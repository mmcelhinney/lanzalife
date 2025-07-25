import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import { Role } from '../entity/Role';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

const router = Router();

// Register a new user
router.post('/register', async (req, res) => {
  const { username, password, roleName } = req.body;

  const userRepository = AppDataSource.getRepository(User);
  const roleRepository = AppDataSource.getRepository(Role);

  try {
    let role = await roleRepository.findOneBy({ name: roleName });

    if (!role) {
      // If role doesn't exist, create it (or handle as an error depending on desired behavior)
      role = new Role();
      role.name = roleName || 'Guest'; // Default to 'Guest' if not provided
      await roleRepository.save(role);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User();
    user.username = username;
    user.password = hashedPassword;
    user.role = role;

    await userRepository.save(user);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const userRepository = AppDataSource.getRepository(User);

  try {
    const user = await userRepository.findOne({ where: { username }, relations: ['role'] });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role.name },
      process.env.JWT_SECRET || 'supersecretjwtkey',
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

export default router;
