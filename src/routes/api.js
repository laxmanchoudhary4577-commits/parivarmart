const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        if (!name || !email || !phone || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (name, email, phone, password) VALUES ($1, $2, $3, $4)', [name, email, phone, hashedPassword]);
        res.json({ success: true, message: 'Registration successful!' });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(400).json({ success: false, message: 'Invalid credentials' });
        const user = result.rows[0];
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
        const result = await pool.query('SELECT * FROM categories ORDER BY category_name');
        res.json({ success: true, categories: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/products', async (req, res) => {
    try {
        const categoryId = req.query.category;
        let sql = 'SELECT p.*, c.category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1';
        if (categoryId) {
            sql += ' AND p.category_id = $1';
            const result = await pool.query(sql, [categoryId]);
            return res.json({ success: true, products: result.rows });
        }
        const result = await pool.query(sql + ' ORDER BY p.created_at DESC');
        res.json({ success: true, products: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/cart', isAuthenticated, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT c.id, c.quantity, p.id as product_id, p.product_name, p.price, p.image, p.stock
            FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = $1`, [req.session.user.id]);
        res.json({ success: true, cart: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/cart/add', isAuthenticated, async (req, res) => {
    try {
        const { product_id, quantity } = req.body;
        const existing = await pool.query('SELECT * FROM cart WHERE user_id = $1 AND product_id = $2', [req.session.user.id, product_id]);
        if (existing.rows.length > 0) {
            await pool.query('UPDATE cart SET quantity = quantity + $1 WHERE id = $2', [quantity, existing.rows[0].id]);
        } else {
            await pool.query('INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3)', [req.session.user.id, product_id, quantity]);
        }
        res.json({ success: true, message: 'Added to cart!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.delete('/cart/remove/:id', isAuthenticated, async (req, res) => {
    try {
        await pool.query('DELETE FROM cart WHERE id = $1 AND user_id = $2', [req.params.id, req.session.user.id]);
        res.json({ success: true, message: 'Item removed!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/order', isAuthenticated, async (req, res) => {
    try {
        const { shipping_address, payment_method } = req.body;
        const items = await pool.query('SELECT c.quantity, p.price, p.stock, p.id FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = $1', [req.session.user.id]);
        if (items.rows.length === 0) return res.status(400).json({ success: false, message: 'Cart is empty' });
        
        let total = 0;
        for (const item of items.rows) {
            if (item.quantity > item.stock) return res.status(400).json({ success: false, message: `No stock for product ${item.id}` });
            total += item.price * item.quantity;
        }

        const order = await pool.query('INSERT INTO orders (user_id, total_amount, shipping_address, payment_method) VALUES ($1, $2, $3, $4) RETURNING id', [req.session.user.id, total, shipping_address, payment_method || 'Cash']);
        for (const item of items.rows) {
            await pool.query('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)', [order.rows[0].id, item.id, item.quantity, item.price]);
            await pool.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [item.quantity, item.id]);
        }
        await pool.query('DELETE FROM cart WHERE user_id = $1', [req.session.user.id]);
        res.json({ success: true, order_id: order.rows[0].id });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/orders', isAuthenticated, async (req, res) => {
    try {
        const result = await pool.query('SELECT o.*, string_agg(p.product_name, \', \') as products FROM orders o LEFT JOIN order_items oi ON o.id = oi.order_id LEFT JOIN products p ON oi.product_id = p.id WHERE o.user_id = $1 GROUP BY o.id ORDER BY o.order_date DESC', [req.session.user.id]);
        res.json({ success: true, orders: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
