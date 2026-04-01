const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { isAdmin } = require('../middleware/auth');

router.get('/check-session', (req, res) => {
    if (req.session.admin) {
        res.json({ loggedIn: true, admin: req.session.admin });
    } else {
        res.json({ loggedIn: false });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const [rows] = await pool.query('SELECT * FROM admins WHERE username = ?', [username]);
        if (rows.length === 0) return res.status(400).json({ success: false, message: 'Invalid credentials' });
        const admin = rows[0];
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
        const [users] = await pool.query('SELECT COUNT(*) as count FROM users');
        const [orders] = await pool.query('SELECT COUNT(*) as count FROM orders');
        const [products] = await pool.query('SELECT COUNT(*) as count FROM products');
        const [revenue] = await pool.query("SELECT SUM(total_amount) as total FROM orders WHERE status = 'Completed'");
        const [pending] = await pool.query("SELECT COUNT(*) as count FROM orders WHERE status = 'Pending'");
        res.json({ success: true, stats: { 
            users: users[0].count, 
            orders: orders[0].count, 
            products: products[0].count, 
            revenue: revenue[0].total || 0, 
            pendingOrders: pending[0].count 
        } });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/orders', isAdmin, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT o.*, u.name as user_name, u.email as user_email, u.phone as user_phone FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.order_date DESC');
        res.json({ success: true, orders: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/add-product', isAdmin, async (req, res) => {
    try {
        const { product_name, category_id, description, price, image, stock } = req.body;
        await pool.query('INSERT INTO products (product_name, category_id, description, price, image, stock) VALUES (?, ?, ?, ?, ?, ?)', [product_name, category_id, description, price, image, stock || 0]);
        res.json({ success: true, message: 'Product added!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.delete('/delete-product/:id', isAdmin, async (req, res) => {
    try {
        await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Product deleted!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.put('/update-product/:id', isAdmin, async (req, res) => {
    try {
        const { product_name, category_id, description, price, image, stock } = req.body;
        await pool.query(
            'UPDATE products SET product_name = ?, category_id = ?, description = ?, price = ?, image = ?, stock = ? WHERE id = ?',
            [product_name, category_id, description, price, image, stock, req.params.id]
        );
        res.json({ success: true, message: 'Product updated!' });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/users', isAdmin, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name, email, phone, created_at FROM users ORDER BY created_at DESC');
        res.json({ success: true, users: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/products', isAdmin, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.*, c.category_name 
            FROM products p 
            JOIN categories c ON p.category_id = c.id 
            ORDER BY p.created_at DESC
        `);
        res.json({ success: true, products: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/all-orders', isAdmin, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT o.*, u.name as user_name, u.email as user_email, u.phone as user_phone 
            FROM orders o 
            JOIN users u ON o.user_id = u.id 
            ORDER BY o.order_date DESC
        `);
        
        for (let order of rows) {
            const [items] = await pool.query(`
                SELECT oi.*, p.product_name 
                FROM order_items oi 
                JOIN products p ON oi.product_id = p.id 
                WHERE oi.order_id = ?
            `, [order.id]);
            order.products = items.map(item => `${item.product_name} (x${item.quantity})`).join(', ');
            
            if (!order.shipping_address) {
                order.shipping_address = 'No address on file';
            }
        }
        
        res.json({ success: true, orders: rows });
    } catch (error) {
        console.error('All orders error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.put('/update-order/:id', isAdmin, async (req, res) => {
    try {
        const { status, shipping_address } = req.body;
        let query = 'UPDATE orders SET ';
        let params = [];
        
        if (status !== undefined) {
            query += 'status = ?';
            params.push(status);
        }
        
        if (shipping_address !== undefined) {
            if (params.length > 0) query += ', ';
            query += 'shipping_address = ?';
            params.push(shipping_address);
        }
        
        query += ' WHERE id = ?';
        params.push(req.params.id);
        
        await pool.query(query, params);
        res.json({ success: true, message: 'Order updated!' });
    } catch (error) {
        console.error('Update order error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
