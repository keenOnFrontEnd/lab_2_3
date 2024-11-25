// src/data-source.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Employees } from './entities/Employees';
import { Categories } from './entities/Categories';
import { Customers } from './entities/Customers';
import { Shippers } from './entities/Shippers';
import { Suppliers } from './entities/Suppliers';
import { Orders } from './entities/Orders';
import { Products } from './entities/Products';
import { OrderDetails } from './entities/OrderDetails';

export const AppDataSource = new DataSource({
  type: 'mssql',
  host: 'localhost',
  port: 1433, 
  username: 'sa', 
  password: '12345678', 
  database: 'lb3',
  synchronize: false, 
  logging: true,
  entities: [Employees, Categories, Customers, Shippers, Suppliers, Orders, Products, OrderDetails],
  migrations: ['src/migration/**/*.ts'],
  migrationsTableName: 'migrations',
  subscribers: [],
  options: {
    encrypt: false, 
    trustServerCertificate: true,
  },
});
