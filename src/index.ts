// src/index.ts
import 'reflect-metadata';
import express, { Request, Response } from 'express';
import { AppDataSource } from './data.source';
import queriesRoutes from './routes/queries';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/queries', queriesRoutes); 

app.get('/', (req: Request, res: Response) => {
  res.send('TypeORM MSSQL Project');
});

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });
