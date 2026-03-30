const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_y0e2E3kqJw6qVd',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret_key'
});

router.post('/create-order', async (req, res) => {
    try {
        const { amount } = req.body;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid amount' });
        }

        const options = {
            amount: Math.round(amount * 100),
            currency: 'INR',
            receipt: `receipt_${Date.now()}`
        };
        
        const order = await razorpay.orders.create(options);
        res.json({ success: true, order });
    } catch (error) {
        console.error('Razorpay error:', error);
        res.status(500).json({ success: false, message: error.message || 'Payment error' });
    }
});

router.post('/verify-payment', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'test_secret_key')
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');
        
        if (generatedSignature === razorpay_signature) {
            res.json({ success: true, message: 'Payment verified!' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid signature' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Verification error' });
    }
});

module.exports = router;
