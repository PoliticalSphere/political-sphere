# Copilot Instructions: Political Sphere

You are assisting with Political Sphere, a democratically-governed multiplayer political simulation game with strict constitutional governance. Every suggestion must meet comprehensive quality, security, and ethical standards.

## Your Role

Generate code, documentation, and infrastructure that:
- Aligns with democratic principles and ethical AI use
- Maintains semantic clarity, modularity, and separation of concerns  
- Treats quality as architectural (not post-implementation)
- Applies zero-trust security at all layers
- Ensures full traceability and auditability
- Meets WCAG 2.2 AA+ accessibility (mandatory)

## Meta-Rule: Self-Improving Rule Sets

**CRITICAL**: When you identify patterns, best practices, or guidelines that would benefit future work:

1. **Always Update BOTH Rule Sets Simultaneously**:
   - `.blackboxrules`
   - `.github/copilot-instructions.md` (this file)
   
2. **Update When You Notice**:
   - Repeated mistakes or anti-patterns
   - Valuable patterns that should be codified
   - Missing guidelines that caused confusion
   - Better ways to structure or document work
   - Security, accessibility, or quality improvements
   - New technology stack patterns
   - Process improvements

3. **Update Format**:
   - Add to appropriate existing section, or create new section if needed
   - Keep changes consistent across both files
   - Update the "Last updated" date in both files
   - Add entry to CHANGELOG.md documenting the rule change
   
4. **Do Not**:
   - Wait for permission to improve rules
   - Update only one file (must update both)
   - Add redundant or contradictory rules
   - Remove existing rules without documenting why

**This ensures continuous improvement and consistency across all AI assistants.**

## Organisation & Structure

### Directory Placement
NEVER place files in root. Always use these structured locations:
```
/apps          - Applications (frontend, api, worker, infrastructure)
/libs          - Shared libraries (ui, platform, infrastructure, shared)
/tools         - Build tools and utilities
/docs          - Comprehensive documentation
/scripts       - Automation scripts (with subdirectories)
/ai-learning   - AI training patterns
/ai-cache      - AI cache data
/ai-metrics    - AI performance metrics
.github/       - GitHub workflows and configs
```

### Naming Conventions (Strict)
Apply consistently across ALL files:
- `kebab-case` → files, directories: `user-management.ts`, `api-client/`
- `PascalCase` → classes, components: `UserProfile`, `ApiClient`
- `camelCase` → functions, variables: `getUserProfile`, `apiClient`
- `SCREAMING_SNAKE_CASE` → constants: `MAX_RETRY_COUNT`, `API_BASE_URL`

Use descriptive names. Avoid abbreviations unless domain-standard (e.g., `API`, `HTTP`).

### File Responsibilities
Every file MUST:
1. Have single, focused purpose
2. Include ownership (CODEOWNERS or inline comment)
3. Use intention-revealing name
4. Include header metadata if appropriate (see `metadata-header-template.md`)

### Discoverability Requirements
- Add README to every significant directory
- Limit hierarchy depth to 4-5 levels
- Group related files logically
- Create index files for easier imports
- Cross-reference documentation

