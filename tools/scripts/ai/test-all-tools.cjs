#!/usr/bin/env node
/**
 * Comprehensive AI Tools Test Suite
 * Tests all performance tools to ensure they work correctly
 */

console.log("🧪 AI Performance Tools - Comprehensive Test Suite\n");
console.log("=".repeat(60));

let passed = 0;
let failed = 0;

// Test 1: Smart Cache
console.log("\n1️⃣ Testing Smart Cache...");
try {
  const SmartCache = require("./smart-cache.cjs");
  const cache = new SmartCache({ maxSize: 10, ttl: 60000 });

  // Test basic set/get
  cache.set("test1", "value1");
  if (cache.get("test1") === "value1") {
    console.log("   ✅ Set/Get works");
    passed++;
  } else {
    console.log("   ❌ Set/Get failed");
    failed++;
  }

  // Test memoization
  let callCount = 0;
  const fn = (x) => {
    callCount++;
    return x * 2;
  };
  const memoized = cache.memoize(fn);
  memoized(5);
  memoized(5);

  if (callCount === 1) {
    console.log("   ✅ Memoization works");
    passed++;
  } else {
    console.log("   ❌ Memoization failed");
    failed++;
  }

  // Test stats
  const stats = cache.getStats();
  if (stats.hits >= 0 && stats.misses >= 0) {
    console.log("   ✅ Statistics tracking works");
    passed++;
  } else {
    console.log("   ❌ Statistics failed");
    failed++;
  }
} catch (error) {
  console.log("   ❌ Error:", error.message);
  failed += 3;
}

// Test 2: Context Optimizer
console.log("\n2️⃣ Testing Context Optimizer...");
try {
  const ContextOptimizer = require("./context-optimizer.cjs");
  const optimizer = new ContextOptimizer({ maxTokens: 8000 });

  // Test token estimation
  const tokens = optimizer.estimateTokens("Hello world");
  if (tokens > 0) {
    console.log("   ✅ Token estimation works");
    passed++;
  } else {
    console.log("   ❌ Token estimation failed");
    failed++;
  }

  // Test optimization
  const result = optimizer.optimize({
    query: "Test query",
    code: "function test() { return true; }",
    docs: "This is documentation",
  });

  if (result.context && result.tokens > 0) {
    console.log("   ✅ Context optimization works");
    passed++;
  } else {
    console.log("   ❌ Context optimization failed");
    failed++;
  }

  // Test summarization
  const summary = optimizer.summarize(
    "This is a long text that needs to be summarized for testing purposes.",
    20,
  );
  if (summary.length <= 25) {
    console.log("   ✅ Summarization works");
    passed++;
  } else {
    console.log("   ❌ Summarization failed");
    failed++;
  }
} catch (error) {
  console.log("   ❌ Error:", error.message);
  failed += 3;
}

// Test 3: AST Analyzer
console.log("\n3️⃣ Testing AST Analyzer...");
try {
  const ASTAnalyzer = require("./ast-analyzer.cjs");
  const analyzer = new ASTAnalyzer();

  // Test parsing
  const code = "function test(a, b) { if (a > b) return a; return b; }";
  const ast = analyzer.parse(code);

  if (ast && !ast.error) {
    console.log("   ✅ Code parsing works");
    passed++;
  } else {
    console.log("   ❌ Code parsing failed");
    failed++;
  }

  // Test complexity analysis
  const complexity = analyzer.analyzeComplexity(ast);
  if (complexity.cyclomatic >= 1) {
    console.log("   ✅ Complexity analysis works");
    passed++;
  } else {
    console.log("   ❌ Complexity analysis failed");
    failed++;
  }

  // Test pattern detection
  const badCode = 'function bad() { eval("test"); }';
  const badAst = analyzer.parse(badCode);
  const patterns = analyzer.findPatterns(badAst);

  if (patterns.securityIssues.length > 0) {
    console.log("   ✅ Pattern detection works");
    passed++;
  } else {
    console.log("   ❌ Pattern detection failed");
    failed++;
  }
} catch (error) {
  console.log("   ❌ Error:", error.message);
  failed += 3;
}

// Test 4: Parallel Processor
console.log("\n4️⃣ Testing Parallel Processor...");
try {
  const ParallelProcessor = require("./parallel-processor.cjs");
  const processor = new ParallelProcessor({ numWorkers: 2 });

  const stats = processor.getStats();
  if (stats.workers > 0) {
    console.log("   ✅ Parallel processor initialized");
    passed++;
  } else {
    console.log("   ❌ Parallel processor initialization failed");
    failed++;
  }
} catch (error) {
  console.log("   ❌ Error:", error.message);
  failed++;
}

// Test 5: Incremental Indexer (skipped - optional component)
console.log("\n5️⃣ Testing Incremental Indexer...");
console.log("   ⏭️  Skipped (optional component)");

// Final results
console.log("\n" + "=".repeat(60));
console.log(`\n📊 Test Results: ${passed}/${passed + failed} passed\n`);

if (failed === 0) {
  console.log("✅ All tests passed! AI tools are working correctly.\n");
  process.exit(0);
} else {
  console.log(`❌ ${failed} test(s) failed. Please review errors above.\n`);
  process.exit(1);
}
