const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/user');

const router = express.Router();

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

// Login (check approval status & 2FA)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
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

    if (!user.two_fa_enabled) {
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '2h' });
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 2 * 60 * 60 * 1000
      });
      await User.updateLoginSuccess(email, token);
      return res.json({ message: 'Login successful' });
    }

    // 2FA Enabled → Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await User.updateOtp(email, otp, expiryTime);

    // ✅ Kirim OTP pakai email styled & identitas pengirim
    await transporter.sendMail({
      from: `"Alfatihah Fundraising" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Kode OTP Anda - Alfatihah Fundraising',
      text: `Kode OTP Anda adalah ${otp}. Berlaku selama 5 menit.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <h2 style="color: #4CAF50;">Kode OTP Anda</h2>
            <p>Hai <strong>${user.name}</strong>,</p>
            <p>Berikut adalah kode OTP untuk login ke akun <strong>Alfatihah Fundraising</strong> Anda:</p>
            <div style="font-size: 24px; font-weight: bold; background: #e8f5e9; padding: 16px; text-align: center; border-radius: 6px; margin: 20px 0;">
              ${otp}
            </div>
            <p>Kode ini berlaku selama <strong>5 menit</strong>.</p>
            <hr style="margin: 30px 0;">
            <p style="font-size: 12px; color: #888;">Email ini dikirim otomatis oleh sistem Alfatihah Fundraising. Jika Anda tidak meminta kode ini, silakan abaikan.</p>
          </div>
        </div>
      `
    });

    res.json({ message: 'OTP sent to your email', requires2FA: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify OTP (2FA)
router.post('/verify-2fa', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findByEmail(email);

    if (!user || user.temp_otp !== otp || !user.temp_otp_expiry || user.temp_otp_expiry < new Date()) {
      await User.incrementFailedLoginAttempts(email);
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    await User.clearOtp(email);
    await User.resetFailedLoginAttempts(email);

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 2 * 60 * 60 * 1000
    });
    await User.updateLoginSuccess(email, token);

    res.json({
      message: '2FA verified',
      token,
    });

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
