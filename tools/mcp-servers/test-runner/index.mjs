import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(MODULE_DIR, "../../../..");
const MAX_OUTPUT_LENGTH = 8000;
const DEFAULT_TIMEOUT = 180_000;

const TASKS = {
  "lint:ci": {
    description: "ESLint with zero warnings allowed",
    command: "npm",
    args: ["run", "lint:ci"],
  },
  "test:fast": {
    description: "Vitest quick run (changed scopes)",
    command: "npm",
    args: ["run", "test:fast"],
  },
  "test:ci": {
    description: "Full vitest suite with coverage",
    command: "npm",
    args: ["run", "test:ci"],
  },
  "type-check": {
    description: "TypeScript project check (no emit)",
    command: "npm",
    args: ["run", "type-check"],
  },
};

function runCommand(command, args, { timeoutMs = DEFAULT_TIMEOUT, env } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: REPO_ROOT,
      env: { ...process.env, FORCE_COLOR: "0", ...env },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    const startedAt = Date.now();

    function append(buffer, chunk) {
      buffer += chunk.toString();
      if (buffer.length > MAX_OUTPUT_LENGTH) {
        buffer = buffer.slice(buffer.length - MAX_OUTPUT_LENGTH);
      }
      return buffer;
    }

    child.stdout.on("data", (chunk) => {
      stdout = append(stdout, chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr = append(stderr, chunk);
    });

    const timeout = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new McpError(ErrorCode.InternalError, "Command timed out"));
    }, timeoutMs);

    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(new McpError(ErrorCode.InternalError, `Failed to start command: ${error.message}`));
    });

    child.on("close", (code) => {
      clearTimeout(timeout);
      resolve({
        code,
        durationMs: Date.now() - startedAt,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      });
    });
  });
}

function assertSafePattern(pattern) {
  if (typeof pattern !== "string" || pattern.trim() === "") {
    throw new McpError(ErrorCode.InvalidRequest, "pattern is required");
  }
  if (pattern.startsWith("-")) {
    throw new McpError(ErrorCode.InvalidRequest, 'pattern may not start with "-"');
  }
  return pattern.trim();
}

class TestRunnerServer extends Server {
  constructor() {
    super(
      {
        name: "political-sphere-test-runner",
        version: "1.0.0",
        description: "Run vetted test/lint workflows and share the output with assistants",
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
          name: "tests_run_task",
          description: "Execute one of the curated npm scripts (lint, test, type-check)",
          inputSchema: {
            type: "object",
            required: ["task"],
            properties: {
              task: {
                type: "string",
                enum: Object.keys(TASKS),
              },
              timeoutMs: { type: "integer", minimum: 1 },
            },
          },
        },
        {
          name: "tests_run_vitest_pattern",
          description: "Run vitest on a specific pattern (npx vitest --run <pattern>)",
          inputSchema: {
            type: "object",
            required: ["pattern"],
            properties: {
              pattern: { type: "string" },
              changedOnly: {
                type: "boolean",
                description: "If true, prepends VITEST_CHANGED=1 for parity with test:fast",
              },
              timeoutMs: { type: "integer", minimum: 1 },
            },
          },
        },
        {
          name: "tests_list_tasks",
          description: "List the pre-approved test/lint tasks exposed by this server",
          inputSchema: {
            type: "object",
            properties: {},
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
      case "tests_run_task":
        return this.handleRunTask(args);
      case "tests_run_vitest_pattern":
        return this.handleRunPattern(args);
      case "tests_list_tasks":
        return this.handleListTasks();
      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool ${name}`);
    }
  }

  async handleRunTask(args) {
    const taskConfig = TASKS[args.task];
    if (!taskConfig) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Unsupported task "${args.task}". Use tests_list_tasks for options.`,
      );
    }
    const result = await runCommand(taskConfig.command, taskConfig.args, {
      timeoutMs: args.timeoutMs ?? DEFAULT_TIMEOUT,
    });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              task: args.task,
              exitCode: result.code,
              durationMs: result.durationMs,
              stdout: result.stdout,
              stderr: result.stderr,
            },
            null,
            2,
          ),
        },
      ],
    };
  }

  async handleRunPattern(args) {
    const pattern = assertSafePattern(args.pattern);
    const env = args.changedOnly ? { VITEST_CHANGED: "1" } : undefined;
    const result = await runCommand("npx", ["vitest", "--run", pattern], {
      timeoutMs: args.timeoutMs ?? DEFAULT_TIMEOUT,
      env,
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              pattern,
              exitCode: result.code,
              durationMs: result.durationMs,
              stdout: result.stdout,
              stderr: result.stderr,
            },
            null,
            2,
          ),
        },
      ],
    };
  }

  async handleListTasks() {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            Object.entries(TASKS).map(([key, value]) => ({
              task: key,
              description: value.description,
              command: `${value.command} ${value.args.join(" ")}`,
            })),
            null,
            2,
          ),
        },
      ],
    };
  }
}

const server = new TestRunnerServer();
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Test runner MCP server ready on STDIO");
