const express = require("express");
const { openai } = require("../services/openaiClient");
const { getDonationMetrics } = require("../services/functions"); // implementasikan fungsi ini
const router = express.Router();

router.post("/query", async (req, res) => {
  const { question } = req.body;

  // 1. Definisikan fungsi yang bisa dipanggil
  const functions = [
    {
      name: "getDonationMetrics",
      description: "Mengambil metrik donasi dari database",
      parameters: {
        type: "object",
        properties: {
          metric: {
            type: "string",
            enum: ["total_donasi", "top_donor", "average_donasi"]
          },
          periodType: {
            type: "string",
            enum: ["day", "week", "month", "year"]
          }
        },
        required: ["metric", "periodType"]
      }
    }
  ];

  // 2. Kirim ke Groq dengan function schema
  const chatResp = await openai.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: question }],
    functions,
    function_call: "auto"
  });

  const msg = chatResp.choices[0].message;

  // 3. Jika model memanggil fungsi, eksekusi dan kirim hasilnya kembali
  if (msg.function_call) {
    const { name, arguments: argsJSON } = msg.function_call;
    const args = JSON.parse(argsJSON);

    let result;
    if (name === "getDonationMetrics") {
      result = await getDonationMetrics(args); 
      // misal { value: 150000000 }
    }

    // 4. Kirim ulang hasil fungsi ke model agar dirender natural
    const followUp = await openai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "user", content: question },
        msg,
        { role: "function", name, content: JSON.stringify(result) }
      ]
    });

    return res.json({ answer: followUp.choices[0].message.content });
  }

  // fallback—harusnya jarang terjadi setelah ada fungsi
  res.json({ answer: msg.content });
});

module.exports = router;
