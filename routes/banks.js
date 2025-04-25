const express = require('express');
const router = express.Router();
const Bank = require('../models/bank');

// GET all banks
router.get('/', async (req, res) => {
  try {
    const banks = await Bank.getAll();
    const formatted = banks.map(b => ({
      id:            b.id,
      name:          b.name,
      accountNumber: b.account_number,
      branch:        b.account_holder,
      logoBase64:    b.logo_base64,     // new field
      createdAt:     b.created_at,
      updatedAt:     b.updated_at,
    }));
    res.json(formatted);
  } catch (err) {
    console.error('Error fetching banks:', err);
    res.status(500).json({ error: 'Failed to fetch banks' });
  }
});

// GET a specific bank by ID
router.get('/:id', async (req, res) => {
  try {
    const b = await Bank.getById(req.params.id);
    if (!b) {
      return res.status(404).json({ error: 'Bank not found' });
    }
    res.json({
      id:            b.id,
      name:          b.name,
      accountNumber: b.account_number,
      branch:        b.account_holder,
      logoBase64:    b.logo_base64,
      createdAt:     b.created_at,
      updatedAt:     b.updated_at,
    });
  } catch (err) {
    console.error('Error fetching bank:', err);
    res.status(500).json({ error: 'Failed to fetch bank' });
  }
});

// POST create a new bank
router.post('/', async (req, res) => {
  const { name, account_number, account_holder, logoBase64 } = req.body;
  try {
    const newBank = await Bank.create({
      name,
      account_number,
      account_holder,
      logo_base64: logoBase64
    });
    res.status(201).json({
      id:            newBank.id,
      name:          newBank.name,
      accountNumber: newBank.account_number,
      branch:        newBank.account_holder,
      logoBase64:    newBank.logo_base64,
    });
  } catch (err) {
    console.error('Error creating bank:', err);
    res.status(500).json({ error: 'Failed to create bank' });
  }
});

// PUT update an existing bank
router.put('/:id', async (req, res) => {
  const { name, account_number, account_holder, logoBase64 } = req.body;
  try {
    const updated = await Bank.update(req.params.id, {
      name,
      account_number,
      account_holder,
      logo_base64: logoBase64
    });
    if (!updated) {
      return res.status(404).json({ error: 'Bank not found' });
    }
    res.json({
      id:            updated.id,
      name:          updated.name,
      accountNumber: updated.account_number,
      branch:        updated.account_holder,
      logoBase64:    updated.logo_base64,
    });
  } catch (err) {
    console.error('Error updating bank:', err);
    res.status(500).json({ error: 'Failed to update bank' });
  }
});

// DELETE a bank
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Bank.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Bank not found' });
    }
    res.json({ message: 'Bank deleted successfully' });
  } catch (err) {
    console.error('Error deleting bank:', err);
    res.status(500).json({ error: 'Failed to delete bank' });
  }
});

module.exports = router;
