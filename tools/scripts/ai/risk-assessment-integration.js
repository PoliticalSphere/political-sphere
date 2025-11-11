#!/usr/bin/env node

/**
 * Simple AI risk assessment helper used by docs and CI smoke jobs.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUTPUT_DIR = join(__dirname, "../../../reports/ai/risk-assessments");

class AIRiskAssessmentIntegration {
  constructor() {
    this.riskMatrix = {
      low: { score: 1, action: "Monitor", color: "green" },
      medium: { score: 2, action: "Mitigate", color: "yellow" },
      high: { score: 3, action: "Address", color: "orange" },
      critical: { score: 4, action: "Stop", color: "red" },
    };
    this.components = [
      "ai-assistant",
      "recommendation-engine",
      "sentiment-analysis",
      "civic-insights",
    ];
  }

  async run() {
    const [command, ...rest] = process.argv.slice(2);
    if (!command || command === "--help" || command === "-h") {
      this.showHelp();
      return;
    }

    switch (command) {
      case "assess":
        await this.assessComponent(rest[0]);
        break;
      case "review":
        await this.reviewPullRequest(rest[0]);
        break;
      case "validate":
        this.validateDocument(rest[0]);
        break;
      case "report":
        this.printLatestReports();
        break;
      default:
        console.error(`Unknown command "${command}".`);
        this.showHelp();
    }
  }

  async assessComponent(component = "ai-assistant") {
    if (!this.components.includes(component)) {
      console.error(`Unknown component "${component}".`);
      process.exitCode = 1;
      return;
    }

    const quantitativeScore = (this.hashString(component) % 100) / 100;
    const qualitativeLevel = this.getRiskLevel(quantitativeScore);
    const assessment = {
      component,
      timestamp: new Date().toISOString(),
      score: quantitativeScore,
      level: qualitativeLevel,
      recommendations: this.buildRecommendations(qualitativeLevel),
    };

    this.saveAssessment(component, assessment);
    console.log(JSON.stringify(assessment, null, 2));

    if (qualitativeLevel === "critical") {
      process.exitCode = 1;
    }
  }

  async reviewPullRequest(prNumber) {
    if (!prNumber) {
      console.error("Provide a pull request number.");
      process.exitCode = 1;
      return;
    }

    const simulatedFindings = [
      { id: "AI-RISK-001", severity: "medium", description: "Missing bias evaluation" },
      { id: "AI-RISK-002", severity: "low", description: "Telemetry not anonymized" },
    ];

    console.log(
      JSON.stringify(
        {
          prNumber,
          findings: simulatedFindings,
          summary: `${simulatedFindings.length} potential risks detected`,
        },
        null,
        2,
      ),
    );
  }

  validateDocument(filePath) {
    if (!filePath || !existsSync(filePath)) {
      console.error("Provide a valid assessment file path.");
      process.exitCode = 1;
      return;
    }

    const content = JSON.parse(readFileSync(filePath, "utf-8"));
    if (!content.component || !content.score) {
      console.error("Assessment file missing required fields.");
      process.exitCode = 1;
      return;
    }

    console.log(`Assessment for ${content.component} is valid.`);
  }

  printLatestReports() {
    if (!existsSync(OUTPUT_DIR)) {
      console.warn("No assessments found.");
      return;
    }
    const files = this.getAssessments();
    console.log(JSON.stringify(files, null, 2));
  }

  getRiskLevel(score) {
    if (score < 0.25) return "low";
    if (score < 0.5) return "medium";
    if (score < 0.75) return "high";
    return "critical";
  }

  buildRecommendations(level) {
    switch (level) {
      case "low":
        return ["Document safeguards", "Monitor usage quarterly"];
      case "medium":
        return ["Add automated tests", "Schedule design review"];
      case "high":
        return ["Engage ethics team", "Add manual approval step"];
      case "critical":
      default:
        return ["Halt deployment", "Escalate to leadership"];
    }
  }

  saveAssessment(component, assessment) {
    if (!existsSync(OUTPUT_DIR)) {
      mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    const outPath = join(OUTPUT_DIR, `${component}.risk.json`);
    writeFileSync(outPath, JSON.stringify(assessment, null, 2));
  }

  getAssessments() {
    return this.components
      .map((component) => {
        const file = join(OUTPUT_DIR, `${component}.risk.json`);
        if (!existsSync(file)) {
          return null;
        }
        return JSON.parse(readFileSync(file, "utf-8"));
      })
      .filter(Boolean);
  }

  hashString(value) {
    return value.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  }

  showHelp() {
    console.log(`AI Risk Assessment Integration
Usage:
  assess <component>   Run an assessment (default ai-assistant)
  review <pr-number>   Print simulated risk review findings
  validate <file>      Validate assessment JSON file
  report               Output recent stored assessments
`);
  }
}

if (import.meta.url === `file://${__filename}`) {
  const cli = new AIRiskAssessmentIntegration();
  cli.run();
}
