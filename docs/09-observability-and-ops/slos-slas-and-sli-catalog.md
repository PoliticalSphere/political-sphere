# SLOs, SLAs, and SLI Catalog

> **Service level objectives, agreements, and indicators for Political Sphere**

<div align="center">

| Classification | Version | Last Updated |      Owner       | Review Cycle |
| :------------: | :-----: | :----------: | :--------------: | :----------: |
|  🔒 Internal   | `0.2.0` |  2025-10-30  | Ops Council |   Quarterly  |

</div>

---

## 🎯 Objectives

- Define measurable standards for system reliability and performance.
- Establish clear expectations for users and internal teams.
- Enable data-driven improvements through objective metrics.

---

## 📊 Definitions

- **SLI (Service Level Indicator):** Quantitative measure of service performance.
- **SLO (Service Level Objective):** Target value for an SLI over a time period.
- **SLA (Service Level Agreement):** Commitment to users or stakeholders based on SLOs.

---

## 🚀 Service Level Objectives

### Availability SLOs

| Service | SLI | SLO | Measurement Window |
| ------- | --- | --- | ------------------ |
| **API** | Uptime | 99.9% | Rolling 30 days |
| **Frontend** | Uptime | 99.5% | Rolling 30 days |
| **Database** | Uptime | 99.95% | Rolling 30 days |
| **WebSocket** | Connection Success Rate | 99.8% | Rolling 7 days |

### Performance SLOs

| Service | SLI | SLO | Measurement Window |
| ------- | --- | --- | ------------------ |
| **API** | P95 Response Time | <250ms | Rolling 7 days |
| **Frontend** | First Contentful Paint | <2s | Rolling 7 days |
| **Database** | Query P95 Latency | <100ms | Rolling 7 days |
| **WebSocket** | Message Delivery Latency | <500ms | Rolling 7 days |

### Reliability SLOs

| Service | SLI | SLO | Measurement Window |
| ------- | --- | --- | ------------------ |
| **API** | Error Rate | <1% | Rolling 7 days |
| **Frontend** | JavaScript Error Rate | <0.5% | Rolling 7 days |
| **Database** | Failed Query Rate | <0.1% | Rolling 7 days |
| **AI Services** | Response Accuracy | >95% | Rolling 30 days |

---

## 🤝 Service Level Agreements

### User-Facing SLAs

- **Platform Availability:** 99.5% uptime, excluding scheduled maintenance.
- **Incident Response:** P0 incidents acknowledged within 15 minutes, resolved within 4 hours.
- **Data Retention:** User data retained for 7 years post-deletion request.
- **Support Response:** Community forum responses within 24 hours.

### Internal SLAs

- **Deployment Success:** 99% of deployments succeed without rollback.
- **Security Patching:** Critical vulnerabilities patched within 48 hours.
- **Backup Recovery:** Full system recovery within 4 hours from backup.

---

## 📈 Service Level Indicators

### Availability SLIs

- **Uptime:** Total time service is operational / total time.
- **Connection Success Rate:** Successful connections / total connection attempts.

### Performance SLIs

- **Response Time:** Time from request to response (P50, P95, P99).
- **Throughput:** Requests per second sustained.
- **Resource Utilization:** CPU, memory, disk usage percentages.

### Reliability SLIs

- **Error Rate:** Failed requests / total requests.
- **Incident Frequency:** Number of incidents per month.
- **Recovery Time:** Time to restore service after failure.

### Business SLIs

- **User Engagement:** Daily active users, session duration.
- **World Activity:** Active parliamentary worlds, concurrent users.
- **Content Quality:** Moderation accuracy, false positive rate.

---

## 📋 Measurement and Reporting

### Tools
- **Prometheus:** SLI collection and SLO evaluation.
- **Grafana:** SLO dashboards and burn-down charts.
- **Custom Scripts:** Business metric aggregation.

### Reporting
- **Weekly:** SLO status and error budgets.
- **Monthly:** Detailed performance reports.
- **Quarterly:** SLO review and adjustments.

### Error Budgets
- **Policy:** 0.1% error budget per service per month.
- **Actions:** Exceeding budget triggers incident review and mitigation planning.

---

## 📎 Related Documents

- [Dashboards and Alerts](dashboards-and-alerts.md)
- [Ops KPIs and Executive Reporting](ops-kpis-and-executive-reporting.md)
- [Change Failure Rate and Velocity Metrics](change-failure-rate-and-velocity-metrics.md)

SLOs ensure Political Sphere delivers reliable, high-performance service to users.
