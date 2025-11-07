# Political Sphere - Interactive File Structure

> **Click to expand sections and explore the codebase hierarchy**

## 📋 Quick Navigation

<details open>
<summary><strong>🎯 How to Use This Document</strong></summary>

Click on any section heading (with the triangle ▶) to expand/collapse it. Each section contains Mermaid diagrams showing the file structure for that area.

**Color Legend:**
- 🔵 Blue - Root/Primary containers
- 🟢 Green - Applications & Services  
- 🟠 Orange - Libraries & Utilities
- 🟣 Purple - Documentation & Governance
- 🔷 Cyan - Infrastructure & DevOps
- 🟤 Brown - Scripts & Tools
- 🔴 Pink - AI Assets & Models

</details>

---

## 📊 Project Overview

```mermaid
graph LR
    Root[political-sphere/]

    Root --> Apps[📱 Apps<br/>12 applications]
    Root --> Libs[📚 Libs<br/>17+ libraries]
    Root --> Docs[📖 Docs<br/>12 sections]
    Root --> Infra[🏗️ Infrastructure<br/>IaC & K8s]
    Root --> Scripts[🔧 Scripts<br/>Automation]
    Root --> AI[🤖 AI Assets<br/>Context & Tools]

    style Root fill:#2196F3,stroke:#1565C0,stroke-width:3px,color:#fff
    style Apps fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
    style Libs fill:#FF9800,stroke:#E65100,stroke-width:2px,color:#fff
    style Docs fill:#9C27B0,stroke:#6A1B9A,stroke-width:2px,color:#fff
    style Infra fill:#00BCD4,stroke:#00838F,stroke-width:2px,color:#fff
    style Scripts fill:#795548,stroke:#4E342E,stroke-width:2px,color:#fff
    style AI fill:#E91E63,stroke:#880E4F,stroke-width:2px,color:#fff
```

---

<details>
<summary><h2>📦 Root Configuration Files</h2></summary>

### Standard Project Files

```mermaid
graph TB
    Root[Root Files]

    Root --> Docs[📄 Documentation]
    Docs --> readme[README.md]
    Docs --> changelog[CHANGELOG.md]
    Docs --> contrib[CONTRIBUTING.md]
    Docs --> license[LICENSE]
    Docs --> conduct[CODE_OF_CONDUCT.md]

    Root --> Config[⚙️ Configuration]
    Config --> package[package.json]
    Config --> nx[nx.json]
    Config --> ts[tsconfig.json]
    Config --> vitest[vitest.config.js]
    Config --> pnpm[pnpm-workspace.yaml]

    Root --> Tooling[🔧 Tooling]
    Tooling --> prettier[.prettierrc]
    Tooling --> eslint[.eslintrc]
    Tooling --> editor[.editorconfig]
    Tooling --> git[.gitignore]
    Tooling --> lefthook[.lefthook.yml]

    style Root fill:#2196F3,stroke:#1565C0,stroke-width:3px,color:#fff
    style Docs fill:#66BB6A,stroke:#388E3C,stroke-width:2px
    style Config fill:#42A5F5,stroke:#1976D2,stroke-width:2px
    style Tooling fill:#AB47BC,stroke:#7B1FA2,stroke-width:2px
```

</details>

---

<details>
<summary><h2>🔧 Development Environment</h2></summary>

### IDE and Container Setup

```mermaid
graph LR
    DevEnv[Development Environment]

    DevEnv --> Container[🐳 .devcontainer/]
    Container --> devjson[devcontainer.json]
    Container --> dockerfile[Dockerfile]
    Container --> compose[docker-compose.dev.yml]

    DevEnv --> VSCode[💻 .vscode/]
    VSCode --> extensions[extensions.json]
    VSCode --> settings[settings.json]
    VSCode --> tasks[tasks.json]
    VSCode --> launch[launch.json]

    DevEnv --> Cache[💾 Build Cache]
    Cache --> nx[.nx/workspace-data/]
    Cache --> vitest[.vitest/cache/]

    style DevEnv fill:#FF6F00,stroke:#E65100,stroke-width:3px,color:#fff
    style Container fill:#26A69A,stroke:#00796B,stroke-width:2px
    style VSCode fill:#5C6BC0,stroke:#3949AB,stroke-width:2px
    style Cache fill:#78909C,stroke:#546E7A,stroke-width:2px
```