### Prevent Duplication
Before creating new code:
1. Search for existing implementations
2. Consolidate shared logic to `/libs/shared`
3. Use single-source-of-truth for configs
4. Reference (don't duplicate) documentation
5. Suggest refactoring when duplication found

### Separation of Concerns
Maintain clear boundaries:
- Domain logic ≠ Infrastructure code
- UI components ≠ Business logic
- External integrations isolated
- Respect Nx module boundaries (enforced)
- Apply Domain-Driven Design bounded contexts

### Lifecycle Indicators
Mark file lifecycle explicitly:
- **Active** → Standard structure, no prefix
- **Experimental** → `/apps/dev/` or `*.experimental.*`
- **Deprecated** → `*.deprecated.*` + deprecation notice
- **Internal** → `*.internal.*` or `/internal/` subdirectory

### Structural Consistency
Apply parallel patterns across:
- Code, docs, infrastructure, AI assets
- NO divergent organizational schemes
- Consistent naming everywhere
- Unified versioning and metadata approach

### Access Boundaries
Protect sensitive assets:
- Secrets → `/apps/infrastructure/secrets` (encrypted)
- Core logic → Protected by module boundaries
- Internal APIs → Clearly marked
- Environment configs → Segregated by environment
- Prevent accidental exposure via policies

### Scalability
Design for growth:
- Modular, extensible structure
- Avoid deep nesting (max 4-5 levels)
- Support horizontal scaling (features, services, teams)
- Support vertical scaling (complexity, load)
- Zero structural technical debt

## Quality Standards

### Quality is Architectural
Design quality upfront, not as afterthought:
- Propose testing strategy BEFORE implementation
- Include error handling in initial design
- Plan observability from start
- Consider performance early

### Multi-Dimensional Assessment
Evaluate EVERY change against:
- **Correctness** → Meets requirements accurately
- **Reliability** → Error handling, retries, fallbacks present
- **Performance** → Efficient latency, throughput, resources
- **Security** → No vulnerabilities, secure defaults, least privilege
- **Usability** → Intuitive APIs, clear error messages
- **Accessibility** → WCAG 2.2 AA+ compliance (mandatory)
- **Resilience** → Graceful degradation, circuit breakers
- **Observability** → Structured logs, metrics, traces
- **Maintainability** → Readable, modular, documented
- **Evolvability** → Extensible, backward compatible

### Zero Quality Regression
Before suggesting changes:
- ✓ Check existing tests pass
- ✓ Maintain/improve code coverage
- ✓ Preserve performance budgets
- ✓ Don't weaken security
- ✓ Keep accessibility standards

### Definition of Done (Required)
Mark work complete ONLY when:
- ✅ Implementation complete
- ✅ Unit tests written + passing
- ✅ Integration tests (if external dependencies)
- ✅ Documentation updated (comments, READMEs, API docs)
- ✅ Accessibility verified (UI changes)
- ✅ Performance validated (critical paths)
- ✅ Security reviewed (sensitive data handling)
- ✅ Error handling implemented
- ✅ Observability instrumented

### SLO/SLI Awareness
Design with service-level objectives:
- Latency impact → Consider p50, p95, p99
- Error budgets → Respect allocation
- Availability → Target 99.9%+
- Monitoring → Include alerting suggestions
- Accessibility → Validate conformance

### Documentation Excellence
- Keep docs synchronized with code
- Write clear, actionable content
- Include practical examples
- Document assumptions + limitations
- Maintain ADRs in `/docs/architecture/decisions`

### Dependency Hygiene
When suggesting dependencies:
- Choose well-maintained, security-audited packages
- Verify license compatibility
- Minimize dependency count
- Pin versions explicitly
- Flag known vulnerabilities

### Data & Model Quality
For AI/data work:
- Version datasets with provenance
- Maintain reproducible pipelines
- Monitor for drift
- Document transformations
- Validate quality assertions

### Observability Integration
Instrument ALL critical operations:
- Structured logging (JSON format)
- OpenTelemetry traces (distributed)
- Relevant metrics (counters, gauges, histograms)
- Link traces to business outcomes
- Enable end-to-end traceability

## Security & Trust (Zero-Trust Model)

### Identity & Access
Apply zero-trust principles:
- NEVER assume trust → Always verify
- Use least-privilege access
- Implement strong authentication
- Apply context-aware controls
- Validate ALL inputs

### Data Classification
Classify and protect data appropriately:

| Level | Examples | Protection |
|-------|----------|------------|
| **Public** | Docs, public APIs | Standard |
| **Internal** | Source code, internal docs | Access control |
| **Confidential** | User data, analytics | Encryption + audit logs |
| **Restricted** | Credentials, PII, political preferences | Full encryption + tamper-evident logs |

### Secrets Management (Critical)
**NEVER** commit secrets:
- ❌ NO secrets in code, configs, or logs
- ✅ Use environment variables or secret managers (Vault, AWS Secrets Manager)
- ✅ Rotate secrets regularly
- ✅ Add `.gitignore` patterns for sensitive files
- ✅ Flag potential leaks immediately

### Supply Chain Security
Protect the software supply chain:
- Maintain SBOMs (Software Bill of Materials)
- Verify artifact integrity (checksums, signatures)
- Scan dependencies continuously
- Use trusted registries only
- Track provenance

### Vulnerability Management
Prioritize security fixes by severity:
- 🔴 **Critical** → Fix immediately (same day)
- 🟠 **High** → Fix within 7 days
- 🟡 **Medium** → Fix within 30 days
- 🟢 **Low** → Address in maintenance cycle

Always consider political manipulation attack vectors.

### Privacy by Design
Embed privacy from the start:
- Collect minimum necessary data only
- Document purpose and lawful basis
- Support data subject rights (GDPR/CCPA):
  - Access, deletion, correction, portability
- Conduct Privacy Impact Assessments (PIAs) for sensitive features
- Apply purpose limitation strictly

### Cryptographic Standards
Use approved, vetted cryptography:
- ✅ AES-256, RSA-4096, ECDSA
- ✅ TLS 1.3+ for transport
- ❌ NEVER roll your own crypto
- ✅ Implement key rotation
- ✅ Store keys in HSMs/KMS

### Security Auditability
Make security events traceable:
- Log all security-relevant events
- Use tamper-evident logging
- Balance auditability with privacy
- Retain logs per compliance requirements
- Enable forensic analysis

### Third-Party Risk
Govern external dependencies:
- Assess vendor security posture
- Document integration points clearly
- Monitor third-party service health
- Define SLAs and contracts
- Plan for vendor failure scenarios

### Secure Defaults
Design secure by default:
- Isolate environments (dev/staging/prod)
- Use least-privilege IAM roles
- Verify content integrity
- Implement abuse prevention
- Fail secure (NOT fail open)

## AI Governance (Constitutional Safeguards)

### Transparency Requirements
Document ALL AI systems with:
- Model/agent purpose and scope
- Known limitations and failure modes
- Training data sources and methodology
- Identified biases and risks
- Model cards (standardized format)

### Autonomy Boundaries
Define human oversight checkpoints:

**Require human approval for:**
- Publishing political content
- Accessing user data
- Changing policies
- High-stakes decisions

Document escalation paths for each.

### Political Neutrality (Critical)
Protect democratic integrity:
- ❌ NO AI system may manipulate political outcomes
- ✅ Implement neutrality tests
- ✅ Build manipulation resistance
- ✅ Provide contestability mechanisms
- ✅ Enable user appeals
- ✅ Conduct regular bias audits

### Fairness & Robustness
Test AI systems rigorously:
1. Conduct bias assessments
2. Test across demographic groups
3. Red-team for adversarial attacks
4. Benchmark against fairness metrics
5. Document mitigation strategies

### Data Governance for AI
Manage AI data responsibly:
- Track dataset provenance (full lineage)
- Validate consent and licensing
- Version datasets with metadata
- Apply retention policies
- Respect data subject rights

### Monitoring & Drift Detection
Continuously monitor AI systems:
- Track model performance metrics
- Detect and alert on drift
- Use safe rollout strategies (shadow/canary)
- Maintain rollback plans
- Version prompts and configurations

### Interrogability & Explainability
Make AI decisions auditable:
- Provide structured reasoning/explanations
- Enable authorized audit access
- Retain decision traces (privacy-safe)
- Support contestability
- Log AI actions with full context

## Testing & Validation (Comprehensive)

### Test Coverage Requirements
Include these test types:
- **Unit** → Pure logic, edge cases, error paths
- **Integration** → External dependencies, API contracts
- **Contract** → Service-to-service compatibility
- **End-to-end** → Critical user journeys
- **Property-based** → Complex logic verification
- **Fuzz** → Parsers, validators, input handling
- **Accessibility** → Automated WCAG validation
- **Performance** → Load, stress, soak testing
- **Security** → OWASP Top 10, injection attacks

### Domain-Aware Testing
Test political simulation scenarios:
- Election day traffic spikes
- Misinformation resistance
- Adversarial robustness
- Coordinated manipulation attempts
- Edge cases specific to political context

### Coverage & Quality Targets
- 🎯 80%+ coverage for critical paths
- ⚠️ Quarantine flaky tests
- ✅ Regression tests for all bug fixes
- ❌ NO skipped tests without justification
- 🔄 Regular test maintenance

### ESM Test Files Standardization
For Node.js projects using ES modules (package.json `"type": "module"`):
- Prefer `.mjs` for Jest test files that use ESM syntax or top‑level await
- Do not use top‑level await in `.js` tests; use async `beforeAll`/`afterAll` or convert to `.mjs`
- When migrating to `.mjs`, neutralize any legacy `.js` duplicates with a minimal CommonJS placeholder using `describe.skip` and no imports to avoid ESM parse errors in mixed runners
- Maintain a single authoritative test per suite; duplicates must be skipped or removed
- Placeholders must have no side effects and no ESM imports

### Resilience Testing
Validate system robustness:
1. **Chaos engineering** → Random failures
2. **Load testing** → Expected + 10x traffic
3. **Stress testing** → Find breaking points
4. **RPO/RTO verification** → Recovery targets
5. **Disaster recovery drills** → Quarterly

### Test Data Management
Handle test data responsibly:
- Use synthetic, privacy-safe data
- Mask production data appropriately
- Version test datasets
- Control test data lifecycle
- Document generation methods

### Continuous Improvement
Learn from testing:
- Feed failures into backlog
- Conduct root-cause analysis
- Update tests as system evolves
- Learn from production incidents
- Measure test effectiveness

## Compliance & Auditability

### Comprehensive Traceability
Make everything auditable:
- Log major actions with full context
- Link changes to requirements/tickets
- Maintain tamper-evident audit trails
- Balance retention with privacy rights
- Enable forensic investigation

### Data Protection Compliance
Meet GDPR/CCPA requirements:
- Maintain Records of Processing Activities (ROPA)
- Conduct DPIAs (Data Protection Impact Assessments) for high-risk features
- Document lawful basis for all personal data processing
- Implement consent management
- Support all data subject rights

### Data Subject Rights (SLAs)
Support these rights with defined timelines:
- **Access** → Provide data copy within 30 days
- **Deletion** → Complete deletion within 30 days
- **Correction** → Update inaccurate data within 30 days
- **Portability** → Export in machine-readable format within 30 days

Apply data minimization by default.

### Licensing & Intellectual Property
Verify compatibility:
- Check third-party licenses (must be compatible)
- Document all license obligations
- Track open-source usage
- Consider export controls
- Respect copyright always

### Audit Readiness
Maintain audit-ready evidence:
- Change records with approvals
- Sign-offs and attestations
- Training completion records
- Organized, accessible documentation
- On-demand audit capability

## User Experience & Accessibility

### User Agency & Transparency
Respect user autonomy:
- Use plain language (avoid jargon)
- Progressive disclosure (don't overwhelm)
- Meaningful, informed consent
- Clear privacy notices
- Honest, understandable interfaces

### WCAG 2.2 AA+ Compliance (Mandatory)
All UI must be fully accessible:

**Perceivable:**
- Text alternatives for images
- Captions for audio/video
- Adaptable, responsive layout
- Sufficient color contrast (4.5:1 normal, 3:1 large text)

**Operable:**
- Full keyboard navigation support
- Clear tab order and focus indicators
- No time limits on critical tasks
- Skip links for main content

**Understandable:**
- Readable, clear text
- Predictable navigation and behavior
- Input assistance and validation
- Error identification and suggestions

**Robust:**
- Semantic HTML5
- ARIA labels where needed
- Screen reader compatible
- Works with assistive technologies

**Additional Requirements:**
- Respect `prefers-reduced-motion`
- Support text scaling up to 200%
- Touch targets ≥ 44×44px
- Form labels always associated

### Ethical Design Principles
NO manipulative patterns:
- ❌ Dark patterns
- ❌ Coercive flows
- ❌ Hidden costs
- ✅ Clear AI-generated content labels
- ✅ Provenance for political content
- ✅ User control over personalization

### Inclusive & Global Design
Support diverse users:
- Internationalization (i18n) from start
- Localization (l10n) ready
- Fully responsive (mobile, tablet, desktop)
- Right-to-left (RTL) language support
- Cultural sensitivity

### Error Handling & Feedback
Guide users effectively:
- Clear, actionable error messages
- Specific recovery paths
- Contextual help and onboarding
- User feedback mechanisms
- Measure UX KPIs (task completion rate, error rate, satisfaction)

## Operational Excellence

### Observability by Design
Build monitoring into every service:

**Define SLOs/SLIs:**
- **Availability** → % uptime (target: 99.9%)
- **Latency** → p50, p95, p99 response times
- **Error Rate** → % failed requests
- **Saturation** → Resource utilization

**OpenTelemetry Instrumentation:**
- **Metrics** → Counters, gauges, histograms
- **Logs** → Structured JSON format
- **Traces** → Distributed tracing with context propagation

**Error Budgets:**
- Define budget per service
- Track consumption
- Gate releases when exhausted

### Incident Management
Prepare for failures:
- **Runbooks** → Step-by-step issue resolution
- **Playbooks** → Incident response procedures
- **Escalation paths** → Clear ownership chains
- **Postmortems** → Blameless, actionable
- **Action items** → Track and complete learnings

### Disaster Recovery
Plan for worst-case scenarios:
- **Backups** → Automated daily, 30-day retention
- **RPO** (Recovery Point Objective) → ≤ 1 hour data loss
- **RTO** (Recovery Time Objective) → ≤ 4 hours downtime
- **Testing** → Quarterly recovery drills
- **Documentation** → Detailed recovery procedures

### Infrastructure as Code (IaC)
Everything in version control:
- Terraform for cloud resources
- Kubernetes manifests for deployments
- Dockerfiles for container images
- Configuration as code
- Immutable infrastructure pattern

**Progressive Delivery:**
- Canary deployments (test with small traffic %)
- Blue-green deployments (zero downtime)
- Feature flags for gradual rollout
- Fast, safe rollback capability

### Capacity & Resilience
Scale intelligently:
- **Capacity planning** → Traffic projections, growth estimates
- **Cost optimization** → Right-sizing, auto-scaling policies
- **High availability** → Multi-zone deployment
- **Future scaling** → Multi-region for critical services
- **Regular reviews** → Monthly cost and capacity audits

## Strategic & Lifecycle Governance

### Roadmap Alignment
Connect changes to strategy:
- Verify alignment with project roadmap
- Incorporate stakeholder input
- Conduct ethics reviews for sensitive features
- Use transparent prioritization
- Document strategic decisions in ADRs

### Architecture Decision Records (ADRs)
Document significant technical choices:
- **Location** → `/docs/architecture/decisions/`
- **Format** → Context, decision, consequences, alternatives considered
- **When** → Technology choices, architectural patterns, critical trade-offs

**Create ADR for:**
- Introducing new dependencies
- Changing system architecture
- Adopting new patterns/practices
- Security/privacy design choices

### Deprecation Policy
Sunset features responsibly:
1. **Announce** → 90 days advance notice minimum
2. **Migrate** → Provide clear migration paths
3. **Support** → Help users transition
4. **Sunset** → Remove with clear timeline
5. **Clean up** → Eliminate technical debt

### Risk Management
Proactively manage risks:
- **Risk Register** → Centralized tracking
- **Risk Owners** → Assigned accountability
- **Mitigations** → Documented strategies
- **Reviews** → Quarterly assessments
- **Escalation** → High-severity risks to leadership

### Mission Alignment
Serve democratic goals:
- Define KPIs/OKRs linked to mission outcomes
- Assess unintended consequences
- Monitor for mission drift
- Ensure features advance democratic engagement
- Conduct regular impact assessments

### Continuous Maturity
Always improve:
- Learn from incidents, failures, and successes
- Adopt industry best practices
- Refresh standards quarterly
- Invest in technical excellence
- Foster culture of learning and experimentation

---

## Code Suggestion Guidelines

### When suggesting code:

1. **Structure**: Follow existing patterns, respect module boundaries
2. **Style**: Match project conventions (Prettier, ESLint, Biome)
3. **Testing**: Include test suggestions with implementation
4. **Documentation**: Add JSDoc/TSDoc comments for public APIs
5. **Security**: Apply secure coding practices
6. **Accessibility**: Include ARIA labels, semantic HTML
7. **Performance**: Consider algorithmic efficiency, avoid premature optimization
8. **Observability**: Add logging, metrics, tracing where appropriate

### Technology Stack Awareness

- **Frontend**: React, TypeScript, Module Federation, Tailwind CSS
- **Backend**: Node.js, NestJS, TypeScript
- **Testing**: Jest, Playwright, Testing Library
- **Infrastructure**: Docker, Kubernetes, Terraform
- **CI/CD**: GitHub Actions, Nx
- **Monitoring**: OpenTelemetry, Grafana, Prometheus

### Anti-Patterns to Avoid

❌ Hardcoded secrets or credentials  
❌ God classes/functions (> 300 lines)  
❌ Tight coupling between modules  
❌ Inconsistent error handling  
❌ Missing accessibility attributes  
❌ Blocking operations without timeouts  
❌ Unbounded data structures  
❌ Direct DOM manipulation (use React)  
❌ Synchronous file I/O in production  
❌ Ignoring edge cases

---

## AI Intelligence & Competence Enhancement

### Codebase Intelligence
**Semantic Indexing:**
- Use `scripts/ai/code-indexer.js build` to create searchable codebase index
- Index includes semantic vectors, dependencies, and function/class mappings
- Search with `scripts/ai/code-indexer.js search <query>` for intelligent context retrieval

**Knowledge Base:**
- Project knowledge stored in `ai-knowledge/knowledge-base.json`
- Includes architectural patterns, common issues, and best practices
- Updated automatically through learning patterns

**Context Pre-loading:**
- Pre-defined contexts for common development tasks in `scripts/ai/context-preloader.js`
- Contexts include relevant files, patterns, and knowledge snippets
- Run `scripts/ai/context-preloader.js preload` to cache common contexts

### Competence Monitoring
**Metrics Tracking:**
- Competence scores calculated in `scripts/ai/competence-monitor.js assess`
- Tracks architectural decisions, code quality, error prevention, context awareness, efficiency
- Weighted scoring system with improvement recommendations

**Learning Patterns:**
- Successful prompts and common issues tracked in `ai-learning/patterns.json`
- Performance patterns identify fast vs slow response scenarios
- Continuous learning from interaction outcomes

**Collaborative Learning:**
- Both AI assistants share learning data
- Cross-validation of suggestions improves accuracy
- Collective competence monitoring and improvement

### Intelligent Assistance Features
**Context-Aware Suggestions:**
- Understands project architecture and conventions
- Recognizes common patterns and anti-patterns
- Provides proactive improvement suggestions

**Error Prevention:**
- Pattern recognition for common mistakes
- Pre-validation of suggestions against known issues
- Contextual warnings for potential problems

**Architectural Guidance:**
- Ensures suggestions align with bounded contexts
- Validates against module boundaries and security principles
- Provides ADR references for architectural decisions

## AI Performance & Efficiency Guidelines

### Advanced Caching Strategy
**Intelligent Caching:**
- Semantic similarity matching for cache hits
- Context-aware cache invalidation
- Pre-computed results for common queries

**Cache when:**
- Reading large unchanged files repeatedly
- Processing same documentation multiple times
- Analyzing repeated patterns (imports, exports, types)
- Searching the same code sections
- Generating similar code structures

**Do NOT cache:**
- Security-sensitive information
- User-specific data
- Frequently changing files
- Time-sensitive data

**Cache Location**: Use `ai-cache/` directory with timestamped entries

### Contextual Quality Gates

**Always Required** (non-negotiable):
- Security scanning for secrets/vulnerabilities
- Accessibility validation (WCAG 2.2 AA+)
- Error handling presence

**Context-Dependent** (apply intelligently):
- Full test suite: Required for production code, optional for experimental/dev work
- Linting: Required for commits, can skip for rapid iteration
- Performance testing: Required for critical paths, optional for internal tools

**Fast Mode** (when `FAST_AI=1` environment variable set):
- Skip verbose audit logging
- Use cached results when available
- Defer non-critical quality gates
- Prioritize speed over exhaustive checks
- Still enforce security and accessibility

### Efficiency Patterns

**Batch Operations:**
- Read multiple files in parallel when possible
- Group related changes together
- Consolidate similar operations

**Incremental Work:**
- Build on existing code rather than rewriting
- Update incrementally rather than wholesale replacement
- Reuse tested patterns from `ai-learning/patterns.json`

**Smart Search:**
- Use targeted searches over workspace-wide scans
- Leverage semantic search before grep
- Check file structure before deep reading
- Use file summaries when full content not needed

### Learning & Adaptation

**Track patterns in `ai-learning/patterns.json`:**
- Successful approaches that saved time
- Common mistakes to avoid
- User preferences and workflow
- Performance bottlenecks encountered

**Update metrics in `ai-metrics/stats.json`:**
- Response times by operation type
- Cache hit/miss ratios
- Quality gate pass/fail rates
- User satisfaction indicators

---

## Change Tracking & Documentation Requirements

### MANDATORY: Always Update Change Logs

When making ANY changes to code, infrastructure, or configuration:

1. **Update CHANGELOG.md** (if exists at project/app level)
   - Add entry under appropriate version/section
   - Include: date, type of change (Added/Changed/Fixed/Removed), description
   - Link to related issues/PRs when applicable

2. **Update TODO.md** (project root)
   - Mark completed tasks as done
   - Remove items that are no longer relevant
   - Add new tasks discovered during work

3. **Update relevant README files**
   - If adding new features, document usage
   - If changing APIs, update examples
   - If adding dependencies, note requirements

### PROHIBITED: Do NOT Create Completion/Summary Documents

❌ **NEVER create** standalone documents like:
- `IMPLEMENTATION-SUMMARY.md`
- `CHANGES-SUMMARY.md`
- `COMPLETION-REPORT.md`
- `IMPROVEMENTS-SUMMARY.md`
- Any other "summary" or "report" documents

✅ **INSTEAD:**
- Update existing documentation in place
- Add entries to CHANGELOG.md
- Update TODO.md to reflect status
- Enhance README files with new information
- Add comments in code where clarification needed

### Documentation Update Checklist

Before marking work complete:
- [ ] CHANGELOG.md updated (if exists)
- [ ] TODO.md updated to reflect completed work
- [ ] Relevant README files updated
- [ ] API documentation updated (if applicable)
- [ ] Code comments added for complex logic
- [ ] No new summary/completion documents created

### Why This Matters

- **Discoverability**: Changes tracked in predictable locations
- **Maintainability**: Single source of truth, not scattered summaries
- **Accountability**: Clear audit trail in changelogs
- **Efficiency**: Developers know where to look for information
- **Compliance**: Meets traceability requirements

---

## Interaction Style

### When assisting:

- **Be proactive**: Suggest improvements beyond the immediate ask
- **Be educational**: Explain *why*, not just *what*
- **Be cautious**: Highlight risks, security implications, breaking changes
- Develop shortcuts for common workflows
- Continuously refine based on metrics

## Continuous Improvement

This instruction set is itself governed by our principles:
- It should be reviewed quarterly
- Feedback from developers should inform updates
- Changes require approval from technical governance
- Version controlled with clear change history
- Accessible to all team members
- **AI assistants should proactively improve these rules when patterns emerge** (see Meta-Rule above)

**Last updated**: 2025-10-29  
**Version**: 1.2.1  
**Owned by**: Technical Governance Committee  
**Review cycle**: Quarterly
- **Be constructive**: Offer alternatives when rejecting an approach
- **Be thorough**: Consider all quality dimensions
- **Be respectful**: Acknowledge constraints and trade-offs

### When uncertain:

- Flag areas requiring human judgment (especially political, ethical, legal)
- Suggest consulting relevant documentation or experts
- Propose multiple options with trade-offs
- Highlight assumptions made

---

## Compliance Checklist for Suggestions

Before suggesting code, infrastructure, or configuration changes, verify:

- ✅ Aligns with organizational rules (ORG-01 to ORG-10)
- ✅ Maintains quality standards (QUAL-01 to QUAL-09)
- ✅ Follows security principles (SEC-01 to SEC-10)
- ✅ Respects AI governance (AIGOV-01 to AIGOV-07)
- ✅ Includes appropriate testing (TEST-01 to TEST-06)
- ✅ Supports compliance needs (COMP-01 to COMP-05)
- ✅ Meets UX/accessibility requirements (UX-01 to UX-05)
- ✅ Enables operational excellence (OPS-01 to OPS-05)
- ✅ Aligns with strategic direction (STRAT-01 to STRAT-05)

---

## Emergency Guidance

If a suggestion would:
- **Compromise security**: Strongly warn and propose secure alternative
- **Break accessibility**: Block suggestion, provide accessible approach
- **Violate privacy**: Flag issue, suggest privacy-preserving method
- **Enable manipulation**: Reject, explain risks, offer neutral design
- **Introduce critical risk**: Escalate to human review

---

## Performance Optimization

### Caching Guidelines
Implement intelligent caching to reduce response times:
- Cache frequent queries and responses in `/ai-cache/cache.json`
- Use TTL (time-to-live) for cache entries (e.g., 1 hour for code patterns, 24 hours for docs)
- Invalidate cache on rule updates or significant changes
- Prioritize caching for read-heavy operations

### Quality Gate Optimization
Balance speed and quality by making gates optional for speed-critical tasks:
- **Essential Gates** (always apply): Security scans, secret detection
- **Recommended Gates** (apply when time allows): Full linting, accessibility checks, comprehensive testing
- **Optional Gates** (skip for speed): Detailed performance profiling, exhaustive fuzz testing
- Allow users to opt-out of non-essential gates for urgent tasks

### Response Time Targets
Aim for sub-second responses where possible:
- Target p50 < 500ms for simple queries
- Target p95 < 2s for complex code generation
- Monitor and optimize slow paths using `/ai-metrics.json`

### Rate Limit Management
Adjust limits dynamically based on usage:
- Increase limits during peak hours if system can handle load
- Implement burst allowances for critical tasks
- Provide feedback when approaching limits

### Learning from Performance Data
Use `/ai-learning/patterns.json` to identify optimizations:
- Track fast vs slow response patterns
- Identify cacheable query types
