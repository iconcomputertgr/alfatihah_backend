// routes/ocr.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const tesseract = require('node-tesseract-ocr');

// Configure multer to store file in memory
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/ocr
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    // req.file.buffer contains the binary data
    const imageBuffer = req.file.buffer;

    // Run OCR
    const config = {
      lang: 'eng', // or other language packs
      oem: 1,
      psm: 3,
    };
    const text = await tesseract.recognize(imageBuffer, config);

    // TODO: parse `text` to extract donor name, amount, date, etc.
    // For example, you could do something like:
    // const donorNameMatch = text.match(/Name:\s*(.+)/);
    // const donorName = donorNameMatch ? donorNameMatch[1].trim() : '';
    // After getting `text` from Tesseract
    const donorMatch = text.match(/Name:\s*(.+)/i);
    const amountMatch = text.match(/Amount:\s*([\d,\.]+)/i);
    // etc...

    const donorName = donorMatch ? donorMatch[1].trim() : '';
    const amount = amountMatch ? amountMatch[1].trim() : '';


    // Just return raw text for now
    res.json({ ocrText: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