</details>

---

<details>
<summary><h2>🤖 GitHub & CI/CD</h2></summary>

### Workflows

```mermaid
graph TB
    GitHub[.github/]

    GitHub --> Workflows[workflows/]
    Workflows --> ci[ci.yml]
    Workflows --> release[release.yml]
    Workflows --> security[security.yml]
    Workflows --> tests[test-*.yml]

    GitHub --> Actions[actions/]
    Actions --> setup[setup-node/]
    Actions --> test[run-tests/]
    Actions --> quality[quality-checks/]

    GitHub --> Templates[Templates]
    Templates --> issues[ISSUE_TEMPLATE/]
    Templates --> pr[PULL_REQUEST_TEMPLATE.md]

    GitHub --> Docs[Documentation]
    Docs --> copilot[copilot-instructions.md]
    Docs --> codeowners[CODEOWNERS]

    style GitHub fill:#FF6F00,stroke:#E65100,stroke-width:3px,color:#fff
    style Workflows fill:#26A69A,stroke:#00796B,stroke-width:2px
    style Actions fill:#5C6BC0,stroke:#3949AB,stroke-width:2px
    style Templates fill:#EC407A,stroke:#AD1457,stroke-width:2px
    style Docs fill:#AB47BC,stroke:#7B1FA2,stroke-width:2px
```

</details>

---

<details>
<summary><h2>📱 Applications (12 Apps)</h2></summary>

### Core Services

<details>
<summary><strong>Backend & Game Engine</strong></summary>

```mermaid
graph TB
    Core[Core Services]
    
    Core --> API[api/]
    API --> apiSrc[src/]
    API --> apiTest[__tests__/]
    API --> apiConfig[config/]
    
    Core --> GameServer[game-server/]
    GameServer --> gsSrc[src/]
    GameServer --> gsEngine[engine/]
    GameServer --> gsTests[__tests__/]
    
    Core --> Worker[worker/]
    Worker --> wSrc[src/]
    Worker --> wJobs[jobs/]
    Worker --> wTests[__tests__/]

    style Core fill:#4CAF50,stroke:#2E7D32,stroke-width:3px,color:#fff
    style API fill:#66BB6A,stroke:#388E3C,stroke-width:2px
    style GameServer fill:#66BB6A,stroke:#388E3C,stroke-width:2px
    style Worker fill:#66BB6A,stroke:#388E3C,stroke-width:2px
```

</details>

### Frontend Applications

<details>
<summary><strong>Web & Microfrontends</strong></summary>

```mermaid
graph TB
    Frontend[Frontend Apps]
    
    Frontend --> Web[web/]
    Web --> webSrc[src/]
    Web --> webPages[pages/]
    Web --> webComponents[components/]
    
    Frontend --> Shell[shell/]
    Shell --> shellSrc[src/]
    Shell --> shellConfig[module-federation.config.js]
    
    Frontend --> AuthRemote[feature-auth-remote/]
    AuthRemote --> authSrc[src/]
    AuthRemote --> authComponents[components/]
    
    Frontend --> DashRemote[feature-dashboard-remote/]
    DashRemote --> dashSrc[src/]
    DashRemote --> dashWidgets[widgets/]

    style Frontend fill:#4CAF50,stroke:#2E7D32,stroke-width:3px,color:#fff
    style Web fill:#81C784,stroke:#4CAF50,stroke-width:2px
    style Shell fill:#81C784,stroke:#4CAF50,stroke-width:2px
    style AuthRemote fill:#81C784,stroke:#4CAF50,stroke-width:2px
    style DashRemote fill:#81C784,stroke:#4CAF50,stroke-width:2px
```

</details>

### Support & Infrastructure

<details>
<summary><strong>Testing, Documentation & Development</strong></summary>

