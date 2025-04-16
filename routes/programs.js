const express = require("express");
const router = express.Router();
const Program = require("../models/program");

router.get("/", async (req, res) => {
  try {
    const programs = await Program.getAll();

    res.json({
      success: true,
      data: programs,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Failed to fetch programs" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const program = await Program.getById(id);

    if (!program) return res.status(404).json({ error: "Program not found" });

    res.json({
      success: true,
      data: program,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Failed to fetch program" });
  }
});

router.post("/", async (req, res) => {
  const { name, description, target_amount, start_date, end_date } = req.body;

  try {
    const program = await Program.create({
      name,
      description,
      target_amount,
      start_date,
      end_date,
    });

    res.status(201).json({
      success: true,
      data: program,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Failed to create program" });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, target_amount, start_date, end_date } = req.body;

  try {
    const program = await Program.update(id, {
      name,
      description,
      target_amount,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
    });

    res.json({
      success: true,
      data: program,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Failed to update program" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const program = await Program.delete(id);

    res.json({
      success: true,
      message: "Program deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Failed to delete program" });
  }
});

module.exports = router;
