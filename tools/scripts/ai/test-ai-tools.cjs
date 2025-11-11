#!/usr/bin/env node
/**
 * AI Tools Integration Test
 * Verifies all integrated AI tools are working correctly
 */

const ASTAnalyzer = require('./ast-analyzer.cjs');

console.log('🧪 Testing AI Tools Integration...\n');

let passed = 0;
let failed = 0;

// Test 1: AST Analyzer - Parse Code
console.log('Test 1: AST Analyzer - Parse JavaScript');
try {
  const analyzer = new ASTAnalyzer();
  const code = `
    function testFunction(a, b) {
      if (a > b) {
        return a;
      }
      return b;
    }
  `;
  const ast = analyzer.parse(code);

  if (!ast.error && ast.type === 'Program') {
    console.log('  ✅ PASS: Successfully parsed JavaScript code\n');
    passed++;
  } else {
    console.log('  ❌ FAIL: Failed to parse JavaScript code\n');
    failed++;
  }
} catch (error) {
  console.log(`  ❌ FAIL: ${error.message}\n`);
  failed++;
}

// Test 2: AST Analyzer - Complexity Analysis
console.log('Test 2: AST Analyzer - Complexity Analysis');
try {
  const analyzer = new ASTAnalyzer();
  const code = `
    function complexFunction(x) {
      if (x > 0) {
        for (let i = 0; i < x; i++) {
          if (i % 2 === 0) {
            console.log(i);
          }
        }
      } else {
        while (x < 0) {
          x++;
        }
      }
      return x;
    }
  `;
  const ast = analyzer.parse(code);
  const complexity = analyzer.analyzeComplexity(ast);

  if (complexity.cyclomatic > 1 && complexity.maxNesting >= 2) {
    console.log(
      `  ✅ PASS: Complexity analysis working (cyclomatic: ${complexity.cyclomatic}, nesting: ${complexity.maxNesting})\n`
    );
    passed++;
  } else {
    console.log('  ❌ FAIL: Complexity analysis not detecting metrics\n');
    failed++;
  }
} catch (error) {
  console.log(`  ❌ FAIL: ${error.message}\n`);
  failed++;
}

// Test 3: AST Analyzer - Pattern Detection
console.log('Test 3: AST Analyzer - Pattern Detection');
try {
  const analyzer = new ASTAnalyzer();
  const code = `
    function dangerousCode() {
      eval('console.log("bad")');
      return true;
    }
  `;
  const ast = analyzer.parse(code);
  const patterns = analyzer.findPatterns(ast);

  if (patterns.securityIssues.length > 0) {
    console.log(`  ✅ PASS: Detected ${patterns.securityIssues.length} security issue(s)\n`);
    passed++;
  } else {
    console.log('  ❌ FAIL: Failed to detect eval() security issue\n');
    failed++;
  }
} catch (error) {
  console.log(`  ❌ FAIL: ${error.message}\n`);
  failed++;
}

// Test 4: AST Analyzer - Semantic Tokens
console.log('Test 4: AST Analyzer - Semantic Tokens');
try {
  const analyzer = new ASTAnalyzer();
  const code = `
    class TestClass {
      constructor() {}
      testMethod() {}
    }
    
    function testFunction() {}
    const testVariable = 42;
  `;
  const ast = analyzer.parse(code);
  const tokens = analyzer.extractSemanticTokens(ast);

  if (tokens.length > 0) {
    console.log(`  ✅ PASS: Extracted ${tokens.length} semantic tokens\n`);
    passed++;
  } else {
    console.log('  ❌ FAIL: Failed to extract semantic tokens\n');
    failed++;
  }
} catch (error) {
  console.log(`  ❌ FAIL: ${error.message}\n`);
  failed++;
}

// Test 5: AST Analyzer - Full File Analysis
console.log('Test 5: AST Analyzer - Full File Analysis');
try {
  const analyzer = new ASTAnalyzer();
  const fs = require('fs');
  const path = require('path');
  const testFile = path.join(__dirname, 'pattern-matcher.cjs');

  if (fs.existsSync(testFile)) {
    const analysis = analyzer.analyzeFile(testFile);

    if (!analysis.error && analysis.complexity && analysis.tokens && analysis.patterns) {
      console.log(
        `  ✅ PASS: Full analysis complete (complexity: ${analysis.complexity.cyclomatic}, tokens: ${analysis.tokens.length})\n`
      );
      passed++;
    } else {
      console.log('  ❌ FAIL: Full analysis incomplete\n');
      failed++;
    }
  } else {
    console.log('  ⏭️  SKIP: Test file not found\n');
  }
} catch (error) {
  console.log(`  ❌ FAIL: ${error.message}\n`);
  failed++;
}

// Test 6: AST Analyzer - Report Generation
console.log('Test 6: AST Analyzer - Report Generation');
try {
  const analyzer = new ASTAnalyzer();
  const code = `
    class UserService {
      async authenticate(username, password) {
        if (!username || !password) {
          throw new Error('Invalid credentials');
        }
        return this.validateUser(username, password);
      }
      
      validateUser(username, password) {
        if (username.length < 3) return false;
        if (password.length < 8) return false;
        return true;
      }
    }
  `;

  const ast = analyzer.parse(code);
  const analysis = {
    file: 'test.js',
    complexity: analyzer.analyzeComplexity(ast),
    tokens: analyzer.extractSemanticTokens(ast),
    patterns: analyzer.findPatterns(ast),
  };

  const report = analyzer.generateReport(analysis);

  if (report && report.includes('AST Analysis Report') && report.includes('Complexity Metrics')) {
    console.log('  ✅ PASS: Report generation successful\n');
    passed++;
  } else {
    console.log('  ❌ FAIL: Report generation incomplete\n');
    failed++;
  }
} catch (error) {
  console.log(`  ❌ FAIL: ${error.message}\n`);
  failed++;
}

// Summary
console.log('─'.repeat(50));
console.log(`\n📊 Test Results: ${passed}/${passed + failed} passed\n`);

if (failed === 0) {
  console.log('✅ All tests passed! AI tools are working correctly.\n');
  process.exit(0);
} else {
  console.log(`❌ ${failed} test(s) failed. Please review the errors above.\n`);
  process.exit(1);
}