```mermaid
graph TB
    Support[Support Apps]
    
    Support --> E2E[e2e/]
    E2E --> e2eTests[tests/]
    E2E --> e2eFixtures[fixtures/]
    E2E --> e2eConfig[playwright.config.ts]
    
    Support --> LoadTest[load-test/]
    LoadTest --> ltScripts[scripts/]
    LoadTest --> ltScenarios[scenarios/]
    
    Support --> DocsApp[docs/]
    DocsApp --> docsPages[pages/]
    DocsApp --> docsPublic[public/]
    
    Support --> Dev[dev/]
    Dev --> devExperiments[experiments/]
    Dev --> devPrototypes[prototypes/]
    
    Support --> Infra[infrastructure/]
    Infra --> terraform[terraform/]
    Infra --> k8s[kubernetes/]
    Infra --> docker[docker/]

    style Support fill:#4CAF50,stroke:#2E7D32,stroke-width:3px,color:#fff
    style E2E fill:#A5D6A7,stroke:#66BB6A,stroke-width:2px
    style LoadTest fill:#A5D6A7,stroke:#66BB6A,stroke-width:2px
    style DocsApp fill:#A5D6A7,stroke:#66BB6A,stroke-width:2px
    style Dev fill:#A5D6A7,stroke:#66BB6A,stroke-width:2px
    style Infra fill:#A5D6A7,stroke:#66BB6A,stroke-width:2px
```

</details>

</details>

---

<details>
<summary><h2>📚 Libraries (17+ Modules)</h2></summary>

### Shared Utilities

<details>
<summary><strong>Common Code & Types</strong></summary>

```mermaid
graph TB
    Shared[shared/]
    
    Shared --> Utils[utils/]
    Utils --> validation[validation/]
    Utils --> formatting[formatting/]
    Utils --> helpers[helpers/]
    
    Shared --> Types[types/]
    Types --> models[models/]
    Types --> interfaces[interfaces/]
    Types --> enums[enums/]
    
    Shared --> Constants[constants/]
    Constants --> config[config/]
    Constants --> defaults[defaults/]
    
    Shared --> Config[config/]
    Config --> env[environment/]
    Config --> feature[feature-flags/]

    style Shared fill:#FF9800,stroke:#E65100,stroke-width:3px,color:#fff
    style Utils fill:#FFB74D,stroke:#FB8C00,stroke-width:2px
    style Types fill:#FFB74D,stroke:#FB8C00,stroke-width:2px
    style Constants fill:#FFB74D,stroke:#FB8C00,stroke-width:2px
    style Config fill:#FFB74D,stroke:#FB8C00,stroke-width:2px
```

</details>

### Platform Services

<details>
<summary><strong>Core Platform Infrastructure</strong></summary>

```mermaid
graph TB
    Platform[platform/]
    
    Platform --> Auth[auth/]
    Auth --> authServices[services/]
    Auth --> authGuards[guards/]
    Auth --> authTokens[tokens/]
    
    Platform --> APIClient[api-client/]
    APIClient --> apiEndpoints[endpoints/]
    APIClient --> apiInterceptors[interceptors/]
    
    Platform --> State[state/]
    State --> storeSetup[store/]
    State --> slices[slices/]
    State --> middleware[middleware/]
    
    Platform --> Routing[routing/]
    Routing --> routes[routes/]
    Routing --> navigation[navigation/]

    style Platform fill:#FF9800,stroke:#E65100,stroke-width:3px,color:#fff
    style Auth fill:#FFA726,stroke:#F57C00,stroke-width:2px
    style APIClient fill:#FFA726,stroke:#F57C00,stroke-width:2px
    style State fill:#FFA726,stroke:#F57C00,stroke-width:2px
    style Routing fill:#FFA726,stroke:#F57C00,stroke-width:2px
```

</details>

### Domain Logic

<details>
<summary><strong>Game Engine & Business Logic</strong></summary>

