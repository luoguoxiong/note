# 跨越速运智能客服 Agent — 面试必问题清单

> 配套文档：《物流智能客服 Agent-简历项目经验.md》，代码位于 `project/RAG-ai/logistics-cs-demo`。
> 标注：⭐⭐⭐ 必问/深挖题；⭐⭐ 高频题；⭐ 可能追问。
> 每题给出"参考答案要点"，全部对应真实代码实现，可直接背。

---

## 0. 开场题（几乎每场面试第一问）

### 0.1 ⭐⭐⭐ 用两分钟介绍一下这个项目，你在其中的角色？

**要点（STAR 结构）：**
- 背景：物流场景客服（查运单 / 运费时效 / 网点 / 寄递政策），人工客服成本高、FAQ 机器人答不了多轮组合问题，所以做一个能"自主调工具、缺参会挂起、有长期记忆、能无缝转人工"的 Agent。
- 角色：独立设计开发（个人项目，要说清楚是个人项目避免被当成团队活）。
- 架构一句话：Node.js + Express 做服务层，LangGraph `StateGraph(agent ⇄ tools)` 编排 ReAct 循环，DeepSeek 做决策模型，PostgreSQL 承担对话历史 / 长期记忆 / 人工会话状态 / 任务队列四类持久化，双通道 SSE 做实时交互。
- 成果收口：六阶段自动化评测，工具选择 100%、缺参补全 100%、Recall@8 100%、10 并发 P95 2.66s、5 轮进程重启恢复 100%。

### 0.2 ⭐⭐⭐ 画一下整体架构 / 一次用户提问的完整链路？

**要点：**
1. 前端 → Express（POST /api/chat，SSE 响应流）。
2. 先走规则层：显式转人工正则直通 → `detectCityIntent` 规则快速路径（明确城市+明确意图时跳过 LLM 意图判断，直接预填参数）→ 都不命中才进 Agent。
3. 进图前组装上下文：PG 拉最近 20 条历史 + Top 8 长期记忆注入 system。
4. LangGraph：agent 节点（LLM bindTools 决策）→ 有 tool_calls 走 ToolNode → 结果回 agent → 直到无 tool_calls 输出答案；工具内部可 `interrupt()` 挂起整张图等补参。
5. 全程 SSE 事件流：`status`（思考/调工具徽章）、`delta`（token 流）、`memory_used`（记忆命中）、槽位弹窗事件。
6. 回合结束后异步入队记忆提取任务（落库，不阻塞回复流）。

---

## 1. Agent 编排与工具调用（LangGraph）

### 1.1 ⭐⭐⭐ 为什么用 LangGraph，而不是自己手写 ReAct 循环？

**要点：**
- 手写循环的问题：中断/恢复（`interrupt` + `Command({resume})`）、流式 token 分发、递归上限、状态合并这些横切能力都要自己造。
- LangGraph 给的：`StateGraph` 声明式编排、`ToolNode`/`toolsCondition` 开箱即用、checkpointer 天然支持断点续跑、`streamMode` 一次拿到节点更新和 token 增量。
- 诚实补充：图的形状其实很简单（agent ⇄ tools 两节点），价值主要在**中断恢复和流式**这两块，这是选型的真实理由。

### 1.2 ⭐⭐⭐ 图的具体结构？状态怎么定义？轮次怎么限制？

**要点：**
- 两节点：`agent`（LLM 决策，有 tool_calls 交 `ToolNode`，否则 END）+ `tools`；`toolsCondition` 条件边 + `tools→agent` 回边。
- 状态只有一个 `messages`，用官方 `messagesStateReducer` 做增量合并（append + 按 id 去重）。
- `recursionLimit: 12`：每个工具轮次消耗 2 个 super-step（agent→tools），约等于 4~5 轮工具调用；`GraphRecursionError` 被 catch 后输出收口话术（"先整理到这里，可追问更具体的问题"），避免前端卡在"思考中"。
- 加分点：说得出"为什么是 12"——按 super-step 而不是对话轮次计数。

### 1.3 ⭐⭐⭐ 工具是怎么定义和绑定的？为什么每轮对话都重新 buildTools？

**要点：**
- 4 个业务工具（query_shipment / query_freight / query_knowledge / query_branches），zod 定义 schema，`.describe()` 写清"什么时候该调/不该调"（如 query_shipment：仅当用户提供了运单号）。
- 用 `tool()` 包装，统一做三件事：SSE 状态徽章（tool_N 调用中/完成）、异常转 JSON error（工具失败不炸图）、interrupt 透传（`isGraphInterrupt` 识别后原样抛出，不当成工具失败）。
- 每轮 buildTools 是因为工具是**会话级闭包**：要捕获 `sessionId/userId/send/originalMessage`，图以会话为粒度组装，成本只是对象创建。

