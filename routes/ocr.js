// routes/ocr.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const tesseract = require('node-tesseract-ocr');

// Configure multer to store file in memory
const upload = multer({ storage: multer.memoryStorage() });

// If Node v20+ is not available or 'fetch' is missing, install node-fetch:
//   npm install node-fetch
// and then:
//   const fetch = require('node-fetch');

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

    // OCR Configuration
    const config = {
      lang: 'eng', // or other language packs as needed
      oem: 1,
      psm: 3,
    };

    // Run Tesseract OCR
    const text = await tesseract.recognize(req.file.buffer, config);

    // ------------------------------
    // 1) Regex Extraction
    // ------------------------------
    // Typical BCA screenshot might contain lines like:
    //   "Transfer Successful"
    //   "12 Mar 2025 08:32:39"
    //   "IDR 660,000.00"
    //   "Beneficiary Name"
    //   "XXX XXX"
    //   "Transaction Type"
    //   "Transfer to BCA Account"
    //   "000 - 000 - 0000"

    // Date/time in the format: "12 Mar 2025 08:32:39"
    const dateRegex = /(\d{1,2}\s+[A-Za-z]{3}\s+\d{4}\s+\d{2}:\d{2}:\d{2})/;
    const dateMatch = text.match(dateRegex);
    const dateTime = dateMatch ? dateMatch[1].trim() : '';

    // Amount in the format: "IDR 660,000.00"
    const amountRegex = /IDR\s+([\d,.,]+)/;
    const amountMatch = text.match(amountRegex);
    const amount = amountMatch ? amountMatch[1].trim() : '';

    // Beneficiary name: The line after "Beneficiary Name"
    // We can do a two-step approach:
    //  1) Find "Beneficiary Name" line
    //  2) Grab the next line OR try a direct pattern
    let beneficiaryName = '';
    const nameLabelRegex = /Beneficiary\s+Name[\s\n]+(.+)/i;
    const nameLabelMatch = text.match(nameLabelRegex);
    if (nameLabelMatch) {
      beneficiaryName = nameLabelMatch[1].split('\n')[0].trim();
    }

    // Alternatively, if "Beneficiary Name" is on one line and the actual name is on the next:
    // you'd parse the text lines individually. The approach above often works
    // if Tesseract recognized "Beneficiary Name\nJEN PIN" together.

    // Account number in the format: "383 - 079 - 2898"
    const accountRegex = /(\d{3}\s*-\s*\d{3}\s*-\s*\d{4})/;
    const accountMatch = text.match(accountRegex);
    const beneficiaryAccount = accountMatch ? accountMatch[1].trim() : '';

    // Transaction Type in the format: "Transfer to BCA Account"
    // This might appear after "Transaction Type" or might appear on its own
    const txTypeLabelRegex = /Transaction\s+Type[\s\n]+(.+)/i;
    let transactionType = '';
    const txTypeLabelMatch = text.match(txTypeLabelRegex);
    if (txTypeLabelMatch) {
      transactionType = txTypeLabelMatch[1].split('\n')[0].trim();
    }

    // ------------------------------
    // 2) Gender Prediction
    // ------------------------------
    // If we have a name, attempt to guess the gender from the first word
    let gender = '';
    if (beneficiaryName) {
      const firstName = beneficiaryName.split(' ')[0];
      gender = await getGender(firstName);
    }

    // ------------------------------
    // 3) Return Structured Data
    // ------------------------------
    // You can store the entire OCR text for debugging, plus
    // any fields you want to pass back to Flutter.
    res.json({
      ocrText: text, // raw OCR text for debugging
      dateTime,
      amount,
      beneficiaryName,
      beneficiaryAccount,
      transactionType,
      gender,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
