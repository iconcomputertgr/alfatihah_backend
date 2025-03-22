const express = require("express");
const router = express.Router();
const multer = require("multer");
const tesseract = require("node-tesseract-ocr");
const fetch = require("node-fetch");
const { exec } = require("child_process");

// Setup Multer (Memory Storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // Batas file 5MB
});

// **Pastikan Tesseract Bisa Ditemukan**
function checkTesseractInstalled() {
  return new Promise((resolve, reject) => {
    exec("tesseract -v", (error, stdout, stderr) => {
      if (error) {
        console.error("Tesseract OCR tidak ditemukan di sistem.");
        reject(new Error("Tesseract OCR tidak terinstal atau PATH belum dikonfigurasi."));
      } else {
        console.log("Tesseract OCR ditemukan:", stdout);
        resolve(true);
      }
    });
  });
}

// **Fungsi untuk mendapatkan gender berdasarkan nama**
async function getGender(firstName) {
  try {
    const response = await fetch(`https://api.genderize.io?name=${encodeURIComponent(firstName)}`);
    if (!response.ok) throw new Error(`Gender API gagal: ${response.statusText}`);
    const data = await response.json();
    return data.gender || "";
  } catch (err) {
    console.error("Error fetching gender:", err);
    return "";
  }
}

// **Fungsi untuk menjalankan OCR dengan timeout**
function recognizeWithTimeout(imageBuffer, config, timeoutMs = 10000) {
  return Promise.race([
    tesseract.recognize(imageBuffer, config),
    new Promise((_, reject) => setTimeout(() => reject(new Error("OCR timeout")), timeoutMs))
  ]);
}

// **Route untuk OCR**
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    // Cek apakah Tesseract tersedia sebelum menjalankan OCR
    await checkTesseractInstalled();

    // Konfigurasi Tesseract
    const config = {
      lang: "eng",
      oem: 1,
      psm: 3,
      executablePath: "C:\\Program Files\\Tesseract-OCR\\tesseract.exe" // Pastikan path sesuai
    };

    const text = await recognizeWithTimeout(req.file.buffer, config);

    // 1) Deteksi bank
    const bank = detectBank(text);

    // 2) Ekstrak data sesuai bank
    let extracted = bank === "BCA" ? extractBCA(text) :
                    bank === "BRI" ? extractBRI(text) :
                    extractGeneric(text);

    // 3) Prediksi gender jika ada nama penerima
    let gender = "";
    if (extracted.beneficiaryName) {
      const firstName = extracted.beneficiaryName.split(" ")[0];
      gender = await getGender(firstName);
    }

    // 4) Kirim hasil
    res.json({ ocrText: text, gender, ...extracted });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// **Fungsi untuk mendeteksi bank dari teks OCR**
function detectBank(text) {
  const lowerText = text.toLowerCase();
  if (lowerText.includes("bca")) return "BCA";
  if (lowerText.includes("bri") || lowerText.includes("brimo")) return "BRI";
  if (lowerText.includes("mandiri")) return "MANDIRI";
  if (lowerText.includes("cimb")) return "CIMB";
  return "UNKNOWN";
}

// **Ekstraksi data untuk BCA**
function extractBCA(text) {
  const dateMatch = text.match(/(\d{1,2}\s+[A-Za-z]{3}\s+\d{4}\s+\d{2}:\d{2}:\d{2})/);
  const amountMatch = text.match(/IDR\s+([\d,\.]+)/);
  const nameMatch = text.match(/Beneficiary\s+Name[\s\n]+(.+)/i);
  const accountMatch = text.match(/(\d{3}\s*-\s*\d{3}\s*-\s*\d{4})/);
  const txMatch = text.match(/Transaction\s+Type[\s\n]+(.+)/i);

  return {
    dateTime: dateMatch ? dateMatch[1].trim() : "",
    amount: amountMatch ? amountMatch[1].trim() : "",
    beneficiaryName: nameMatch ? nameMatch[1].split("\n")[0].trim() : "",
    beneficiaryAccount: accountMatch ? accountMatch[1].trim() : "",
    transactionType: txMatch ? txMatch[1].split("\n")[0].trim() : "",
    bank: "BCA",
  };
}

// **Ekstraksi data untuk BRI**
function extractBRI(text) {
  const dateMatch = text.match(/(\d{1,2}\s+[A-Za-z]{3,}\s+\d{4},?\s+\d{2}:\d{2}:\d{2}\s+WIB)/i);
  const amountMatch = text.match(/Rp[\s]*([\d.,]+)/i);
  const nameMatch = text.match(/Tujuan:\s*(.+)/i);
  const accountMatch = text.match(/(\d{3,4}\s*-\s*\d{3,4}\s*-\s*\d{3,4})/);
  const txMatch = text.match(/Jenis\s+Transaksi:\s*(.+)/i);

  return {
    dateTime: dateMatch ? dateMatch[1].trim() : "",
    amount: amountMatch ? amountMatch[1].trim() : "",
    beneficiaryName: nameMatch ? nameMatch[1].split("\n")[0].trim() : "",
    beneficiaryAccount: accountMatch ? accountMatch[1].trim() : "",
    transactionType: txMatch ? txMatch[1].split("\n")[0].trim() : "",
    bank: "BRI",
  };
}

// **Ekstraksi data untuk bank lain**
function extractGeneric(text) {
  const dateMatch = text.match(/(\d{1,2}\s+[A-Za-z]{3}\s+\d{4}\s+\d{2}:\d{2}:\d{2})/);
  const amountMatch = text.match(/Rp[\s]*([\d.,]+)/i);

  return {
    dateTime: dateMatch ? dateMatch[1].trim() : "",
    amount: amountMatch ? amountMatch[1].trim() : "",
    bank: "UNKNOWN",
  };
}

// **Menangani error global agar server tidak crash**
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

module.exports = router;
