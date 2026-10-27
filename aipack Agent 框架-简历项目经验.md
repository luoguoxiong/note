## aipack — 轻量级可扩展 TypeScript Agent 框架（开源）

**项目角色：** 独立设计与开发（开源，npm 发布 `@aipack-ai/*`，v1.3.1）

**技术栈：** TypeScript、Node.js、pnpm Monorepo、自研 Tapable 插件系统、BM25/向量检索、tsup、MySQL、ClickHouse、Kafka、Redis、Prometheus、React + ECharts、Docker Compose、Changesets

**项目背景：** 针对构建 AI Agent 应用时反复重写"模型调用循环、工具调度、上下文管理、权限审批"的问题，独立设计并实现一个零外部 Agent 框架依赖的 TypeScript Agent 框架：以 Runtime 为内核、Extension/Transformer 插件生态为扩展点，配套 CLI 终端助手、可观测性全链路与内置 Eval 评测体系，框架以库形式可嵌入任意宿主应用。

**核心工作：**

1. **框架内核与 Agent 执行循环：** 自研 Agent Runtime（不依赖 LangGraph/LangChain），按 SessionStore / SessionPersistence / Telemetry / ToolExecutor / ContextCompactor / ModelTurnRunner / RunLoops 七个职责模块组织；提供 `run()` / `stream()` 双入口，实现"模型调用 → tool_calls → 工具执行 → 结果回填 → 再调用"的完整 Agent 循环，`maxTurns` 控制执行轮次；模型与工具消息逐轮实时持久化，同会话串行锁 + 存储级跨进程锁保证并发一致性；实现上下文溢出自动恢复闭环（五类溢出模式检测 → 压缩历史 → 同回合重试且不消耗轮次）；流式输出采用两层事件模型（模型层 StreamEvent 协议归一 + 运行层 text / tool_start / tool_end / done 等 ResultChunk）。

2. **插件化架构（Extension + Transformer）：** 自研 Tapable 钩子内核（SyncHook / AsyncSeriesHook / AsyncSeriesWaterfallHook / HookMap，支持 stage 排序），提供 12 个生命周期钩子（beforeRun / beforeModelCall / beforeToolCall / afterToolCall / done / failed 等），插件经 `apply()` 声明式挂载，单点失败按 `TapFailurePolicy`（log / silent / throw）处理并可接入遥测；设计数组顺序链式上下文转换器（Transformer）体系，内置 SystemMessageCleaner / Truncation / TokenBudget / ToolPairing / StateSnapshot 5 个转换器，按"配对组"整体丢弃（tool_call 与 tool_result 不拆散），避免悬空工具调用导致模型请求 400。

3. **框架级权限审批（Human-in-the-loop）：** 设计四档权限裁决 allow / deny / confirm / pending，deny-by-default fail-closed；裁决由框架在工具执行前强制执行，工具自身无法绕过，且审批等待不占用工具执行超时；ApprovalManager 审批单支持登记 / 等待 / 结算 / 取消及超时与中止自动结算，`restore()` 在进程重启后恢复"孤儿"审批单；FileApprovalStore 以 temp+rename 原子写持久化未决审批单、JSONL 追加审计流水，配合跨进程文件锁（O_EXCL 独占创建、kill(pid,0) 存活探测、token 归属校验防误删）。

4. **多模型接入层：** 内置 13 家模型提供商（OpenAI / DeepSeek / Anthropic / Google / Moonshot 等）统一目录，通过 `api: openai-completions | anthropic-messages` 两个字段将全部 OpenAI 兼容提供商归并到同一协议实现，模型条目统一上下文窗口 / 推理 / 多模态能力元数据；自研 SSE 解析与 tool_call 参数增量 JSON 解析，凭证三级解析（注入 → 环境变量 → 自定义 resolver），指数退避重试、逐次尝试（per-attempt）上报与错误分类，发送前预修复提供商兼容性问题（孤立 tool_call 合成结果、DeepSeek 空 assistant 桥接等）。

