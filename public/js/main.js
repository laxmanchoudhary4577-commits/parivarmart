async function checkSession() {
    try {
        const res = await fetch('/api/check-session');
        const data = await res.json();
        
        if (data.loggedIn) {
            document.getElementById('loginBtn').style.display = 'none';
            document.getElementById('registerBtn').style.display = 'none';
            document.getElementById('userName').style.display = 'inline';
            document.getElementById('userName').textContent = data.user.name;
            document.getElementById('logoutBtn').style.display = 'inline';
            updateCartCount();
        }
    } catch (error) {
        console.error('Session check error:', error);
    }
}

async function checkAdminSession() {
    try {
        const res = await fetch('/admin/check-session');
        const data = await res.json();
        
        if (!data.loggedIn) {
            window.location.href = '/admin-login';
        }
    } catch (error) {
        window.location.href = '/admin-login';
    }
}

document.getElementById('logoutBtn')?.addEventListener('click', async (e) => {
    e.preventDefault();
    await fetch('/api/logout');
    window.location.href = '/';
});

async function loadCategories() {
    try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        
        if (data.success) {
            const grid = document.getElementById('categoryGrid');
            grid.innerHTML = data.categories.map(cat => `
                <div class="category-card" onclick="filterByCategory(${cat.id})">
                    <img src="${cat.category_image || 'https://via.placeholder.com/200'}" alt="${cat.category_name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 10px;">
                    <h3>${cat.category_name}</h3>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Load categories error:', error);
    }
}

async function loadCategoriesForFilter() {
    try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        
        if (data.success) {
            const filter = document.getElementById('categoryFilter');
            data.categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.category_name;
                filter.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Load categories error:', error);
    }
}

async function loadCategoriesForAdmin() {
    try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        
        if (data.success) {
            const select = document.getElementById('productCategory');
            data.categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.category_name;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Load categories error:', error);
    }
}

async function loadProducts(categoryId = null) {
    try {
        const url = categoryId ? `/api/products?category=${categoryId}` : '/api/products';
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.success) {
            const grid = document.getElementById('productGrid');
            if (grid) {
                grid.innerHTML = data.products.map(product => `
                    <div class="product-card">
                        <img src="${product.image || 'https://via.placeholder.com/250x200'}" alt="${product.product_name}" class="product-image">
                        <div class="product-info">
                            <h3 class="product-name">${product.product_name}</h3>
                            <p class="product-price">₹${product.price}</p>
                            <p class="product-stock">Stock: ${product.stock}</p>
                            <button class="btn btn-primary btn-block btn-add-to-cart" onclick="addToCart(${product.id}, event)" ${product.stock <= 0 ? 'disabled' : ''}>
                                ${product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Load products error:', error);
    }
}

function filterByCategory(categoryId) {
    window.location.href = `/products?category=${categoryId}`;
}

async function addToCart(productId, event) {
    try {
        const btn = event.target;
        btn.classList.add('adding');
        btn.textContent = 'Added!';
        
        const res = await fetch('/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId, quantity: 1 })
        });
        const data = await res.json();
        
        if (data.success) {
            updateCartCount();
            const badge = document.getElementById('cartCount');
            if (badge) {
                badge.classList.add('pop');
                setTimeout(() => badge.classList.remove('pop'), 300);
            }
            setTimeout(() => {
                btn.classList.remove('adding');
                btn.textContent = 'Add to Cart';
            }, 1000);
        } else {
            btn.classList.remove('adding');
            btn.textContent = 'Add to Cart';
            if (data.message.includes('login')) {
                window.location.href = '/login';
            }
        }
    } catch (error) {
        console.error('Add to cart error:', error);
    }
}

async function updateCartCount() {
    try {
        const res = await fetch('/api/check-session');
        const sessionData = await res.json();
        
        if (!sessionData.loggedIn) {
            return;
        }
        
        const cartRes = await fetch('/api/cart');
        const cartData = await cartRes.json();
        
        if (cartData.success && document.getElementById('cartCount')) {
            const count = cartData.cart.reduce((sum, item) => sum + item.quantity, 0);
            document.getElementById('cartCount').textContent = count;
        }
    } catch (error) {
        console.error('Update cart count error:', error);
    }
}

async function loadCart() {
    try {
        const res = await fetch('/api/cart');
        const data = await res.json();
        
        if (!data.success) {
            window.location.href = '/login';
            return;
        }
        
        const cartItems = document.getElementById('cartItems');
        const cartSummary = document.getElementById('cartSummary');
        const messageDiv = document.getElementById('cartMessage');
        
        if (data.cart.length === 0) {
            messageDiv.innerHTML = '<div class="alert alert-success">Your cart is empty</div>';
            cartSummary.style.display = 'none';
            return;
        }
        
        let total = 0;
        cartItems.innerHTML = data.cart.map(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            return `
                <div class="cart-item">
                    <img src="${item.image || 'https://via.placeholder.com/100'}" alt="${item.product_name}" class="cart-item-image">
                    <div class="cart-item-info">
                        <h3>${item.product_name}</h3>
                        <p class="cart-item-price">₹${item.price}</p>
                    </div>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateCartItem(${item.id}, ${item.quantity - 1})">-</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateCartItem(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                    <p style="font-weight: bold; margin-left: 20px;">₹${itemTotal}</p>
                    <button class="btn btn-outline" style="margin-left: 20px;" onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            `;
        }).join('');
        
        document.getElementById('cartSubtotal').textContent = '₹' + total;
        document.getElementById('cartTotal').textContent = '₹' + total;
        cartSummary.style.display = 'block';
    } catch (error) {
        console.error('Load cart error:', error);
    }
}

