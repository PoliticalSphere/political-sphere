#!/usr/bin/env node
/**
 * AST-Based Code Analyzer
 *
 * Inspired by Ruff's AST analysis and VS Code's semantic analysis.
 * Provides deep code understanding through Abstract Syntax Tree parsing.
 *
 * @source Ruff (astral-sh/ruff) - Python AST analysis patterns
 * @source VS Code (microsoft/vscode) - Code intelligence and semantic tokens
 */

const fs = require("fs");
const path = require("path");

const acorn = require("acorn");
const walk = require("acorn-walk");

class ASTAnalyzer {
  constructor() {
    this.patterns = {
      // Code quality patterns inspired by Ruff
      complexity: [],
      security: [],
      maintainability: [],
      performance: [],
    };

    // Semantic token types from VS Code
    this.tokenTypes = {
      NAMESPACE: "namespace",
      CLASS: "class",
      ENUM: "enum",
      INTERFACE: "interface",
      STRUCT: "struct",
      TYPE_PARAMETER: "typeParameter",
      PARAMETER: "parameter",
      VARIABLE: "variable",
      PROPERTY: "property",
      ENUM_MEMBER: "enumMember",
      EVENT: "event",
      FUNCTION: "function",
      METHOD: "method",
      MACRO: "macro",
      KEYWORD: "keyword",
      MODIFIER: "modifier",
      COMMENT: "comment",
      STRING: "string",
      NUMBER: "number",
      REGEXP: "regexp",
      OPERATOR: "operator",
    };
  }

  /**
   * Parse code into AST
   * Based on Ruff's parsing approach
   */
  parse(code, options = {}) {
    try {
      return acorn.parse(code, {
        ecmaVersion: "latest",
        sourceType: "module",
        locations: true,
        ranges: true,
        ...options,
      });
    } catch (error) {
      return {
        error: true,
        message: error.message,
        location: error.loc,
      };
    }
  }

  /**
   * Analyze complexity metrics
   * Inspired by Ruff's complexity analysis
   */
  analyzeComplexity(ast) {
    const metrics = {
      cyclomatic: 1, // Base complexity
      cognitive: 0,
      halstead: {
        operators: 0,
        operands: 0,
        distinctOperators: new Set(),
        distinctOperands: new Set(),
      },
      nesting: 0,
      maxNesting: 0,
    };

    let currentNesting = 0;

    walk.recursive(
      ast,
      { depth: 0 },
      {
        // Cyclomatic complexity: decision points
        IfStatement(node, state, c) {
          metrics.cyclomatic++;
          metrics.cognitive++;
          currentNesting++;
          metrics.maxNesting = Math.max(metrics.maxNesting, currentNesting);
          c(node.test, state);
          c(node.consequent, state);
          if (node.alternate) c(node.alternate, state);
          currentNesting--;
        },

        WhileStatement(node, state, c) {
          metrics.cyclomatic++;
          metrics.cognitive++;
          currentNesting++;
          metrics.maxNesting = Math.max(metrics.maxNesting, currentNesting);
          c(node.test, state);
          c(node.body, state);
          currentNesting--;
        },

        ForStatement(node, state, c) {
          metrics.cyclomatic++;
          metrics.cognitive++;
          currentNesting++;
          metrics.maxNesting = Math.max(metrics.maxNesting, currentNesting);
          if (node.init) c(node.init, state);
          if (node.test) c(node.test, state);
          if (node.update) c(node.update, state);
          c(node.body, state);
          currentNesting--;
        },

        ConditionalExpression(node, state, c) {
          metrics.cyclomatic++;
          metrics.cognitive++;
          c(node.test, state);
          c(node.consequent, state);
          c(node.alternate, state);
        },

        LogicalExpression(node, state, c) {
          if (node.operator === "&&" || node.operator === "||") {
            metrics.cyclomatic++;
          }
          metrics.halstead.operators++;
          metrics.halstead.distinctOperators.add(node.operator);
          c(node.left, state);
          c(node.right, state);
        },

        // Halstead metrics
        BinaryExpression(node, state, c) {
          metrics.halstead.operators++;
          metrics.halstead.distinctOperators.add(node.operator);
          c(node.left, state);
          c(node.right, state);
        },

        Identifier(node) {
          metrics.halstead.operands++;
          metrics.halstead.distinctOperands.add(node.name);
        },
      },
    );

    // Calculate derived Halstead metrics
    const n1 = metrics.halstead.distinctOperators.size;
    const n2 = metrics.halstead.distinctOperands.size;
    const N1 = metrics.halstead.operators;
    const N2 = metrics.halstead.operands;

    metrics.halstead.vocabulary = n1 + n2;
    metrics.halstead.length = N1 + N2;
    metrics.halstead.volume = metrics.halstead.length * Math.log2(metrics.halstead.vocabulary || 1);
    metrics.halstead.difficulty = (n1 / 2) * (N2 / (n2 || 1));
    metrics.halstead.effort = metrics.halstead.volume * metrics.halstead.difficulty;

    return metrics;
  }

