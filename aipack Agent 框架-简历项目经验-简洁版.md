## aipack — 轻量级可扩展 TypeScript Agent 框架（开源）

**项目角色：** 独立设计与开发（npm 发布 `@aipack-ai/*`，v1.3.1）

**技术栈：** TypeScript、Node.js、pnpm Monorepo、自研 Tapable 插件系统、BM25/向量检索、MySQL、ClickHouse、Kafka、Redis、Prometheus、React

**项目背景：** 针对构建 AI Agent 应用时反复重写"模型调用循环、工具调度、上下文管理、权限审批"的问题，独立设计并实现零外部 Agent 框架依赖的 TypeScript 框架：以 Runtime 为内核、Extension/Transformer 插件生态为扩展点，配套 CLI 终端助手、可观测性全链路与内置 Eval 评测体系，以库形式可嵌入任意宿主应用。

**核心工作：**

1. **Agent 执行循环内核：** 自研 Runtime（不依赖 LangGraph/LangChain），实现"模型调用 → tool_calls → 工具执行 → 结果回填 → 再调用"完整循环，`run()` / `stream()` 双入口与两层流式事件模型；上下文溢出"检测 → 压缩 → 同回合重试"自动恢复闭环；同会话串行锁 + 存储级跨进程锁保证并发一致性。

2. **插件化架构与权限审批：** 自研 Tapable 钩子内核（12 个生命周期钩子）+ 5 个内置上下文 Transformer，按"配对组"整体丢弃 tool_call/tool_result 避免悬空调用 400；四档权限裁决 allow/deny/confirm/pending（deny-by-default fail-closed），由框架强制执行、工具无法绕过，审批单支持跨进程持久化与重启恢复。

3. **多模型接入层：** 内置 13 家模型提供商统一目录，全部 OpenAI 兼容提供商归并为 2 种协议实现；自研 SSE 解析与 tool_call 参数增量 JSON 解析，指数退避重试、错误分类，发送前预修复提供商兼容性问题。

4. **上下文工程：** ① 长期记忆：BM25 + 向量双路召回、归一化加权融合，done 钩子自动捕获入库；② 上下文压缩：双水位预算驱动 trim / summarize / truncate 策略管道，压不下去时发交接事件由宿主决策。

5. **Skills 技能系统：** 对齐 SKILL.md 开放规范，渐进式披露——System Prompt 仅注入名称 + 描述目录，全文经 skill 工具按需拉取，无 skill 时零注册零注入。

6. **多 Agent 编排：** AgentGraph 声明式节点 / 边编排（并行 fan-out、条件边、返工环防死循环），内置 Pipeline / Router / Supervisor / Debate / MapReduce 五种模式。

7. **MCP 双向打通：** 客户端把外部 MCP Server 工具包装为原生 Tool（stdio / Streamable HTTP / legacy SSE 三种传输、分页拉全、取消通知、多 Server 注册表）；服务端反向暴露为标准 MCP Server，供 Claude Desktop / Cursor 调用。

8. **可观测性与 Eval 评测：** 6 类埋点记录（TTFT 分段 / cache token / 成本核算、W3C traceparent 全链路），MySQL + ClickHouse 双库落盘、Kafka 削峰 + 死信队列收集服务，Prometheus 导出 + React Dashboard；Eval 提供 8 类声明式断言 + 规则评分器（零 LLM 成本）、mock 回放免 API Key 全量回归、baseline 门禁拦截回归卡 CI。

**项目成果：** 单仓 11 包 monorepo、核心 TypeScript 源码约 3 万行，npm 发布 v1.3.1（Changesets 管理），配套 Vite + React 文档站与 CLI 终端助手（REPL 20+ 斜杠命令、工作区沙箱）；13 家提供商 / 12 钩子 / 5 编排模式 / 3 种 MCP 传输 / 42 内置 Eval 用例；11 包 70+ 测试文件（node:test）保障质量。
