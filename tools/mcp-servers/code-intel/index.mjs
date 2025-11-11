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
import ts from "typescript";

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(MODULE_DIR, "../../../..");
const TSCONFIG_PATH = resolve(REPO_ROOT, "tsconfig.json");
const MAX_REFERENCE_RESULTS = 40;

let parsedConfigCache = null;

function loadTsConfig() {
  if (parsedConfigCache) {
    return parsedConfigCache;
  }

  if (!ts.sys.fileExists(TSCONFIG_PATH)) {
    throw new McpError(ErrorCode.InvalidRequest, "tsconfig.json not found at repo root");
  }

  const configFile = ts.readConfigFile(TSCONFIG_PATH, ts.sys.readFile);
  if (configFile.error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Unable to read tsconfig.json: ${ts.formatDiagnosticsWithColorAndContext([configFile.error], {
        getCanonicalFileName: (fileName) => fileName,
        getCurrentDirectory: () => REPO_ROOT,
        getNewLine: () => ts.sys.newLine,
      })}`,
    );
  }

  const parsed = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    REPO_ROOT,
    undefined,
    TSCONFIG_PATH,
  );

  parsedConfigCache = parsed;
  return parsed;
}

function ensureRepoFilePath(inputPath) {
  if (typeof inputPath !== "string" || inputPath.trim() === "") {
    throw new McpError(ErrorCode.InvalidRequest, "filePath is required");
  }

  const absolute = resolve(REPO_ROOT, inputPath);
  if (!absolute.startsWith(REPO_ROOT)) {
    throw new McpError(ErrorCode.InvalidRequest, "filePath must stay within the repository");
  }
  if (!ts.sys.fileExists(absolute)) {
    throw new McpError(ErrorCode.InvalidRequest, `File not found: ${inputPath}`);
  }
  return absolute;
}

function createLanguageArtifacts(targetFile) {
  const parsed = loadTsConfig();
  const fileSet = new Set(parsed.fileNames);
  if (targetFile) {
    fileSet.add(targetFile);
  }

  const scriptFileNames = Array.from(fileSet);
  const fileVersions = new Map(scriptFileNames.map((file) => [file, 0]));

  const host = {
    getCompilationSettings: () => parsed.options,
    getScriptFileNames: () => scriptFileNames,
    getScriptVersion: (fileName) => String(fileVersions.get(fileName) ?? 0),
    getScriptSnapshot: (fileName) => {
      if (!ts.sys.fileExists(fileName)) {
        return undefined;
      }
      const contents = ts.sys.readFile(fileName, "utf8");
      const current = fileVersions.get(fileName) ?? 0;
      fileVersions.set(fileName, current + 1);
      return contents !== undefined ? ts.ScriptSnapshot.fromString(contents) : undefined;
    },
    getCurrentDirectory: () => REPO_ROOT,
    getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    readDirectory: ts.sys.readDirectory,
    directoryExists: ts.sys.directoryExists,
    getDirectories: ts.sys.getDirectories,
    useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames,
  };

  const languageService = ts.createLanguageService(host, ts.createDocumentRegistry());
  const program = languageService.getProgram();
  if (!program) {
    languageService.dispose();
    throw new McpError(ErrorCode.InternalError, "Failed to initialize TypeScript program");
  }

  return { languageService, program };
}

function getSourceFile(program, fileName) {
  const sf = program.getSourceFile(fileName);
  if (!sf) {
    throw new McpError(
      ErrorCode.InvalidRequest,
      `Unable to load ${relative(REPO_ROOT, fileName)} into the TypeScript program`,
    );
  }
  return sf;
}

function ensurePositionArgs(args) {
  const line = Number(args.line);
  const column = Number(args.column);

  if (!Number.isInteger(line) || line < 1) {
    throw new McpError(ErrorCode.InvalidRequest, "line must be a positive integer (1-based)");
  }

  if (!Number.isInteger(column) || column < 1) {
    throw new McpError(ErrorCode.InvalidRequest, "column must be a positive integer (1-based)");
  }

  return { line, column };
}

function toTextPosition(sourceFile, line, column) {
  return ts.getPositionOfLineAndCharacter(sourceFile, line - 1, column - 1);
}

function formatSpan(program, fileName, textSpan) {
  const sourceFile = getSourceFile(program, fileName);
  const start = ts.getLineAndCharacterOfPosition(sourceFile, textSpan.start);
  const end = ts.getLineAndCharacterOfPosition(sourceFile, textSpan.start + textSpan.length);
  return {
    filePath: relative(REPO_ROOT, fileName),
    start: { line: start.line + 1, column: start.character + 1 },
    end: { line: end.line + 1, column: end.character + 1 },
    preview: extractSnippet(fileName, start.line, end.line),
  };
}

function extractSnippet(fileName, startLineZero, endLineZero) {
  const contents = ts.sys.readFile(fileName, "utf8");
  if (!contents) {
    return "";
  }
  const lines = contents.split(/\r?\n/);
  const from = Math.max(startLineZero - 1, 0);
  const to = Math.min(endLineZero + 2, lines.length);
  return lines.slice(from, to).join("\n").trim();
}

class CodeIntelServer extends Server {
  constructor() {
    super(
      {
        name: "political-sphere-code-intel",
        version: "1.0.0",
        description: "Code intelligence helpers backed by the local TypeScript language service",
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.setRequestHandler(ListToolsRequestSchema, this.listTools.bind(this));
    this.setRequestHandler(CallToolRequestSchema, this.callTool.bind(this));
  }

  async listTools() {
    return {
      tools: [
        {
          name: "codeintel_definition",
          description: "Find the definition for a symbol at a particular line/column inside a file",
          inputSchema: {
            type: "object",
            required: ["filePath", "line", "column"],
            properties: {
              filePath: { type: "string" },
              line: { type: "integer", minimum: 1 },
              column: { type: "integer", minimum: 1 },
            },
          },
        },
        {
          name: "codeintel_references",
          description: "List references for a symbol at the given location (max 40)",
          inputSchema: {
            type: "object",
            required: ["filePath", "line", "column"],
            properties: {
              filePath: { type: "string" },
              line: { type: "integer", minimum: 1 },
              column: { type: "integer", minimum: 1 },
            },
          },
        },
        {
          name: "codeintel_quickinfo",
          description: "Show type information and doc comments for the symbol at a location",
          inputSchema: {
            type: "object",
            required: ["filePath", "line", "column"],
            properties: {
              filePath: { type: "string" },
              line: { type: "integer", minimum: 1 },
              column: { type: "integer", minimum: 1 },
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
      case "codeintel_definition":
        return this.handleDefinition(args);
      case "codeintel_references":
        return this.handleReferences(args);
      case "codeintel_quickinfo":
        return this.handleQuickInfo(args);
      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  }

  handleDefinition(args) {
    const filePath = ensureRepoFilePath(args.filePath);
    const { line, column } = ensurePositionArgs(args);
    const { languageService, program } = createLanguageArtifacts(filePath);
    try {
      const sf = getSourceFile(program, filePath);
      const position = toTextPosition(sf, line, column);
      const definitions = languageService.getDefinitionAtPosition(filePath, position) ?? [];
      const formatted = definitions.map((def) => ({
        ...formatSpan(program, def.fileName, def.textSpan),
        kind: def.kind,
      }));
      return {
        content: [{ type: "text", text: JSON.stringify({ definitions: formatted }, null, 2) }],
      };
    } finally {
      languageService.dispose();
    }
  }

  handleReferences(args) {
    const filePath = ensureRepoFilePath(args.filePath);
    const { line, column } = ensurePositionArgs(args);
    const { languageService, program } = createLanguageArtifacts(filePath);
    try {
      const sf = getSourceFile(program, filePath);
      const position = toTextPosition(sf, line, column);
      const refs = languageService.getReferencesAtPosition(filePath, position) ?? [];
      const sliced = refs.slice(0, MAX_REFERENCE_RESULTS);
      const formatted = sliced.map((ref) => ({
        ...formatSpan(program, ref.fileName, ref.textSpan),
        isDefinition: Boolean(ref.isDefinition),
      }));
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                total: refs.length,
                returned: formatted.length,
                references: formatted,
              },
              null,
              2,
            ),
          },
        ],
      };
    } finally {
      languageService.dispose();
    }
  }

  handleQuickInfo(args) {
    const filePath = ensureRepoFilePath(args.filePath);
    const { line, column } = ensurePositionArgs(args);
    const { languageService, program } = createLanguageArtifacts(filePath);
    try {
      const sf = getSourceFile(program, filePath);
      const position = toTextPosition(sf, line, column);
      const quickInfo = languageService.getQuickInfoAtPosition(filePath, position);
      if (!quickInfo) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          "Unable to retrieve symbol information for the supplied position",
        );
      }

      const display = (quickInfo.displayParts ?? []).map((part) => part.text).join("");
      const documentation = (quickInfo.documentation ?? []).map((part) => part.text).join("\n");
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                signature: display.trim(),
                documentation: documentation.trim(),
                tags: quickInfo.tags ?? [],
                range: formatSpan(program, filePath, quickInfo.textSpan),
              },
              null,
              2,
            ),
          },
        ],
      };
    } finally {
      languageService.dispose();
    }
  }
}

const server = new CodeIntelServer();
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Code Intel MCP server ready on STDIO");
