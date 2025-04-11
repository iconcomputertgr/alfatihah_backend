require("dotenv").config();

const express = require("express");
const crypto = require("crypto");
const authRoutes = require("./routes/auth");
const ocrRoutes = require("./routes/ocr");
const programRoutes = require("./routes/programs");
const bankRoutes = require("./routes/banks");
const donaturRoutes = require("./routes/donaturs");
const cookieParser = require("cookie-parser");

const app = express();

app.use(cookieParser());

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use((req, res, next) => {
  console.log("Request: ", req.method, req.url);
  next();
});

app.use("/api/auth", authRoutes);

app.use("/api/ocr", ocrRoutes);

app.use("/api/programs", programRoutes);

app.use("/api/banks", bankRoutes);

app.use("/api/donaturs", donaturRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Alfatihah Backend running on port ${PORT}`)
);