```mermaid
graph TB
    GameEngine[game-engine/]
    
    GameEngine --> Core[core/]
    Core --> rules[rules/]
    Core --> mechanics[mechanics/]
    Core --> systems[systems/]
    
    GameEngine --> Simulation[simulation/]
    Simulation --> algorithms[algorithms/]
    Simulation --> models[models/]
    Simulation --> ai[ai/]
    
    GameEngine --> Events[events/]
    Events --> handlers[handlers/]
    Events --> emitters[emitters/]
    Events --> listeners[listeners/]

    style GameEngine fill:#FF9800,stroke:#E65100,stroke-width:3px,color:#fff
    style Core fill:#FF8A65,stroke:#FF5722,stroke-width:2px
    style Simulation fill:#FF8A65,stroke:#FF5722,stroke-width:2px
    style Events fill:#FF8A65,stroke:#FF5722,stroke-width:2px
```

</details>

### Infrastructure Libraries

<details>
<summary><strong>Data Layer & Operations</strong></summary>

```mermaid
graph TB
    Infrastructure[infrastructure/]
    
    Infrastructure --> Database[database/]
    Database --> repositories[repositories/]
    Database --> migrations[migrations/]
    Database --> seeds[seeds/]
    
    Infrastructure --> Monitoring[monitoring/]
    Monitoring --> metrics[metrics/]
    Monitoring --> logging[logging/]
    Monitoring --> tracing[tracing/]
    
    Infrastructure --> Deployment[deployment/]
    Deployment --> scripts[scripts/]
    Deployment --> configs[configs/]

    style Infrastructure fill:#FF9800,stroke:#E65100,stroke-width:3px,color:#fff
    style Database fill:#FFAB91,stroke:#FF7043,stroke-width:2px
    style Monitoring fill:#FFAB91,stroke:#FF7043,stroke-width:2px
    style Deployment fill:#FFAB91,stroke:#FF7043,stroke-width:2px
```

</details>

### UI Components

<details>
<summary><strong>Design System & Accessibility</strong></summary>

```mermaid
graph TB
    UI[ui/]
    
    UI --> Components[components/]
    Components --> atoms[atoms/]
    Components --> molecules[molecules/]
    Components --> organisms[organisms/]
    
    UI --> DesignSystem[design-system/]
    DesignSystem --> tokens[tokens/]
    DesignSystem --> themes[themes/]
    DesignSystem --> patterns[patterns/]
    
    UI --> Accessibility[accessibility/]
    Accessibility --> utils[utils/]
    Accessibility --> hooks[hooks/]
    Accessibility --> tests[tests/]

    style UI fill:#FF9800,stroke:#E65100,stroke-width:3px,color:#fff
    style Components fill:#FFCC80,stroke:#FFA726,stroke-width:2px
    style DesignSystem fill:#FFCC80,stroke:#FFA726,stroke-width:2px
    style Accessibility fill:#FFCC80,stroke:#FFA726,stroke-width:2px
```

</details>

</details>

---

<details>
<summary><h2>📖 Documentation (12 Sections)</h2></summary>

### Foundation & Strategy

<details>
<summary><strong>Core Principles & Planning</strong></summary>

```mermaid
graph TB
    Foundation[Documentation]
    
    Foundation --> F00[00-foundation/]
    F00 --> principles[principles.md]
    F00 --> organization[organization.md]
    F00 --> standards[standards/]
    
    Foundation --> F01[01-strategy/]
    F01 --> roadmap[roadmap.md]
    F01 --> vision[vision.md]
    F01 --> strategy[strategy.md]

    style Foundation fill:#9C27B0,stroke:#6A1B9A,stroke-width:3px,color:#fff
    style F00 fill:#BA68C8,stroke:#8E24AA,stroke-width:2px
    style F01 fill:#BA68C8,stroke:#8E24AA,stroke-width:2px
```

</details>

### Governance & Legal

<details>
<summary><strong>Policies & Compliance</strong></summary>

```mermaid
graph TB
    Governance[Governance & Legal]
    
    Governance --> F02[02-governance/]
    F02 --> framework[framework.md]
    F02 --> policies[policies/]
    F02 --> constitution[constitution.md]
    
    Governance --> F03[03-legal-and-compliance/]
    F03 --> gdpr[gdpr/]
    F03 --> ccpa[ccpa/]
    F03 --> compliance[compliance.md]

    style Governance fill:#9C27B0,stroke:#6A1B9A,stroke-width:3px,color:#fff
    style F02 fill:#AB47BC,stroke:#7B1FA2,stroke-width:2px
    style F03 fill:#AB47BC,stroke:#7B1FA2,stroke-width:2px
```