### 1.4 ⭐⭐ 怎么保证"该调的调、不该调的不调"？（工具准确率 100% 怎么来的）

**要点：**
- 三层手段：① 工具 description 明确写调用条件和反例；② system prompt 约束（缺运单号不许编造、先抽参数再调）；③ 参数 schema 用 zod optional，"没说就不传"，缺参交给 interrupt 而不是让 LLM 硬编。
- 评测保障：24 条话术 × 6 类意图（含一问多工具、免工具闲聊、"20 斤→10kg"单位换算、缺运单号不调工具等边界），`npm run eval tools` 一键回归。

### 1.5 ⭐ 一问多工具怎么处理？多轮上下文怎么继承？

**要点：**
- 多工具：LLM 单次可返回多个 tool_calls，`ToolNode` 并行执行，结果各自回填 messages，agent 汇总后作答（如"杭州到北京多少钱+那边有没有网点"）。
- 上下文：图内靠 `messagesStateReducer` 增量合并；**跨轮/跨重启靠 PostgreSQL**——历史以 PG 为准每轮重新注入，图状态只是"单轮内"的执行状态。

---

## 2. 工作流中断与恢复（最大考点）

### 2.1 ⭐⭐⭐ 缺参补全为什么不用"LLM 追问一句"的方式，而要用图内 interrupt + 弹窗？

**要点（设计权衡题，必准备好）：**
- LLM 追问的问题：① 答案要再过一遍 LLM 抽取，多一轮调用、可能抽错；② 追问后是"新一轮对话"，上一轮工具的执行状态（已查到的 origin、weight）全丢了；③ 纯文本交互没法给结构化选项。
- interrupt 方案：工具内部发现缺参直接把**整张图挂起**，前端拿到结构化 payload（intent/missing/preset）渲染地址选择弹窗，用户点选后 `Command({ resume })` 从断点续跑，工具从 `interrupt()` 的返回值直接拿到选择，**已填参数不重算、LLM 不重跑**。
- 一句话总结：把"多轮对话式补参"变成"一次结构化表单"，省 token、零抽取误差、保留执行现场。

### 2.2 ⭐⭐⭐ interrupt 的底层机制讲一下？续跑时 LLM 的 tool_calls 参数还是缺的，为什么不会死循环？

**要点（代码级，最能拉开差距）：**
- 工具内 `interrupt(payload)` 抛出特殊中断信号 → LangGraph 捕获后把当前 super-step 的状态存进 checkpointer（按 thread_id），stream 的 updates 通道给出 `__interrupt__`，value 即挂起 payload → 进程可以停在这里。
- 续跑：`graph.stream(new Command({ resume: picked }), { thread_id })` → LangGraph 从断点恢复，**不重跑 agent 节点**，直接重放 tools 节点里那次工具调用，`interrupt()` 第二次执行不再抛异常而是**返回 resume 的值**——所以补的参数是经 interrupt 返回值注入的，根本不出现在工具入参 JSON 里，也就不存在"LLM 又发一遍缺参调用"的问题。
- 因此续跑时工具闭包里 `originalMessage`、已抽到的 preset（origin/weight）都还在。

### 2.3 ⭐⭐⭐ checkpointer 用的什么？为什么用 MemorySaver 就够了？服务重启时挂起的弹窗怎么办？

**要点（诚实 + 有演进方案）：**
- 用 MemorySaver + 每轮对话一个 thread_id：中断状态的生命周期是"本次提问缺参数"，短生命周期（10 分钟 TTL 清理 `releaseThread`，新消息到达即作废旧 thread）。
- 对话历史不依赖 checkpointer（PG 为准），所以进程重启丢掉的只是"一个还没补参数的弹窗"，代价可接受。
- 演进：真要跨重启恢复，换 `PostgresSaver` 即可，接口不变——说得出这个替换路径是加分项。

### 2.4 ⭐⭐⭐ 规则快速路径（detectCityIntent）是干嘛的？为什么要规则 + 图内 interrupt 两条路？

**要点（含踩坑修复，面试官爱听）：**
- 规则路：消息里同时命中"意图词 + 明确城市"时（如"从杭州寄北京多少钱"），不进图挂起，直接预填参数发起对话，快且省一次中断交互。
- 真实踩坑（评测发现并修复的两类误伤）：① "保价怎么收费"——含城市词"收费"里的运费意图词被误判弹地址窗 → 让政策咨询正则 `KNOWLEDGE_INTENT_RE` 优先于运费判断；② "浙江有哪些网点"——省份名不算城市 → `PROVINCE_LIST` 视为地点明确，交给 LLM 直接调工具。
- 结论：规则路只服务"高置信"场景，兜底仍是图内 interrupt，两条路互补。

