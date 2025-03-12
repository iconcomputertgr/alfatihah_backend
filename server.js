require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/auth');
const ocrRoutes = require('./routes/ocr'); // <-- import the ocr route

const app = express();

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Alfatihah Backend running on port ${PORT}`));