async function updateCartItem(cartId, quantity) {
    if (quantity < 1) {
        await removeFromCart(cartId);
        return;
    }
    
    try {
        const res = await fetch('/api/cart/update/' + cartId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity })
        });
        const data = await res.json();
        
        if (data.success) {
            loadCart();
            updateCartCount();
        }
    } catch (error) {
        console.error('Update cart error:', error);
    }
}

async function removeFromCart(cartId) {
    try {
        const res = await fetch('/api/cart/remove/' + cartId, {
            method: 'DELETE'
        });
        const data = await res.json();
        
        if (data.success) {
            loadCart();
            updateCartCount();
        }
    } catch (error) {
        console.error('Remove from cart error:', error);
    }
}

function proceedToCheckout() {
    document.getElementById('checkoutModal').classList.add('active');
}

function closeCheckoutModal() {
    document.getElementById('checkoutModal').classList.remove('active');
}

function togglePaymentSection() {
    const method = document.getElementById('paymentMethod').value;
    document.getElementById('razorpaySection').style.display = method === 'Razorpay' ? 'block' : 'none';
    document.getElementById('codSection').style.display = method === 'Razorpay' ? 'none' : 'block';
}

let currentOrderTotal = 0;

async function initiateRazorpayPayment() {
    try {
        const houseNo = document.getElementById('houseNo').value;
        const street = document.getElementById('street').value;
        const city = document.getElementById('city').value;
        const state = document.getElementById('state').value;
        const pincode = document.getElementById('pincode').value;
        
        if (!houseNo || !street || !city || !state || !pincode) {
            alert('Please fill all address details');
            return;
        }

        const totalText = document.getElementById('cartTotal').textContent.replace('₹', '');
        currentOrderTotal = parseFloat(totalText);

        const res = await fetch('/api/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: currentOrderTotal })
        });
        const data = await res.json();

        if (!data.success) {
            alert('Error creating order: ' + data.message);
            return;
        }

        const options = {
            key: 'rzp_test_y0e2E3kqJw6qVd',
            amount: data.order.amount,
            currency: 'INR',
            name: 'Parivar Mart',
            description: 'Order Payment',
            order_id: data.order.id,
            handler: async function(response) {
                const verifyRes = await fetch('/api/verify-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature
                    })
                });
                const verifyData = await verifyRes.json();
                
                if (verifyData.success) {
                    const shipping_address = `${houseNo}, ${street}, ${city}, ${state} - ${pincode}`;
                    const orderRes = await fetch('/api/order', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            shipping_address, 
                            payment_method: 'Online Paid',
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id
                        })
                    });
                    const orderData = await orderRes.json();
                    
                    if (orderData.success) {
                        alert('Payment successful! Order placed!');
                        closeCheckoutModal();
                        window.location.href = '/orders';
                    }
                } else {
                    alert('Payment verification failed');
                }
            },
            theme: {
                color: '#16a34a'
            }
        };

        const rzp = new Razorpay(options);
        rzp.open();
    } catch (error) {
        console.error('Payment error:', error);
        alert('Payment error');
    }
}