### 2.5 ⭐ 挂起期间用户发了一条新消息怎么处理？

**要点：**
- 新请求失效机制：新消息到达即作废旧 thread（deleteThread + 清 pendingSlots），按新消息重新走完整链路；10 分钟 TTL 兜底清理。
- 回答思路：中断状态是"短生命周期 + 可随时作废"的，不追求跨请求保真。

---

## 3. 长期记忆系统

### 3.1 ⭐⭐⭐ 双层记忆是什么？为什么分两层？

**要点：**
- L1 `memory_summaries`：会话摘要（情景记忆）——跨会话"上次聊到哪"；L2 `memory_facts`：用户画像事实（语义记忆）——"常用寄出地=杭州、偏好经济档"。
- 分层理由：摘要粒度粗、时效短、容量小（20 条）；事实粒度细、可结构化检索、可做置信度和 TTL，两者召回方式与生命周期都不同。
- 召回：Top 8 相关事实 + 摘要注入 system prompt；另外**工具参数预填**（query_freight 缺 origin 时用记忆里的常用寄出城市兜底，命中后 `bumpFact` 加 hits/confidence）。

### 3.2 ⭐⭐⭐ 记忆提取为什么是异步的？冲突怎么消解？怎么防止覆盖丢数据？

**要点（三连问的完整答案）：**
- 异步：回合结束只做入队（落库），后台 worker 消费才调 LLM 提取——记忆提取不阻塞回复链路（首 Token 时延不被记忆拖累）。
- 冲突消解：LLM 基于已有事实判断"新增/更新/忽略"；更新时新值写 active 行，旧值带时间戳归档进 `history` 版本链（可追溯"纠正更新"）。
- 防覆盖：见 4.1——同用户读改写全程 advisory lock 串行化 + 单事务 diff 落盘。

### 3.3 ⭐⭐ 记忆不会无限膨胀吧？容量/TTL/遗忘怎么做？

**要点：**
- 容量：每用户 active 事实 100 条、摘要 20 条，超限按 updatedAt/ts 淘汰最旧。
- TTL：事实带 `expiresAt`，过期失效；提取走**白名单 8 个 type.key 组合**（如 attribute.origin_city、preference.price_tier），不收开放式垃圾信息。
- 主动遗忘：用户明确说"别记这个"可删除；低置信/低 hits 衰减。
- 为什么白名单：受控 schema 才能做结构化召回和预填，泛化提取会把记忆库变成噪声池。

### 3.4 ⭐⭐ Recall@8 100% 是怎么测的？

**要点：**
- 3 组用户画像共 15 条事实，跨会话用探测话术验证命中；指标定义为"目标事实是否出现在注入 prompt 的 Top 8 里"；`npm run eval recall` 一键复跑，数据带 `eval-<RUN>-` 前缀隔离、自动清理，不污染生产数据。

---

## 4. 持久化与任务可靠性（后端深度题）

### 4.1 ⭐⭐⭐ 为什么从 JSON 文件迁移到 PostgreSQL？多实例并发下怎么保证记忆一致性？

**要点（简历第 4 条的核心）：**
- JSON 文件整读整写：多实例下互相覆盖、崩溃写坏文件、无法做原子并发控制。
- 现方案 `withUserLock`：`BEGIN` → `pg_advisory_xact_lock(hashtextextended(user_id))`（哈希做锁键，用户无行也能锁）→ 事务内读全量 → 策略函数只改内存态 → 提交前按字段签名 diff，精确生成 INSERT/UPDATE/DELETE → `COMMIT`，异常自动回滚。
- 细节加分：高频计数 `bumpFact`（hits+1）走**原子 SQL 更新**，不进读-改-写路径，避免锁竞争。

### 4.2 ⭐⭐⭐ 记忆任务队列是怎么实现的？为什么不用 setTimeout/Redis/BullMQ？

**要点：**
- 旧方案"进程内 setTimeout + Map"三个生产问题：重启丢任务、去抖靠内存、失败无重试。
- PG 表实现：入队 `ON CONFLICT (dedupe_key) WHERE status='pending'`（**部分唯一索引**）——同一去重键只允许一个 pending，窗口内新对话合并 payload（jsonb `||`）并推迟 `run_at`，去抖天然持久化。
- 认领：`FOR UPDATE SKIP LOCKED` 事务内置 running，多实例不会重复消费；失败指数退避 5s→10s、最多 3 次后置 dead（死信留表可排查）；同用户忙时 3s 后重试。
- 为什么不用 Redis/BullMQ：不想为 demo 引第二个存储，PG 一套底座同时解决"数据 + 队列 + 锁"，运维面最小；量大了再换专业 MQ（说得出边界）。

