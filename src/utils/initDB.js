const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function initDB() {
    const connection = await pool.getConnection();
    try {
        await connection.query(`CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, phone VARCHAR(50) NOT NULL, password VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await connection.query(`CREATE TABLE IF NOT EXISTS categories (id INT AUTO_INCREMENT PRIMARY KEY, category_name VARCHAR(255) NOT NULL, category_image TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await connection.query(`CREATE TABLE IF NOT EXISTS products (id INT AUTO_INCREMENT PRIMARY KEY, product_name VARCHAR(255) NOT NULL, category_id INT NOT NULL, description TEXT, price DECIMAL(10,2) NOT NULL, image TEXT, stock INT DEFAULT 0, is_active INT DEFAULT 1, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (category_id) REFERENCES categories(id))`);
        await connection.query(`CREATE TABLE IF NOT EXISTS cart (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, product_id INT NOT NULL, quantity INT DEFAULT 1, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id), FOREIGN KEY (product_id) REFERENCES products(id))`);
        await connection.query(`CREATE TABLE IF NOT EXISTS orders (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, total_amount DECIMAL(10,2) NOT NULL, status VARCHAR(50) DEFAULT 'Pending', shipping_address TEXT, payment_method VARCHAR(50), FOREIGN KEY (user_id) REFERENCES users(id))`);
        await connection.query(`CREATE TABLE IF NOT EXISTS order_items (id INT AUTO_INCREMENT PRIMARY KEY, order_id INT NOT NULL, product_id INT NOT NULL, quantity INT NOT NULL, price DECIMAL(10,2) NOT NULL, FOREIGN KEY (order_id) REFERENCES orders(id), FOREIGN KEY (product_id) REFERENCES products(id))`);
        await connection.query(`CREATE TABLE IF NOT EXISTS admins (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);

        const [categories] = await connection.query('SELECT COUNT(*) as count FROM categories');
        if (categories[0].count === 0) {
            // Seed data logic
            const categoriesData = [['Fruits & Vegetables', '...'], ['Dairy & Eggs', '...']]; // Truncated for brevity
            for (const [name, image] of categoriesData) {
                await connection.query('INSERT INTO categories (category_name, category_image) VALUES (?, ?)', [name, image]);
            }
            const hashedPassword = bcrypt.hashSync('Store@2026', 10);
            await connection.query('INSERT INTO admins (username, password) VALUES (?, ?)', ['store_admin', hashedPassword]);
        }
    } finally {
        connection.release();
    }
}

module.exports = initDB;
