# TODO: Assistant Tooling Enhancements

## Outstanding Tasks

1. **Telemetry Dashboard**
   - Instrument Blackbox and Copilot suggestion pipelines to capture acceptance rate, edit distance, and time-to-merge metrics.
   - Surface metrics via lightweight dashboard (Grafana or Looker) with weekly trend snapshots.
   - Automate alerts when suggestion rejection rate exceeds agreed thresholds.

2. **Guard Script Extensions**
   - ✅ Persist guard results to `ai-metrics/guard-history.json` for longitudinal analysis.
   - Add optional static analysis (e.g., `npm run lint:boundaries`) gated behind `GUARD_MODE=strict`.
   - Explore Nx target graphs to run only affected tests for faster feedback.

3. **Prompt Library Automation**
   - ✅ Maintain machine-readable doc context via `npm run ai:context`.
   - Generate Markdown index of scenario prompts (feature, refactor, hotfix) with owners and last-reviewed timestamps.
   - CI check to fail when prompt templates fall out of date (>90 days since review).

4. **Copilot Experiment Log**
   - Create structured log template (date, prompt variant, outcome metrics).
   - Add GitHub Action to compile monthly experiment summaries for the engineering guild review.

5. **CI/CD Acceleration & Hygiene**
   - Connect Nx Cloud (or equivalent remote cache) and update workflows to use affected targets for lint/test/build.
   - Rework deployment workflow to consume build artifacts/tests from CI instead of rebuilding in place.
   - Consolidate redundant security scanning workflows into a reusable pipeline with scheduled deep scans.
   - ✅ Document the Node.js version policy in contributor onboarding and surface it in CI README.

Keep this list synchronized with implementation progress to ensure assistant-driven workflows remain auditable and continuously improving.
