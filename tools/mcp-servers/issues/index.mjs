import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import yaml from 'js-yaml';

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(MODULE_DIR, '../../../..');
const ISSUES_PATH = resolve(REPO_ROOT, 'data/issues/backlog.yml');

const { load } = yaml;

async function loadIssues() {
  try {
    const contents = await readFile(ISSUES_PATH, 'utf8');
    const parsed = load(contents) ?? {};
    const issues = Array.isArray(parsed.issues) ? parsed.issues : [];
    return issues;
  } catch (error) {
    throw new McpError(ErrorCode.InternalError, `Unable to load backlog: ${error.message}`);
  }
}

function filterIssues(issues, filters) {
  return issues.filter(issue => {
    if (filters.status && issue.status !== filters.status) {
      return false;
    }
    if (filters.area && issue.area !== filters.area) {
      return false;
    }
    if (filters.severity && issue.severity !== filters.severity) {
      return false;
    }
    if (filters.tag && !(issue.tags || []).includes(filters.tag)) {
      return false;
    }
    return true;
  });
}

class IssuesServer extends Server {
  constructor() {
    super(
      {
        name: 'political-sphere-issues',
        version: '1.0.0',
        description: 'Query the local engineering backlog so Copilot can cite real tasks',
      },
      {
        capabilities: { tools: {} },
      }
    );

    this.setRequestHandler(ListToolsRequestSchema, this.listTools.bind(this));
    this.setRequestHandler(CallToolRequestSchema, this.callTool.bind(this));
  }

  async listTools() {
    return {
      tools: [
        {
          name: 'issues_query',
          description: 'Filter backlog items by status/area/severity/tag',
          inputSchema: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              area: { type: 'string' },
              severity: { type: 'string' },
              tag: { type: 'string' },
              limit: { type: 'integer', minimum: 1, maximum: 25 },
            },
          },
        },
        {
          name: 'issues_get',
          description: 'Fetch a single backlog issue by id',
          inputSchema: {
            type: 'object',
            required: ['id'],
            properties: {
              id: { type: 'string' },
            },
          },
        },
        {
          name: 'issues_summary',
          description: 'Summarize backlog counts by status and severity',
          inputSchema: {
            type: 'object',
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
      case 'issues_query':
        return this.handleQuery(args);
      case 'issues_get':
        return this.handleGet(args);
      case 'issues_summary':
        return this.handleSummary();
      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool ${name}`);
    }
  }

  async handleQuery(args) {
    const allIssues = await loadIssues();
    const filtered = filterIssues(allIssues, args);
    const limited = filtered.slice(0, Math.min(args.limit ?? 10, 25));
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              total: filtered.length,
              returned: limited.length,
              issues: limited,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  async handleGet(args) {
    const allIssues = await loadIssues();
    const found = allIssues.find(issue => issue.id === args.id);
    if (!found) {
      throw new McpError(ErrorCode.InvalidRequest, `Issue ${args.id} not found`);
    }
    return { content: [{ type: 'text', text: JSON.stringify(found, null, 2) }] };
  }

  async handleSummary() {
    const issues = await loadIssues();
    const byStatus = {};
    const bySeverity = {};
    for (const issue of issues) {
      byStatus[issue.status] = (byStatus[issue.status] ?? 0) + 1;
      bySeverity[issue.severity] = (bySeverity[issue.severity] ?? 0) + 1;
    }
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ total: issues.length, byStatus, bySeverity }, null, 2),
        },
      ],
    };
  }
}

const server = new IssuesServer();
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('Issues MCP server ready on STDIO');
