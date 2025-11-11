import { readdir, readFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(MODULE_DIR, "../../../..");
const FEATURE_FLAGS_PATH = resolve(REPO_ROOT, "config/features/feature-flags.json");
const DEFAULT_ENV_ROOTS = [".", "apps", "tools", "config"];
const SKIP_DIRS = new Set([
  ".git",
  "node_modules",
  ".next",
  "dist",
  "coverage",
  ".turbo",
  ".dvc",
  ".nx",
]);
const MAX_TEMPLATE_RESULTS = 100;

const { parse: parseEnv } = dotenv;

function resolveRepoPath(inputPath) {
  if (typeof inputPath !== "string" || inputPath.trim() === "") {
    throw new McpError(ErrorCode.InvalidRequest, "path is required");
  }
  const absolute = resolve(REPO_ROOT, inputPath);
  if (!absolute.startsWith(REPO_ROOT)) {
    throw new McpError(ErrorCode.InvalidRequest, "path must stay within repository root");
  }
  return absolute;
}

async function discoverEnvTemplates() {
  const queue = DEFAULT_ENV_ROOTS.map((root) => resolveRepoPath(root));
  const visited = new Set();
  const templates = new Set();

  while (queue.length > 0 && templates.size < MAX_TEMPLATE_RESULTS) {
    const current = queue.shift();
    if (!current || visited.has(current)) {
      continue;
    }
    visited.add(current);

    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      const fullPath = resolve(current, entry.name);
      if (!fullPath.startsWith(REPO_ROOT)) {
        continue;
      }
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) {
          queue.push(fullPath);
        }
        continue;
      }
      if (entry.isFile() && /\.env.*\.example$/i.test(entry.name)) {
        templates.add(relative(REPO_ROOT, fullPath));
      }
    }
  }

  return Array.from(templates).sort();
}

async function readEnvTemplate(filePath) {
  const absolute = resolveRepoPath(filePath);
  if (!absolute.endsWith(".example")) {
    throw new McpError(ErrorCode.InvalidRequest, "Only .example env files are exposed");
  }
  const contents = await readFile(absolute, "utf8");
  const parsed = parseEnv(contents);
  return {
    filePath: relative(REPO_ROOT, absolute),
    variables: Object.entries(parsed).map(([key, value]) => ({
      key,
      sampleValue: value,
    })),
  };
}

async function loadFeatureFlags() {
  try {
    const contents = await readFile(FEATURE_FLAGS_PATH, "utf8");
    return JSON.parse(contents);
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Unable to read feature flag metadata: ${error.message}`,
    );
  }
}

class ConfigServer extends Server {
  constructor() {
    super(
      {
        name: "political-sphere-config",
        version: "1.0.0",
        description: "Expose sanitized env templates and feature flag metadata",
      },
      {
        capabilities: { tools: {} },
      },
    );

    this.setRequestHandler(ListToolsRequestSchema, this.listTools.bind(this));
    this.setRequestHandler(CallToolRequestSchema, this.callTool.bind(this));
  }

  async listTools() {
    return {
      tools: [
        {
          name: "config_list_env_templates",
          description: "List .env*.example files that Copilot can safely read",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "config_read_env_template",
          description: "Read and parse a .env.example file (values are safe placeholders)",
          inputSchema: {
            type: "object",
            required: ["filePath"],
            properties: {
              filePath: { type: "string" },
            },
          },
        },
        {
          name: "config_list_feature_flags",
          description: "List feature flag metadata (key, owner, default state)",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "config_feature_flag_details",
          description: "Show details for a specific feature flag",
          inputSchema: {
            type: "object",
            required: ["key"],
            properties: {
              key: { type: "string" },
            },
          },
        },
      ],
    };
  }

  async callTool(request) {
    const params = request.params ?? {};
    const name = params.name;
    const args = params.arguments ?? {};

    switch (name) {
      case "config_list_env_templates":
        return this.handleListEnv();
      case "config_read_env_template":
        return this.handleReadEnv(args);
      case "config_list_feature_flags":
        return this.handleListFlags();
      case "config_feature_flag_details":
        return this.handleFlagDetails(args);
      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool ${name}`);
    }
  }

  async handleListEnv() {
    const templates = await discoverEnvTemplates();
    return {
      content: [{ type: "text", text: JSON.stringify({ templates }, null, 2) }],
    };
  }

  async handleReadEnv(args) {
    if (typeof args.filePath !== "string" || args.filePath.trim() === "") {
      throw new McpError(ErrorCode.InvalidRequest, "filePath is required");
    }
    const parsed = await readEnvTemplate(args.filePath);
    return { content: [{ type: "text", text: JSON.stringify(parsed, null, 2) }] };
  }

  async handleListFlags() {
    const flags = await loadFeatureFlags();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            flags.features.map((flag) => ({
              key: flag.key,
              status: flag.status,
              default: flag.default,
              owner: flag.owner,
            })),
            null,
            2,
          ),
        },
      ],
    };
  }

  async handleFlagDetails(args) {
    if (typeof args.key !== "string" || args.key.trim() === "") {
      throw new McpError(ErrorCode.InvalidRequest, "key is required");
    }
    const key = args.key.trim();
    const flags = await loadFeatureFlags();
    const found = flags.features.find((flag) => flag.key === key);
    if (!found) {
      throw new McpError(ErrorCode.InvalidRequest, `Unknown feature flag ${key}`);
    }
    return { content: [{ type: "text", text: JSON.stringify(found, null, 2) }] };
  }
}

const server = new ConfigServer();
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Config MCP server ready on STDIO");
