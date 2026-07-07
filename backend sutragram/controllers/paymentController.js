import Transaction from '../models/Transaction.js';
import Order from '../models/Order.js';
import ArtisanProfile from '../models/ArtisanProfile.js';
import SupplierProfile from '../models/SupplierProfile.js';
import { verifyRazorpaySignature } from '../services/razorpayService.js';
import { maybeSendLowCreditAlert, recordCreditTransaction } from '../services/creditService.js';

const LEAD_CREDIT_PACKAGES = {
    STARTER: { credits: 10, price: 900 },
    BUSINESS: { credits: 50, price: 3900 },
    ENTERPRISE: { credits: 100, price: 6900 },
};

// @desc    Serve Razorpay checkout HTML page (for Expo Go / WebBrowser)
// @route   GET /api/payments/checkout-page
// @access  Public (order_id verified internally)
export const getCheckoutPage = async (req, res) => {
    try {
        const { order_id, key, amount, callback_url, skip_server_verify } = req.query;

        if (!order_id || !key || !amount) {
            return res.status(400).send('Missing required parameters');
        }

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>sutraGram Payment</title>
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #1a1a2e;
            color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            text-align: center;
            max-width: 400px;
            width: 100%;
        }
        h1 { font-size: 24px; margin-bottom: 8px; color: #E07A5F; }
        p { font-size: 16px; color: #aaa; margin-bottom: 24px; }
        .amount { font-size: 36px; font-weight: bold; margin: 20px 0; }
        .btn {
            background: #E07A5F;
            color: #fff;
            font-size: 18px;
            font-weight: 600;
            border: none;
            border-radius: 12px;
            padding: 16px 40px;
            cursor: pointer;
            width: 100%;
            margin-top: 16px;
        }
        .btn:active { opacity: 0.8; }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .status { margin-top: 20px; font-size: 14px; color: #aaa; }
        .success { color: #4ade80; font-size: 20px; }
        .error { color: #ef4444; font-size: 16px; }
        .spinner {
            border: 4px solid rgba(255,255,255,0.1);
            border-top: 4px solid #E07A5F;
            border-radius: 50%;
            width: 40px; height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="container">
        <h1>sutraGram</h1>
        <p>Complete your payment</p>
        <div class="amount">₹${(parseInt(amount) / 100).toLocaleString('en-IN')}</div>
        <button class="btn" id="payBtn" onclick="startPayment()">Pay Now</button>
        <div class="status" id="status"></div>
    </div>
    <script>
        const callbackUrl = '${callback_url || ''}';

        function startPayment() {
            var btn = document.getElementById('payBtn');
            btn.disabled = true;
            btn.textContent = 'Opening...';

            var options = {
                key: '${key}',
                amount: '${amount}',
                currency: 'INR',
                name: 'sutraGram',
                description: 'Order Payment',
                order_id: '${order_id}',
                handler: function(response) {
                    ${skip_server_verify === 'true' ? `
                    // Skip server verification - redirect directly with payment data
                    document.getElementById('status').innerHTML = '<p class="success">✅ Payment Successful!</p><p style="color:#aaa;margin-top:8px;">Redirecting...</p>';
                    btn.style.display = 'none';
                    if (callbackUrl) {
                        setTimeout(() => {
                            window.location.href = callbackUrl + 
                                '?status=success' +
                                '&razorpay_payment_id=' + encodeURIComponent(response.razorpay_payment_id) +
                                '&razorpay_order_id=' + encodeURIComponent(response.razorpay_order_id) +
                                '&razorpay_signature=' + encodeURIComponent(response.razorpay_signature);
                        }, 800);
                    }
                    ` : `
                    // Verify payment on backend
                    document.getElementById('status').innerHTML = '<div class="spinner"></div><p>Verifying payment...</p>';
                    btn.style.display = 'none';

                    fetch('/api/v1/payments/verify-web', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        })
                    })
                    .then(r => r.json())
                    .then(data => {
                        if (data.success) {
                            document.getElementById('status').innerHTML = '<p class="success">✅ Payment Successful!</p><p style="color:#aaa;margin-top:8px;">You can close this window and return to the app.</p>';
                            if (callbackUrl) {
                                setTimeout(() => { window.location.href = callbackUrl + '?status=success&payment_id=' + response.razorpay_payment_id; }, 1500);
                            }
                        } else {
                            document.getElementById('status').innerHTML = '<p class="error">❌ Verification failed. Please contact support.</p>';
                            btn.style.display = 'block';
                            btn.disabled = false;
                            btn.textContent = 'Retry';
                        }
                    })
                    .catch(err => {
                        document.getElementById('status').innerHTML = '<p class="error">❌ Network error. Please try again.</p>';
                        btn.style.display = 'block';
                        btn.disabled = false;
                        btn.textContent = 'Retry';
                    });
                    `}
                },
                modal: {
                    ondismiss: function() {
                        btn.disabled = false;
                        btn.textContent = 'Pay Now';
                        document.getElementById('status').innerHTML = '<p style="color:#fbbf24;">Payment cancelled. Tap to retry.</p>';
                    }
                },
                theme: { color: '#E07A5F' }
            };

            var rzp = new Razorpay(options);
            rzp.on('payment.failed', function(response) {
                document.getElementById('status').innerHTML = '<p class="error">❌ ' + response.error.description + '</p>';
                btn.disabled = false;
                btn.textContent = 'Retry Payment';
            });
            rzp.open();
        }

        // Auto-open payment on load
        setTimeout(startPayment, 500);
    </script>
</body>
</html>`;

        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } catch (error) {
        console.error('Checkout page error:', error);
        res.status(500).send('Failed to load checkout page');
    }
};

// @desc    Payment callback handler (for redirect after payment)
// @route   GET /api/payments/callback
// @access  Public
export const paymentCallback = async (req, res) => {
    try {
        const { status, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.query;

        console.log('🔄 [callback] Payment callback received:', { 
            status, 
            razorpay_payment_id, 
            razorpay_order_id,
            razorpay_signature,
            hasSignature: !!razorpay_signature
        });

        // Simple HTML page that will be captured by WebBrowser.openAuthSessionAsync
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment ${status === 'success' ? 'Successful' : 'Failed'}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: ${status === 'success' ? '#10b981' : '#ef4444'};
            color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            text-align: center;
            padding: 20px;
        }
        .container { max-width: 400px; }
        h1 { font-size: 48px; margin-bottom: 16px; }
        p { font-size: 18px; opacity: 0.9; }
    </style>
</head>
<body>
    <div class="container">
        <h1>${status === 'success' ? '✅' : '❌'}</h1>
        <p>${status === 'success' ? 'Payment Successful!' : 'Payment Failed'}</p>
        <p style="font-size: 14px; margin-top: 16px;">Returning to app...</p>
    </div>
    <script>
        // This page will be captured by WebBrowser and closed automatically
        setTimeout(() => {
            window.close();
        }, 1000);
    </script>
</body>
</html>`;

        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } catch (error) {
        console.error('❌ [callback] Error:', error);
        res.status(500).send('Error processing callback');
    }
};

// @desc    Verify Razorpay payment (no auth — called from web checkout page)
// @route   POST /api/payments/verify-web
// @access  Public (signature verified cryptographically)
export const verifyPaymentWeb = async (req, res) => {
    try {
        console.log('🔍 [verify-web] Received payment verification request:', req.body);
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            console.log('❌ [verify-web] Missing parameters');
            return res.status(400).json({ success: false, message: 'Missing payment verification parameters.' });
        }

        // Verify signature
        const isValidSignature = verifyRazorpaySignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        console.log('🔐 [verify-web] Signature valid:', isValidSignature);
        if (!isValidSignature) {
            return res.status(400).json({ success: false, message: 'Invalid payment signature.' });
        }

        // Find all orders with this razorpay_order_id
        const orders = await Order.find({ razorpay_order_id });
        console.log('📦 [verify-web] Found orders:', orders.length);

        if (!orders || orders.length === 0) {
            console.log('❌ [verify-web] No orders found for razorpay_order_id:', razorpay_order_id);
            return res.status(404).json({ success: false, message: 'No orders found for this payment.' });
        }

        // Update all orders
        for (const order of orders) {
            order.razorpay_payment_id = razorpay_payment_id;
            order.razorpay_signature = razorpay_signature;
            if (order.order_status === 'placed') {
                order.order_status = 'confirmed';
            }
            order.payment_status = 'paid';
            await order.save();
            console.log('✅ [verify-web] Updated order:', order._id);

            await Transaction.create({
                user: order.consumer,
                related_user: order.artisan,
                order: order._id,
                type: 'Inbound',
                amount: order.total_amount,
                status: 'hold',
                description: `Payment held in escrow for order ${order._id}`,
            });
        }

        console.log('✅ [verify-web] Payment verification successful');
        res.status(200).json({ success: true, message: 'Payment verified successfully.' });
    } catch (error) {
        console.error('❌ [verify-web] Error:', error);
        res.status(500).json({ success: false, message: 'Failed to verify payment.', error: error.message });
    }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payments/verify
// @access  Private (consumer only)
export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Missing payment verification parameters.',
            });
        }

        // Verify signature
        const isValidSignature = verifyRazorpaySignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValidSignature) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature.',
            });
        }

        // Find all orders with this razorpay_order_id
        const orders = await Order.find({ razorpay_order_id });

        if (!orders || orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No orders found for this payment.',
            });
        }

        // Verify consumer owns at least one of the orders
        const userOwnsOrder = orders.some(
            (order) => order.consumer.toString() === req.user._id.toString()
        );

        if (!userOwnsOrder) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to verify this payment.',
            });
        }

        // Update all orders with payment details and status
        const updatedOrders = [];
        const transactions = [];

        for (const order of orders) {
            order.razorpay_payment_id = razorpay_payment_id;
            order.razorpay_signature = razorpay_signature;
            if (order.order_status === 'placed') {
                order.order_status = 'confirmed';
            }
            order.payment_status = 'paid';
            await order.save();
            updatedOrders.push(order);

            // Create transaction record for escrow
            const transaction = await Transaction.create({
                user: order.consumer,
                related_user: order.artisan,
                order: order._id,
                type: 'Inbound',
                amount: order.total_amount,
                status: 'hold',
                description: `Payment held in escrow for order ${order._id}`,
            });
            transactions.push(transaction);
        }

        res.status(200).json({
            success: true,
            message: 'Payment verified successfully. Funds held in escrow until delivery.',
            data: {
                orders: updatedOrders,
                transactions,
            },
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify payment.',
            error: error.message,
        });
    }
};

