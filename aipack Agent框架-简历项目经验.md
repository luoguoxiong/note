# aipack TypeScript Agent 框架 —— 简历项目经验（精简版）

> 数字为示例占位，投递前请替换为真实数据。

## 项目：aipack — 轻量级 TypeScript Agent 框架（独立设计开发，从 0 到 1）

**项目描述**：零外部 Agent 框架依赖的开源框架（pnpm monorepo，10 个包发布 npm），内核提供 Runtime 调度、插件体系、会话持久化与框架级权限管控，插件化补齐记忆、压缩、MCP、多 Agent 编排、评测与可观测性，支持库嵌入与 CLI 交付。

**主要工作**：

- 自研"Runtime + Extension + Transformer"三段式内核：编排"任务图 → 上下文转换 → 模型调用 → 工具执行回填"循环，插件经 Tapable 钩子零侵入挂载，上下文按转换器链式处理（工具消息配对修复等），支持 run / stream 双入口与文件（原子写）/ 内存双会话存储。
- 统一 13+ 模型提供商（OpenAI / Anthropic / DeepSeek / Google 等）的目录与流式调用，经适配器一键接入内核；工具签名 TypeBox Schema 全类型约束、运行时校验。
- 跨会话长期记忆：capture → index → recall/inject → consolidate 闭环，BM25（零依赖、CJK 分词）+ 向量双路混合召回，sentinel 防跨轮注入累积，增量去重合并与低置信度条目修剪。
- 上下文压缩："策略管道 + 双水位预算"，Token 超高水位（0.80×有效窗口）依序执行 trim 无损裁剪 → summarize fork 摘要（map-reduce 分块）→ truncate 保底截断，压至低水位（0.40），每级后做工具消息配对校验、失败仅回滚该级；支持后台预压缩、KV cache 前缀保持、会话检查点与失败退避。
- 零运行时依赖自研 MCP 双向接入（JSON-RPC 2.0 + 协议子集）：外部 Server 工具包装为原生 Tool（stdio / HTTP / SSE、热刷新、协议容错），自有工具反向暴露给 Claude Desktop / Cursor；多 Agent 编排图可一键拉起为 MCP Server。
- 框架级安全：权限四档裁决（allow / deny / confirm / pending）先于工具执行、无法绕过，审批单持久化支持 CLI 跨进程审批；AgentGraph 支持并行 / 条件边 / 返工环，内置 Pipeline / Router / Supervisor / Debate / MapReduce 编排模式。
- Eval 评测（用例 → 评分器 → 报告）：mock 回放免 API Key 可跑 PR 级 CI，baseline 回归门禁、回归即非零退出码；可观测性 SDK 一行接入，MySQL / ClickHouse 双库 + Redis 聚合 + Prometheus 导出，支持 Kafka 平台化部署。

**技术栈**：TypeScript、Node.js、pnpm monorepo + Changesets、Tapable、TypeBox、JSON-RPC 2.0 / MCP、BM25 + 向量检索、MySQL / ClickHouse / Redis / Kafka、Prometheus、Vite + React

**项目成果**（示例占位）：

- 10 个包发布 npm，GitHub Star XXX；13 个可运行示例，4 个离线可跑
- 长对话压缩后 Token 成本降低 XX%；记忆混合检索命中率提升 XX%
- 核心包测试 XXX 用例全绿，Eval 门禁接入 CI，Agent 行为回归合入前拦截
