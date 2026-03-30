const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { isAdmin } = require('../middleware/auth');

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
        if (result.rows.length === 0) return res.status(400).json({ success: false, message: 'Invalid credentials' });
        const admin = result.rows[0];
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });
        req.session.admin = { id: admin.id, username: admin.username };
        res.json({ success: true, message: 'Login successful!', admin: req.session.admin });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

router.get('/stats', isAdmin, async (req, res) => {
    try {
        const users = await pool.query('SELECT COUNT(*) as count FROM users');
        const orders = await pool.query('SELECT COUNT(*) as count FROM orders');
        const products = await pool.query('SELECT COUNT(*) as count FROM products');
        const revenue = await pool.query("SELECT SUM(total_amount) as total FROM orders WHERE status = 'Completed'");
        const pending = await pool.query("SELECT COUNT(*) as count FROM orders WHERE status = 'Pending'");
        res.json({ success: true, stats: { users: parseInt(users.rows[0].count), orders: parseInt(orders.rows[0].count), products: parseInt(products.rows[0].count), revenue: revenue.rows[0].total || 0, pendingOrders: parseInt(pending.rows[0].count) } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/orders', isAdmin, async (req, res) => {
    try {
        const result = await pool.query('SELECT o.*, u.name as user_name, u.email as user_email, u.phone as user_phone FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.order_date DESC');
        res.json({ success: true, orders: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/add-product', isAdmin, async (req, res) => {
    try {
        const { product_name, category_id, description, price, image, stock } = req.body;
        await pool.query('INSERT INTO products (product_name, category_id, description, price, image, stock) VALUES ($1, $2, $3, $4, $5, $6)', [product_name, category_id, description, price, image, stock || 0]);
        res.json({ success: true, message: 'Product added!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.delete('/delete-product/:id', isAdmin, async (req, res) => {
    try {
        await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
        res.json({ success: true, message: 'Product deleted!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/users', isAdmin, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, email, phone, created_at FROM users ORDER BY created_at DESC');
        res.json({ success: true, users: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
