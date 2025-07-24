import 'reflect-metadata';
import express from 'express';
import { AppDataSource } from './data-source';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

AppDataSource.initialize()
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend is running on http://localhost:${port}`);
    });
  })
  .catch((error) => console.log(error));
