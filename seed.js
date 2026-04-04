const pool = require('./src/config/db');

async function seed() {
  try {
    console.log('Starting seed...');
    
    // Clear existing - handle foreign keys
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    await pool.query('DELETE FROM order_items');
    await pool.query('DELETE FROM cart');
    await pool.query('DELETE FROM products');
    await pool.query('DELETE FROM categories');
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Cleared old data');
    
    // Get max category id first to auto increment properly
    await pool.query('ALTER TABLE categories AUTO_INCREMENT = 1');
    await pool.query('ALTER TABLE products AUTO_INCREMENT = 1');
    
    // Categories
    const categories = [
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
    
    for (const [name, image] of categories) {
      await pool.query('INSERT INTO categories (category_name, category_image) VALUES (?, ?)', [name, image]);
    }
    console.log('Categories added');
    
    // Products
    const products = [
      ['Fresh Apple', 'Organic red apples 1kg', 180, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400', 100, 1],
      ['Fresh Banana', 'Yellow bananas 1 dozen', 50, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400', 150, 1],
      ['Fresh Onion', 'Red onions 1kg', 40, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400', 200, 1],
      ['Fresh Potato', 'Organic potatoes 1kg', 35, 'https://images.unsplash.com/photo-1518977676601-b53f82b8777d?w=400', 200, 1],
      ['Fresh Tomato', 'Red tomatoes 1kg', 45, 'https://images.unsplash.com/photo-1546470427-e26264be0b0e?w=400', 150, 1],
      ['Green Grapes', 'Sweet green grapes 500g', 120, 'https://images.unsplash.com/photo-1597411489780-3182efc5a83a?w=400', 80, 1],
      ['Orange', 'Fresh oranges 1kg', 90, 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400', 120, 1],
      ['Watermelon', 'Sweet watermelon 1pc', 50, 'https://images.unsplash.com/photo-1563114773-84221bd62daa?w=400', 100, 1],
      ['Mango', 'Alphonso mango 1kg', 200, 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400', 80, 1],
      ['Lemon', 'Fresh lemon 250g', 25, 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=400', 150, 1],
      ['Milk', 'Fresh toned milk 1L', 55, 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400', 200, 2],
      ['Curd', 'Fresh curd 400g', 35, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', 100, 2],
      ['Paneer', 'Fresh paneer 200g', 70, 'https://images.unsplash.com/photo-1559755288-7042e2dc20e1?w=400', 80, 2],
      ['Eggs', 'Farm fresh eggs (12 pcs)', 80, 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400', 300, 2],
      ['Butter', 'Premium butter 100g', 60, 'https://images.unsplash.com/photo-1589985270958-bf087b4c9e0c?w=400', 100, 2],
      ['Cheese', 'Processed cheese 200g', 90, 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400', 60, 2],
      ['Ghee', 'Pure ghee 500ml', 350, 'https://images.unsplash.com/photo-1600189020959-3c097d3b6dd3?w=400', 40, 2],
      ['Yogurt', 'Flavored yogurt 150g', 40, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', 100, 2],
      ['Ice Cream', 'Vanilla ice cream 500ml', 150, 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400', 60, 2],
      ['Bread', 'Whole wheat bread 400g', 40, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', 150, 3],
      ['Croissant', 'Fresh butter croissant 2 pcs', 80, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', 50, 3],
      ['Cookies', 'Chocolate cookies 200g', 50, 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400', 200, 3],
      ['Biscuits', 'Marie biscuits 200g', 30, 'https://images.unsplash.com/photo-1493087651729-2e785200d3f8?w=400', 250, 3],
      ['Donut', 'Glazed donut 2 pcs', 70, 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400', 50, 3],
      ['Cake', 'Vanilla cake slice 100g', 50, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', 60, 3],
      ['Muffin', 'Chocolate muffin 2 pcs', 60, 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400', 50, 3],
      ['Chips', 'Potato chips 100g', 35, 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400', 180, 4],
      ['Namkeen', 'Mixed namkeen 250g', 45, 'https://images.unsplash.com/photo-1621951753163-0f9ae1a61f8e?w=400', 120, 4],
      ['Peanuts', 'Roasted peanuts 200g', 60, 'https://images.unsplash.com/photo-1615497001839-b0a0eac3274c?w=400', 80, 4],
      ['Chocolate', 'Dark chocolate 100g', 70, 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400', 100, 4],
      ['Popcorn', 'Butter popcorn 100g', 40, 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400', 100, 4],
      ['Noodles', 'Instant noodles pack 70g', 25, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400', 150, 4],
      ['Kurkure', 'Crispy kurkure 150g', 35, 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400', 150, 4],
      ['Orange Juice', 'Fresh orange juice 1L', 120, 'https://images.unsplash.com/photo-1600271881702-90fbbc5abe23?w=400', 80, 5],
      ['Mango Juice', 'Alphonso mango juice 1L', 150, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400', 60, 5],
      ['Cold Coffee', 'Ready to drink cold coffee 250ml', 50, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', 100, 5],
      ['Soft Drinks', 'Cola 500ml', 40, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400', 200, 5],
      ['Water Bottle', 'Mineral water 1L', 20, 'https://images.unsplash.com/photo-1560023907-5f339617ea30?w=400', 300, 5],
      ['Energy Drink', 'Energy drink 250ml', 50, 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=400', 80, 5],
      ['Milkshake', 'Chocolate milkshake 250ml', 60, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400', 70, 5],
      ['Shampoo', 'Anti-dandruff shampoo 200ml', 250, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', 80, 6],
      ['Soap', 'Moisturizing soap 125g', 40, 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400', 150, 6],
      ['Toothpaste', 'Fluoride toothpaste 100g', 80, 'https://images.unsplash.com/photo-1559553156-2e97137af16f?w=400', 200, 6],
      ['Face Cream', 'Moisturizing face cream 50g', 180, 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcc90?w=400', 60, 6],
      ['Hair Oil', 'Coconut hair oil 200ml', 150, 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400', 50, 6],
      ['Lotion', 'Body lotion 200ml', 180, 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', 60, 6],
      ['Face Wash', 'Vitamin C face wash 100g', 180, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', 50, 6],
      ['Detergent', 'Liquid detergent 1L', 350, 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400', 100, 7],
      ['Dishwash', 'Dishwashing liquid 500ml', 120, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400', 80, 7],
      ['Floor Cleaner', 'Multi-surface floor cleaner 1L', 180, 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400', 60, 7],
      ['Air Freshener', 'Room freshener 400ml', 180, 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400', 50, 7],
      ['Glass Cleaner', 'Glass cleaner 500ml', 120, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400', 60, 7],
      ['Bleach', 'Face bleach 100g', 120, 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400', 50, 7],
      ['Baby Soap', 'Gentle baby soap 75g', 50, 'https://images.unsplash.com/photo-1552693673-1bf958298935?w=400', 100, 8],
      ['Baby Powder', 'Talc-free baby powder 200g', 120, 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400', 80, 8],
      ['Diapers', 'Baby diapers pack of 30', 450, 'https://images.unsplash.com/photo-1507652313519-d4e917499ed9?w=400', 50, 8],
      ['Baby Oil', 'Baby massage oil 200ml', 120, 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400', 60, 8],
      ['Baby Wipes', 'Baby wet wipes 80 pcs', 150, 'https://images.unsplash.com/photo-1507652313519-d4e917499ed9?w=400', 80, 8],
      ['Baby Lotion', 'Baby body lotion 200ml', 180, 'https://images.unsplash.com/photo-1552693673-1bf958298935?w=400', 50, 8],
      ['Baby Cream', 'Baby cream 100g', 100, 'https://images.unsplash.com/photo-1552693673-1bf958298935?w=400', 60, 8],
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
      ['Besan', 'Gram flour 1kg', 80, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400', 100, 10],
      ['Maida', 'All purpose flour 1kg', 50, 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400', 120, 10]
    ];
    
    for (const [name, desc, price, image, stock, catId] of products) {
      await pool.query('INSERT INTO products (product_name, category_id, description, price, image, stock, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)', [name, catId, desc, price, image, stock]);
    }
    console.log('Products added');
    
    const [cats] = await pool.query('SELECT COUNT(*) as count FROM categories');
    const [prods] = await pool.query('SELECT COUNT(*) as count FROM products');
    console.log('Done! Categories:', cats[0].count, 'Products:', prods[0].count);
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

seed();
