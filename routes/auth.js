const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/user');

const router = express.Router();

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

// Login (check approval status)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (user.approved === 0) {
      return res.status(403).json({ error: 'Account not yet approved by admin' });
    }
    if (user.locked_until && user.locked_until > new Date()) {
      return res.status(403).json({ error: 'Account locked. Try again later.' });
    }
    if (!(await bcrypt.compare(password, user.password))) {
      await User.incrementFailedLoginAttempts(email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.two_fa_enabled) {
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
      await User.updateLoginSuccess(email, token);
      return res.json({ token, message: 'Login successful' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await User.updateOtp(email, otp);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code - Alfatihah',
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    });

    res.json({ message: 'OTP sent to your email', requires2FA: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify OTP
router.post('/verify-2fa', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findByEmail(email);
    if (!user || user.temp_otp !== otp || (user.temp_otp_expiry && user.temp_otp_expiry < new Date())) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }
    await User.clearOtp(email);
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    await User.updateLoginSuccess(email, token);
    res.json({ token, message: '2FA verified' });
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
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await User.enable2FA(email);
    res.json({ message: '2FA enabled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to enable 2FA' });
  }
});

// Admin: Approve user (requires admin check)
router.post('/approve-user', async (req, res) => {
  const { userId } = req.body;
  try {
    // Placeholder for admin check (e.g., JWT middleware)
    const adminUser = { role: 'admin' }; // Replace with actual auth logic
    if (adminUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const user = await User.findById(userId); // Assume findById method exists or adjust
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
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
    // Placeholder for admin check
    const adminUser = { role: 'admin' }; // Replace with actual auth logic
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