document.getElementById('checkoutForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const houseNo = document.getElementById('houseNo').value;
    const street = document.getElementById('street').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const pincode = document.getElementById('pincode').value;
    const payment_method = document.getElementById('paymentMethod').value;
    
    const shipping_address = `${houseNo}, ${street}, ${city}, ${state} - ${pincode}`;
    
    try {
        const res = await fetch('/api/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shipping_address, payment_method })
        });
        const data = await res.json();
        
        if (data.success) {
            alert('Order placed successfully! Order ID: ' + data.order_id);
            closeCheckoutModal();
            window.location.href = '/orders';
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Order error:', error);
    }
});

async function loadOrders() {
    try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        
        if (!data.success) {
            window.location.href = '/login';
            return;
        }
        
        const ordersList = document.getElementById('ordersList');
        const messageDiv = document.getElementById('ordersMessage');
        
        if (data.orders.length === 0) {
            messageDiv.innerHTML = '<div class="alert alert-success">No orders yet</div>';
            return;
        }
        
        ordersList.innerHTML = data.orders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-id">Order #${order.id}</span>
                    <span class="order-status ${order.status.toLowerCase()}">${order.status}</span>
                </div>
                <p><strong>Date:</strong> ${new Date(order.order_date).toLocaleString()}</p>
                <p><strong>Products:</strong> ${order.products || 'N/A'}</p>
                <p><strong>Payment:</strong> ${order.payment_method}</p>
                <p class="order-total">Total: ₹${order.total_amount}</p>
                ${order.status === 'Pending' ? `<button class="btn btn-outline" onclick="cancelOrder(${order.id})" style="margin-top: 10px;">Cancel Order</button>` : ''}
            </div>
        `).join('');
    } catch (error) {
        console.error('Load orders error:', error);
    }
}

async function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) {
        return;
    }
    
    try {
        const res = await fetch('/api/cancel-order/' + orderId, {
            method: 'PUT'
        });
        const data = await res.json();
        
        if (data.success) {
            loadOrders();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Cancel order error:', error);
    }
}

async function loadAdminStats() {
    try {
        const res = await fetch('/admin/stats');
        const data = await res.json();
        
        if (data.success) {
            document.getElementById('totalUsers').textContent = data.stats.users;
            document.getElementById('totalOrders').textContent = data.stats.orders;
            document.getElementById('pendingOrders').textContent = data.stats.pendingOrders;
            document.getElementById('totalProducts').textContent = data.stats.products;
            document.getElementById('totalRevenue').textContent = '₹' + data.stats.revenue;
        }
    } catch (error) {
        console.error('Load admin stats error:', error);
    }
}

async function loadRecentOrders() {
    try {
        const res = await fetch('/admin/all-orders');
        const data = await res.json();
        
        if (data.success) {
            const container = document.getElementById('recentOrders');
            const recent = data.orders.slice(0, 5);
            
            if (recent.length === 0) {
                container.innerHTML = '<p>No orders yet</p>';
                return;
            }
            
            container.innerHTML = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Customer</th>
                            <th>Products</th>
                            <th>Total</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recent.map(order => `
                            <tr>
                                <td>#${order.id}</td>
                                <td>${new Date(order.order_date).toLocaleDateString()}</td>
                                <td>${order.user_name}<br><small>${order.user_phone}</small></td>
                                <td><small>${order.products || 'N/A'}</small></td>
                                <td>₹${order.total_amount}</td>
                                <td><span class="order-status ${order.status.toLowerCase()}">${order.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
    } catch (error) {
        console.error('Load recent orders error:', error);
    }
}

