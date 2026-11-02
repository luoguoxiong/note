# 物流智能理赔审核 Multi-Agent 系统

针对物流理赔材料类型多、业务数据分散、审核规则复杂、人工核验效率低等问题，构建基于多 Agent 协同的智能理赔审核系统：材料解析、运单核验、历史工单核验、规则审核、风险评估、报告生成拆分为独立 Agent，由 Supervisor 统一编排，实现理赔案件自动化初审与风险分流。

## 架构

```
 submit case
     │
     ▼
┌────────────────────────────────────────────────────────────────────┐
│  supervisor（LLM 编排 + 规则修正：按案件类型/金额动态选路径）         │
│      │ plan { enableHistory, extraChecks }                         │
│      ▼                                                             │
│  parse（材料解析 Agent：多模态 OCR 汇总抽取 + 交叉对账 → conflicts） │
│      │ fan-out（按计划）                                            │
│      ├──────────────┬─────────────────┐                            │
│      ▼              ▼                 │                            │
│  waybill         history              │  并行核验                   │
│  (MCP 工具)      (理赔/工单数据源)     │                            │
│      └──────┬───────┘                 │                            │
│             ▼ join                     │                            │
│  rules（确定性规则引擎 R001~R007）      │                            │
│             ▼                          │                            │
│  risk（LLM 风险分级 + 红线强制加严）    │                            │
│      │ high / manual / conflicts       │                            │
│      ▼                                 │                            │
│  approval ── interrupt() 挂起 ──► 人工审批（API: Command(resume)）   │
│      ▼                                 │                            │
│  report（结构化审核报告 + 证据引用）    │                            │
└────────────────────────────────────────┘
     │
     ▼  最终赔付/拒赔（与 Agent 流程隔离，需审批令牌 + 审计）
 decisions
```

技术栈：TypeScript · Node.js ≥20 · LangGraph.js 1.x（StateGraph / Annotation / interrupt / Command / PostgresSaver）· LangChain（ChatDeepSeek 结构化 JSON 输出）· MCP（@modelcontextprotocol/sdk stdio server + @langchain/mcp-adapters）· PostgreSQL（业务表 + checkpoint）· Redis（幂等锁，可选降级）· Express + SSE。

## 快速开始

```bash
# 1. 基础设施（PostgreSQL :5434 / Redis :6391，避让本机其他实例）
docker compose up -d

# 2. 建表 + 灌入 mock 业务数据（运单/理赔历史/工单）+ checkpoint 迁移
npm run seed

# 3. 一键演示（自动拉起服务 :3015，三个案件全流程 + 审批 + 幂等/权限演示）
npm run demo

# 4. 审核台（:3005）
npm start    # 浏览器打开 http://127.0.0.1:3005
```

> Node 用 v20+（本机 nvm v22：`~/.nvm/versions/node/v22.19.0/bin/node`）。评测：`npm run eval [rules|e2e|approval|restart|permission|mcp|all]`，报告落盘 `data/eval-report-*.json`。

## 核心设计

### 多 Agent 编排（Supervisor 模式）
- `supervisor` 节点用 LLM 生成执行计划（是否并行调度历史核验、额外检查项），确定性规则修正（大额案件强制历史核验），LLM 不可用时规则兜底——**LLM 只能加严、不能放宽**。
- 材料解析后按计划 **fan-out** 运单核验与历史工单核验，完成后 **join** 进规则审核（LangGraph 超步机制天然支持并行）。
- 案件类型动态路径：生鲜 → 冷链温控检查；数码 → 发票核验；超阈值金额 → 历史核验 + 人工复核。

### 多源信息并行核验
- 运单核验 Agent 经 **MCP 协议**（stdio server `src/mcp/waybill-server.ts`）调用"运单系统"工具（轨迹/签收/保价、生鲜温控事件），MCP 不可用自动降级直连数据源。
- 历史工单核验 Agent 查询理赔历史 + 运单工单两个数据源，输出风险标志（高频理赔/重复理赔/未结投诉）。
- 材料解析 Agent 汇总多模态 OCR 抽取结果（demo 用 mock-vision-ocr 模拟，生产替换真实多模态模型），交叉对账产出**结构化冲突**（申报 vs 发票金额、单号一致性、破损件数）。

### 审核规则与风险评估
- 规则引擎 `src/graph/rules.ts` 为**确定性纯函数**（可独立测试）：R001 材料完整性 / R002 理赔时效 / R003 金额约束 / R004 生鲜温控 / R005 禁运品类 / R006 重复与高频理赔 / R007 核验完整性。
- 风险评估 Agent 综合规则命中、核验异常、材料冲突给出风险分级；命中规则红线强制 high + 人工复核，冲突案件至少 medium。

### 工作流状态与容错
- Checkpoint 持久化：PostgresSaver（复用业务连接池，`setup()` 幂等迁移），每个节点完成即落库。
- **重启恢复（两级）**：① interrupt 挂起的案件（waiting_approval）重启后经人工审批 `Command({resume})` 恢复；② 执行中被强杀的案件（parsing/verifying 等中间态）在服务启动时被自动扫描，经 `graph.stream(null)` 从 checkpoint 断点续跑——已完成节点不重跑，幂等锁保证进行中的核验不重复调用业务接口（eval restart 阶段两个用例分别验证）。
- LLM 调用统一 `withRetry`（指数退避）+ 超时；每个 Agent 失败降级不中断流程（规则兜底结果，R007 记"证据不足"）。
- 幂等：Redis SETNX 包装核验工具调用（同案件同运单不重复调用业务接口）；审批单 pending 唯一索引；进程内并发闸防同案件重复执行图。

### 可观测性
- 所有 Agent 动作落 `agent_runs`（agent/action/duration/tokens/status/error/detail），`GET /api/cases/:id/trace` 链路追踪；SSE 实时推送执行进度；报告归档 `data/reports/<caseNo>.md`。

### 权限与人工审批
- 高风险/证据不足/结果冲突案件 → `interrupt()` 挂起等待人工审批（审核台或 `POST /api/cases/:id/approve`）。
- 最终赔付/拒赔是独立高影响操作：`POST /api/cases/:id/decision` 需 `X-Approver-Token`，写 `decisions` 决策表 + 审计，与 Agent 自动分析完全隔离。

## API

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/cases` | 提交案件（templateKey），后台异步执行工作流 |
| GET | `/api/cases` / `/api/cases/:id` | 案件列表 / 详情（报告、审批单、决策） |
| GET | `/api/cases/:id/trace` | 执行轨迹（Agent 链路追踪） |
| GET | `/api/cases/:id/events` | SSE 实时进度 |
| POST | `/api/cases/:id/approve` | 人工审批（恢复 interrupt 挂起流程） |
| POST | `/api/cases/:id/decision` | 最终赔付/拒赔（需 `X-Approver-Token`） |
| GET | `/api/templates` | 演示案件模板 |

## 演示模板

| key | 场景 | 预期 |
|---|---|---|
| fresh-normal | 生鲜破损材料齐全 | 低风险自动通过 → 赔付 |
| fresh-nocold | 生鲜缺温控记录 | warn → 人工复核 |
| digital-over | 申报超保价 | R003 红线 → 审批（降额） |
| fresh-repeat | 90 天 3 次理赔 + 未结工单 | 高风险 → 审批 |
| general-late | 签收 18 天后申请 | R002 红线 → 审批（拒赔） |
| digital-missing | 缺发票 | R001 红线 → 审批（补材料） |
| general-conflict | 申报与发票冲突 | 冲突 → 审批 |
| general-normal | 正常普货破损 | 低风险自动通过 |
