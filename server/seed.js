const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const connectDB = require('./config/db');

const User = require('./models/User');
const Category = require('./models/Category');
const Warehouse = require('./models/Warehouse');
const Product = require('./models/Product');

const seedData = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();

    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Warehouse.deleteMany({}),
      Product.deleteMany({}),
    ]);

    // 1. Create Users
    console.log('Creating users...');
    const admin = await User.create({
      name: 'Admin Manager',
      email: 'admin@example.com',
      phone: '+1234567890',
      password: 'password123',
      role: 'manager'
    });

    const staff1 = await User.create({
      name: 'John Staff',
      email: 'john@example.com',
      phone: '+1234567891',
      password: 'password123',
      role: 'staff'
    });

    // 2. Create Categories
    console.log('Creating categories...');
    const catElectronics = await Category.create({ name: 'Electronics', description: 'Gadgets and devices' });
    const catFurniture = await Category.create({ name: 'Furniture', description: 'Office and home furniture' });
    const catStationery = await Category.create({ name: 'Stationery', description: 'Office supplies' });

    // 3. Create Warehouses
    console.log('Creating warehouses...');
    const whMain = await Warehouse.create({ name: 'Main Warehouse', code: 'WH-MAIN', location: 'New York', type: 'main' });
    const whRetail = await Warehouse.create({ name: 'Retail Store A', code: 'WH-RET-A', location: 'Brooklyn', type: 'retail' });

    // 4. Create Products
    console.log('Creating products...');
    const products = [
      {
        name: 'Wireless Mouse',
        sku: 'ELEC-MOU-001',
        description: 'Ergonomic wireless mouse',
        category: catElectronics._id,
        costPrice: 15,
        sellingPrice: 25,
        minStockLevel: 20,
        unit: 'pcs',
        barcode: '1234567890123'
      },
      {
        name: 'Mechanical Keyboard',
        sku: 'ELEC-KEY-001',
        description: 'RGB mechanical keyboard',
        category: catElectronics._id,
        costPrice: 45,
        sellingPrice: 80,
        minStockLevel: 10,
        unit: 'pcs',
        barcode: '1234567890124'
      },
      {
        name: 'Office Chair',
        sku: 'FURN-CHR-001',
        description: 'Ergonomic mesh office chair',
        category: catFurniture._id,
        costPrice: 80,
        sellingPrice: 150,
        minStockLevel: 5,
        unit: 'pcs',
      },
      {
        name: 'Standing Desk',
        sku: 'FURN-DSK-001',
        description: 'Adjustable standing desk',
        category: catFurniture._id,
        costPrice: 200,
        sellingPrice: 350,
        minStockLevel: 2,
        unit: 'pcs',
      },
      {
        name: 'A4 Paper Ream',
        sku: 'STAT-PPR-001',
        description: '500 sheets A4 printer paper',
        category: catStationery._id,
        costPrice: 3,
        sellingPrice: 6,
        minStockLevel: 50,
        unit: 'packs',
      },
      {
        name: 'Gel Pens (Pack of 10)',
        sku: 'STAT-PEN-001',
        description: 'Black gel pens',
        category: catStationery._id,
        costPrice: 2,
        sellingPrice: 5,
        minStockLevel: 30,
        unit: 'packs',
      }
    ];

    await Product.insertMany(products);

    console.log('Database seeded successfully! 🌱');
    console.log('-------------------------------------------');
    console.log('Admin Account: admin@example.com / password123');
    console.log('Staff Account: john@example.com / password123');
    console.log('-------------------------------------------');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
