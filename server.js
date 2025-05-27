require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const ocrRoutes = require("./routes/ocr");
const programRoutes = require("./routes/programs");
const bankRoutes = require("./routes/banks");
const donaturRoutes = require("./routes/donaturs");
const donationRoutes = require("./routes/donations");
const userRoutes = require("./routes/users");
const permissionsRoutes = require("./routes/permissions");
const transactionsRoutes = require("./routes/transactions");
const donationSummaryRouter = require("./routes/donationSummaries");
const csPerformanceRouter = require("./routes/csPerformances");
const programFundRouter = require("./routes/programFundAllocations");
const dailyTransactionsRtaRouter = require("./routes/dailyTransactionsRta");
const fundingBankProgramRtaRouter = require("./routes/fundingBankProgramRta");
const budgetOverviewRtaRouter = require("./routes/budgetOverviewRta");

const app = express();

app.use(cookieParser());

app.use(express.json());

// ← limit all incoming JSON bodies to 100 KB
app.use(bodyParser.json({ limit: "100kb" }));
app.use(bodyParser.urlencoded({ limit: "100kb", extended: true }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(
  cors({
    origin: "*",
    methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use("/assets/images", express.static("assets/images"));

app.use((req, res, next) => {
  console.log("Request: ", req.method, req.url);
  next();
});

app.use("/api/auth", authRoutes);

app.use("/api/ocr", ocrRoutes);

app.use("/api/programs", programRoutes);

app.use("/api/banks", bankRoutes);

app.use("/api/donaturs", donaturRoutes);

app.use("/api/donations", donationRoutes);

app.use("/api/users", userRoutes);

app.use("/api/permissions", permissionsRoutes);

app.use("/api/transactions", transactionsRoutes);

app.use("/api/donationsummary", donationSummaryRouter);

app.use("/api/cs-performance", csPerformanceRouter);

app.use("/api/program-fund", programFundRouter);

app.use("/api/daily-rta", dailyTransactionsRtaRouter);
app.use("/api/funding-bank-program-rta", fundingBankProgramRtaRouter);
app.use("/api/budget-overview-rta", budgetOverviewRtaRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Alfatihah Backend running on port ${PORT}`)
);

// catch-all error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: "Internal server error" });
});
