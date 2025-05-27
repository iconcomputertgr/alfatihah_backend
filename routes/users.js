// routes/users.js

const express = require("express");
const router = express.Router();

const User = require("../models/user");
const Permission = require("../models/permission");
const createUploadMiddleware = require("../middlewares/upload");
const bcrypt = require("bcrypt");

// Upload middleware for profile pictures
const uploadUserPhoto = createUploadMiddleware(
  "assets/images/users",
  (req, file) => {
    const name = req.body.name || "user";
    return name.toLowerCase().replace(/\s+/g, "_");
  }
);

// GET /api/users
router.get("/", async (req, res) => {
  try {
    const users = await User.findAll();
    res.json({ success: true, data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/users/:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    res.json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/users
router.post(
  "/",
  uploadUserPhoto.single("profile_picture"),
  async (req, res) => {
    const {
      name,
      email,
      password,
      role,
      is_active,
      approved,
      permissions = [],
      theme = "light",
    } = req.body;
    const file = req.file;

    try {
      const filePath = file
        ? `assets/images/users/${file.filename}`
        : "assets/images/default_profile.png";

      const result = await User.create(
        name,
        email,
        password,
        role,
        is_active,
        approved,
        filePath,
        theme
      );

      const userId = result.insertId;
      await Permission.assignToUser(userId, permissions);

      res.status(201).json({ success: true, data: { id: userId } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// PUT /api/users/:id
router.put(
  "/:id",
  uploadUserPhoto.single("profile_picture"),
  async (req, res) => {
    const { id } = req.params;
    const {
      name,
      email,
      role,
      is_active,
      approved,
      permissions = [],
      theme,
    } = req.body;
    const file = req.file;

    try {
      const filePath = file ? `assets/images/users/${file.filename}` : null;

      const updatePayload = {
        name,
        email,
        role,
        is_active,
        approved,
        theme,
      };

      if (filePath) updatePayload.profile_picture = filePath;

      await User.update(id, updatePayload);

      await Permission.removeFromUser(id);
      await Permission.assignToUser(id, permissions);

      res.json({ success: true, data: { id } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// DELETE /api/users/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await User.delete(id);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/users/:id/profile
router.patch(
  "/:id",
  uploadUserPhoto.single("profile_picture"),
  async (req, res) => {
    const { id } = req.params;
    const { name, email, theme, password, newPassword } = req.body;
    const file = req.file;

    try {
      const user = await User.findById(id);

      // Change password flow
      if (password && newPassword) {
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return res.status(400).json({ error: "Old password is incorrect" });
        }
        await User.updatePassword(id, newPassword);
        return res.json({ success: true, message: "Password updated" });
      }

      // Profile update flow
      let filePath = null;
      if (file) {
        filePath = `assets/images/users/${file.filename}`;
      }

      await User.update(id, {
        name: name || user.name,
        email: email || user.email,
        theme: theme || user.theme,
        role: user.role,
        is_active: user.is_active,
        approved: user.approved,
        profile_picture: filePath || user.profile_picture,
      });

      res.json({ success: true, message: "Profile updated" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// GET /api/users/:id/permissions
router.get("/:id/permissions", async (req, res) => {
  const { id } = req.params;
  try {
    const perms = await User.getUserPermissions(id);
    const ids = perms.map((p) => p.id);
    res.json({ success: true, data: ids });
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
