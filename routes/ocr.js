// routes/ocr.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const tesseract = require('node-tesseract-ocr');

// For memory-based file storage
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

    // Tesseract config
    const config = {
      lang: 'eng', // or other language packs as needed
      oem: 1,
      psm: 3,
    };

    // Run OCR
    const text = await tesseract.recognize(req.file.buffer, config);

    // 1) Detect the bank
    const bank = detectBank(text);

    // 2) Extract fields based on the bank
    let extracted = {};
    if (bank === 'BCA') {
      extracted = extractBCA(text);
    } else if (bank === 'BRI') {
      extracted = extractBRI(text);
    } else {
      // If unknown, or not found
      extracted = extractGeneric(text); 
    }

    // 3) Gender prediction if we have a beneficiary name
    let gender = '';
    if (extracted.beneficiaryName) {
      const firstName = extracted.beneficiaryName.split(' ')[0];
      gender = await getGender(firstName);
    }

    // 4) Return structured data
    // Merge the extracted fields with the raw OCR text and gender
    res.json({
      ocrText: text,
      gender,
      ...extracted,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Helper function to detect bank from the OCR text
function detectBank(text) {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('bca')) return 'BCA';
  if (lowerText.includes('bri') || lowerText.includes('brimo')) return 'BRI';
  if (lowerText.includes('mandiri')) return 'MANDIRI';
  if (lowerText.includes('cimb')) return 'CIMB';
  // Add more checks as needed
  return 'UNKNOWN';
}

// Regex extraction for BCA
function extractBCA(text) {
  // This is the same logic you had for BCA.
  const dateRegex = /(\d{1,2}\s+[A-Za-z]{3}\s+\d{4}\s+\d{2}:\d{2}:\d{2})/;
  const dateMatch = text.match(dateRegex);
  const dateTime = dateMatch ? dateMatch[1].trim() : '';

  const amountRegex = /IDR\s+([\d,.,]+)/;
  const amountMatch = text.match(amountRegex);
  const amount = amountMatch ? amountMatch[1].trim() : '';

  // Beneficiary name
  let beneficiaryName = '';
  const nameLabelRegex = /Beneficiary\s+Name[\s\n]+(.+)/i;
  const nameLabelMatch = text.match(nameLabelRegex);
  if (nameLabelMatch) {
    beneficiaryName = nameLabelMatch[1].split('\n')[0].trim();
  }

  // Account number
  const accountRegex = /(\d{3}\s*-\s*\d{3}\s*-\s*\d{4})/;
  const accountMatch = text.match(accountRegex);
  const beneficiaryAccount = accountMatch ? accountMatch[1].trim() : '';

  // Transaction type
  const txTypeLabelRegex = /Transaction\s+Type[\s\n]+(.+)/i;
  let transactionType = '';
  const txTypeLabelMatch = text.match(txTypeLabelRegex);
  if (txTypeLabelMatch) {
    transactionType = txTypeLabelMatch[1].split('\n')[0].trim();
  }

  // Fund Received date/time
  const fundReceivedRegex = /Fund Received[:\s]+(\d{1,2}\s+[A-Za-z]{3}\s+\d{4}\s+\d{2}:\d{2}:\d{2})/;
  const fundReceivedMatch = text.match(fundReceivedRegex);
  const fundReceived = fundReceivedMatch ? fundReceivedMatch[1].trim() : '';

  return {
    dateTime,
    amount,
    beneficiaryName,
    beneficiaryAccount,
    transactionType,
    fundReceived,
    bank: 'BCA',
  };
}

// Regex extraction for BRI
function extractBRI(text) {
  // Example for BRI (BRImo) screenshot:
  // "Transaksi Berhasil"
  // "03 April 2024, 17:23:37 WIB"
  // "Rp2.450.000"
  // "Sumber Dana: DR LO KURNIAWAN"
  // "Tujuan: NURUL KHASANAH"
  // "Transfer Bank BRI"
  // etc.

  // Date/time
  // e.g. "03 April 2024, 17:23:37 WIB"
  const dateRegex = /(\d{1,2}\s+[A-Za-z]{3,}\s+\d{4},?\s+\d{2}:\d{2}:\d{2}\s+WIB)/i;
  const dateMatch = text.match(dateRegex);
  const dateTime = dateMatch ? dateMatch[1].trim() : '';

  // Amount e.g. "Rp2.450.000"
  const amountRegex = /Rp[\s]*([\d.,]+)/i;
  const amountMatch = text.match(amountRegex);
  const amount = amountMatch ? amountMatch[1].trim() : '';

  // Sumber Dana or "Source" (beneficiaryName or account name)
  // e.g. "Sumber Dana:\s+DR LO KURNIAWAN"
  let beneficiaryName = '';
  const nameRegex = /Tujuan:\s*(.+)/i; 
  // Or "Nama Tujuan:\s*(.+)" etc. depends on real text
  const nameMatch = text.match(nameRegex);
  if (nameMatch) {
    beneficiaryName = nameMatch[1].split('\n')[0].trim();
  }

  // Account number (sometimes BRI might show e.g. "xxxx-xxxx-xxxx")
  // Adjust pattern as needed
  const accountRegex = /(\d{3,4}\s*-\s*\d{3,4}\s*-\s*\d{3,4})/;
  const accountMatch = text.match(accountRegex);
  const beneficiaryAccount = accountMatch ? accountMatch[1].trim() : '';

  // Transaction type (e.g. "Transfer Bank BRI")
  let transactionType = '';
  const txRegex = /Jenis\s+Transaksi:\s*(.+)/i;
  const txMatch = text.match(txRegex);
  if (txMatch) {
    transactionType = txMatch[1].split('\n')[0].trim();
  }

  // For BRI, we might not have a separate "Fund Received" line, so set empty or
  // if you see something like "Fund Received:" in actual text, parse it similarly.

  return {
    dateTime,
    amount,
    beneficiaryName,
    beneficiaryAccount,
    transactionType,
    fundReceived: '', // or parse if available
    bank: 'BRI',
  };
}

// Generic fallback extraction (in case bank is unknown)
function extractGeneric(text) {
  // Minimal or fallback approach
  // Attempt to find date, amount, name, etc. with more general regex
  const dateRegex = /(\d{1,2}\s+[A-Za-z]{3}\s+\d{4}\s+\d{2}:\d{2}:\d{2})/;
  const dateMatch = text.match(dateRegex);
  const dateTime = dateMatch ? dateMatch[1].trim() : '';

  const amountRegex = /Rp[\s]*([\d.,]+)/i;
  const amountMatch = text.match(amountRegex);
  const amount = amountMatch ? amountMatch[1].trim() : '';

  // etc. 
  return {
    dateTime,
    amount,
    bank: 'UNKNOWN',
  };
}

module.exports = router;