</details>

### Technical Documentation

<details>
<summary><strong>Architecture & Engineering</strong></summary>

```mermaid
graph TB
    Technical[Technical Docs]
    
    Technical --> F04[04-architecture/]
    F04 --> decisions[decisions/]
    F04 --> diagrams[diagrams/]
    F04 --> patterns[patterns/]
    
    Technical --> F05[05-engineering-and-devops/]
    F05 --> development[development/]
    F05 --> testing[testing.md]
    F05 --> languages[languages/]
    
    Technical --> F06[06-security-and-risk/]
    F06 --> policies[security-policies/]
    F06 --> risk[risk-register.md]
    F06 --> incidents[incidents/]

    style Technical fill:#9C27B0,stroke:#6A1B9A,stroke-width:3px,color:#fff
    style F04 fill:#CE93D8,stroke:#AB47BC,stroke-width:2px
    style F05 fill:#CE93D8,stroke:#AB47BC,stroke-width:2px
    style F06 fill:#CE93D8,stroke:#AB47BC,stroke-width:2px
```

</details>

### Product & Operations

<details>
<summary><strong>AI, Game Design & Operations</strong></summary>

```mermaid
graph TB
    Product[Product & Ops]
    
    Product --> F07[07-ai-and-simulation/]
    F07 --> governance[ai-governance.md]
    F07 --> models[models/]
    F07 --> ethics[ethics/]
    
    Product --> F08[08-game-design-and-mechanics/]
    F08 --> rules[rules/]
    F08 --> balance[balance/]
    F08 --> content[content/]
    
    Product --> F09[09-observability-and-ops/]
    F09 --> runbooks[runbooks/]
    F09 --> monitoring[monitoring/]
    F09 --> sre[sre/]

    style Product fill:#9C27B0,stroke:#6A1B9A,stroke-width:3px,color:#fff
    style F07 fill:#E1BEE7,stroke:#CE93D8,stroke-width:2px
    style F08 fill:#E1BEE7,stroke:#CE93D8,stroke-width:2px
    style F09 fill:#E1BEE7,stroke:#CE93D8,stroke-width:2px
```

</details>

### Meta Documentation

<details>
<summary><strong>Audit & Control</strong></summary>

```mermaid
graph TB
    Meta[Meta Docs]
    
    Meta --> Audit[audit-trail/]
    Audit --> logs[audit-logs/]
    Audit --> compliance[compliance-records/]
    
    Meta --> Control[document-control/]
    Control --> versions[versions/]
    Control --> review[review-process.md]

    style Meta fill:#9C27B0,stroke:#6A1B9A,stroke-width:3px,color:#fff
    style Audit fill:#F3E5F5,stroke:#E1BEE7,stroke-width:2px
    style Control fill:#F3E5F5,stroke:#E1BEE7,stroke-width:2px
```

</details>

</details>

---

<details>
<summary><h2>🏗️ Infrastructure</h2></summary>

### Cloud Resources

<details>
<summary><strong>Terraform & IaC</strong></summary>

```mermaid
graph TB
    Terraform[apps/infrastructure/terraform/]
    
    Terraform --> Modules[modules/]
    Modules --> vpc[vpc/]
    Modules --> eks[eks/]
    Modules --> rds[rds/]
    
    Terraform --> Environments[environments/]
    Environments --> dev[dev/]
    Environments --> staging[staging/]
    Environments --> prod[prod/]
    
    Terraform --> State[state/]
    State --> backend[backend.tf]
    State --> locks[locks/]

    style Terraform fill:#00BCD4,stroke:#00838F,stroke-width:3px,color:#fff
    style Modules fill:#26C6DA,stroke:#00ACC1,stroke-width:2px
    style Environments fill:#26C6DA,stroke:#00ACC1,stroke-width:2px
    style State fill:#26C6DA,stroke:#00ACC1,stroke-width:2px
```

</details>

### Container Orchestration

<details>
<summary><strong>Kubernetes & Docker</strong></summary>

