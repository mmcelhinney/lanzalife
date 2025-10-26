import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import { Role } from '../entity/Role';
import * as bcrypt from 'bcrypt';

const router = Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find({
      relations: ['role'],
      select: ['id', 'firstName', 'lastName', 'username', 'telephone', 'role']
    });

    const usersWithRole = users.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      telephone: user.telephone,
      role: user.role.name
    }));

    res.json(usersWithRole);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ['role'],
      select: ['id', 'firstName', 'lastName', 'username', 'telephone', 'role']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      telephone: user.telephone,
      role: user.role.name
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { firstName, lastName, username, roleName, telephone, email, password } = req.body;
    const userRepository = AppDataSource.getRepository(User);
    const roleRepository = AppDataSource.getRepository(Role);

    const user = await userRepository.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ['role']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update basic fields
    user.firstName = firstName;
    user.lastName = lastName;
    user.username = username;
    user.telephone = telephone;
    user.email = email;

    // Update role if provided
    if (roleName) {
      let role = await roleRepository.findOneBy({ name: roleName });
      if (!role) {
        role = new Role();
        role.name = roleName;
        await roleRepository.save(role);
      }
      user.role = role;
    }

    // Update password if provided
    if (password && password.trim()) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await userRepository.save(user);

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: parseInt(req.params.id) }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await userRepository.remove(user);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

export default router;