### 4.3 ⭐⭐ advisory lock 有什么坑？你踩过吗？

**要点（真实踩坑，强加分）：**
- 锁键命名空间：worker 持有 `pg_try_advisory_lock('memjob:'+userId)`（会话级）后，任务内又要调 `withUserLock` 的 `pg_advisory_xact_lock(userId)`——若共用同一键会**自己锁死自己**（advisory lock 对同会话可重入，但 xact 锁在等待另一个会话持有者时死等）。所以 worker 锁键统一加 `memjob:` 前缀分命名空间。
- 其他要点：xact 锁随事务自动释放（无泄漏），session 锁要显式 unlock；锁粒度是用户级（不是全局），吞吐不受影响。

### 4.4 ⭐⭐ 一共有哪些表？为什么对话历史以 PG 为准而不是 LangGraph checkpointer？

**要点：**
- 六表：对话消息表（会话历史）、chat_sessions（含 human_* 人工会话字段）、memory_facts、memory_summaries、memory_jobs、support_human（客服表）。
- 历史以 PG 为准：checkpointer 是"单轮图执行状态"（含 tool_calls 中间态），语义是执行快照不是对话记录；PG 历史每轮重新注入、跨重启稳定、可直接做裁剪（最近 20 条）与摘要。

---

## 5. 转人工与人工协同

### 5.1 ⭐⭐⭐ 转人工怎么触发的？为什么 transfer_human 不做成绑定工具？

**要点（三保险设计）：**
- 保险 1：`isExplicitTransferRequest` 显式规则直通（"转人工""我要投诉"等归一化正则）——不经过 LLM，零延迟零漏判。
- 保险 2：system prompt 强约束（识别到强烈不满/投诉诉求时输出固定转接话术）。
- 保险 3：`claimsTransferred` 正则兜底——LLM 回复里若出现"正在为您转接"却没真触发转接，强制 `startHumanSession`，防"嘴上转了系统没转"。
- 不绑工具的原因：工具调用不可控（可能误调/绕过），转人工是**业务规则行为**不是模型决策，且显式诉求必须绕过模型直达；LLM 层只负责隐式场景。

### 5.2 ⭐⭐⭐ 服务重启时正在排队/接入中的人工会话怎么恢复？（你简历写了 100% 恢复，怎么做的）

**要点（惰性恢复，必背）：**
- 状态每次变更都写 `chat_sessions.human_*` 字段；定时器**不持久化**（恢复后按需重建）。
- 惰性恢复：重启后内存 Map 为空，**首次 `getSession(sessionId)` 访问才从 PG 恢复**——active 直接可收发；queued 按 `joinAt` 续排定时器，**已过期的立即补推接入**。
- 为什么惰性而不是启动时全量恢复：会话量大时启动慢、大量会话其实已死（24h TTL 清残留）；访问时才恢复，代价最小且逻辑简单。
- 验证方式：5 轮 SIGTERM 故障注入 ×（排队中/接入中）两种场景 + 对话历史与后续对话恢复，`npm run eval restart`。

---

## 6. SSE 实时通信

### 6.1 ⭐⭐⭐ 为什么用 SSE 不用 WebSocket？双通道指什么？

**要点：**
- 场景是"服务端 → 客户端单向流"，SSE 足够：基于 HTTP 免升级、自动重连、浏览器原生 EventSource、代理/网关友好；双向诉求只有"补参选择/用户发言"，用普通 POST 即可，不值得为它引入 WS 的连接管理和运维成本。
- 双通道：① Agent 对话通道——`status`（思考/工具徽章）、`delta`（token 流）、`memory_used`（记忆命中）、槽位弹窗事件，全链路结构化事件可观测；② 客服协同通道——排队/接入/消息互转/离线补偿。
- 流式实现：`streamMode: ['updates','messages']`，messages 通道按 `meta.langgraph_node` 过滤**只透传 agent 节点的 token**，工具结果不混进回答。

### 6.2 ⭐ 断线了怎么办？离线消息怎么补偿？

**要点：**
- 人工会话消息落库，重连后按游标补拉未读；客服协同的状态变化（接入/结束）也以 DB 为准推送，SSE 只负责"通知+流"，状态真源在 PG——重启/断线都不丢。

