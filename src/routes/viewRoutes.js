const express = require('express');
const router = express.Router();
const path = require('path');

const publicPath = path.join(__dirname, '../../public');

router.get('/', (req, res) => res.sendFile(path.join(publicPath, 'index.html')));
router.get('/products', (req, res) => res.sendFile(path.join(publicPath, 'products.html')));
router.get('/cart', (req, res) => res.sendFile(path.join(publicPath, 'cart.html')));
router.get('/orders', (req, res) => res.sendFile(path.join(publicPath, 'orders.html')));
router.get('/login', (req, res) => res.sendFile(path.join(publicPath, 'login.html')));
router.get('/register', (req, res) => res.sendFile(path.join(publicPath, 'register.html')));
router.get('/forgot-password', (req, res) => res.sendFile(path.join(publicPath, 'forgot-password.html')));
router.get('/verify-otp', (req, res) => res.sendFile(path.join(publicPath, 'verify-otp.html')));
router.get('/reset-password', (req, res) => res.sendFile(path.join(publicPath, 'reset-password.html')));

// Admin Views
router.get('/admin-login', (req, res) => res.sendFile(path.join(publicPath, 'admin-login.html')));
router.get('/admin-dashboard', (req, res) => req.session.admin ? res.sendFile(path.join(publicPath, 'admin-dashboard.html')) : res.redirect('/admin-login'));
router.get('/admin-products', (req, res) => req.session.admin ? res.sendFile(path.join(publicPath, 'admin-products.html')) : res.redirect('/admin-login'));
router.get('/admin-orders', (req, res) => req.session.admin ? res.sendFile(path.join(publicPath, 'admin-orders.html')) : res.redirect('/admin-login'));
router.get('/admin-users', (req, res) => req.session.admin ? res.sendFile(path.join(publicPath, 'admin-users.html')) : res.redirect('/admin-login'));

module.exports = router;