// @desc    Process payment (UPI placeholder)
// @route   POST /api/payments/process
// @access  Private (consumer only)
export const processPayment = async (req, res) => {
    try {
        const { order_id, payment_method, upi_id } = req.body;

        if (!order_id || !payment_method) {
            return res.status(400).json({
                success: false,
                message: 'Order ID and payment method are required.',
            });
        }

        const order = await Order.findById(order_id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found.',
            });
        }

        // Verify consumer
        if (order.consumer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to pay for this order.',
            });
        }

        // In production, integrate with UPI gateway (Razorpay, PayU, etc.)
        // For now, simulate payment success

        const transaction = await Transaction.create({
            order: order._id,
            user: req.user._id,
            related_user: order.artisan,
            amount: order.total_amount,
            type: 'Inbound',
            status: 'hold',
            description: `Payment processed via ${payment_method}${upi_id ? ` (${upi_id})` : ''}`,
        });

        // Update order status
        order.order_status = 'confirmed';
        order.payment_status = 'paid';
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Payment processed successfully. Funds held in escrow until delivery.',
            data: { transaction },
        });
    } catch (error) {
        console.error('Process payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process payment.',
            error: error.message,
        });
    }
};

// @desc    Release payment from escrow (after delivery confirmation)
// @route   POST /api/payments/release/:orderId
// @access  Private (system/admin only)
export const releasePayment = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found.',
            });
        }

        if (order.order_status !== 'delivered') {
            return res.status(400).json({
                success: false,
                message: 'Order must be delivered before payment release.',
            });
        }

        const transaction = await Transaction.findOne({ order: orderId, status: 'hold' });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found or already released.',
            });
        }

        // Calculate platform fee (10%)
        const platformFee = transaction.amount * 0.10;
        const artisanPayout = transaction.amount - platformFee;

        // Update transaction
        transaction.status = 'completed';
        transaction.platform_fee = platformFee;
        transaction.description = `Escrow released. Artisan payout: ${artisanPayout}`;
        await transaction.save();

        // Update order status
        order.order_status = 'delivered';
        order.payment_status = 'completed';
        await order.save();

        // In production, trigger actual payout to artisan's UPI/bank account
        const artisanProfile = await ArtisanProfile.findOne({ user: order.artisan });
        console.log(`Payout ₹${artisanPayout} to artisan UPI: ${artisanProfile?.payment_upi_id}`);

        res.status(200).json({
            success: true,
            message: 'Payment released successfully.',
            data: {
                transaction,
                artisan_payout: artisanPayout,
                platform_fee: platformFee,
            },
        });
    } catch (error) {
        console.error('Release payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to release payment.',
            error: error.message,
        });
    }
};

