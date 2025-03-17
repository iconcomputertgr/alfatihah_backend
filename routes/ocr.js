// routes/ocr.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const tesseract = require('node-tesseract-ocr');

const upload = multer({ storage: multer.memoryStorage() });

// If necessary, import fetch (e.g., using node-fetch)
// const fetch = require('node-fetch');

async function getGender(firstName) {
  try {
    const response = await fetch(
      `https://api.genderize.io?name=${encodeURIComponent(firstName)}`
    );
    const data = await response.json();
    return data.gender || '';
  } catch (err) {
    console.error('Error fetching gender:', err);
    return '';
  }
}

router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const config = {
      lang: 'eng',
      oem: 1,
      psm: 3,
    };

    const text = await tesseract.recognize(req.file.buffer, config);

    // ------------------------------
    // 1) Regex Extraction
    // ------------------------------
    // Extract a date/time in format "12 Mar 2025 08:32:39"
    const dateRegex = /(\d{1,2}\s+[A-Za-z]{3}\s+\d{4}\s+\d{2}:\d{2}:\d{2})/;
    const dateMatch = text.match(dateRegex);
    const dateTime = dateMatch ? dateMatch[1].trim() : '';

    // Extract amount, e.g., "IDR 660,000.00"
    const amountRegex = /IDR\s+([\d,.,]+)/;
    const amountMatch = text.match(amountRegex);
    const amount = amountMatch ? amountMatch[1].trim() : '';

    // Extract beneficiary name.
    let beneficiaryName = '';
    const nameLabelRegex = /Beneficiary\s+Name[\s\n]+(.+)/i;
    const nameLabelMatch = text.match(nameLabelRegex);
    if (nameLabelMatch) {
      beneficiaryName = nameLabelMatch[1].split('\n')[0].trim();
    }

    // Extract account number.
    const accountRegex = /(\d{3}\s*-\s*\d{3}\s*-\s*\d{4})/;
    const accountMatch = text.match(accountRegex);
    const beneficiaryAccount = accountMatch ? accountMatch[1].trim() : '';

    // Extract transaction type.
    const txTypeLabelRegex = /Transaction\s+Type[\s\n]+(.+)/i;
    let transactionType = '';
    const txTypeLabelMatch = text.match(txTypeLabelRegex);
    if (txTypeLabelMatch) {
      transactionType = txTypeLabelMatch[1].split('\n')[0].trim();
    }

    // New: Extract Fund Received date/time.
    // Assumes a line like "Fund Received: 12 Mar 2025 08:32:39"
    const fundReceivedRegex = /Fund Received[:\s]+(\d{1,2}\s+[A-Za-z]{3}\s+\d{4}\s+\d{2}:\d{2}:\d{2})/;
    const fundReceivedMatch = text.match(fundReceivedRegex);
    const fundReceived = fundReceivedMatch ? fundReceivedMatch[1].trim() : '';

    // ------------------------------
    // 2) Gender Prediction
    // ------------------------------
    let gender = '';
    if (beneficiaryName) {
      const firstName = beneficiaryName.split(' ')[0];
      gender = await getGender(firstName);
    }

    // ------------------------------
    // 3) Return Structured Data
    // ------------------------------
    res.json({
      ocrText: text,
      dateTime,
      amount,
      beneficiaryName,
      beneficiaryAccount,
      transactionType,
      gender,
      fundReceived, // New field
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
