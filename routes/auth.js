const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/user');
const router = express.Router();

// Make sure to include cookie-parser in your app
// const cookieParser = require('cookie-parser');
// app.use(cookieParser());

// Setup Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Register user (pending approval)
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    await User.create(email, password, name);
    res.status(201).json({ message: 'Registration successful. Awaiting admin approval.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Test Email Route
router.get('/test-email', async (req, res) => {
  try {
    const info = await transporter.sendMail({
      from: `"Alfatihah Fundraising" <${process.env.EMAIL_USER}>`,
      to: 'jedifuk@gmail.com', // or any valid recipient email address
      subject: 'Test Email - Alfatihah Fundraising',
      text: 'This is a test email from Nodemailer.',
      html: '<p>This is a test email from <strong>Nodemailer</strong>.</p>',
    });
    console.log('Test email sent: %s', info.messageId);
    res.json({ message: 'Test email sent successfully', info });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ error: 'Failed to send test email', details: error });
  }
});

// POST /login endpoint
router.post('/login', async (req, res) => {
  const { email, password, rememberDevice } = req.body;
  try {
    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    if (user.approved === 0) {
      return res.status(403).json({ error: 'Account not yet approved by admin' });
    }

    if (user.locked_until && user.locked_until > new Date()) {
      return res.status(403).json({ error: 'Account locked. Try again later.' });
    }

    if (!user.password || !password || !(await bcrypt.compare(password, user.password))) {
      await User.incrementFailedLoginAttempts(email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await User.resetFailedLoginAttempts(email);

    // For users without 2FA enabled, proceed as usual.
    if (!user.two_fa_enabled) {
      let deviceToken = null;
      if (rememberDevice) {
        deviceToken = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week
        await User.createTrustedDevice(user.id, deviceToken, req.ip, req.headers['user-agent'], expiry);
        res.cookie('device_token', deviceToken, { 
          httpOnly: true, 
          secure: process.env.NODE_ENV === 'production', 
          maxAge: 7 * 24 * 60 * 60 * 1000 
        });
      }
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '2h' });
      res.cookie('auth_token', token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        maxAge: 2 * 60 * 60 * 1000 
      });
      await User.updateLoginSuccess(email, token);
      return res.json({ message: 'Login successful', token, deviceToken });
    }

    // For 2FA-enabled accounts:
    if (user.two_fa_enabled) {
      // First check if a trusted device token is present in cookies.
      if (rememberDevice && req.cookies && req.cookies.device_token) {
        const deviceToken = req.cookies.device_token;
        const isTrusted = await User.isTrustedDevice(user.id, deviceToken, req.ip, req.headers['user-agent']);
        if (isTrusted) {
          // Bypass OTP if trusted.
          const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '2h' });
          res.cookie('auth_token', token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            maxAge: 2 * 60 * 60 * 1000 
          });
          await User.updateLoginSuccess(email, token);
          return res.json({ message: 'Login successful', token, deviceToken });
        }
      }
      // If not trusted, generate OTP as usual.
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiryTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      await User.updateOtp(email, otp, expiryTime);

      // Send OTP email
      await transporter.sendMail({
        from: `"Alfatihah Fundraising" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your OTP Code - Alfatihah Fundraising',
        text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
        html: `<div style="font-family: Arial; padding: 20px;">
                 <h2>Your OTP Code</h2>
                 <p>Hello ${user.name},</p>
                 <p>Your OTP code for Alfatihah Fundraising is:</p>
                 <h1>${otp}</h1>
                 <p>This code expires in <strong>5 minutes</strong>.</p>
               </div>`
      });
      return res.json({ message: 'OTP sent to your email', requires2FA: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /verify-2fa endpoint
router.post('/verify-2fa', async (req, res) => {
  console.log('Received OTP verification request for email:', req.body.email);
  const { email, otp, rememberDevice } = req.body;
  try {
    const user = await User.findByEmail(email);
    // if (!user || user.temp_otp !== otp || !user.temp_otp_expiry || user.temp_otp_expiry < new Date()) {
    if (!user || String(user.temp_otp) !== otp || !user.temp_otp_expiry || user.temp_otp_expiry < new Date()) {
      await User.incrementFailedLoginAttempts(email);
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    await User.clearOtp(email);
    await User.resetFailedLoginAttempts(email);

    let deviceToken = null;
    if (rememberDevice) {
      deviceToken = crypto.randomBytes(32).toString('hex');
      const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week
      await User.createTrustedDevice(user.id, deviceToken, req.ip, req.headers['user-agent'], expiry);
      res.cookie('device_token', deviceToken, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        maxAge: 7 * 24 * 60 * 60 * 1000 
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.cookie('auth_token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 2 * 60 * 60 * 1000 
    });
    await User.updateLoginSuccess(email, token);

    res.json({ message: '2FA verified', token, deviceToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '2FA verification failed' });
  }
});

// Enable 2FA
router.post('/enable-2fa', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findByEmail(email);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await User.enable2FA(email);
    res.json({ message: '2FA enabled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to enable 2FA' });
  }
});

// Admin: Approve user
router.post('/approve-user', async (req, res) => {
  const { userId } = req.body;
  try {
    const adminUser = { role: 'admin' }; // Replace with real auth logic
    if (adminUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await User.approveUser(userId);
    res.json({ message: 'User approved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Approval failed' });
  }
});

// Admin: Get pending users
router.get('/pending-users', async (req, res) => {
  try {
    const adminUser = { role: 'admin' }; // Replace with real auth logic
    if (adminUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const pendingUsers = await User.getPendingUsers();
    res.json(pendingUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch pending users' });
  }
});

module.exports = router;