async function loadAdminProducts() {
    try {
        const res = await fetch('/admin/products');
        const data = await res.json();
        
        if (data.success) {
            const tbody = document.getElementById('productTableBody');
            tbody.innerHTML = data.products.map(product => `
                <tr>
                    <td>${product.id}</td>
                    <td><img src="${product.image || 'https://via.placeholder.com/50'}" style="width: 50px; height: 50px; object-fit: cover;"></td>
                    <td>${product.product_name}</td>
                    <td>${product.category_name}</td>
                    <td>₹${product.price}</td>
                    <td>${product.stock}</td>
                    <td>${product.is_active ? 'Active' : 'Inactive'}</td>
                    <td>
                        <button class="btn btn-secondary" onclick='openProductModal(${JSON.stringify(product)})'>Edit</button>
                        <button class="btn btn-outline" onclick="deleteProduct(${product.id})">Delete</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Load admin products error:', error);
    }
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        const res = await fetch('/admin/delete-product/' + productId, {
            method: 'DELETE'
        });
        const data = await res.json();
        
        if (data.success) {
            loadAdminProducts();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Delete product error:', error);
    }
}

async function loadAdminOrders() {
    try {
        const res = await fetch('/admin/all-orders');
        const data = await res.json();
        
        if (data.success) {
            const tbody = document.getElementById('orderTableBody');
            tbody.innerHTML = data.orders.map(order => `
                <tr>
                    <td>#${order.id}</td>
                    <td>${new Date(order.order_date).toLocaleString()}</td>
                    <td>${order.user_name}<br><small>${order.user_email}</small><br><small>${order.user_phone}</small></td>
                    <td>${order.shipping_address || 'N/A'}</td>
                    <td>${order.products || 'N/A'}</td>
                    <td>₹${order.total_amount}</td>
                    <td>${order.payment_method}</td>
                    <td><span class="order-status ${order.status.toLowerCase()}">${order.status}</span></td>
                    <td>
                        <button class="btn btn-secondary" onclick="openStatusModal(${order.id}, '${order.status}')">Update</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Load admin orders error:', error);
    }
}

async function loadAdminUsers() {
    try {
        const res = await fetch('/admin/users');
        const data = await res.json();
        
        if (data.success) {
            const tbody = document.getElementById('userTableBody');
            tbody.innerHTML = data.users.map(user => `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.phone}</td>
                    <td>${new Date(user.created_at).toLocaleDateString()}</td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Load admin users error:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Main Navbar Toggle
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelector('.nav-links');
    
    if (navbar && navLinks) {
        const navToggle = document.createElement('button');
        navToggle.className = 'nav-toggle';
        navToggle.innerHTML = '☰';
        navToggle.setAttribute('aria-label', 'Toggle navigation');
        navbar.insertBefore(navToggle, navLinks);
        
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            navToggle.innerHTML = navLinks.classList.contains('active') ? '✕' : '☰';
        });
        
        document.addEventListener('click', (e) => {
            if (!navbar.contains(e.target) && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                navToggle.innerHTML = '☰';
            }
        });
    }

    // Admin Sidebar Toggle
    const adminSidebar = document.querySelector('.admin-sidebar');
    const adminContent = document.querySelector('.admin-content');
    
    if (adminSidebar && adminContent) {
        const adminToggle = document.createElement('button');
        adminToggle.className = 'admin-toggle';
        adminToggle.innerHTML = '☰ Menu';
        adminToggle.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 1001;
            padding: 8px 15px;
            background: var(--primary);
            color: white;
            border: none;
            border-radius: 8px;
            display: none;
            cursor: pointer;
            font-weight: 600;
        `;
        document.body.appendChild(adminToggle);

        // Update display based on screen size
        const checkWidth = () => {
            if (window.innerWidth <= 768) {
                adminToggle.style.display = 'block';
            } else {
                adminToggle.style.display = 'none';
                adminSidebar.style.display = 'block';
            }
        };

        window.addEventListener('resize', checkWidth);
        checkWidth();

        adminToggle.addEventListener('click', () => {
            if (adminSidebar.style.display === 'none' || adminSidebar.style.display === '') {
                adminSidebar.style.display = 'block';
                adminSidebar.style.position = 'fixed';
                adminSidebar.style.zIndex = '1000';
                adminSidebar.style.width = '100%';
                adminToggle.innerHTML = '✕ Close';
            } else {
                adminSidebar.style.display = 'none';
                adminToggle.innerHTML = '☰ Menu';
            }
        });
    }
});
