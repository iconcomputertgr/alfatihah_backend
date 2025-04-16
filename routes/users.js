const express = require("express");
const router = express.Router();

const User = require("../models/user");

router.get("/", async (req, res) => {
  try {
    const users = await User.findAll();

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  const { name, email, password, role, is_active, approved } = req.body;

  try {
    const user = await User.create(
      name,
      email,
      password,
      role,
      is_active,
      approved
    );

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, role, is_active, approved } = req.body;

  try {
    const user = await User.update(id, {
      name,
      email,
      role,
      is_active,
      approved,
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.delete(id);

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, password, newPassword } = req.body;

  try {
    const user = await User.findById(id);

    if (password && newPassword) {
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.status(400).json({ error: "Old password is incorrect" });
      }

      await User.updatePassword(id, newPassword);

      return res.json({ success: true, message: "Password updated" });
    }

    await User.update(id, {
      name: name || user.name,
      email: email || user.email,
      role: user.role,
      isActive: user.is_active,
      approved: user.approved,
    });

    res.json({ success: true, message: "Profile updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
