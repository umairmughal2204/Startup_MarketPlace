const express = require("express");
const User = require("../models/User");
const { createToken, normalizeUser, requireAuth, requireRole, requireSelfOrAdmin } = require("../middleware/auth");
const { validateBody, isEmail, isPhone, isOneOf } = require("../utils/validate");

const router = express.Router();

const ROLES = ["Entrepreneur", "Supplier", "Investor", "Admin"];

router.post(
	"/register",
	validateBody({
		name: { required: true, minLength: 2, maxLength: 100 },
		email: { required: true, check: isEmail, message: "Please enter a valid email address" },
		password: { required: true, minLength: 6, message: "Password must be at least 6 characters" },
		role: { required: true, check: isOneOf(ROLES), message: "Please select a valid role" },
	}),
	async (req, res) => {
	try {
		const { name, email, password, role, professionalDetails } = req.body || {};

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
	}
);

router.post(
	"/login",
	validateBody({
		email: { required: true, check: isEmail, message: "Please enter a valid email address" },
		password: { required: true },
		role: { required: true, check: isOneOf(ROLES), message: "Please select a valid role" },
	}),
	async (req, res) => {
	try {
		const { email, password, role } = req.body || {};

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
	}
);


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

router.put(
	"/users/:id/profile",
	requireSelfOrAdmin,
	validateBody({
		name: { minLength: 2, maxLength: 100 },
		phone: { check: isPhone, message: "Please enter a valid phone number" },
	}),
	async (req, res) => {
	try {
		// Email is fixed at registration and can never be changed from this endpoint,
		// even if a client sends it — silently ignored rather than validated/applied.
		const { name, phone, profileVisibility } = req.body || {};
		const updates = {};
		if (name !== undefined) updates.name = name;
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
	}
);

router.put(
	"/users/:id/password",
	requireSelfOrAdmin,
	validateBody({
		currentPassword: { required: true },
		newPassword: { required: true, minLength: 6, message: "New password must be at least 6 characters" },
	}),
	async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body || {};

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
	}
);

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
