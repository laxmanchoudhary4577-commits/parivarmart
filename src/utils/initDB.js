const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function initDB() {
    const client = await pool.connect();
    try {
        await client.query(`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, phone VARCHAR(50) NOT NULL, password VARCHAR(255) NOT NULL, otp VARCHAR(10), otp_expiry BIGINT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await client.query(`CREATE TABLE IF NOT EXISTS categories (id SERIAL PRIMARY KEY, category_name VARCHAR(255) NOT NULL, category_image TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await client.query(`CREATE TABLE IF NOT EXISTS products (id SERIAL PRIMARY KEY, product_name VARCHAR(255) NOT NULL, category_id INT NOT NULL, description TEXT, price DECIMAL(10,2) NOT NULL, image TEXT, stock INT DEFAULT 0, is_active INT DEFAULT 1, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (category_id) REFERENCES categories(id))`);
        await client.query(`CREATE TABLE IF NOT EXISTS cart (id SERIAL PRIMARY KEY, user_id INT NOT NULL, product_id INT NOT NULL, quantity INT DEFAULT 1, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id), FOREIGN KEY (product_id) REFERENCES products(id))`);
        await client.query(`CREATE TABLE IF NOT EXISTS orders (id SERIAL PRIMARY KEY, user_id INT NOT NULL, order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, total_amount DECIMAL(10,2) NOT NULL, status VARCHAR(50) DEFAULT 'Pending', shipping_address TEXT, payment_method VARCHAR(50), FOREIGN KEY (user_id) REFERENCES users(id))`);
        await client.query(`CREATE TABLE IF NOT EXISTS order_items (id SERIAL PRIMARY KEY, order_id INT NOT NULL, product_id INT NOT NULL, quantity INT NOT NULL, price DECIMAL(10,2) NOT NULL, FOREIGN KEY (order_id) REFERENCES orders(id), FOREIGN KEY (product_id) REFERENCES products(id))`);
        await client.query(`CREATE TABLE IF NOT EXISTS admins (id SERIAL PRIMARY KEY, username VARCHAR(255) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await client.query(`CREATE TABLE IF NOT EXISTS otp_verification (id SERIAL PRIMARY KEY, email VARCHAR(255) NOT NULL, otp VARCHAR(255) NOT NULL, expiry BIGINT NOT NULL, is_verified BOOLEAN DEFAULT FALSE, attempts INT DEFAULT 0, last_sent BIGINT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);

        const categoriesRes = await client.query('SELECT COUNT(*) as count FROM categories');
        if (parseInt(categoriesRes.rows[0].count) === 0) {
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
                await client.query('INSERT INTO categories (category_name, category_image) VALUES ($1, $2)', [name, image]);
            }
            const hashedPassword = bcrypt.hashSync('Store@2026', 10);
            await client.query('INSERT INTO admins (username, password) VALUES ($1, $2)', ['store_admin', hashedPassword]);
        }
    } finally {
        client.release();
    }
}

module.exports = initDB;