---

## 7. 评测与性能（简历成果的防身题）

### 7.1 ⭐⭐⭐ 首 Token P95 2.66s，这个数怎么来的？做了哪些优化？

**要点（先讲优化再报数，显得数据可信）：**
- 构成：网络 + LLM 首 token 占大头；服务端可优化的四板斧：① 记忆提取/摘要**异步队列化**（不阻塞回复链路）；② 去抖窗口合并 LLM 调用（省 token）；③ 上下文裁剪——最近 20 条历史 + Top 8 记忆，prompt 长度有上界；④ 规则快速路径命中时跳过部分 LLM 环节。
- 方法：10 并发 50 请求压测（`npm run eval load`），P50 2.14s / P95 2.66s，吞吐约 175 req/min，成功率 100%。
- 诚实点：瓶颈在 DeepSeek 推理时延，服务端开销占比小——能定位瓶颈比数字本身更加分。

### 7.2 ⭐⭐ 六阶段评测分别测什么？发现过什么问题？

**要点：**
- `npm run eval tools|slots|memory|recall|load|restart`：工具选择/参数组装 → 缺参补全 → 记忆写入 → 记忆召回 → 并发压测 → 重启故障恢复。
- 真实收益案例（一定要讲）：① 规则误伤（"保价怎么收费"误弹窗、"浙江有哪些网点"误判）由评测暴露并修复回归；② 状态恢复缺陷（重启丢人工会话）由 restart 阶段暴露 → 持久化 + 惰性恢复方案落地。
- 工程化：数据 `eval-<RUN>-` 前缀隔离自动清理、报告落盘 `data/eval-*.json`、可一键复跑——"评测发现的 bug 能定位、修复、回归验证"是这句话的落点。

### 7.3 ⭐ 记忆命中怎么可视化？出问题怎么排查？

**要点：**
- SSE `memory_used` 事件实时展示命中的事实；`status` 事件贯穿思考/调工具/等待补参/工具完成全链路；PG 表带 history 版本链，记忆写错可回溯"谁在什么时候基于什么证据写的"。

---

## 8. 高危追问清单（面试官最可能连续深挖的 8 连问）

1. interrupt 续跑时参数到底从哪来的？（2.2 答案必须脱口而出）
2. `pg_advisory_xact_lock` 和 `FOR UPDATE SKIP LOCKED` 各解决什么问题？为什么队列不用 advisory lock？（行级竞争用 SKIP LOCKED；用户级串行化才用 advisory lock，粒度不同）
3. 部分唯一索引 `ON CONFLICT ... WHERE status='pending'` 为什么必须加 WHERE？（只有 pending 参与去重，failed/dead 同键可再次入队）
4. 去抖合并的 payload 冲突怎么办？（jsonb `||` 新值覆盖同键，`run_at` 重置等于窗口顺延）
5. 记忆提取 LLM 输出不合法 JSON 怎么办？（重试 + 白名单 schema 校验 + 失败进 dead 留痕）
6. MemorySaver 多实例下挂起的 thread 在另一台机器上续跑怎么办？（当前单实例；多实例需 sticky session 或换 PostgresSaver——能说出迁移路径）
7. 为什么每轮 buildTools 会不会浪费？（只是闭包对象组装，图编译缓存与否不影响正确性；会话级依赖决定了必须重建）
8. 这个项目离生产还差什么？（诚实+有见地：鉴权与租户隔离、checkpointer 持久化、真实运单系统对接、可观测从 SSE 日志升级到 OTel、评测集扩到线上 case 持续回归）

---

## 9. 一句话防身（把数字挂嘴边）

| 数字 | 出处 |
|---|---|
| 工具选择/参数组装 100%（24 话术 × 6 意图） | eval tools |
| 缺参补全 100%（4 场景，规则路 + interrupt 路） | eval slots |
| Recall@8 100%（3 画像 15 事实） | eval recall |
| 记忆写入 4/4 + 跨会话召回 + 纠正更新（版本链） | eval memory |
| 10 并发 50 请求 100%，P50 2.14s / P95 2.66s，约 175 req/min | eval load |
| 5 轮重启 × 2 场景恢复 100% | eval restart |

**三个贯穿全场的叙事锚点：**
1. "缺参 = 图内 interrupt 一次挂起，不靠 LLM 多轮追问" —— 中断恢复。
2. "一切状态以 PG 为真源：历史、记忆、人工会话、任务队列，进程随时可死" —— 可靠性。
3. "每个功能都有评测阶段兜底，bug 是被评测发现并回归验证的" —— 工程素养。
