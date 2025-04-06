const express = require('express');
const router = express.Router();
const Bank = require('../models/bank'); // Adjust the path as needed

// GET all banks.
router.get('/', async (req, res) => {
  try {
    const banks = await Bank.getAll();
    res.json(banks);
  } catch (error) {
    console.error('Error fetching banks:', error);
    res.status(500).json({ error: 'Failed to fetch banks' });
  }
});

// GET a specific bank by ID.
router.get('/:id', async (req, res) => {
  try {
    const bank = await Bank.getById(req.params.id);
    if (!bank) {
      return res.status(404).json({ error: 'Bank not found' });
    }
    res.json(bank);
  } catch (error) {
    console.error('Error fetching bank:', error);
    res.status(500).json({ error: 'Failed to fetch bank' });
  }
});

// POST create a new bank.
router.post('/', async (req, res) => {
  const { name, account_number, account_holder } = req.body;
  try {
    const newBank = await Bank.create({ name, account_number, account_holder });
    res.status(201).json(newBank);
  } catch (error) {
    console.error('Error creating bank:', error);
    res.status(500).json({ error: 'Failed to create bank' });
  }
});

// PUT update an existing bank.
router.put('/:id', async (req, res) => {
  const { name, account_number, account_holder } = req.body;
  try {
    const updatedBank = await Bank.update(req.params.id, { name, account_number, account_holder });
    if (!updatedBank) {
      return res.status(404).json({ error: 'Bank not found' });
    }
    res.json(updatedBank);
  } catch (error) {
    console.error('Error updating bank:', error);
    res.status(500).json({ error: 'Failed to update bank' });
  }
});

// DELETE a bank.
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Bank.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Bank not found' });
    }
    res.json({ message: 'Bank deleted successfully' });
  } catch (error) {
    console.error('Error deleting bank:', error);
    res.status(500).json({ error: 'Failed to delete bank' });
  }
});

module.exports = router;
