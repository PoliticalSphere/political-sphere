const http = require("node:http");
const url = require("node:url");
const { log } = require("../../../libs/shared/src/log.js");

const HOST = "localhost";
const PORT = 4000;

const mockNews = {
	data: [
		{
			id: 1,
			title: "New Policy on Climate Change",
			summary: "Government announces new climate initiatives.",
			category: "Environment",
			updatedAt: "2024-01-15T10:00:00Z",
			tags: ["climate", "policy"],
		},
		{
			id: 2,
			title: "Economic Reform Bill Passed",
			summary: "Parliament approves major economic reforms.",
			category: "Economy",
			updatedAt: "2024-01-14T14:00:00Z",
			tags: ["economy", "reform"],
		},
	],
};

const mockMetrics = {
	total: 2,
	categories: {
		Environment: 1,
		Economy: 1,
	},
	tags: {
		climate: 1,
		policy: 1,
		economy: 1,
		reform: 1,
	},
	latest: {
		title: "New Policy on Climate Change",
		updatedAt: "2024-01-15T10:00:00Z",
	},
	generatedAt: "2024-01-15T12:00:00Z",
};

const server = http.createServer((req, res) => {
	const parsedUrl = url.parse(req.url, true);
	const path = parsedUrl.pathname;

	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type");

	if (req.method === "OPTIONS") {
		res.writeHead(200);
		res.end();
		return;
	}

	if (req.method === "GET" && path === "/api/news") {
		res.writeHead(200, { "Content-Type": "application/json" });
		res.end(JSON.stringify(mockNews));
		return;
	}

	if (req.method === "GET" && path === "/metrics/news") {
		res.writeHead(200, { "Content-Type": "application/json" });
		res.end(JSON.stringify(mockMetrics));
		return;
	}

	if (req.method === "GET" && path === "/favicon.ico") {
		res.writeHead(204);
		res.end();
		return;
	}

	res.writeHead(404, { "Content-Type": "application/json" });
	res.end(JSON.stringify({ error: "Not Found" }));
});

server.listen(PORT, HOST, () => {
	log("info", "Mock API server running", { host: HOST, port: PORT, url: `http://${HOST}:${PORT}` });
});

process.on("SIGINT", () => {
	server.close(() => {
		log("info", "Mock API server closed");
		process.exit(0);
	});
});
