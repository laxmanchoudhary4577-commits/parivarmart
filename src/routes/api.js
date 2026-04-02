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
        const categoriesData = [
            ['Fruits & Vegetables', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400'],
            ['Dairy & Eggs', 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400'],
            ['Bakery & Biscuits', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'],
            ['Snacks & Munchies', 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400'],
            ['Beverages', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400'],
            ['Beauty & Personal Care', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400'],
            ['Home Care', 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400'],
            ['Baby Care', 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400'],
            ['Pet Care', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400'],
            ['Staples', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400']
        ];
        
        for (const [name, image] of categoriesData) {
            await pool.query('INSERT IGNORE INTO categories (category_name, category_image) VALUES (?, ?)', [name, image]);
        }
        
        const productsData = [
            ['Fresh Apple', 'Organic red apples 1kg', 180, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400', 100, 1],
            ['Fresh Banana', 'Yellow bananas 1 dozen', 50, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400', 150, 1],
            ['Fresh Onion', 'Red onions 1kg', 40, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400', 200, 1],
            ['Fresh Potato', 'Organic potatoes 1kg', 35, 'https://images.unsplash.com/photo-1518977676601-b53f82b8777d?w=400', 200, 1],
            ['Fresh Tomato', 'Red tomatoes 1kg', 45, 'https://images.unsplash.com/photo-1546470427-e26264be0b0e?w=400', 150, 1],
            ['Milk', 'Fresh toned milk 1L', 55, 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400', 200, 2],
            ['Curd', 'Fresh curd 400g', 35, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', 100, 2],
            ['Paneer', 'Fresh paneer 200g', 70, 'https://images.unsplash.com/photo-1559755288-7042e2dc20e1?w=400', 80, 2],
            ['Eggs', 'Farm fresh eggs (12 pcs)', 80, 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400', 300, 2],
            ['Butter', 'Premium butter 100g', 60, 'https://images.unsplash.com/photo-1589985270958-bf087b4c9e0c?w=400', 100, 2],
            ['Cheese', 'Processed cheese 200g', 90, 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400', 60, 2],
            ['Ghee', 'Pure ghee 500ml', 350, 'https://images.unsplash.com/photo-1600189020959-3c097d3b6dd3?w=400', 40, 2],
            ['Bread', 'Whole wheat bread 400g', 40, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', 150, 3],
            ['Croissant', 'Fresh butter croissant 2 pcs', 80, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', 50, 3],
            ['Cookies', 'Chocolate cookies 200g', 50, 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400', 200, 3],
            ['Biscuits', 'Marie biscuits 200g', 30, 'https://images.unsplash.com/photo-1493087651729-2e785200d3f8?w=400', 250, 3],
            ['Donut', 'Glazed donut 2 pcs', 70, 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400', 50, 3],
            ['Cake', 'Vanilla cake slice 100g', 50, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', 60, 3],
            ['Chips', 'Potato chips 100g', 35, 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400', 180, 4],
            ['Namkeen', 'Mixed namkeen 250g', 45, 'https://images.unsplash.com/photo-1621951753163-0f9ae1a61f8e?w=400', 120, 4],
            ['Peanuts', 'Roasted peanuts 200g', 60, 'https://images.unsplash.com/photo-1615497001839-b0a0eac3274c?w=400', 80, 4],
            ['Chocolate', 'Dark chocolate 100g', 70, 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400', 100, 4],
            ['Popcorn', 'Butter popcorn 100g', 40, 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400', 100, 4],
            ['Noodles', 'Instant noodles pack 70g', 25, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400', 150, 4],
            ['Orange Juice', 'Fresh orange juice 1L', 120, 'https://images.unsplash.com/photo-1600271881702-90fbbc5abe23?w=400', 80, 5],
            ['Mango Juice', 'Alphonso mango juice 1L', 150, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400', 60, 5],
            ['Cold Coffee', 'Ready to drink cold coffee 250ml', 50, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', 100, 5],
            ['Soft Drinks', 'Cola 500ml', 40, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400', 200, 5],
            ['Water Bottle', 'Mineral water 1L', 20, 'https://images.unsplash.com/photo-1560023907-5f339617ea30?w=400', 300, 5],
            ['Energy Drink', 'Energy drink 250ml', 50, 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=400', 80, 5],
            ['Shampoo', 'Anti-dandruff shampoo 200ml', 250, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', 80, 6],
            ['Soap', 'Moisturizing soap 125g', 40, 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400', 150, 6],
            ['Toothpaste', 'Fluoride toothpaste 100g', 80, 'https://images.unsplash.com/photo-1559553156-2e97137af16f?w=400', 200, 6],
            ['Face Cream', 'Moisturizing face cream 50g', 180, 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcc90?w=400', 60, 6],
            ['Hair Oil', 'Coconut hair oil 200ml', 150, 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400', 50, 6],
            ['Lotion', 'Body lotion 200ml', 180, 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', 60, 6],
            ['Detergent', 'Liquid detergent 1L', 350, 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400', 100, 7],
            ['Dishwash', 'Dishwashing liquid 500ml', 120, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400', 80, 7],
            ['Floor Cleaner', 'Multi-surface floor cleaner 1L', 180, 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400', 60, 7],
            ['Air Freshener', 'Room freshener 400ml', 180, 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400', 50, 7],
            ['Glass Cleaner', 'Glass cleaner 500ml', 120, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400', 60, 7],
            ['Baby Soap', 'Gentle baby soap 75g', 50, 'https://images.unsplash.com/photo-1552693673-1bf958298935?w=400', 100, 8],
            ['Baby Powder', 'Talc-free baby powder 200g', 120, 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400', 80, 8],
            ['Diapers', 'Baby diapers pack of 30', 450, 'https://images.unsplash.com/photo-1507652313519-d4e917499ed9?w=400', 50, 8],
            ['Baby Oil', 'Baby massage oil 200ml', 120, 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400', 60, 8],
            ['Baby Wipes', 'Baby wet wipes 80 pcs', 150, 'https://images.unsplash.com/photo-1507652313519-d4e917499ed9?w=400', 80, 8],
            ['Baby Lotion', 'Baby body lotion 200ml', 180, 'https://images.unsplash.com/photo-1552693673-1bf958298935?w=400', 50, 8],
            ['Dog Food', 'Premium dog food 5kg', 1200, 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400', 30, 9],
            ['Cat Food', 'Premium cat food 1kg', 350, 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400', 40, 9],
            ['Pet Treats', 'Dog treats 500g', 200, 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400', 50, 9],
            ['Cat Litter', 'Cat litter 5kg', 400, 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400', 30, 9],
            ['Pet Shampoo', 'Pet shampoo 200ml', 250, 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400', 40, 9],
            ['Basmati Rice', 'Premium basmati rice 1kg', 199, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', 150, 10],
            ['Sugar', 'Pure white sugar 1kg', 45, 'https://images.unsplash.com/photo-1588833616353-82c68c389a0d?w=400', 200, 10],
            ['Salt', 'Iodized salt 1kg', 25, 'https://images.unsplash.com/photo-1518112390430-94a6c11aa475?w=400', 300, 10],
            ['Cooking Oil', 'Refined oil 1L', 150, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', 100, 10],
            ['Dal', 'Premium urad dal 1kg', 120, 'https://images.unsplash.com/photo-1518481615372-33879a7c11e0?w=400', 120, 10],
            ['Atta', 'Whole wheat atta 10kg', 450, 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400', 80, 10],
            ['Tea', 'Premium tea leaves 250g', 80, 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cbe9?w=400', 150, 10],
            ['Coffee', 'Instant coffee 100g', 150, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400', 80, 10],
            ['Green Grapes', 'Sweet green grapes 500g', 120, 'https://images.unsplash.com/photo-1597411489780-3182efc5a83a?w=400', 80, 1],
            ['Orange', 'Fresh oranges 1kg', 90, 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400', 120, 1],
            ['Watermelon', 'Sweet watermelon 1pc', 50, 'https://images.unsplash.com/photo-1563114773-84221bd62daa?w=400', 100, 1],
            ['Mango', 'Alphonso mango 1kg', 200, 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400', 80, 1],
            ['Lemon', 'Fresh lemon 250g', 25, 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=400', 150, 1],
            ['Garlic', 'Fresh garlic 250g', 30, 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2f85?w=400', 120, 1],
            ['Yogurt', 'Flavored yogurt 150g', 40, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', 100, 2],
            ['Cream', 'Fresh cream 200ml', 60, 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400', 80, 2],
            ['Ice Cream', 'Vanilla ice cream 500ml', 150, 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400', 60, 2],
            ['Lassi', 'Sweet lassi 250ml', 30, 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400', 80, 2],
            ['Muffin', 'Chocolate muffin 2 pcs', 60, 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400', 50, 3],
            ['Pastry', 'Fresh pastry 1pc', 45, 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400', 60, 3],
            ['Rusk', 'Sweet rusk 400g', 45, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400', 80, 3],
            ['Kurkure', 'Crispy kurkure 150g', 35, 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400', 150, 4],
            ['Bhujia', 'Spicy bhujia 250g', 50, 'https://images.unsplash.com/photo-1621951753163-0f9ae1a61f8e?w=400', 100, 4],
            ['Trail Mix', 'Dry fruit mix 200g', 120, 'https://images.unsplash.com/photo-1615497001839-b0a0eac3274c?w=400', 60, 4],
            ['Iced Tea', 'Lemon iced tea 500ml', 45, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', 100, 5],
            ['Milkshake', 'Chocolate milkshake 250ml', 60, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400', 70, 5],
            ['Coconut Water', 'Fresh coconut water 1L', 60, 'https://images.unsplash.com/photo-1525385133512-2f346b384338?w=400', 80, 5],
            ['Face Wash', 'Vitamin C face wash 100g', 180, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', 50, 6],
            ['Sunscreen', 'SPF 50 sunscreen 50ml', 250, 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', 40, 6],
            ['Lip Balm', 'Moisturizing lip balm 10g', 40, 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400', 100, 6],
            ['Hand Cream', 'Hand cream 100ml', 120, 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcc90?w=400', 60, 6],
            ['Bleach', 'Face bleach 100g', 120, 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400', 50, 7],
            ['Scrub', 'Floor scrub 500g', 100, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400', 60, 7],
            ['Tissue Box', 'Facial tissue 100 sheets', 40, 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400', 100, 7],
            ['Baby Feed', 'Baby food jar 100g', 80, 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400', 50, 8],
            ['Baby Cream', 'Baby cream 100g', 100, 'https://images.unsplash.com/photo-1552693673-1bf958298935?w=400', 60, 8],
            ['Kids Snacks', 'Kids snacks pack 100g', 50, 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400', 80, 8],
            ['Bird Seed', 'Bird seed 1kg', 150, 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400', 30, 9],
            ['Pet Bowl', 'Stainless pet bowl 500ml', 120, 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400', 50, 9],
            ['Besan', 'Gram flour 1kg', 80, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400', 100, 10],
            ['Maida', 'All purpose flour 1kg', 50, 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400', 120, 10],
            ['Papad', 'Roasted papad 200g', 60, 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cbe9?w=400', 80, 10],
            ['Pickle', 'Mango pickle 400g', 100, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400', 60, 10],
            ['Chilli Powder', 'Red chilli powder 100g', 50, 'https://images.unsplash.com/photo-1518112390430-94a6c11aa475?w=400', 100, 10]
        ];
        
        for (const [name, desc, price, image, stock, catId] of productsData) {
            await pool.query('INSERT IGNORE INTO products (product_name, category_id, description, price, image, stock, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)', [name, catId, desc, price, image, stock]);
        }
        res.json({ success: true, message: 'Categories and Products added!' });
    } catch (error) {
        console.error('Seed error:', error);
        res.status(500).json({ success: false, message: 'Seed error: ' + error.message });
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
        
        // Force session save before responding
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ success: false, message: 'Session error' });
            }
            res.json({ success: true, message: 'Login successful!', user: req.session.user });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.json({ success: false, message: 'Logout failed' });
        }
        res.clearCookie('sessionId');
        res.json({ success: true });
    });
});

router.get('/categories', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM categories ORDER BY category_name');
        res.json({ success: true, categories: rows });
    } catch (error) {
        console.error('Categories error:', error);
        res.json({ success: true, categories: [] });
    }
});

router.get('/products', async (req, res) => {
    try {
        const categoryId = req.query.category;
        
        if (categoryId) {
            const [rows] = await pool.query('SELECT p.*, c.category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1 AND p.category_id = ? ORDER BY p.created_at DESC', [categoryId]);
            return res.json({ success: true, products: rows });
        }
        
        const [rows] = await pool.query('SELECT p.*, c.category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1 ORDER BY p.created_at DESC');
        res.json({ success: true, products: rows });
    } catch (error) {
        console.error('Products error:', error);
        res.json({ success: true, products: [] });
    }
});

router.get('/products', async (req, res) => {
    try {
        console.log('Fetching products...');
        const categoryId = req.query.category;
        let sql = 'SELECT p.*, c.category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1';
        if (categoryId) {
            sql += ' AND p.category_id = ?';
            const [rows] = await pool.query(sql, [categoryId]);
            console.log('Products found:', rows.length);
            return res.json({ success: true, products: rows });
        }
        const [rows] = await pool.query(sql + ' ORDER BY p.created_at DESC');
        console.log('Products found:', rows.length);
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
        const [items] = await pool.query('SELECT c.quantity, p.price, p.stock, p.id, p.product_name FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?', [req.session.user.id]);
        if (items.length === 0) return res.status(400).json({ success: false, message: 'Cart is empty' });
        
        let total = 0;
        for (const item of items) {
            if (item.quantity > item.stock) {
                return res.status(400).json({ success: false, message: `Only ${item.stock} stock available for ${item.product_name}` });
            }
            total += item.price * item.quantity;
        }

        const [orderResult] = await pool.query('INSERT INTO orders (user_id, total_amount, shipping_address, payment_method) VALUES (?, ?, ?, ?)', [req.session.user.id, total, shipping_address, payment_method || 'Cash']);
        const orderId = orderResult.insertId;
        
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            for (const item of items) {
                await connection.query('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)', [orderId, item.id, item.quantity, item.price]);
                await connection.query('UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?', [item.quantity, item.id]);
            }
            await connection.query('DELETE FROM cart WHERE user_id = ?', [req.session.user.id]);
            await connection.commit();
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
        
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
