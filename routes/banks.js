const express = require("express");
const router = express.Router();
const createUploadMiddleware = require("../middlewares/upload");
const Bank = require("../models/bank");

const uploadBankLogo = createUploadMiddleware(
  "assets/images/banks",
  (req, file) => {
    const name = req.body.name || "bank";
    return name.toLowerCase().replace(/\s+/g, "_");
  }
);

router.get("/", async (req, res) => {
  try {
    const banks = await Bank.getAll();

    res.json({
      success: true,
      data: banks.map((bank) => ({
        id: bank.id,
        name: bank.name,
        account_number: bank.account_number,
        account_holder: bank.account_holder,
        logo: bank.logo,
      })),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Failed to fetch banks" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const bank = await Bank.getById(id);

    if (!bank) return res.status(404).json({ error: "Bank not found" });

    res.json({
      success: true,
      data: {
        id: bank.id,
        name: bank.name,
        account_number: bank.account_number,
        account_holder: bank.account_holder,
        logo: bank.logo,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Failed to fetch bank" });
  }
});

router.post("/", uploadBankLogo.single("logo"), async (req, res) => {
  const { name, account_number, account_holder } = req.body;
  const file = req.file;

  try {
    const filePath = file
      ? `assets/images/banks/${file.filename}`
      : "assets/images/default_bank.png";

    const bank = await Bank.create({
      name,
      account_number,
      account_holder,
      logo: filePath,
    });

    const created = {
      id: bank.id,
      name: bank.name,
      account_number: bank.account_number,
      account_holder: bank.account_holder,
      logo: bank.logo,
    };

    res.status(201).json({
      success: true,
      data: created,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Failed to create bank" });
  }
});

router.put("/:id", uploadBankLogo.single("logo"), async (req, res) => {
  const { id } = req.params;
  const { name, account_number, account_holder } = req.body;
  const file = req.file;

  try {
    const filePath = file ? `assets/images/banks/${file.filename}` : null;

    const updatePayload = {
      name,
      account_number,
      account_holder,
    };

    if (filePath) updatePayload.logo = filePath;

    const bank = await Bank.update(id, updatePayload);

    if (!bank) return res.status(404).json({ error: "Bank not found" });

    const updated = {
      id: bank.id,
      name: bank.name,
      account_number: bank.account_number,
      account_holder: bank.account_holder,
      logo: bank.logo,
    };

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Failed to update bank" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Bank.delete(id);

    if (!deleted) return res.status(404).json({ error: "Bank not found" });

    res.json({ success: true, message: "Bank deleted successfully" });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Failed to delete bank" });
  }
});

module.exports = router;
