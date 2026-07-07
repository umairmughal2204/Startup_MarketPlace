const express = require("express");
const User = require("../models/User");
const { createToken, normalizeUser, requireAuth, requireRole, requireSelfOrAdmin } = require("../middleware/auth");

const router = express.Router();

router.post("/register", async (req, res) => {
	try {
		const { name, email, password, role, professionalDetails } = req.body || {};
		if (!name || !email || !password || !role) {
			return res.status(400).json({ message: "name, email, password, and role are required" });
		}

		const existing = await User.findOne({ email: String(email).toLowerCase() });
		if (existing) {
			return res.status(409).json({ message: "Email already registered" });
		}

		const user = await User.create({
			name,
			email,
			password,
			role,
			professionalDetails: professionalDetails || {},
			isVerified: role === "Admin",
		});

		const token = createToken(user);
		res.status(201).json({ user: normalizeUser(user), token });
	} catch (error) {
		res.status(500).json({ message: "Registration failed" });
	}
});

router.post("/login", async (req, res) => {
	try {
		const { email, password, role } = req.body || {};
		if (!email || !password || !role) {
			return res.status(400).json({ message: "email, password, and role are required" });
		}

		const user = await User.findOne({ email: String(email).toLowerCase() });
		if (!user) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		if (user.role !== role) {
			return res.status(403).json({ message: "Role mismatch" });
		}

		const isMatch = await user.comparePassword(password);
		if (!isMatch) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		if (user.status === "Suspended") {
			return res.status(403).json({ message: "Account is suspended" });
		}

		if (user.role !== "Admin" && !user.isVerified) {
			return res.status(403).json({ message: "Account is pending verification" });
		}

		const token = createToken(user);
		res.json({ user: normalizeUser(user), token });
	} catch (error) {
		res.status(500).json({ message: "Login failed" });
	}
});


router.get("/me", requireAuth, async (req, res) => {
	try {
		res.json({ user: normalizeUser(req.user) });
	} catch (error) {
		res.status(500).json({ message: "Failed to load current user" });
	}
});

router.get("/users", requireRole("Admin"), async (req, res) => {
	try {
		const users = await User.find().sort({ createdAt: -1 });
		res.json(users.map(normalizeUser));
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch users" });
	}
});

router.put("/users/:id/profile", requireSelfOrAdmin, async (req, res) => {
	try {
		const { name, email, phone, profileVisibility } = req.body || {};
		const updates = {};
		if (name !== undefined) updates.name = name;
		if (email !== undefined) updates.email = email;
		if (phone !== undefined) updates.phone = phone;
		if (profileVisibility !== undefined) updates.profileVisibility = profileVisibility;

		const user = await User.findByIdAndUpdate(req.params.id, updates, {
			new: true,
			runValidators: true,
		});

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.json({ user: normalizeUser(user) });
	} catch (error) {
		res.status(400).json({ message: "Failed to update profile" });
	}
});

router.put("/users/:id/password", requireSelfOrAdmin, async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body || {};
		if (!currentPassword || !newPassword) {
			return res.status(400).json({ message: "currentPassword and newPassword are required" });
		}

		const user = await User.findById(req.params.id);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const isMatch = await user.comparePassword(currentPassword);
		if (!isMatch) {
			return res.status(401).json({ message: "Current password is incorrect" });
		}

		user.password = newPassword;
		await user.save();

		res.json({ message: "Password updated" });
	} catch (error) {
		res.status(500).json({ message: "Failed to update password" });
	}
});

router.put("/users/:id/notifications", requireSelfOrAdmin, async (req, res) => {
	try {
		const { notificationPreferences } = req.body || {};
		const user = await User.findByIdAndUpdate(
			req.params.id,
			{ notificationPreferences },
			{ new: true, runValidators: true }
		);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.json({ user: normalizeUser(user) });
	} catch (error) {
		res.status(400).json({ message: "Failed to update notifications" });
	}
});

router.put("/users/:id/verify", requireRole("Admin"), async (req, res) => {
	try {
		const { isVerified } = req.body || {};
		const user = await User.findByIdAndUpdate(
			req.params.id,
			{ isVerified: Boolean(isVerified) },
			{ new: true }
		);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.json({ user: normalizeUser(user) });
	} catch (error) {
		res.status(400).json({ message: "Failed to update verification" });
	}
});

router.put("/users/:id/status", requireRole("Admin"), async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const nextStatus = user.status === "Suspended" ? "Active" : "Suspended";
		user.status = nextStatus;
		await user.save();

		res.json({ user: normalizeUser(user) });
	} catch (error) {
		res.status(400).json({ message: "Failed to update user status" });
	}
});

module.exports = router;
