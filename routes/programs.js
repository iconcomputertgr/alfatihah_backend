const express = require('express');
const router = express.Router();
const Program = require('../models/program'); // Adjust path as necessary

// GET all programs.
router.get('/', async (req, res) => {
  try {
    const programs = await Program.getAll();
    res.json(programs);
  } catch (error) {
    console.error('Error fetching programs:', error);
    res.status(500).json({ error: 'Failed to fetch programs' });
  }
});

// GET a specific program by ID.
router.get('/:id', async (req, res) => {
  try {
    const program = await Program.getById(req.params.id);
    if (!program) {
      return res.status(404).json({ error: 'Program not found' });
    }
    res.json(program);
  } catch (error) {
    console.error('Error fetching program:', error);
    res.status(500).json({ error: 'Failed to fetch program' });
  }
});

// POST create a new program.
router.post('/', async (req, res) => {
  const { name, description, target_amount, start_date, end_date } = req.body;
  try {
    const newProgram = await Program.create({ name, description, target_amount, start_date, end_date });
    res.status(201).json(newProgram);
  } catch (error) {
    console.error('Error creating program:', error);
    res.status(500).json({ error: 'Failed to create program' });
  }
});

// PUT update an existing program.
router.put('/:id', async (req, res) => {
  const { name, description, target_amount, start_date, end_date } = req.body;
  try {
    const updatedProgram = await Program.update(req.params.id, { name, description, target_amount, start_date, end_date });
    if (!updatedProgram) {
      return res.status(404).json({ error: 'Program not found' });
    }
    res.json(updatedProgram);
  } catch (error) {
    console.error('Error updating program:', error);
    res.status(500).json({ error: 'Failed to update program' });
  }
});

// DELETE a program.
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Program.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Program not found' });
    }
    res.json({ message: 'Program deleted successfully' });
  } catch (error) {
    console.error('Error deleting program:', error);
    res.status(500).json({ error: 'Failed to delete program' });
  }
});

module.exports = router;
