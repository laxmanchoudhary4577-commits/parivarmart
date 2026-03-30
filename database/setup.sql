-- MySQL Database Setup for Parivar Mart
-- Run this in phpMyAdmin or MySQL Workbench

-- Create Database
CREATE DATABASE IF NOT EXISTS parivar_mart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE parivar_mart;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    otp VARCHAR(10),
    otp_expiry BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Password Reset Tokens Table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL,
    category_image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    category_id INT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image TEXT,
    stock INT DEFAULT 0,
    is_active INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Cart Table
CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    shipping_address TEXT,
    payment_method VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Categories
INSERT INTO categories (category_name, category_image) VALUES 
('Fruits & Vegetables', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=250'),
('Dairy & Eggs', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=250'),
('Bakery & Biscuits', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=250'),
('Snacks & Munchies', 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=250'),
('Beverages', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=250'),
('Beauty & Personal Care', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=250'),
('Home Care', 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=250'),
('Baby Care', 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=250'),
('Pet Care', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=250'),
('Staples', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=250');

-- Insert Products
INSERT INTO products (category_id, product_name, description, price, image, stock) VALUES
(1, 'Fresh Apple', 'Organic red apples 1kg', 180, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=250', 100),
(1, 'Fresh Banana', 'Yellow bananas 1 dozen', 50, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=250', 150),
(1, 'Fresh Onion', 'Red onions 1kg', 40, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=250', 200),
(1, 'Fresh Potato', 'Organic potatoes 1kg', 35, 'https://images.unsplash.com/photo-1518977676601-b53f82b8777d?w=250', 200),
(1, 'Fresh Tomato', 'Red tomatoes 1kg', 45, 'https://images.unsplash.com/photo-1546470427-e26264be0b0e?w=250', 150),
(2, 'Milk', 'Fresh toned milk 1L', 55, 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=250', 200),
(2, 'Curd', 'Fresh curd 400g', 35, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=250', 100),
(2, 'Paneer', 'Fresh paneer 200g', 70, 'https://images.unsplash.com/photo-1559755288-7042e2dc20e1?w=250', 80),
(2, 'Eggs', 'Farm fresh eggs (12 pcs)', 80, 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=250', 300),
(2, 'Butter', 'Premium butter 100g', 60, 'https://images.unsplash.com/photo-1589985270958-bf087b4c9e0c?w=250', 100),
(3, 'Bread', 'Whole wheat bread 400g', 40, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=250', 150),
(3, 'Croissant', 'Fresh butter croissant 2 pcs', 80, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=250', 50),
(3, 'Cookies', 'Chocolate cookies 200g', 50, 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=250', 200),
(3, 'Biscuits', 'Marie biscuits 200g', 30, 'https://images.unsplash.com/photo-1493087651729-2e785200d3f8?w=250', 250),
(4, 'Chips', 'Potato chips 100g', 35, 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=250', 180),
(4, 'Namkeen', 'Mixed namkeen 250g', 45, 'https://images.unsplash.com/photo-1621951753163-0f9ae1a61f8e?w=250', 120),
(4, 'Peanuts', 'Roasted peanuts 200g', 60, 'https://images.unsplash.com/photo-1615497001839-b0a0eac3274c?w=250', 80),
(4, 'Chocolate', 'Dark chocolate 100g', 70, 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=250', 100),
(5, 'Orange Juice', 'Fresh orange juice 1L', 120, 'https://images.unsplash.com/photo-1600271881702-90fbbc5abe23?w=250', 80),
(5, 'Mango Juice', 'Alphonso mango juice 1L', 150, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=250', 60),
(5, 'Cold Coffee', 'Ready to drink cold coffee 250ml', 50, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=250', 100),
(5, 'Soft Drinks', 'Cola 500ml', 40, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=250', 200),
(5, 'Water Bottle', 'Mineral water 1L', 20, 'https://images.unsplash.com/photo-1560023907-5f339617ea30?w=250', 300),
(6, 'Shampoo', 'Anti-dandruff shampoo 200ml', 250, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=250', 80),
(6, 'Soap', 'Moisturizing soap 125g', 40, 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=250', 150),
(6, 'Toothpaste', 'Fluoride toothpaste 100g', 80, 'https://images.unsplash.com/photo-1559553156-2e97137af16f?w=250', 200),
(6, 'Face Cream', 'Moisturizing face cream 50g', 180, 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcc90?w=250', 60),
(7, 'Detergent', 'Liquid detergent 1L', 350, 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=250', 100),
(7, 'Dishwash', 'Dishwashing liquid 500ml', 120, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=250', 80),
(7, 'Floor Cleaner', 'Multi-surface floor cleaner 1L', 180, 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=250', 60),
(8, 'Baby Soap', 'Gentle baby soap 75g', 50, 'https://images.unsplash.com/photo-1552693673-1bf958298935?w=250', 100),
(8, 'Baby Powder', 'Talc-free baby powder 200g', 120, 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=250', 80),
(8, 'Diapers', 'Baby diapers pack of 30', 450, 'https://images.unsplash.com/photo-1507652313519-d4e917499ed9?w=250', 50),
(9, 'Dog Food', 'Premium dog food 5kg', 1200, 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=250', 30),
(9, 'Cat Food', 'Premium cat food 1kg', 350, 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=250', 40),
(9, 'Pet Treats', 'Dog treats 500g', 200, 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=250', 50),
(10, 'Basmati Rice', 'Premium basmati rice 1kg', 199, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=250', 150),
(10, 'Sugar', 'Pure white sugar 1kg', 45, 'https://images.unsplash.com/photo-1588833616353-82c68c389a0d?w=250', 200),
(10, 'Salt', 'Iodized salt 1kg', 25, 'https://images.unsplash.com/photo-1518112390430-94a6c11aa475?w=250', 300),
(10, 'Cooking Oil', 'Refined oil 1L', 150, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=250', 100),
(10, 'Dal', 'Premium urad dal 1kg', 120, 'https://images.unsplash.com/photo-1518481615372-33879a7c11e0?w=250', 120),
(10, 'Atta', 'Whole wheat atta 10kg', 450, 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=250', 80),
(10, 'Tea', 'Premium tea leaves 250g', 80, 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cbe9?w=250', 150),
(10, 'Coffee', 'Instant coffee 100g', 150, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=250', 80);

-- Insert Admin (Password: Store@2026 - hashed with bcrypt)
INSERT INTO admins (username, password) VALUES 
('store_admin', '$2a$10$8K1p/a0dL3LXMIgoEDFiwOM2T8gkI1qJ0qGYxqH2m5JHLTQxGWz6');
