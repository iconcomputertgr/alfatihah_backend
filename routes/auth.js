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

// Register user
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create(email, hashedPassword);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login (send OTP)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    await User.updateOtp(email, otp);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code - Alfatihah',
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    });

    res.json({ message: 'OTP sent to your email', requires2FA: true });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify OTP
router.post('/verify-2fa', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findByEmail(email);
    if (!user || user.temp_otp !== otp) {
      return res.status(401).json({ error: 'Invalid OTP' });
    }
    await User.clearOtp(email);
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, message: '2FA verified' });
  } catch (error) {
    res.status(500).json({ error: '2FA verification failed' });
  }
});

module.exports = router;