  /**
   * Extract semantic tokens
   * Based on VS Code's semantic token provider
   */
  extractSemanticTokens(ast) {
    const tokens = [];
    walk.simple(ast, {
      ClassDeclaration(node) {
        tokens.push({
          range: node.range,
          type: "class",
          modifiers: ["declaration"],
          name: node.id?.name,
        });
      },

      FunctionDeclaration(node) {
        tokens.push({
          range: node.range,
          type: "function",
          modifiers: ["declaration"],
          name: node.id?.name,
        });
      },

      VariableDeclaration(node) {
        node.declarations.forEach((decl) => {
          if (decl.id?.type === "Identifier") {
            tokens.push({
              range: decl.id.range,
              type: "variable",
              modifiers: [node.kind === "const" ? "readonly" : "declaration"],
              name: decl.id.name,
            });
          }
        });
      },

      MemberExpression(node) {
        if (node.property?.type === "Identifier") {
          tokens.push({
            range: node.property.range,
            type: "property",
            modifiers: [],
            name: node.property.name,
          });
        }
      },
    });

    return tokens;
  }

  /**
   * Find code patterns
   * Inspired by Ruff's pattern matching
   */
  findPatterns(ast) {
    const patterns = {
      antiPatterns: [],
      bestPractices: [],
      securityIssues: [],
      performanceIssues: [],
    };

    walk.simple(ast, {
      // Anti-pattern: Nested callbacks (callback hell)
      CallExpression(node) {
        let depth = 0;
        let current = node;
        while (current.parent && current.parent.type === "CallExpression") {
          depth++;
          current = current.parent;
        }
        if (depth > 3) {
          patterns.antiPatterns.push({
            type: "callback-hell",
            severity: "warning",
            range: node.range,
            message: `Deeply nested callbacks (depth: ${depth}). Consider using async/await.`,
          });
        }
      },

      // Security: eval usage
      Identifier(node) {
        if (node.name === "eval") {
          patterns.securityIssues.push({
            type: "dangerous-eval",
            severity: "critical",
            range: node.range,
            message: "Use of eval() is dangerous and should be avoided",
          });
        }
      },

      // Performance: Array.forEach vs for loop
      MemberExpression(node) {
        if (node.property?.name === "forEach" && node.object?.type === "Identifier") {
          patterns.performanceIssues.push({
            type: "foreach-performance",
            severity: "info",
            range: node.range,
            message: "Consider using for...of for better performance in hot paths",
          });
        }
      },
    });

    return patterns;
  }

  /**
   * Analyze file
   * Complete analysis pipeline
   */
  analyzeFile(filePath) {
    const code = fs.readFileSync(filePath, "utf8");
    const ast = this.parse(code);

    if (ast.error) {
      return {
        error: true,
        file: filePath,
        message: ast.message,
        location: ast.location,
      };
    }

    return {
      file: filePath,
      complexity: this.analyzeComplexity(ast),
      tokens: this.extractSemanticTokens(ast, code),
      patterns: this.findPatterns(ast),
      ast: ast, // Include AST for further analysis
    };
  }

  /**
   * Generate report
   */
  generateReport(analysis) {
    const report = [];

    report.push(`\n📊 AST Analysis Report: ${path.basename(analysis.file)}\n`);

    // Complexity metrics
    report.push("Complexity Metrics:");
    report.push(`  Cyclomatic: ${analysis.complexity.cyclomatic}`);
    report.push(`  Cognitive: ${analysis.complexity.cognitive}`);
    report.push(`  Max Nesting: ${analysis.complexity.maxNesting}`);
    report.push(`  Halstead Volume: ${analysis.complexity.halstead.volume.toFixed(2)}`);
    report.push(`  Halstead Difficulty: ${analysis.complexity.halstead.difficulty.toFixed(2)}\n`);

    // Semantic tokens
    report.push(`Semantic Tokens: ${analysis.tokens.length}`);
    const tokenCounts = {};
    analysis.tokens.forEach((t) => {
      tokenCounts[t.type] = (tokenCounts[t.type] || 0) + 1;
    });
    Object.entries(tokenCounts).forEach(([type, count]) => {
      report.push(`  ${type}: ${count}`);
    });

    // Patterns
    const { patterns } = analysis;
    const totalIssues =
      patterns.antiPatterns.length +
      patterns.securityIssues.length +
      patterns.performanceIssues.length;

    if (totalIssues > 0) {
      report.push(`\n⚠️  Issues Found: ${totalIssues}`);

      if (patterns.securityIssues.length > 0) {
        report.push("\nSecurity Issues:");
        patterns.securityIssues.forEach((issue) => {
          report.push(`  [${issue.severity}] ${issue.message}`);
        });
      }

      if (patterns.antiPatterns.length > 0) {
        report.push("\nAnti-patterns:");
        patterns.antiPatterns.forEach((issue) => {
          report.push(`  [${issue.severity}] ${issue.message}`);
        });
      }

      if (patterns.performanceIssues.length > 0) {
        report.push("\nPerformance Issues:");
        patterns.performanceIssues.forEach((issue) => {
          report.push(`  [${issue.severity}] ${issue.message}`);
        });
      }
    } else {
      report.push("\n✅ No issues found");
    }

    return report.join("\n");
  }
}

// CLI interface
if (require.main === module) {
  const analyzer = new ASTAnalyzer();
  const filePath = process.argv[2];

  if (!filePath) {
    console.error("Usage: node ast-analyzer.cjs <file-path>");
    process.exit(1);
  }

  const analysis = analyzer.analyzeFile(filePath);

  if (analysis.error) {
    console.error(`❌ Parse error: ${analysis.message}`);
    if (analysis.location) {
      console.error(`   at line ${analysis.location.line}, column ${analysis.location.column}`);
    }
    process.exit(1);
  }

  console.log(analyzer.generateReport(analysis));
}

module.exports = ASTAnalyzer;