// @desc    Get transaction history
// @route   GET /api/payments/transactions
// @access  Private
export const getTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        let query;
        if (req.user.role === 'consumer') {
            query = { consumer: req.user._id };
        } else if (req.user.role === 'artisan') {
            query = { artisan: req.user._id };
        } else if (req.user.role === 'admin') {
            query = {};
        } else {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view transactions.',
            });
        }

        const transactions = await Transaction.find(query)
            .populate('order')
            .populate('consumer', 'name email')
            .populate('artisan', 'name email')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Transaction.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                transactions,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transactions.',
            error: error.message,
        });
    }
};

// @desc    Verify payment account (test transaction)
// @route   POST /api/payments/verify-account
// @access  Private (artisan only)
export const verifyPaymentAccount = async (req, res) => {
    try {
        const { upi_id, bank_account_number, ifsc_code } = req.body;

        if (!upi_id && !bank_account_number) {
            return res.status(400).json({
                success: false,
                message: 'Please provide UPI ID or bank account details.',
            });
        }

        // In production, perform test transaction to verify account
        // For now, simulate verification
        const isValid = true;

        if (isValid) {
            const artisanProfile = await ArtisanProfile.findOneAndUpdate(
                { user: req.user._id },
                {
                    payment_upi_id: upi_id,
                    bank_account_number,
                    bank_ifsc_code: ifsc_code,
                    payment_account_verified: true,
                },
                { new: true }
            );

            res.status(200).json({
                success: true,
                message: 'Payment account verified successfully.',
                data: {
                    payment_account_verified: true,
                },
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Payment account verification failed.',
            });
        }
    } catch (error) {
        console.error('Verify payment account error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify payment account.',
            error: error.message,
        });
    }
};