5. **上下文工程三件套：** ① 长期记忆插件：BM25（CJK 相邻两字 bigram 分词、按查询理论满分 Σidf 归一化）+ 向量双路独立召回，min-max 归一化加权融合；done 钩子自动捕获入库，sentinel 标记注入并逐轮剥离防污染，增量候选窗口合并（避免全库 O(N²) 两两比较，0.85 相似度阈值、先存后删保原子）。② 上下文压缩插件：双水位预算（0.70 预压缩 / 0.80 触发 / 0.40 目标，高低水位迟滞防反复触发）驱动 trim / summarize / truncate 策略管道——trim 保 KV-cache 前缀的 tail→head 无损裁剪、summarize 分块 map-reduce 摘要与后台预压缩、truncate 不动点迭代求"不可丢集合"防悬空 tool_call；压不下去时发 `ContextExhaustedEvent` 携带交接文档，会话检查点与交接由宿主决策。③ Skills 插件：对齐 SKILL.md 开放规范，渐进式披露（System Prompt 仅注入名称 + 描述目录，全文经 skill 工具按需拉取），无 skill 时零注册零注入。

6. **多 Agent 编排与 MCP 双向打通：** AgentGraph 声明式节点 / 边模型（依赖、输入输出映射、retry / 超时），执行引擎支持并行 fan-out（concurrency 限流）、条件边、返工环（`maxVisitsPerNode` 防死循环安全阀）；内置 Pipeline / Router / Supervisor（依赖拓扑分层调度）/ Debate（收敛条件提前终止）/ MapReduce 五种编排模式；MCP 双向接入——客户端把外部 MCP Server 工具包装为原生 Tool（stdio / Streamable HTTP / legacy SSE 三种传输、分页拉全、取消通知、多 Server 注册表），服务端把框架工具反向暴露为标准 MCP Server（stdio + Streamable HTTP，AsyncLocalStorage 路由多 session 出站请求），MCPBridge 可将任意编排图发布为 MCP 工具供 Claude Desktop / Cursor 调用。

7. **可观测性全链路与 Eval 评测：** 埋点 SDK 覆盖 6 类记录（Run / Span / ToolCall / Permission / Event / Retry），TTFT / active / queued 延迟分段、cache token 与成本核算、W3C traceparent 链路打通，定时 + 阈值批量上报、失败本地缓存断点补报、内置 PII 脱敏与采样策略；收集服务采用 MySQL 业务库 + ClickHouse 监控库双库落盘，Kafka 削峰 + 独立 ingest worker + 死信队列，聚合器三档（memory / redis / hybrid），提供 Prometheus `/metrics/prometheus` 导出、错误归因下钻与线上 trace 回流生成 EvalCase；React + ECharts Dashboard（KPI 卡、趋势图、Trace 甘特图），并以 Extension 形式一键接入 Langfuse；Eval 体系提供 8 类声明式断言 + 8 个规则评分器（零 LLM 成本）+ mock fixture 回放（免 API Key 全量回归）+ baseline 回归门禁（2% 容差、非零退出码卡 CI），内置 42 用例 × 4 套件。

**项目成果：**

- **开源交付：** 单仓 11 包 monorepo（agent / cli / memory / compression / skills / multi-agent / mcp / observability / observability-server / eval / agent-langfuse），核心 TypeScript 源码约 3 万行；以 `@aipack-ai/*` 发布至 npm（v1.3.1），Changesets 管理版本与 CHANGELOG；配套 Vite + React 文档网站（Netlify 部署）与 CLI 终端助手（REPL 20+ 斜杠命令、Tab 补全、管道 stdin、内置文件工具工作区沙箱防符号链接逃逸）。
- **功能规模：** 13 家提供商 / 2 种协议归一、12 个生命周期钩子、5 个内置 Transformer、四档权限裁决 + 审批单跨进程恢复、5 种多 Agent 编排模式、3 种 MCP 传输、6 类可观测记录、8 类断言与 10 个评分器、42 个内置 Eval 用例。
- **质量保障：** 11 包共 70+ 测试文件（node:test），其中 agent 包 24 个测试文件、约 174 个 describe 覆盖运行时全链路 / 权限审批 / 跨进程会话锁 / 压缩与溢出恢复；Eval mock 模式免 API Key 即可全量回归，baseline 门禁拦截套件级性能回归。
