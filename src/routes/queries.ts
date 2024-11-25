// src/routes/queries.ts
import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data.source';
import { Suppliers } from '../entities/Suppliers';
import { Products } from '../entities/Products';
import { OrderDetails } from '../entities/OrderDetails';
import { Orders } from '../entities/Orders';
import { Customers } from '../entities/Customers';
import { Employees } from '../entities/Employees';
import { Brackets } from 'typeorm';

const router = Router();

/**
 * 1. Знайти всіх постачальників з міста Лондон або Париж
 */
router.get('/suppliers/from-london-or-paris', async (req: Request, res: Response) => {
  try {
    const supplierRepository = AppDataSource.getRepository(Suppliers);
    const suppliers = await supplierRepository
    .createQueryBuilder()
    .where(new Brackets(qb => {
      qb.where('City = :city1', { city1: 'London' })
      .orWhere('City = :city2', { city2: 'Paris' })
    }))
    res.json(suppliers);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

/**
 * 2. Знайти всі продукти, назва яких складається з 10 символів.
 */
router.get('/products/with-10-character-names', async (req: Request, res: Response) => {
  try {
    const productRepository = AppDataSource.getRepository(Products);
    const products = await productRepository
      .createQueryBuilder('product')
      .where('LEN(product.ProductName) = :length', { length: 10 })
      .getMany();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

/**
 * 3. Виведіть загальну кількість замовлених одиниць продуктів для кожного продукту
 */
router.get('/products/total-ordered-units', async (req: Request, res: Response) => {
  try {
    const orderDetailsRepository = AppDataSource.getRepository(OrderDetails);
    const totals = await orderDetailsRepository
      .createQueryBuilder('orderDetail')
      .select('orderDetail.ProductID', 'ProductID')
      .addSelect('SUM(orderDetail.Quantity)', 'TotalQuantity')
      .groupBy('orderDetail.ProductID')
      .getRawMany();
    res.json(totals);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

/**
 * 4. Показати кількість співробітників і клієнтів з кожного міста, у якому є клієнти
 */
router.get('/counts/employees-customers-by-city', async (req: Request, res: Response) => {
  try {
    const customerRepository = AppDataSource.getRepository(Customers);
    const employeeRepository = AppDataSource.getRepository(Employees);

    const citiesWithCustomers = await customerRepository
      .createQueryBuilder('customer')
      .select('customer.City')
      .distinct(true)
      .getRawMany();

    const results: any[] = [];

    for (const cityObj of citiesWithCustomers) {
      const city = cityObj.customer_City;
      const employeeCount = await employeeRepository.count({ where: { city: city } });
      const customerCount = await customerRepository.count({ where: { city: city } });
      results.push({
        city,
        employeeCount,
        customerCount
      });
    }

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

/**
 * 5. Виведіть покупців з Великої Британії, які витратили більше 1000 у.о
 */
router.get('/customers/britain-spent-over-1000', async (req: Request, res: Response) => {
  try {
    const customerRepository = AppDataSource.getRepository(Customers);
    const ordersRepository = AppDataSource.getRepository(Orders);

    const customers = await customerRepository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.orders', 'order')
      .where('customer.Country = :country', { country: 'UK' }) 
      .groupBy('customer.CustomerID')
      .having('SUM(order.Freight) > :amount', { amount: 1000 })
      .getMany();

    res.json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

/**
 * 6. Отримати імена клієнтів, які розмістили свої замовлення в 1997 році. Імена мають виводитись без повторів
 */
router.get('/customers/ordered-in-1997', async (req: Request, res: Response) => {
  try {
    const customerRepository = AppDataSource.getRepository(Customers);
    const customers = await customerRepository
      .createQueryBuilder('customer')
      .innerJoin('customer.orders', 'order')
      .where('YEAR(order.OrderDate) = :year', { year: 1997 })
      .select(['customer.ContactName'])
      .distinct(true)
      .getRawMany();

    // Витягнути лише імена з результату
    const uniqueNames = customers.map(c => c.customer_ContactName);
    res.json(uniqueNames);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

/**
 * 7. Знайти імена компаній, які є і постачальниками, і клієнтами
 */
router.get('/companies/suppliers-and-customers', async (req: Request, res: Response) => {
  try {
    const supplierRepository = AppDataSource.getRepository(Suppliers);
    const customerRepository = AppDataSource.getRepository(Customers);

    const supplierNames = await supplierRepository
      .createQueryBuilder('supplier')
      .select('supplier.CompanyName')
      .getRawMany();

    const customerNames = await customerRepository
      .createQueryBuilder('customer')
      .select('customer.CompanyName')
      .getRawMany();

    const supplierNameSet = new Set(supplierNames.map(s => s.supplier_CompanyName));
    const commonNames = customerNames
      .map(c => c.customer_CompanyName)
      .filter(name => supplierNameSet.has(name));

    res.json(commonNames);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

export default router;
