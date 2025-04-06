const express = require('express');
const router = express.Router();
const Donatur = require('../models/donatur');

router.get('/', async (req, res) => {
  try {
    const donaturs = await Donatur.getAll();
    res.json(donaturs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch donaturs' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const donatur = await Donatur.getById(req.params.id);
    if (!donatur) return res.status(404).json({ error: 'Donatur not found' });
    res.json(donatur);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch donatur' });
  }
});

router.post('/', async (req, res) => {
  const { user_id, name, email, phone, address } = req.body;
  try {
    const newDonatur = await Donatur.create({ user_id, name, email, phone, address });
    res.status(201).json(newDonatur);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create donatur' });
  }
});

router.put('/:id', async (req, res) => {
  const { user_id, name, email, phone, address } = req.body;
  try {
    const updatedDonatur = await Donatur.update(req.params.id, { user_id, name, email, phone, address });
    res.json(updatedDonatur);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update donatur' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Donatur.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Donatur not found' });
    res.json({ message: 'Donatur deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete donatur' });
  }
});

module.exports = router;