// @desc    Purchase supplier lead credits (payment integration placeholder)
// @route   POST /api/payments/supplier/credits/purchase
// @access  Private (supplier only)
export const purchaseLeadCredits = async (req, res) => {
    try {
        if (req.user.role !== 'supplier') {
            return res.status(403).json({
                success: false,
                message: 'Only suppliers can purchase lead credits.',
            });
        }

        const { package_code } = req.body;
        const selectedPackage = LEAD_CREDIT_PACKAGES[String(package_code || '').toUpperCase()];

        if (!selectedPackage) {
            return res.status(400).json({
                success: false,
                message: 'Invalid package code. Use STARTER, BUSINESS, or ENTERPRISE.',
                data: { packages: LEAD_CREDIT_PACKAGES },
            });
        }

        const supplierProfile = await SupplierProfile.findOneAndUpdate(
            { user: req.user._id },
            {
                $inc: { lead_credits_balance: selectedPackage.credits },
            },
            { new: true }
        );

        if (!supplierProfile) {
            return res.status(404).json({
                success: false,
                message: 'Supplier profile not found.',
            });
        }

        await recordCreditTransaction(
            req.user._id,
            selectedPackage.credits,
            'purchase',
            {
                package_code: String(package_code || '').toUpperCase(),
                price_paise: selectedPackage.price,
            },
            {
                balanceAfter: supplierProfile.lead_credits_balance,
            }
        );
        await maybeSendLowCreditAlert(supplierProfile);

        return res.status(200).json({
            success: true,
            message: 'Lead credits purchased successfully.',
            data: {
                package: {
                    code: String(package_code || '').toUpperCase(),
                    credits: selectedPackage.credits,
                    price_paise: selectedPackage.price,
                },
                credits_balance: supplierProfile.lead_credits_balance,
                payment_status: 'simulated_success',
            },
        });
    } catch (error) {
        console.error('Purchase lead credits error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to purchase lead credits.',
            error: error.message,
        });
    }
};

// @desc    Handle payment dispute
// @route   POST /api/payments/dispute/:orderId
// @access  Private (consumer/artisan)
export const handleDispute = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { reason, description } = req.body;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found.',
            });
        }

        // Verify user is part of the order
        const isConsumer = order.consumer.toString() === req.user._id.toString();
        const isArtisan = order.artisan.toString() === req.user._id.toString();

        if (!isConsumer && !isArtisan) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to dispute this order.',
            });
        }

        // Update order status
        order.order_status = 'disputed';
        await order.save();

        // In production, create a Dispute model entry
        // For now, log the dispute
        console.log(`Dispute raised for order ${orderId}: ${reason}`);

        res.status(200).json({
            success: true,
            message: 'Dispute raised successfully. Admin will review.',
            data: { order },
        });
    } catch (error) {
        console.error('Handle dispute error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to handle dispute.',
            error: error.message,
        });
    }
};