```mermaid
graph TB
    K8s[apps/infrastructure/kubernetes/]
    
    K8s --> Base[base/]
    Base --> namespaces[namespaces/]
    Base --> services[services/]
    Base --> deployments[deployments/]
    
    K8s --> Helm[helm/]
    Helm --> charts[charts/]
    Helm --> values[values/]
    
    K8s --> Overlays[overlays/]
    Overlays --> devOverlay[dev/]
    Overlays --> prodOverlay[prod/]
    
    Docker[apps/infrastructure/docker/]
    Docker --> dockerfiles[Dockerfiles/]
    Docker --> compose[docker-compose/]

    style K8s fill:#00BCD4,stroke:#00838F,stroke-width:3px,color:#fff
    style Docker fill:#00BCD4,stroke:#00838F,stroke-width:3px,color:#fff
    style Base fill:#4DD0E1,stroke:#26C6DA,stroke-width:2px
    style Helm fill:#4DD0E1,stroke:#26C6DA,stroke-width:2px
    style Overlays fill:#4DD0E1,stroke:#26C6DA,stroke-width:2px
```

</details>

### Secrets & Configuration

<details>
<summary><strong>Environment Management</strong></summary>

```mermaid
graph TB
    Config[Configuration]
    
    Config --> Secrets[secrets/]
    Secrets --> encrypted[encrypted/]
    Secrets --> templates[templates/]
    
    Config --> Envs[environments/]
    Envs --> devEnv[dev.env]
    Envs --> stagingEnv[staging.env]
    Envs --> prodEnv[prod.env]

    style Config fill:#00BCD4,stroke:#00838F,stroke-width:3px,color:#fff
    style Secrets fill:#80DEEA,stroke:#4DD0E1,stroke-width:2px
    style Envs fill:#80DEEA,stroke:#4DD0E1,stroke-width:2px
```

</details>

</details>

---

<details>
<summary><h2>🔧 Scripts & Tools</h2></summary>

### Automation Scripts

<details>
<summary><strong>CI/CD & Migrations</strong></summary>

```mermaid
graph TB
    Scripts[scripts/]
    
    Scripts --> CI[ci/]
    CI --> build[build.sh]
    CI --> test[test.sh]
    CI --> deploy[deploy.sh]
    
    Scripts --> Migrations[migrations/]
    Migrations --> db[database/]
    Migrations --> data[data/]
    
    Scripts --> Utils[utilities/]
    Utils --> cleanup[cleanup-processes.sh]
    Utils --> optimize[optimize-workspace.sh]
    Utils --> monitor[perf-monitor.sh]

    style Scripts fill:#795548,stroke:#4E342E,stroke-width:3px,color:#fff
    style CI fill:#A1887F,stroke:#6D4C41,stroke-width:2px
    style Migrations fill:#A1887F,stroke:#6D4C41,stroke-width:2px
    style Utils fill:#A1887F,stroke:#6D4C41,stroke-width:2px
```

</details>

### Development Tools

<details>
<summary><strong>Tooling & Configuration</strong></summary>

```mermaid
graph TB
    Tools[tools/]
    
    Tools --> Config[config/]
    Config --> eslint[eslint/]
    Config --> prettier[prettier/]
    Config --> vitest[vitest/]
    
    Tools --> Scripts[scripts/]
    Scripts --> ai[ai/]
    Scripts --> test[test/]
    
    Tools --> Docker[docker/]
    Docker --> images[images/]
    Docker --> compose[compose/]

    style Tools fill:#795548,stroke:#4E342E,stroke-width:3px,color:#fff
    style Config fill:#BCAAA4,stroke:#A1887F,stroke-width:2px
    style Scripts fill:#BCAAA4,stroke:#A1887F,stroke-width:2px
    style Docker fill:#BCAAA4,stroke:#A1887F,stroke-width:2px
```

</details>

</details>

---

<details>
<summary><h2>🤖 AI Assets</h2></summary>

### Context & Knowledge

<details>
<summary><strong>AI Cache & Learning</strong></summary>

