import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

const execFileAsync = promisify(execFile);

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(MODULE_DIR, "../../../..");
const DEFAULT_SEARCH_ROOTS = ["docs", "README.md", "CHANGELOG.md", "apps", "libs", "config"];
const MAX_RESULTS = 80;
const MAX_OUTLINE_DEPTH = 4;

function resolveRepoPath(inputPath) {
  const absolute = resolve(REPO_ROOT, inputPath);
  if (!absolute.startsWith(REPO_ROOT)) {
    throw new McpError(ErrorCode.InvalidRequest, "Path must live inside the repository");
  }
  return absolute;
}

function sanitizeSearchPaths(paths) {
  if (!paths || paths.length === 0) {
    return DEFAULT_SEARCH_ROOTS.filter((path) => path).map((path) => resolveRepoPath(path));
  }

  return paths.map((path) => resolveRepoPath(path));
}

async function runRipgrep(query, { limit, caseSensitive, paths }) {
  if (typeof query !== "string" || query.trim() === "") {
    throw new McpError(ErrorCode.InvalidRequest, "query is required");
  }

  const sanitizedLimit = Math.min(Math.max(limit ?? 40, 1), MAX_RESULTS);
  const args = ["--line-number", "--color", "never", "--no-heading", "-m", String(sanitizedLimit)];
  if (caseSensitive !== true) {
    args.push("-i");
  }
  args.push("--");
  args.push(query);
  for (const searchPath of paths) {
    args.push(relative(REPO_ROOT, searchPath) || ".");
  }

  try {
    const { stdout } = await execFileAsync("rg", args, { cwd: REPO_ROOT });
    return stdout
      .split("\n")
      .filter(Boolean)
      .slice(0, sanitizedLimit)
      .map((line) => {
        const firstColon = line.indexOf(":");
        const secondColon = line.indexOf(":", firstColon + 1);
        if (firstColon === -1 || secondColon === -1) {
          return null;
        }
        const file = line.slice(0, firstColon);
        const lineNumber = Number(line.slice(firstColon + 1, secondColon));
        const text = line.slice(secondColon + 1).trim();
        return {
          filePath: file,
          line: lineNumber,
          text,
        };
      })
      .filter(Boolean);
  } catch (error) {
    if (error.code === 1) {
      return [];
    }
    throw new McpError(ErrorCode.InternalError, `ripgrep failed: ${error.message}`);
  }
}

async function readFileExcerpt(filePath, startLine, endLine) {
  if (!filePath) {
    throw new McpError(ErrorCode.InvalidRequest, "filePath is required");
  }
  const absolute = resolveRepoPath(filePath);
  const contents = await readFile(absolute, "utf8");
  const lines = contents.split(/\r?\n/);
  const from = Math.max((startLine ?? 1) - 1, 0);
  const to = Math.min(endLine ?? from + 20, lines.length);
  return {
    filePath: relative(REPO_ROOT, absolute),
    startLine: from + 1,
    endLine: to,
    text: lines.slice(from, to).join("\n"),
  };
}

async function buildOutline(filePath) {
  const absolute = resolveRepoPath(filePath);
  const contents = await readFile(absolute, "utf8");
  const lines = contents.split(/\r?\n/);
  const outline = [];

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const depth = headingMatch[1].length;
      if (depth <= MAX_OUTLINE_DEPTH) {
        outline.push({
          depth,
          title: headingMatch[2].trim(),
        });
      }
    }
  }

  return {
    filePath: relative(REPO_ROOT, absolute),
    outline,
  };
}

class DocsSearchServer extends Server {
  constructor() {
    super(
      {
        name: "political-sphere-docs-search",
        version: "1.0.0",
        description: "High-signal documentation search and navigation utilities",
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
          name: "docs_search",
          description: "Search docs/README/CHANGELOG with ripgrep (max 80 results)",
          inputSchema: {
            type: "object",
            required: ["query"],
            properties: {
              query: { type: "string" },
              paths: {
                type: "array",
                items: { type: "string" },
                description: "Optional directories/files to scope search",
              },
              limit: { type: "integer", minimum: 1, maximum: MAX_RESULTS },
              caseSensitive: { type: "boolean" },
            },
          },
        },
        {
          name: "docs_excerpt",
          description: "Read a snippet from a documentation file",
          inputSchema: {
            type: "object",
            required: ["filePath"],
            properties: {
              filePath: { type: "string" },
              startLine: { type: "integer", minimum: 1 },
              endLine: { type: "integer", minimum: 1 },
            },
          },
        },
        {
          name: "docs_outline",
          description: "Generate a heading outline for a Markdown document (extra helper)",
          inputSchema: {
            type: "object",
            required: ["filePath"],
            properties: {
              filePath: { type: "string" },
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
      case "docs_search":
        return this.handleSearch(args);
      case "docs_excerpt":
        return this.handleExcerpt(args);
      case "docs_outline":
        return this.handleOutline(args);
      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool ${name}`);
    }
  }

  async handleSearch(args) {
    const paths = sanitizeSearchPaths(args.paths ?? undefined);
    const matches = await runRipgrep(args.query, {
      limit: args.limit,
      caseSensitive: args.caseSensitive,
      paths,
    });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              query: args.query,
              total: matches.length,
              results: matches,
            },
            null,
            2,
          ),
        },
      ],
    };
  }

  async handleExcerpt(args) {
    const excerpt = await readFileExcerpt(args.filePath, args.startLine, args.endLine);
    return {
      content: [{ type: "text", text: JSON.stringify(excerpt, null, 2) }],
    };
  }

  async handleOutline(args) {
    const outline = await buildOutline(args.filePath);
    return {
      content: [{ type: "text", text: JSON.stringify(outline, null, 2) }],
    };
  }
}

const server = new DocsSearchServer();
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Docs search MCP server ready on STDIO");
