import { CreateUserSchema } from "@political-sphere/shared";
import express from "express";
import fs from "fs";
import { UserService } from "../domain";

const router = express.Router();
const userService = new UserService();

router.post("/users", async (req, res) => {
	try {
		// Debugging: log content-type and req.body presence to diagnose 415 errors in tests
		// (temporary; will be removed once the underlying issue is fixed)
		// eslint-disable-next-line no-console
		console.log("[users.route] headers:", req.headers);
		// eslint-disable-next-line no-console
		console.log(
			"[users.route] is application/json?",
			req.is("application/json"),
		);
		// eslint-disable-next-line no-console
		console.log("[users.route] body present?", !!req.body);
		const input = CreateUserSchema.parse(req.body);
		// eslint-disable-next-line no-console
		console.log("[users.route] parsed input:", input);
		const user = await userService.createUser(input);
		// eslint-disable-next-line no-console
		console.log("[users.route] created user:", user && user.id);
		res.status(201).json(user);
	} catch (error) {
		// Log whatever was thrown to aid debugging in tests
		// eslint-disable-next-line no-console
		console.error("[users.route] caught error while creating user:", error);
		if (error instanceof Error) {
			// eslint-disable-next-line no-console
			console.error("[users.route] error while creating user:", error.message);
			// eslint-disable-next-line no-console
			console.error(error.stack);
			// In test env include diagnostic details in the JSON body to help CI/debugging
			if (process.env.NODE_ENV === "test") {
				// Persist the error to a temp file so the test runner can inspect it
				try {
					fs.writeFileSync(
						"/tmp/political_sphere_last_users_error.json",
						JSON.stringify(
							{
								error: error.message,
								name: error.name,
								stack: error.stack,
								raw: String(error),
							},
							null,
							2,
						),
					);
				} catch (_e) {
					// ignore write errors
				}
				return res.status(400).json({
					error: error.message,
					name: error.name,
					stack: error.stack,
					raw: String(error),
				});
			}
			return res.status(400).json({ error: error.message });
		} else {
			if (process.env.NODE_ENV === "test") {
				return res
					.status(500)
					.json({ error: "Internal server error", raw: String(error) });
			}
			return res.status(500).json({ error: "Internal server error" });
		}
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
