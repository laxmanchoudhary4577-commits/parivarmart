const pool = require('./src/config/db');

async function seed() {
  try {
    console.log('Starting seed...');
    
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    await pool.query('DELETE FROM order_items');
    await pool.query('DELETE FROM cart');
    await pool.query('DELETE FROM products');
    await pool.query('DELETE FROM categories');
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Cleared old data');
    
    await pool.query('ALTER TABLE categories AUTO_INCREMENT = 1');
    await pool.query('ALTER TABLE products AUTO_INCREMENT = 1');
    
    const categories = [
      ['Hair Services', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400'],
      ['Skin Care', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400'],
      ['Nail Services', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400'],
      ['Massage & Spa', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400'],
      ['Bridal Services', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400'],
      ['Facial Treatments', 'https://images.unsplash.com/photo-1512291313931-d4291048e7b6?w=400'],
      ['Manicure & Pedicure', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400'],
      ['Beauty Packages', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400']
    ];
    
    for (const [name, image] of categories) {
      await pool.query('INSERT INTO categories (category_name, category_image) VALUES (?, ?)', [name, image]);
    }
    console.log('Categories added');
    
    const products = [
      ['Haircut & Styling', 'Professional haircut with styling', 350, 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400', 50, 1],
      ['Hair Coloring', 'Full hair coloring with premium colors', 1500, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400', 30, 1],
      ['Hair Spa Treatment', 'Rejuvenating hair spa', 800, 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400', 40, 1],
      ['Hair Straightening', 'Professional straightening', 2500, 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400', 25, 1],
      ['Hair Curling', 'Professional curling treatment', 1800, 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400', 25, 1],
      ['Keratin Treatment', 'Keratin smoothing treatment', 3500, 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400', 20, 1],
      ['Hair Rebonding', 'Permanent hair rebonding', 4000, 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400', 15, 1],
      ['Hair Highlights', 'Partial or full highlights', 2000, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400', 25, 1],
      ['Basic Facial', 'Classic facial treatment', 600, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400', 50, 2],
      ['Anti-Aging Facial', 'Anti-aging facial with collagen', 1200, 'https://images.unsplash.com/photo-1512291313931-d4291048e7b6?w=400', 40, 2],
      ['Hydrafacial', 'Deep hydration facial', 1800, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400', 30, 2],
      ['Gold Facial', 'Luxury gold facial', 2500, 'https://images.unsplash.com/photo-1512291313931-d4291048e7b6?w=400', 20, 2],
      ['Vitamin C Facial', 'Brightening vitamin C facial', 1000, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400', 35, 2],
      ['Acne Facial', 'Specialized acne treatment', 900, 'https://images.unsplash.com/photo-1512291313931-d4291048e7b6?w=400', 30, 2],
      ['Oxygen Facial', 'Oxygen therapy facial', 1500, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400', 25, 2],
      ['Nail Art', 'Creative nail art design', 500, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400', 60, 3],
      ['Gel Nail Polish', 'Long-lasting gel polish', 800, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400', 50, 3],
      ['Acrylic Nails', 'Acrylic nail extensions', 1200, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400', 40, 3],
      ['Nail Fixing', 'Nail repair & fixing', 300, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400', 50, 3],
      ['Full Body Massage', '60 min full body massage', 1200, 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400', 40, 4],
      ['Aromatherapy Massage', 'Relaxing aromatherapy', 1500, 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400', 35, 4],
      ['Hot Stone Massage', 'Hot stone therapy', 1800, 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400', 30, 4],
      ['Swedish Massage', 'Classic Swedish massage', 1400, 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400', 30, 4],
      ['Deep Tissue Massage', 'Deep tissue muscle release', 1600, 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400', 25, 4],
      ['Thai Massage', 'Traditional Thai massage', 1800, 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400', 25, 4],
      ['Couple Massage', 'Romantic couple massage', 3000, 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400', 20, 4],
      ['Bridal Makeup', 'Complete bridal makeup', 8000, 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400', 15, 5],
      ['Bridal Hair', 'Bridal hair styling', 3500, 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400', 20, 5],
      ['Bridal Package', 'Full bridal package', 15000, 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400', 10, 5],
      ['Reception Makeup', 'Reception party makeup', 4000, 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400', 20, 5],
      ['Mehendi', 'Professional mehendi art', 1500, 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400', 30, 5],
      ['Saree Draping', 'Professional saree draping', 500, 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400', 40, 5],
      ['Classic Pedicure', 'Basic pedicure treatment', 400, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400', 60, 6],
      ['Spa Pedicure', 'Luxury spa pedicure', 800, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400', 50, 6],
      ['Classic Manicure', 'Basic manicure treatment', 350, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400', 60, 6],
      ['Spa Manicure', 'Luxury spa manicure', 700, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400', 50, 6],
      ['Gel Manicure', 'Gel-based manicure', 900, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400', 40, 6],
      ['Foot Spa', 'Relaxing foot spa treatment', 600, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400', 50, 6],
      ['Day Spa Package', 'Full day spa experience', 3500, 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400', 20, 7],
      ['Relaxation Package', 'Complete relaxation package', 2500, 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400', 25, 7],
      ['Detox Package', 'Body detox package', 4000, 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400', 15, 7],
      ['Beauty Package', 'Full beauty package', 5000, 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400', 15, 7],
      ['Premium Package', 'Premium salon package', 8000, 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400', 10, 7],
      ['Monthly Membership', 'Monthly beauty membership', 10000, 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400', 20, 7]
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
