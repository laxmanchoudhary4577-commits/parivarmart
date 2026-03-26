const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'ecommerce-secret-key-2024',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

let pool;

async function initDB() {
    pool = mysql.createPool({
        host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
        user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
        password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
        database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'parivar_mart',
        port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    const connection = await pool.getConnection();
    
    try {
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                phone VARCHAR(50) NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS password_reset_tokens (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                token VARCHAR(255) NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                category_name VARCHAR(255) NOT NULL,
                category_image TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await connection.query(`
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
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS cart (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                total_amount DECIMAL(10,2) NOT NULL,
                status VARCHAR(50) DEFAULT 'Pending',
                shipping_address TEXT,
                payment_method VARCHAR(50),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id),
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        const [categories] = await connection.query('SELECT COUNT(*) as count FROM categories');
        if (categories[0].count === 0) {
            const categoriesData = [
                ['Fruits & Vegetables', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=250'],
                ['Dairy & Eggs', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=250'],
                ['Bakery & Biscuits', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=250'],
                ['Snacks & Munchies', 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=250'],
                ['Beverages', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=250'],
                ['Beauty & Personal Care', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=250'],
                ['Home Care', 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=250'],
                ['Baby Care', 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=250'],
                ['Pet Care', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=250'],
                ['Staples', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=250']
            ];
            
            for (const [name, image] of categoriesData) {
                await connection.query('INSERT INTO categories (category_name, category_image) VALUES (?, ?)', [name, image]);
            }

            const productsData = [
                [1, 'Fresh Apple', 'Organic red apples 1kg', 180, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=250', 100],
                [1, 'Fresh Banana', 'Yellow bananas 1 dozen', 50, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=250', 150],
                [1, 'Fresh Onion', 'Red onions 1kg', 40, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=250', 200],
                [1, 'Fresh Potato', 'Organic potatoes 1kg', 35, 'https://images.unsplash.com/photo-1518977676601-b53f82b8777d?w=250', 200],
                [1, 'Fresh Tomato', 'Red tomatoes 1kg', 45, 'https://images.unsplash.com/photo-1546470427-e26264be0b0e?w=250', 150],
                [2, 'Milk', 'Fresh toned milk 1L', 55, 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=250', 200],
                [2, 'Curd', 'Fresh curd 400g', 35, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=250', 100],
                [2, 'Paneer', 'Fresh paneer 200g', 70, 'https://images.unsplash.com/photo-1559755288-7042e2dc20e1?w=250', 80],
                [2, 'Eggs', 'Farm fresh eggs (12 pcs)', 80, 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=250', 300],
                [2, 'Butter', 'Premium butter 100g', 60, 'https://images.unsplash.com/photo-1589985270958-bf087b4c9e0c?w=250', 100],
                [3, 'Bread', 'Whole wheat bread 400g', 40, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=250', 150],
                [3, 'Croissant', 'Fresh butter croissant 2 pcs', 80, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=250', 50],
                [3, 'Cookies', 'Chocolate cookies 200g', 50, 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=250', 200],
                [3, 'Biscuits', 'Marie biscuits 200g', 30, 'https://images.unsplash.com/photo-1493087651729-2e785200d3f8?w=250', 250],
                [4, 'Chips', 'Potato chips 100g', 35, 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=250', 180],
                [4, 'Namkeen', 'Mixed namkeen 250g', 45, 'https://images.unsplash.com/photo-1621951753163-0f9ae1a61f8e?w=250', 120],
                [4, 'Peanuts', 'Roasted peanuts 200g', 60, 'https://images.unsplash.com/photo-1615497001839-b0a0eac3274c?w=250', 80],
                [4, 'Chocolate', 'Dark chocolate 100g', 70, 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=250', 100],
                [5, 'Orange Juice', 'Fresh orange juice 1L', 120, 'https://images.unsplash.com/photo-1600271881702-90fbbc5abe23?w=250', 80],
                [5, 'Mango Juice', 'Alphonso mango juice 1L', 150, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=250', 60],
                [5, 'Cold Coffee', 'Ready to drink cold coffee 250ml', 50, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=250', 100],
                [5, 'Soft Drinks', 'Cola 500ml', 40, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=250', 200],
                [5, 'Water Bottle', 'Mineral water 1L', 20, 'https://images.unsplash.com/photo-1560023907-5f339617ea30?w=250', 300],
                [6, 'Shampoo', 'Anti-dandruff shampoo 200ml', 250, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=250', 80],
                [6, 'Soap', 'Moisturizing soap 125g', 40, 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=250', 150],
                [6, 'Toothpaste', 'Fluoride toothpaste 100g', 80, 'https://images.unsplash.com/photo-1559553156-2e97137af16f?w=250', 200],
                [6, 'Face Cream', 'Moisturizing face cream 50g', 180, 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcc90?w=250', 60],
                [7, 'Detergent', 'Liquid detergent 1L', 350, 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=250', 100],
                [7, 'Dishwash', 'Dishwashing liquid 500ml', 120, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=250', 80],
                [7, 'Floor Cleaner', 'Multi-surface floor cleaner 1L', 180, 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=250', 60],
                [8, 'Baby Soap', 'Gentle baby soap 75g', 50, 'https://images.unsplash.com/photo-1552693673-1bf958298935?w=250', 100],
                [8, 'Baby Powder', 'Talc-free baby powder 200g', 120, 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=250', 80],
                [8, 'Diapers', 'Baby diapers pack of 30', 450, 'https://images.unsplash.com/photo-1507652313519-d4e917499ed9?w=250', 50],
                [9, 'Dog Food', 'Premium dog food 5kg', 1200, 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=250', 30],
                [9, 'Cat Food', 'Premium cat food 1kg', 350, 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=250', 40],
                [9, 'Pet Treats', 'Dog treats 500g', 200, 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=250', 50],
                [10, 'Basmati Rice', 'Premium basmati rice 1kg', 199, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=250', 150],
                [10, 'Sugar', 'Pure white sugar 1kg', 45, 'https://images.unsplash.com/photo-1588833616353-82c68c389a0d?w=250', 200],
                [10, 'Salt', 'Iodized salt 1kg', 25, 'https://images.unsplash.com/photo-1518112390430-94a6c11aa475?w=250', 300],
                [10, 'Cooking Oil', 'Refined oil 1L', 150, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=250', 100],
                [10, 'Dal', 'Premium urad dal 1kg', 120, 'https://images.unsplash.com/photo-1518481615372-33879a7c11e0?w=250', 120],
                [10, 'Atta', 'Whole wheat atta 10kg', 450, 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=250', 80],
                [10, 'Tea', 'Premium tea leaves 250g', 80, 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cbe9?w=250', 150],
                [10, 'Coffee', 'Instant coffee 100g', 150, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=250', 80]
            ];

            for (const [catId, name, desc, price, image, stock] of productsData) {
                await connection.query(
                    'INSERT INTO products (category_id, product_name, description, price, image, stock) VALUES (?, ?, ?, ?, ?, ?)',
                    [catId, name, desc, price, image, stock]
                );
            }

            const hashedPassword = bcrypt.hashSync('Store@2026', 10);
            await connection.query('INSERT INTO admins (username, password) VALUES (?, ?)', ['store_admin', hashedPassword]);
            
            console.log('Database initialized with sample data!');
        }
    } catch (error) {
        console.error('Database initialization error:', error);
    } finally {
        connection.release();
    }
}

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.status(401).json({ success: false, message: 'Please login first' });
}

function isAdmin(req, res, next) {
    if (req.session.admin) {
        return next();
    }
    res.status(401).json({ success: false, message: 'Admin access required' });
}

app.post('/api/register', async (req, res) => {
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

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }
        req.session.user = { id: user.id, name: user.name, email: user.email };
        res.json({ success: true, message: 'Login successful!', user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

app.get('/api/categories', async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT * FROM categories ORDER BY category_name');
        res.json({ success: true, categories });
    } catch (error) {
        console.error('Categories error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const categoryId = req.query.category;
        let sql = 'SELECT p.*, c.category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1';
        if (categoryId) {
            sql += ' AND p.category_id = ?';
            const [products] = await pool.query(sql, [categoryId]);
            return res.json({ success: true, products });
        }
        sql += ' ORDER BY p.created_at DESC';
        const [products] = await pool.query(sql);
        res.json({ success: true, products });
    } catch (error) {
        console.error('Products error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/api/cart', isAuthenticated, async (req, res) => {
    try {
        const user_id = req.session.user.id;
        const [cartItems] = await pool.query(`
            SELECT c.id, c.quantity, p.id as product_id, p.product_name, p.price, p.image, p.stock
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
        `, [user_id]);
        res.json({ success: true, cart: cartItems });
    } catch (error) {
        console.error('Cart error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/cart/add', isAuthenticated, async (req, res) => {
    try {
        const { product_id, quantity } = req.body;
        const user_id = req.session.user.id;
        const [products] = await pool.query('SELECT stock FROM products WHERE id = ?', [product_id]);
        if (products.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        const [existing] = await pool.query('SELECT * FROM cart WHERE user_id = ? AND product_id = ?', [user_id, product_id]);
        if (existing.length > 0) {
            await pool.query('UPDATE cart SET quantity = quantity + ? WHERE id = ?', [quantity, existing[0].id]);
        } else {
            await pool.query('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)', [user_id, product_id, quantity]);
        }
        res.json({ success: true, message: 'Added to cart!' });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.delete('/api/cart/remove/:id', isAuthenticated, async (req, res) => {
    try {
        const user_id = req.session.user.id;
        await pool.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [req.params.id, user_id]);
        res.json({ success: true, message: 'Item removed!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/order', isAuthenticated, async (req, res) => {
    try {
        const { shipping_address, payment_method } = req.body;
        const user_id = req.session.user.id;
        const [cartItems] = await pool.query(`
            SELECT c.quantity, p.price, p.stock, p.id as product_id
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
        `, [user_id]);

        if (cartItems.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        let totalAmount = 0;
        for (const item of cartItems) {
            if (item.quantity > item.stock) {
                return res.status(400).json({ success: false, message: `Insufficient stock for product ID ${item.product_id}` });
            }
            totalAmount += item.price * item.quantity;
        }

        const [orderResult] = await pool.query(
            'INSERT INTO orders (user_id, total_amount, shipping_address, payment_method) VALUES (?, ?, ?, ?)',
            [user_id, totalAmount, shipping_address, payment_method || 'Cash']
        );
        const orderId = orderResult.insertId;

        for (const item of cartItems) {
            await pool.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price]
            );
            await pool.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
        }

        await pool.query('DELETE FROM cart WHERE user_id = ?', [user_id]);
        res.json({ success: true, message: 'Order placed successfully!', order_id: orderId });
    } catch (error) {
        console.error('Order error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/api/orders', isAuthenticated, async (req, res) => {
    try {
        const user_id = req.session.user.id;
        const [orders] = await pool.query(`
            SELECT o.*, GROUP_CONCAT(p.product_name) as products
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE o.user_id = ?
            GROUP BY o.id
            ORDER BY o.order_date DESC
        `, [user_id]);
        res.json({ success: true, orders });
    } catch (error) {
        console.error('Orders error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.put('/api/cancel-order/:id', isAuthenticated, async (req, res) => {
    try {
        const user_id = req.session.user.id;
        const [orders] = await pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, user_id]);
        if (orders.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        if (orders[0].status !== 'Pending') {
            return res.status(400).json({ success: false, message: 'Only pending orders can be cancelled' });
        }
        await pool.query('UPDATE orders SET status = ? WHERE id = ?', ['Cancelled', req.params.id]);
        res.json({ success: true, message: 'Order cancelled!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const [admins] = await pool.query('SELECT * FROM admins WHERE username = ?', [username]);
        if (admins.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }
        const admin = admins[0];
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }
        req.session.admin = { id: admin.id, username: admin.username };
        res.json({ success: true, message: 'Login successful!', admin: { id: admin.id, username: admin.username } });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/admin/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

app.get('/admin/stats', isAdmin, async (req, res) => {
    try {
        const [userCount] = await pool.query('SELECT COUNT(*) as count FROM users');
        const [orderCount] = await pool.query('SELECT COUNT(*) as count FROM orders');
        const [productCount] = await pool.query('SELECT COUNT(*) as count FROM products');
        const [revenue] = await pool.query("SELECT SUM(total_amount) as total FROM orders WHERE status = 'Completed'");
        const [pendingOrders] = await pool.query("SELECT COUNT(*) as count FROM orders WHERE status = 'Pending'");
        res.json({
            success: true,
            stats: {
                users: userCount[0].count,
                orders: orderCount[0].count,
                products: productCount[0].count,
                revenue: revenue[0].total || 0,
                pendingOrders: pendingOrders[0].count
            }
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/admin/orders', isAdmin, async (req, res) => {
    try {
        const [orders] = await pool.query(`
            SELECT o.*, u.name as user_name, u.email as user_email, u.phone as user_phone
            FROM orders o
            JOIN users u ON o.user_id = u.id
            ORDER BY o.order_date DESC
        `);
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/admin/products', isAdmin, async (req, res) => {
    try {
        const [products] = await pool.query('SELECT p.*, c.category_name FROM products p JOIN categories c ON p.category_id = c.id ORDER BY p.id');
        res.json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/admin/add-product', isAdmin, async (req, res) => {
    try {
        const { product_name, category_id, description, price, image, stock } = req.body;
        await pool.query(
            'INSERT INTO products (product_name, category_id, description, price, image, stock) VALUES (?, ?, ?, ?, ?, ?)',
            [product_name, category_id, description, price, image, stock || 0]
        );
        res.json({ success: true, message: 'Product added!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.delete('/admin/delete-product/:id', isAdmin, async (req, res) => {
    try {
        await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Product deleted!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/admin/users', isAdmin, async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, name, email, phone, created_at FROM users ORDER BY created_at DESC');
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/products', (req, res) => res.sendFile(path.join(__dirname, 'public', 'products.html')));
app.get('/cart', (req, res) => res.sendFile(path.join(__dirname, 'public', 'cart.html')));
app.get('/orders', (req, res) => res.sendFile(path.join(__dirname, 'public', 'orders.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));
app.get('/admin-login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin-login.html')));
app.get('/admin-dashboard', (req, res) => req.session.admin ? res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html')) : res.redirect('/admin-login'));
app.get('/admin-products', (req, res) => req.session.admin ? res.sendFile(path.join(__dirname, 'public', 'admin-products.html')) : res.redirect('/admin-login'));
app.get('/admin-orders', (req, res) => req.session.admin ? res.sendFile(path.join(__dirname, 'public', 'admin-orders.html')) : res.redirect('/admin-login'));
app.get('/admin-users', (req, res) => req.session.admin ? res.sendFile(path.join(__dirname, 'public', 'admin-users.html')) : res.redirect('/admin-login'));

initDB().then(() => {
    app.listen(PORT, () => {
        console.log('========================================');
        console.log('  E-Commerce Server Running (MySQL)');
        console.log('========================================');
        console.log(`  Server: http://localhost:${PORT}`);
        console.log(`  Admin: http://localhost:${PORT}/admin-login`);
        console.log('  Admin Username: store_admin');
        console.log('  Admin Password: Store@2026');
        console.log('========================================');
    });
});

module.exports = app;
