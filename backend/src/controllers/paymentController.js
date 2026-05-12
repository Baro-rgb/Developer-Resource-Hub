const { pool } = require('../config/database');

// Create payment link (Generate VietQR URL for SePay)
const createPaymentLink = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { plan } = req.body; // e.g., 'pro'

    // For demonstration, Pro plan is 199,000 VND
    const amount = plan === 'pro' ? 199000 : 0;
    
    if (amount === 0) {
      return res.status(400).json({ success: false, message: 'Invalid plan selected' });
    }

    const orderCode = Number(String(Date.now()).slice(-6)); // Generate a unique 6-digit order code
    const description = `DH${orderCode}`;

    // Get config from env
    const bankId = process.env.SEPAY_BANK_ID || 'MBBank';
    const accNo = process.env.SEPAY_ACCOUNT_NO || '0123456789';
    const accName = process.env.SEPAY_ACCOUNT_NAME || 'NGUYEN VAN A';

    // Generate VietQR image URL (SePay format)
    const qrUrl = `https://qr.sepay.vn/img?acc=${accNo}&bank=${bankId}&amount=${amount}&des=${description}&name=${encodeURIComponent(accName)}`;

    // Save the order to our database to track it
    await pool.query(
      `INSERT INTO payments (order_code, user_id, amount, status, plan_type) VALUES ($1, $2, $3, 'PENDING', $4)`,
      [orderCode, userId, amount, plan]
    );

    res.json({
      success: true,
      data: {
        checkoutUrl: qrUrl,
        orderCode: orderCode,
        amount: amount,
        description: description
      }
    });
  } catch (error) {
    next(error);
  }
};

// Check payment status
const checkPaymentStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orderCode = req.params.orderCode;

    const result = await pool.query(
      'SELECT status FROM payments WHERE order_code = $1 AND user_id = $2',
      [orderCode, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({
      success: true,
      data: {
        status: result.rows[0].status // 'PENDING' or 'PAID'
      }
    });
  } catch (error) {
    next(error);
  }
};

// Handle SePay Webhook
const handleWebhook = async (req, res, next) => {
  try {
    // Basic Security Check (if token is configured)
    const webhookToken = process.env.SEPAY_WEBHOOK_TOKEN;
    if (webhookToken) {
      const authHeader = req.headers['authorization'];
      if (!authHeader || authHeader !== `Apikey ${webhookToken}`) {
        return res.status(401).json({ success: false, message: 'Unauthorized webhook' });
      }
    }

    const {
      gateway,
      transactionDate,
      accountNumber,
      code,
      content,
      transferType,
      transferAmount
    } = req.body;

    // We only care about incoming money
    if (transferType !== 'in') {
      return res.json({ success: true, message: 'Ignored out transfer' });
    }

    // Try to extract order code from content (e.g. "Nguyen Van A chuyen tien DH123456")
    const orderCodeMatch = content ? content.match(/DH(\d+)/i) : null;
    
    if (orderCodeMatch && orderCodeMatch[1]) {
      const orderCode = parseInt(orderCodeMatch[1]);
      
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Get the payment record
        const paymentResult = await client.query('SELECT * FROM payments WHERE order_code = $1 FOR UPDATE', [orderCode]);
        const payment = paymentResult.rows[0];

        // Check if payment exists, is pending, and amount matches (or is greater)
        if (payment && payment.status === 'PENDING' && transferAmount >= payment.amount) {
          // Update payment status
          await client.query('UPDATE payments SET status = $1 WHERE id = $2', ['PAID', payment.id]);
          
          // Upgrade user to Pro
          await client.query('UPDATE users SET subscription_plan = $1 WHERE id = $2', [payment.plan_type, payment.user_id]);
          console.log(`✅ Automatically upgraded user ${payment.user_id} to ${payment.plan_type} via SePay webhook`);
        }

        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        console.error('Webhook processing error:', err);
      } finally {
        client.release();
      }
    }

    // Always return 200 OK to SePay so they know we received it
    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.json({ success: false, message: 'Error processing webhook' });
  }
};

module.exports = {
  createPaymentLink,
  checkPaymentStatus,
  handleWebhook
};
