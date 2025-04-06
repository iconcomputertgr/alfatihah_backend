require('dotenv').config();
const express = require('express');
const crypto= require('crypto');
const authRoutes = require('./routes/auth');
const ocrRoutes = require('./routes/ocr'); // <-- import the ocr route
const programRoutes = require('./routes/programs'); // <-- import the programs route
const bankRoutes = require('./routes/banks'); // NEW: Banks endpoints
const donaturRoutes = require('./routes/donaturs');


const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Adjust for production
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

// Existing routes
app.use('/api/auth', authRoutes);

// New OCR route
app.use('/api/ocr', ocrRoutes);

//New Programs route
app.use('/api/programs', programRoutes);

app.use('/api/banks', bankRoutes);

app.use('/api/donaturs', donaturRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Alfatihah Backend running on port ${PORT}`));
