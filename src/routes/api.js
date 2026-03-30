const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Auth Routes
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        if (!name || !email || !phone || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
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
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(400).json({ success: false, message: 'Invalid credentials' });
        const user = users[0];
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

// Category & Product Routes
router.get('/categories', async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT * FROM categories ORDER BY category_name');
        res.json({ success: true, categories });
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
            const [products] = await pool.query(sql, [categoryId]);
            return res.json({ success: true, products });
        }
        const [products] = await pool.query(sql + ' ORDER BY p.created_at DESC');
        res.json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Cart Routes
router.get('/cart', isAuthenticated, async (req, res) => {
    try {
        const [cartItems] = await pool.query(`
            SELECT c.id, c.quantity, p.id as product_id, p.product_name, p.price, p.image, p.stock
            FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?`, [req.session.user.id]);
        res.json({ success: true, cart: cartItems });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/cart/add', isAuthenticated, async (req, res) => {
    try {
        const { product_id, quantity } = req.body;
        const [existing] = await pool.query('SELECT * FROM cart WHERE user_id = ? AND product_id = ?', [req.session.user.id, product_id]);
        if (existing.length > 0) {
            await pool.query('UPDATE cart SET quantity = quantity + ? WHERE id = ?', [quantity, existing[0].id]);
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

// Order Routes
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

        const [order] = await pool.query('INSERT INTO orders (user_id, total_amount, shipping_address, payment_method) VALUES (?, ?, ?, ?)', [req.session.user.id, total, shipping_address, payment_method || 'Cash']);
        for (const item of items) {
            await pool.query('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)', [order.insertId, item.id, item.quantity, item.price]);
            await pool.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.id]);
        }
        await pool.query('DELETE FROM cart WHERE user_id = ?', [req.session.user.id]);
        res.json({ success: true, order_id: order.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/orders', isAuthenticated, async (req, res) => {
    try {
        const [orders] = await pool.query('SELECT o.*, GROUP_CONCAT(p.product_name) as products FROM orders o LEFT JOIN order_items oi ON o.id = oi.order_id LEFT JOIN products p ON oi.product_id = p.id WHERE o.user_id = ? GROUP BY o.id ORDER BY o.order_date DESC', [req.session.user.id]);
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
