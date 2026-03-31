const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

router.get('/check-session', (req, res) => {
    if (req.session && req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});

router.get('/seed-products', async (req, res) => {
    try {
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
        res.json({ success: true, message: 'Products seeded!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        if (!name || !email || !phone || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({ success: false, message: 'Phone number must be exactly 10 digits' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)', [name, email, phone, hashedPassword]);
        res.json({ success: true, message: 'Registration successful!' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(400).json({ success: false, message: 'Invalid credentials' });
        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });
        req.session.user = { id: user.id, name: user.name, email: user.email };
        res.json({ success: true, message: 'Login successful!', user: req.session.user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

router.get('/categories', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM categories ORDER BY category_name');
        res.json({ success: true, categories: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/products', async (req, res) => {
    try {
        const categoryId = req.query.category;
        let sql = 'SELECT p.*, c.category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1';
        if (categoryId) {
            sql += ' AND p.category_id = ?';
            const [rows] = await pool.query(sql, [categoryId]);
            return res.json({ success: true, products: rows });
        }
        const [rows] = await pool.query(sql + ' ORDER BY p.created_at DESC');
        res.json({ success: true, products: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/cart', isAuthenticated, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT c.id, c.quantity, p.id as product_id, p.product_name, p.price, p.image, p.stock
            FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?`, [req.session.user.id]);
        res.json({ success: true, cart: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/cart/add', isAuthenticated, async (req, res) => {
    try {
        const { product_id, quantity } = req.body;
        const [rows] = await pool.query('SELECT * FROM cart WHERE user_id = ? AND product_id = ?', [req.session.user.id, product_id]);
        if (rows.length > 0) {
            await pool.query('UPDATE cart SET quantity = quantity + ? WHERE id = ?', [quantity, rows[0].id]);
        } else {
            await pool.query('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)', [req.session.user.id, product_id, quantity]);
        }
        res.json({ success: true, message: 'Added to cart!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.delete('/cart/remove/:id', isAuthenticated, async (req, res) => {
    try {
        await pool.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [req.params.id, req.session.user.id]);
        res.json({ success: true, message: 'Item removed!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.put('/cart/update/:id', isAuthenticated, async (req, res) => {
    try {
        const { quantity } = req.body;
        if (quantity < 1) {
            await pool.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [req.params.id, req.session.user.id]);
            return res.json({ success: true, message: 'Item removed!' });
        }
        await pool.query('UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?', [quantity, req.params.id, req.session.user.id]);
        res.json({ success: true, message: 'Cart updated!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/order', isAuthenticated, async (req, res) => {
    try {
        const { shipping_address, payment_method } = req.body;
        const [items] = await pool.query('SELECT c.quantity, p.price, p.stock, p.id FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?', [req.session.user.id]);
        if (items.length === 0) return res.status(400).json({ success: false, message: 'Cart is empty' });
        
        let total = 0;
        for (const item of items) {
            if (item.quantity > item.stock) return res.status(400).json({ success: false, message: `No stock for product ${item.id}` });
            total += item.price * item.quantity;
        }

        const [orderResult] = await pool.query('INSERT INTO orders (user_id, total_amount, shipping_address, payment_method) VALUES (?, ?, ?, ?)', [req.session.user.id, total, shipping_address, payment_method || 'Cash']);
        const orderId = orderResult.insertId;
        for (const item of items) {
            await pool.query('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)', [orderId, item.id, item.quantity, item.price]);
            await pool.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.id]);
        }
        await pool.query('DELETE FROM cart WHERE user_id = ?', [req.session.user.id]);
        res.json({ success: true, order_id: orderId });
    } catch (error) {
        console.error('Order error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/orders', isAuthenticated, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT o.*, GROUP_CONCAT(p.product_name SEPARATOR \', \') as products FROM orders o LEFT JOIN order_items oi ON o.id = oi.order_id LEFT JOIN products p ON oi.product_id = p.id WHERE o.user_id = ? GROUP BY o.id ORDER BY o.order_date DESC', [req.session.user.id]);
        res.json({ success: true, orders: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
