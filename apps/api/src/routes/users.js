import { CreateUserSchema } from "@political-sphere/shared";
import express from "express";
// fs was used for temporary test diagnostics; removed in cleanup
import { UserService } from "../domain";

const router = express.Router();
const userService = new UserService();

router.post("/users", async (req, res) => {
	try {
			// Debugging: log content-type and req.body presence to diagnose 415 errors in tests
			// (temporary; will be removed once the underlying issue is fixed)
			// eslint-disable-next-line no-console
			console.log('[users.route] headers:', req.headers);
			// eslint-disable-next-line no-console
			console.log('[users.route] is application/json?', req.is('application/json'));
			// eslint-disable-next-line no-console
			console.log('[users.route] body present?', !!req.body);
			const input = CreateUserSchema.parse(req.body);
			// eslint-disable-next-line no-console
			console.log('[users.route] parsed input:', input);
			const user = await userService.createUser(input);
			// eslint-disable-next-line no-console
			console.log('[users.route] created user:', user && user.id);
			res.status(201).json(user);
	} catch (error) {
		// Log whatever was thrown to aid debugging in tests
		// eslint-disable-next-line no-console
		console.error('[users.route] caught error while creating user:', error);
		if (error instanceof Error) {
			// eslint-disable-next-line no-console
			console.error('[users.route] error while creating user:', error.message);
			// eslint-disable-next-line no-console
			console.error(error.stack);
			// Return a concise error in test and non-test modes; detailed stack remains in logs.
			return res.status(400).json({ error: error.message });
		}
		return res.status(500).json({ error: "Internal server error" });
	}
});

router.get("/users/:id", async (req, res) => {
	try {
		const user = await userService.getUserById(req.params.id);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}
		res.set("Cache-Control", "public, max-age=600"); // Cache for 10 minutes
		res.json(user);
	} catch (error) {
		res.status(500).json({ error: "Internal server error" });
	}
});

export default router;
