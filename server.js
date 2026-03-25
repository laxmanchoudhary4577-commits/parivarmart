const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const initSqlJs = require('sql.js');

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

let db;

function query(sql, params = []) {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
        results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
}

function run(sql, params = []) {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    stmt.step();
    stmt.free();
    return { lastID: db.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0] || 0 };
}

function getOne(sql, params = []) {
    const results = query(sql, params);
    return results[0] || null;
}

async function initDB() {
    const SQL = await initSqlJs();
    db = new SQL.Database();
    
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            token TEXT NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_name TEXT NOT NULL,
            category_image TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_name TEXT NOT NULL,
            category_id INTEGER NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            image TEXT,
            stock INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories(id)
        );

        CREATE TABLE IF NOT EXISTS cart (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
        );

        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            total_amount REAL NOT NULL,
            status TEXT DEFAULT 'Pending',
            shipping_address TEXT,
            payment_method TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
        );

        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    const existingCategories = query('SELECT COUNT(*) as count FROM categories');
    if (existingCategories[0].count === 0) {
        db.run(`INSERT INTO categories (category_name, category_image) VALUES 
            ('Fruits & Vegetables', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=250'),
            ('Dairy & Eggs', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=250'),
            ('Bakery & Biscuits', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=250'),
            ('Snacks & Munchies', 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=250'),
            ('Beverages', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=250'),
            ('Beauty & Personal Care', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=250'),
            ('Home Care', 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=250'),
            ('Baby Care', 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=250'),
            ('Pet Care', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=250'),
            ('Staples', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=250')`);
            
        db.run(`INSERT INTO products (product_name, category_id, description, price, image, stock) VALUES
            ('Fresh Apple', 1, 'Organic red apples 1kg', 180, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=250', 100),
            ('Fresh Banana', 1, 'Yellow bananas 1 dozen', 50, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=250', 150),
            ('Fresh Onion', 1, 'Red onions 1kg', 40, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=250', 200),
            ('Fresh Potato', 1, 'Organic potatoes 1kg', 35, 'https://images.unsplash.com/photo-1518977676601-b53f82b8777d?w=250', 200),
            ('Fresh Tomato', 1, 'Red tomatoes 1kg', 45, 'https://images.unsplash.com/photo-1546470427-e26264be0b0e?w=250', 150),
            ('Green Capsicum', 1, 'Fresh green capsicum 500g', 60, 'https://images.unsplash.com/photo-1563564925-223d12429b5a?w=250', 80),
            ('Carrots', 1, 'Fresh carrots 1kg', 40, 'https://images.unsplash.com/photo-1598170845078-1e5c875a4e8e?w=250', 100),
            ('Spinach', 1, 'Fresh green spinach 250g', 25, 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=250', 120),
            ('Milk', 2, 'Fresh toned milk 1L', 55, 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=250', 200),
            ('Curd', 2, 'Fresh curd 400g', 35, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=250', 100),
            ('Paneer', 2, 'Fresh paneer 200g', 70, 'https://images.unsplash.com/photo-1559755288-7042e2dc20e1?w=250', 80),
            ('Eggs', 2, 'Farm fresh eggs (12 pcs)', 80, 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=250', 300),
            ('Butter', 2, 'Premium butter 100g', 60, 'https://images.unsplash.com/photo-1589985270958-bf087b4c9e0c?w=250', 100),
            ('Cheese', 2, 'Processed cheese 200g', 90, 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=250', 60),
            ('Bread', 3, 'Whole wheat bread 400g', 40, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=250', 150),
            ('Croissant', 3, 'Fresh butter croissant 2 pcs', 80, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=250', 50),
            ('Cookies', 3, 'Chocolate cookies 200g', 50, 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=250', 200),
            ('Biscuits', 3, 'Marie biscuits 200g', 30, 'https://images.unsplash.com/photo-1493087651729-2e785200d3f8?w=250', 250),
            ('Chips', 4, 'Potato chips 100g', 35, 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=250', 180),
            ('Namkeen', 4, 'Mixed namkeen 250g', 45, 'https://images.unsplash.com/photo-1621951753163-0f9ae1a61f8e?w=250', 120),
            ('Peanuts', 4, 'Roasted peanuts 200g', 60, 'https://images.unsplash.com/photo-1615497001839-b0a0eac3274c?w=250', 80),
            ('Chocolate', 4, 'Dark chocolate 100g', 70, 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=250', 100),
            ('Orange Juice', 5, 'Fresh orange juice 1L', 120, 'https://images.unsplash.com/photo-1600271881702-90fbbc5abe23?w=250', 80),
            ('Mango Juice', 5, 'Alphonso mango juice 1L', 150, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=250', 60),
            ('Cold Coffee', 5, 'Ready to drink cold coffee 250ml', 50, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=250', 100),
            ('Soft Drinks', 5, 'Cola 500ml', 40, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=250', 200),
            ('Water Bottle', 5, 'Mineral water 1L', 20, 'https://images.unsplash.com/photo-1560023907-5f339617ea30?w=250', 300),
            ('Shampoo', 6, 'Anti-dandruff shampoo 200ml', 250, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=250', 80),
            ('Soap', 6, 'Moisturizing soap 125g', 40, 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=250', 150),
            ('Toothpaste', 6, 'Fluoride toothpaste 100g', 80, 'https://images.unsplash.com/photo-1559553156-2e97137af16f?w=250', 200),
            ('Face Cream', 6, 'Moisturizing face cream 50g', 180, 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcc90?w=250', 60),
            ('Detergent', 7, 'Liquid detergent 1L', 350, 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=250', 100),
            ('Dishwash', 7, 'Dishwashing liquid 500ml', 120, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=250', 80),
            ('Floor Cleaner', 7, 'Multi-surface floor cleaner 1L', 180, 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=250', 60),
            ('Baby Soap', 8, 'Gentle baby soap 75g', 50, 'https://images.unsplash.com/photo-1552693673-1bf958298935?w=250', 100),
            ('Baby Powder', 8, 'Talc-free baby powder 200g', 120, 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=250', 80),
            ('Diapers', 8, 'Baby diapers pack of 30', 450, 'https://images.unsplash.com/photo-1507652313519-d4e917499ed9?w=250', 50),
            ('Glass Cleaner Spray', 7, 'Streak-free glass cleaner 500ml', 90, '/images/glass_cleaner.png', 100),
            ('Toilet Cleaner', 7, 'Strong toilet cleaner liquid 500ml', 150, 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=250', 80),
            ('Air Freshener', 7, 'Rose fragrance room spray 300ml', 199, '/images/air_freshener.png', 50),
            ('Garbage Bags', 7, 'Medium size garbage bags pack of 30', 120, '/images/garbage_bags.png', 150),
            ('Baby Lotion', 8, 'Gentle moisturizing baby lotion 200ml', 250, '/images/baby_lotion.png', 60),
            ('Baby Wipes', 8, 'Soft baby wet wipes pack of 80', 150, '/images/baby_wipes.png', 200),
            ('Baby Shampoo', 8, 'Tear-free baby shampoo 200ml', 200, 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=250', 90),
            ('Baby Massage Oil', 8, 'Nourishing baby massage oil 100ml', 300, 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=250', 40),
            ('Dog Food', 9, 'Premium dog food 5kg', 1200, 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=250', 30),
            ('Cat Food', 9, 'Premium cat food 1kg', 350, 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=250', 40),
            ('Pet Treats', 9, 'Dog treats 500g', 200, 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=250', 50),
            ('Basmati Rice', 10, 'Premium basmati rice 1kg', 199, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=250', 150),
            ('Sugar', 10, 'Pure white sugar 1kg', 45, 'https://images.unsplash.com/photo-1588833616353-82c68c389a0d?w=250', 200),
            ('Salt', 10, 'Iodized salt 1kg', 25, 'https://images.unsplash.com/photo-1518112390430-94a6c11aa475?w=250', 300),
            ('Cooking Oil', 10, 'Refined oil 1L', 150, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=250', 100),
            ('Dal', 10, 'Premium urad dal 1kg', 120, 'https://images.unsplash.com/photo-1518481615372-33879a7c11e0?w=250', 120),
            ('Atta', 10, 'Whole wheat atta 10kg', 450, 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=250', 80),
            ('Besan', 10, 'Premium besan 1kg', 80, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=250', 100),
            ('Tea', 10, 'Premium tea leaves 250g', 80, 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cbe9?w=250', 150),
            ('Coffee', 10, 'Instant coffee 100g', 150, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=250', 80)`);

        const adminExists = query('SELECT COUNT(*) as count FROM admins');
        if (adminExists[0].count === 0) {
            const hashedPassword = bcrypt.hashSync('Store@2026', 10);
            db.run('INSERT INTO admins (username, password) VALUES (?, ?)', ['store_admin', hashedPassword]);
        }
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

        const existing = getOne('SELECT id FROM users WHERE email = ?', [email]);
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        run('INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)', [name, email, phone, hashedPassword]);

        res.json({ success: true, message: 'Registration successful!' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const user = getOne('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            return res.status(400).json({ success: false, message: 'Email not registered' });
        }

        const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const expires_at = new Date(Date.now() + 60 * 60 * 1000).toISOString();

        run('DELETE FROM password_reset_tokens WHERE email = ?', [email]);
        run('INSERT INTO password_reset_tokens (email, token, expires_at) VALUES (?, ?, ?)', [email, token, expires_at]);

        console.log('========================================');
        console.log('  PASSWORD RESET LINK');
        console.log('========================================');
        console.log('  Email: ' + email);
        console.log('  Reset URL: http://localhost:3000/reset-password.html?code=' + token);
        console.log('========================================');

        res.json({ success: true, message: 'Reset link generated! Check console for link (Demo Mode)' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/reset-password', async (req, res) => {
    try {
        const { code, newPassword } = req.body;

        if (!code || !newPassword) {
            return res.status(400).json({ success: false, message: 'Code and new password required' });
        }

        const resetToken = getOne('SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at > datetime("now")', [code]);

        if (!resetToken) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset code' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        run('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, resetToken.email]);
        run('DELETE FROM password_reset_tokens WHERE token = ?', [code]);

        res.json({ success: true, message: 'Password reset successfully!' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password required' });
        }

        const user = getOne('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        req.session.user = { id: user.id, name: user.name, email: user.email };

        res.json({
            success: true,
            message: 'Login successful!',
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/api/check-session', (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});

app.get('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

app.get('/api/categories', (req, res) => {
    try {
        const categories = query('SELECT * FROM categories ORDER BY category_name');
        res.json({ success: true, categories });
    } catch (error) {
        console.error('Categories error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/api/products', (req, res) => {
    try {
        const categoryId = req.query.category;

        let sql = 'SELECT p.*, c.category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1';

        if (categoryId) {
            sql += ' AND p.category_id = ?';
            const products = query(sql, [categoryId]);
            return res.json({ success: true, products });
        }

        sql += ' ORDER BY p.created_at DESC';
        const products = query(sql);
        res.json({ success: true, products });
    } catch (error) {
        console.error('Products error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/cart/add', isAuthenticated, (req, res) => {
    try {
        const { product_id, quantity } = req.body;
        const user_id = req.session.user.id;

        if (!product_id || !quantity || quantity < 1) {
            return res.status(400).json({ success: false, message: 'Invalid data' });
        }

        const product = getOne('SELECT stock FROM products WHERE id = ?', [product_id]);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const existing = getOne('SELECT * FROM cart WHERE user_id = ? AND product_id = ?', [user_id, product_id]);

        if (existing) {
            const newQty = existing.quantity + quantity;
            run('UPDATE cart SET quantity = ? WHERE id = ?', [newQty, existing.id]);
        } else {
            run('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)', [user_id, product_id, quantity]);
        }

        res.json({ success: true, cartCount: getCartCount(user_id) });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

function getCartCount(user_id) {
    const cart = getOne('SELECT SUM(quantity) as count FROM cart WHERE user_id = ?', [user_id]);
    return cart.count || 0;
}

app.get('/api/cart', isAuthenticated, (req, res) => {
    try {
        const user_id = req.session.user.id;

        const cartItems = query(`
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

app.put('/api/cart/update/:id', isAuthenticated, (req, res) => {
    try {
        const { quantity } = req.body;
        const user_id = req.session.user.id;

        if (quantity < 1) {
            return res.status(400).json({ success: false, message: 'Invalid quantity' });
        }

        run('UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?', [quantity, req.params.id, user_id]);
        res.json({ success: true, message: 'Cart updated!' });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.delete('/api/cart/remove/:id', isAuthenticated, (req, res) => {
    try {
        const user_id = req.session.user.id;
        run('DELETE FROM cart WHERE id = ? AND user_id = ?', [req.params.id, user_id]);
        res.json({ success: true, message: 'Item removed from cart!' });
    } catch (error) {
        console.error('Remove cart error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/order', isAuthenticated, (req, res) => {
    try {
        const { shipping_address, payment_method } = req.body;
        const user_id = req.session.user.id;

        const cartItems = query(`
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

        const orderResult = run(
            'INSERT INTO orders (user_id, total_amount, shipping_address, payment_method) VALUES (?, ?, ?, ?)',
            [user_id, totalAmount, shipping_address, payment_method || 'Cash']
        );

        const orderId = orderResult.lastID;

        for (const item of cartItems) {
            run(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price]
            );
            run('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
        }

        run('DELETE FROM cart WHERE user_id = ?', [user_id]);

        res.json({ success: true, message: 'Order placed successfully!', order_id: orderId });
    } catch (error) {
        console.error('Order error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/api/orders', isAuthenticated, (req, res) => {
    try {
        const user_id = req.session.user.id;

        const orders = query(`
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

app.put('/api/cancel-order/:id', isAuthenticated, (req, res) => {
    try {
        const user_id = req.session.user.id;
        const orderId = req.params.id;

        const order = getOne('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, user_id]);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.status !== 'Pending') {
            return res.status(400).json({ success: false, message: 'Only pending orders can be cancelled' });
        }

        const orderItems = query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
        for (const item of orderItems) {
            run('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
        }

        run('UPDATE orders SET status = ? WHERE id = ?', ['Cancelled', orderId]);

        res.json({ success: true, message: 'Order cancelled successfully!' });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password required' });
        }

        const admin = getOne('SELECT * FROM admins WHERE username = ?', [username]);

        if (!admin) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        req.session.admin = { id: admin.id, username: admin.username };

        res.json({
            success: true,
            message: 'Login successful!',
            admin: { id: admin.id, username: admin.username }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/admin/check-session', (req, res) => {
    if (req.session.admin) {
        res.json({ loggedIn: true, admin: req.session.admin });
    } else {
        res.json({ loggedIn: false });
    }
});

app.get('/admin/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

app.get('/admin/users', isAdmin, (req, res) => {
    try {
        const users = query('SELECT id, name, email, phone, created_at FROM users ORDER BY created_at DESC');
        res.json({ success: true, users });
    } catch (error) {
        console.error('Users error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/admin/orders', isAdmin, (req, res) => {
    try {
        const orders = query(`
            SELECT o.*, u.name as user_name, u.email as user_email, u.phone as user_phone
            FROM orders o
            JOIN users u ON o.user_id = u.id
            ORDER BY o.order_date DESC
        `);
        res.json({ success: true, orders });
    } catch (error) {
        console.error('Orders error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/admin/all-orders', isAdmin, (req, res) => {
    try {
        const orders = query(`
            SELECT o.*, u.name as user_name, u.email as user_email, u.phone as user_phone,
                   GROUP_CONCAT(p.product_name || ' (x' || oi.quantity || ')') as products
            FROM orders o
            JOIN users u ON o.user_id = u.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            GROUP BY o.id
            ORDER BY o.order_date DESC
        `);
        res.json({ success: true, orders });
    } catch (error) {
        console.error('Orders error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.put('/admin/update-order/:id', isAdmin, (req, res) => {
    try {
        const { status } = req.body;
        run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true, message: 'Order updated!' });
    } catch (error) {
        console.error('Update order error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/admin/products', isAdmin, (req, res) => {
    try {
        const products = query('SELECT p.*, c.category_name FROM products p JOIN categories c ON p.category_id = c.id ORDER BY p.id');
        res.json({ success: true, products });
    } catch (error) {
        console.error('Products error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/admin/add-product', isAdmin, (req, res) => {
    try {
        const { product_name, category_id, description, price, image, stock } = req.body;

        if (!product_name || !category_id || !price) {
            return res.status(400).json({ success: false, message: 'Required fields missing' });
        }

        run(
            'INSERT INTO products (product_name, category_id, description, price, image, stock) VALUES (?, ?, ?, ?, ?, ?)',
            [product_name, category_id, description, price, image, stock || 0]
        );

        res.json({ success: true, message: 'Product added!' });
    } catch (error) {
        console.error('Add product error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.put('/admin/update-product/:id', isAdmin, (req, res) => {
    try {
        const { product_name, category_id, description, price, image, stock, is_active } = req.body;

        run(
            'UPDATE products SET product_name = ?, category_id = ?, description = ?, price = ?, image = ?, stock = ?, is_active = ? WHERE id = ?',
            [product_name, category_id, description, price, image, stock, is_active, req.params.id]
        );

        res.json({ success: true, message: 'Product updated!' });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.delete('/admin/delete-product/:id', isAdmin, (req, res) => {
    try {
        run('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Product deleted!' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/admin/stats', isAdmin, (req, res) => {
    try {
        const userCount = getOne('SELECT COUNT(*) as count FROM users');
        const orderCount = getOne('SELECT COUNT(*) as count FROM orders');
        const productCount = getOne('SELECT COUNT(*) as count FROM products');
        const revenue = getOne("SELECT SUM(total_amount) as total FROM orders WHERE status = 'Completed'");
        const pendingOrders = getOne("SELECT COUNT(*) as count FROM orders WHERE status = 'Pending'");

        res.json({
            success: true,
            stats: {
                users: userCount.count,
                orders: orderCount.count,
                products: productCount.count,
                revenue: revenue.total || 0,
                pendingOrders: pendingOrders.count
            }
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/products', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'products.html'));
});

app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cart.html'));
});

app.get('/orders', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'orders.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/forgot-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'forgot-password.html'));
});

app.get('/reset-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
});

app.get('/admin-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

app.get('/admin-dashboard', (req, res) => {
    if (!req.session.admin) {
        return res.redirect('/admin-login');
    }
    res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});

app.get('/admin-products', (req, res) => {
    if (!req.session.admin) {
        return res.redirect('/admin-login');
    }
    res.sendFile(path.join(__dirname, 'public', 'admin-products.html'));
});

app.get('/admin-orders', (req, res) => {
    if (!req.session.admin) {
        return res.redirect('/admin-login');
    }
    res.sendFile(path.join(__dirname, 'public', 'admin-orders.html'));
});

app.get('/admin-users', (req, res) => {
    if (!req.session.admin) {
        return res.redirect('/admin-login');
    }
    res.sendFile(path.join(__dirname, 'public', 'admin-users.html'));
});

initDB().then(() => {
    app.listen(PORT, () => {
        console.log('========================================');
        console.log('  E-Commerce Server Running');
        console.log('========================================');
        console.log(`  Server: http://localhost:${PORT}`);
        console.log(`  Admin: http://localhost:${PORT}/admin-login`);
        console.log('  Admin Username: store_admin');
        console.log('  Admin Password: Store@2026');
        console.log('========================================');
    });
});

module.exports = app;