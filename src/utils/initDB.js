const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function initDB() {
    try {
        await pool.query(`CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, phone VARCHAR(50) NOT NULL, password VARCHAR(255) NOT NULL, otp VARCHAR(10), otp_expiry BIGINT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await pool.query(`CREATE TABLE IF NOT EXISTS categories (id INT AUTO_INCREMENT PRIMARY KEY, category_name VARCHAR(255) NOT NULL, category_image TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await pool.query(`CREATE TABLE IF NOT EXISTS products (id INT AUTO_INCREMENT PRIMARY KEY, product_name VARCHAR(255) NOT NULL, category_id INT NOT NULL, description TEXT, price DECIMAL(10,2) NOT NULL, image TEXT, stock INT DEFAULT 0, is_active INT DEFAULT 1, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (category_id) REFERENCES categories(id))`);
        await pool.query(`CREATE TABLE IF NOT EXISTS cart (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, product_id INT NOT NULL, quantity INT DEFAULT 1, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id), FOREIGN KEY (product_id) REFERENCES products(id))`);
        await pool.query(`CREATE TABLE IF NOT EXISTS orders (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, total_amount DECIMAL(10,2) NOT NULL, status VARCHAR(50) DEFAULT 'Pending', shipping_address TEXT, payment_method VARCHAR(50), FOREIGN KEY (user_id) REFERENCES users(id))`);
        await pool.query(`CREATE TABLE IF NOT EXISTS order_items (id INT AUTO_INCREMENT PRIMARY KEY, order_id INT NOT NULL, product_id INT NOT NULL, quantity INT NOT NULL, price DECIMAL(10,2) NOT NULL, FOREIGN KEY (order_id) REFERENCES orders(id), FOREIGN KEY (product_id) REFERENCES products(id))`);
        await pool.query(`CREATE TABLE IF NOT EXISTS admins (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await pool.query(`CREATE TABLE IF NOT EXISTS otp_verification (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255) NOT NULL, otp VARCHAR(255) NOT NULL, expiry BIGINT NOT NULL, is_verified BOOLEAN DEFAULT FALSE, attempts INT DEFAULT 0, last_sent BIGINT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);

        const [categoriesRes] = await pool.query('SELECT COUNT(*) as count FROM categories');
        if (categoriesRes[0].count === 0) {
            const categoriesData = [
                ['Fruits & Vegetables', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400'],
                ['Dairy & Eggs', 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400'],
                ['Bakery', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'],
                ['Beverages', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400'],
                ['Snacks & Munchies', 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400'],
                ['Personal Care', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400'],
                ['Home Care', 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400'],
                ['Baby Care', 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400']
            ];
            for (const [name, image] of categoriesData) {
                await pool.query('INSERT INTO categories (category_name, category_image) VALUES (?, ?)', [name, image]);
            }

            const productsData = [
                ['Fresh Apples (1kg)', 1, 'Premium quality red apples', 120, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400', 50],
                ['Banana (1 dozen)', 1, 'Fresh yellow bananas', 50, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400', 100],
                ['Milk (1L)', 2, 'Fresh toned milk', 45, 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400', 200],
                ['Eggs (12 pcs)', 2, 'Farm fresh eggs', 60, 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400', 150],
                ['Whole Wheat Bread', 3, 'Freshly baked bread', 40, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', 80],
                ['Butter (500g)', 2, 'Pure dairy butter', 180, 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400', 60],
                ['Coca Cola (1L)', 4, 'Refreshing soft drink', 40, 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400', 100],
                ['Orange Juice (1L)', 4, 'Fresh orange juice', 80, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400', 50],
                ['Chips (100g)', 5, 'Crunchy potato chips', 30, 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400', 200],
                ['Shampoo (500ml)', 6, 'Anti-dandruff shampoo', 250, 'https://images.unsplash.com/photo-1556228578-8c89e6fb0342?w=400', 40],
                ['Soap (4 pcs)', 6, 'Moisturizing soap bar', 80, 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400', 100],
                ['Detergent (1kg)', 7, 'Front load detergent', 180, 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400', 60],
                ['Diapers (30 pcs)', 8, 'Premium baby diapers', 450, 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400', 30],
            ];
            for (const [name, catId, desc, price, image, stock] of productsData) {
                await pool.query('INSERT INTO products (product_name, category_id, description, price, image, stock) VALUES (?, ?, ?, ?, ?, ?)', [name, catId, desc, price, image, stock]);
            }

            const hashedPassword = bcrypt.hashSync('Store@2026', 10);
            await pool.query('INSERT INTO admins (username, password) VALUES (?, ?)', ['store_admin', hashedPassword]);
        }
    } catch (error) {
        console.error('initDB error:', error);
    }
}

module.exports = initDB;


module.exports = initDB;
