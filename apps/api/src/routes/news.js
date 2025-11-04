import express from "express";
import { NewsService } from "../news-service.js";
import { NewsStore } from "../news-store.js";

const router = express.Router();

// Initialize news service with store
const newsStore = new NewsStore();
const newsService = new NewsService(newsStore);

// GET /api/news - List news items with optional filters
router.get("/news", async (req, res) => {
	try {
		const { category, tag, search, limit } = req.query;
		const options = {};
		if (category) options.category = category;
		if (tag) options.tag = tag;
		if (search) options.search = search;
		if (limit) options.limit = parseInt(limit, 10);

		const news = await newsService.list(options);
		res.json({ success: true, data: news });
	} catch (error) {
		console.error("Error fetching news:", error);
		res.status(400).json({
			success: false,
			error: error.message,
			message: "Failed to fetch news",
		});
	}
});

// POST /api/news - Create a new news item
router.post("/news", async (req, res) => {
	try {
		const newsItem = await newsService.create(req.body);
		res.status(201).json({ success: true, data: newsItem });
	} catch (error) {
		console.error("Error creating news:", error);
		res.status(400).json({
			success: false,
			error: error.message,
			message: "Failed to create news item",
		});
	}
});

// GET /api/news/:id - Get a specific news item
router.get("/news/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const news = await newsService.list();
		const item = news.find((n) => n.id === id);
		if (!item) {
			return res.status(404).json({
				success: false,
				error: "Not found",
				message: "News item not found",
			});
		}
		res.json({ success: true, data: item });
	} catch (error) {
		console.error("Error fetching news item:", error);
		res.status(500).json({
			success: false,
			error: "Internal server error",
			message: "Failed to fetch news item",
		});
	}
});

// PUT /api/news/:id - Update a news item
router.put("/news/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const updatedItem = await newsService.update(id, req.body);
		if (!updatedItem) {
			return res.status(404).json({
				success: false,
				error: "Not found",
				message: "News item not found",
			});
		}
		res.json({ success: true, data: updatedItem });
	} catch (error) {
		console.error("Error updating news:", error);
		res.status(400).json({
			success: false,
			error: error.message,
			message: "Failed to update news item",
		});
	}
});

// GET /metrics/news - Get news analytics summary
router.get("/metrics/news", async (req, res) => {
	try {
		const summary = await newsService.analyticsSummary();
		res.json({ success: true, data: summary });
	} catch (error) {
		console.error("Error fetching news metrics:", error);
		res.status(500).json({
			success: false,
			error: "Internal server error",
			message: "Failed to fetch news metrics",
		});
	}
});

export default router;
