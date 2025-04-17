const express = require("express");
const router = express.Router();

const User = require("../models/user");
const Permission = require("../models/permission");
const createUploadMiddleware = require("../middlewares/upload");

const bcrypt = require("bcrypt");

const uploadUserPhoto = createUploadMiddleware(
  "assets/images/users",
  (req, file) => {
    const name = req.body.name || "user";
    return name.toLowerCase().replace(/\s+/g, "_");
  }
);

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
    } = req.body;
    const file = req.file;

    try {
      const filePath = file
        ? `assets/images/users/${file.filename}`
        : "assets/images/default_profile.png";

      const user = await User.create(
        name,
        email,
        password,
        role,
        is_active,
        approved,
        filePath
      );

      const userId = user.insertId;

      await Permission.assignToUser(userId, permissions);

      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

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
    } = req.body;
    const file = req.file;

    try {
      const filePath = file
        ? `assets/images/users/${file.filename}`
        : null;

      const updatePayload = {
        name,
        email,
        role,
        is_active,
        approved,
      };

      if (filePath) updatePayload.profile_picture = filePath;

      const user = await User.update(id, updatePayload);

      await Permission.removeFromUser(id);
      await Permission.assignToUser(id, permissions);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

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

router.patch(
  "/:id",
  uploadUserPhoto.single("profile_picture"),
  async (req, res) => {
    const { id } = req.params;
    const { name, email, password, newPassword } = req.body;
    const file = req.file;

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

      let filePath = null;
      if (file) {
        filePath = `assets/images/users/${file.filename}`;
      }

      await User.update(id, {
        name: name || user.name,
        email: email || user.email,
        role: user.role,
        isActive: user.is_active,
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

router.get("/:id/permissions", async (req, res) => {
  const { id } = req.params;

  try {
    const permissions = await User.getUserPermissions(id);

    const permissionIds = permissions.map((row) => row.id);

    res.json({ success: true, data: permissionIds });
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
