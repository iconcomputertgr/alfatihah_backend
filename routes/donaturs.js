const express = require("express");
const router = express.Router();
const Donatur = require("../models/donatur");

router.get("/", async (req, res) => {
  try {
    const donaturs = await Donatur.getAll();

    res.json({
      success: true,
      data: donaturs,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Failed to fetch donaturs" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const donatur = await Donatur.getById(id);

    if (!donatur) return res.status(404).json({ error: "Donatur not found" });

    res.json({
      success: true,
      data: donatur,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Failed to fetch donatur" });
  }
});

router.post("/", async (req, res) => {
  const { user, name, email, phone, address } = req.body;

  try {
    const donatur = await Donatur.create({
      user_id: user.id,
      name,
      email,
      phone,
      address,
    });

    res.status(201).json({
      success: true,
      data: donatur,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Failed to create donatur" });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { user, name, email, phone, address } = req.body;

  try {
    const donatur = await Donatur.update(id, {
      user_id: user.id,
      name,
      email,
      phone,
      address,
    });

    res.json({
      success: true,
      data: donatur,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Failed to update donatur" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const donatur = await Donatur.delete(id);

    res.json({
      success: true,
      message: "Donatur deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Failed to delete donatur" });
  }
});

module.exports = router;
