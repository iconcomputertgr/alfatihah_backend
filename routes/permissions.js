const express = require("express");
const router = express.Router();

const Permission = require("../models/permission");

router.get("/", async (req, res) => {
  try {
    const permissions = await Permission.findAll();

    res.json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