```mermaid
graph TB
    AIContext[AI Context]
    
    AIContext --> Cache[ai-cache/]
    Cache --> context[context-cache.json]
    Cache --> smart[smart-cache.json]
    Cache --> workspace[workspace-state.json]
    
    AIContext --> Knowledge[ai-knowledge/]
    Knowledge --> articles[articles/]
    Knowledge --> guides[guides/]
    Knowledge --> patterns[patterns/]
    
    AIContext --> Bundles[context-bundles/]
    Bundles --> full[full-context/]
    Bundles --> minimal[minimal/]

    style AIContext fill:#E91E63,stroke:#880E4F,stroke-width:3px,color:#fff
    style Cache fill:#F06292,stroke:#C2185B,stroke-width:2px
    style Knowledge fill:#F06292,stroke:#C2185B,stroke-width:2px
    style Bundles fill:#F06292,stroke:#C2185B,stroke-width:2px
```

</details>

### Tools & Metrics

<details>
<summary><strong>Prompts & Performance</strong></summary>

```mermaid
graph TB
    AITools[AI Tools]
    
    AITools --> Prompts[prompts/]
    Prompts --> templates[templates/]
    Prompts --> chains[chains/]
    Prompts --> examples[examples/]
    
    AITools --> Patterns[patterns/]
    Patterns --> code[code-patterns/]
    Patterns --> arch[architecture/]
    
    AITools --> Metrics[metrics/]
    Metrics --> performance[performance/]
    Metrics --> quality[quality/]
    
    AITools --> Governance[governance/]
    Governance --> rules[rules/]
    Governance --> policies[policies/]

    style AITools fill:#E91E63,stroke:#880E4F,stroke-width:3px,color:#fff
    style Prompts fill:#EC407A,stroke:#AD1457,stroke-width:2px
    style Patterns fill:#EC407A,stroke:#AD1457,stroke-width:2px
    style Metrics fill:#EC407A,stroke:#AD1457,stroke-width:2px
    style Governance fill:#EC407A,stroke:#AD1457,stroke-width:2px
```

</details>

</details>

---

## 📚 Additional Resources

<details>
<summary><h3>Data & Configuration</h3></summary>

### Runtime Data

```mermaid
graph TB
    Data[data/]
    
    Data --> Fixtures[fixtures/]
    Fixtures --> test[test-data/]
    Fixtures --> seed[seed-data/]
    
    Data --> Seeds[seeds/]
    Seeds --> dev[development/]
    Seeds --> staging[staging/]

    style Data fill:#607D8B,stroke:#37474F,stroke-width:3px,color:#fff
    style Fixtures fill:#78909C,stroke:#546E7A,stroke-width:2px
    style Seeds fill:#78909C,stroke:#546E7A,stroke-width:2px
```

### Configuration Files

```mermaid
graph TB
    Static[static/]
    
    Static --> env[environment.js]
    Static --> main[main.js]
    Static --> runtime[runtime.js]
    Static --> styles[styles.css]

    style Static fill:#607D8B,stroke:#37474F,stroke-width:3px,color:#fff
```

### Reports & Metrics

```mermaid
graph TB
    Reports[reports/]
    
    Reports --> coverage[coverage-ranked.json]
    Reports --> vitest[vitest-api-output.json]
    Reports --> logs[logs/]

    style Reports fill:#607D8B,stroke:#37474F,stroke-width:3px,color:#fff
```

</details>

---

## 🎨 Color Legend

- **🔵 Blue (#2196F3)** - Root containers and primary navigation
- **🟢 Green (#4CAF50)** - Applications and services
- **🟠 Orange (#FF9800)** - Libraries and utilities
- **🟣 Purple (#9C27B0)** - Documentation and governance
- **🔷 Cyan (#00BCD4)** - Infrastructure and DevOps
- **🟤 Brown (#795548)** - Scripts and tools
- **🔴 Pink (#E91E63)** - AI assets and models
- **🔘 Gray (#607D8B)** - Data and configuration

---

## 📖 How to Navigate

1. **Click section headers** to expand/collapse content
2. **Nested details** allow drilling down into subsections
3. **Mermaid diagrams** provide visual hierarchy
4. **Color coding** groups related components
5. **Breadth-first** organization for quick scanning

---

*Last Updated: November 7, 2025*
