# aipack — 轻量级 TypeScript Agent 框架 · 面试必问题清单

> 配套简历：`aipack Agent 框架-简历项目经验.md`
> 代码：`project/aipack`（以下引用均已在源码中核对）

---

## 一、框架内核（简历第 1 条）

### Q1 为什么自研而不用 LangGraph / LangChain？
- 定位是"库"而非"应用"：要嵌入 CLI、服务端、桌面端任意宿主，必须完全掌控执行循环、上下文与权限层；LangGraph 的状态图抽象偏流程编排，aipack 需要的是 Agent 运行时（会话 / 工具 / 权限 / 上下文工程一体）+ 插件生态。
- 零外部 Agent 框架依赖 → 供应链与包体积可控，类型全量自持。

### Q2 一次 run 的完整链路？工具循环怎么写的？
- `validate → normalize → 同会话串行锁 → 存储级锁 → RunLoops.run()`：钩子（beforeInitialize/beforeRun）→ hydrate 恢复历史 → createCompilation → `runLoop` → buildResult → done。
- `runLoop`：`while (maxTurns--)` 每轮 ①链式转换上下文 → ②阈值压缩 → ③调模型（push 即 `persistSafe` 落盘）→ ④`extractToolCalls`，无调用即 break → ⑤工具结果按序回填 → 回到③。轮数耗尽输出 `stopReason: 'max_turns'`，钩子 terminate 输出 `'terminated'`。

### Q3 上下文溢出自动恢复怎么做的？（亮点题）
- `isContextOverflow` 五模式检测：显式错误 / 静默溢出 / 输入截断 / thinking 耗尽 / 输出打满 → 丢弃失败消息 → 压缩历史 → **同回合重试不消耗轮次**，上限 2 次；流式路径吞掉可恢复的 error chunk。

### Q4 流式事件为什么设计两层？
- 模型层 `StreamEvent`（text_delta / tool_call_delta…）归一 13 家提供商协议差异；运行层 `ResultChunk`（text / tool_start / tool_end / thinking / error / done）由 RunLoops 合成——**tool_start/tool_end 是执行器在工具前后合成的，模型流里没有**；done 携带完整 Result（usage / stopReason / toolsUsed）。

### Q5 同会话并发怎么控制？
- 同会话 promise 串行锁 + `withStorageLock` 存储级锁（跨进程文件锁）；SessionStore LRU 256，只淘汰非活动会话不删存储。

---

## 二、插件体系（简历第 2 条）

### Q6 为什么自己写 Tapable 不直接用 webpack 的？
- 需要的只是 3 种钩子 + HookMap + stage 排序 + 失败策略，自研零依赖；错误语义可控：`TapFailurePolicy`（log/silent/throw），`setTapErrorHandler` 接遥测，Runtime 构造时把钩子失败转发 `onHookError`。

### Q7 12 个钩子哪些是 waterfall（能改写数据）？
- `beforeRun`（改写 Request）、`beforeTransform`/`afterTransform`、`beforeModelCall`（改写 system/messages/tools，**每次模型调用都触发**）、`beforeToolCall`（block / terminate / 改写 args）、`afterToolCall`（改写 result / terminate）。

### Q8 ToolPairing 为什么必须放链尾？（陷阱题）
- 截断 / TokenBudget 丢弃可能拆散 tool_call/tool_result 配对，**孤立 tool_call 发给模型直接 400**；兜底清理必须最后跑。Truncation 按"配对组"整组丢弃也是同一原因。

### Q9 单个 Transformer 失败会怎样？
- 仅告警跳过，不阻断本轮；no-op 转换器（返回原引用）跳过全量重映射，最终 splice 原地替换保持 session.messages 引用。

---

## 三、权限审批（简历第 3 条，最高频必问）

### Q10 四档裁决语义？为什么 deny-by-default？
- allow / deny / confirm（同步 `policy.confirm(req)` 回调）/ pending（挂起等审批单）。
- 未配置策略或规则无匹配默认 **deny**（除非显式 `permissionFailOpen`）——权限系统必须 fail-closed，否则新工具默认全放行。

### Q11 裁决为什么放框架层，工具自己做不行吗？
- 工具不可信（提示注入 / 恶意 args），框架在 `execute()` 前统一裁决才**无法绕过**；同时统一上报 `PermissionRecord` 遥测。裁决顺序：`prepareArguments → 权限裁决 → 超时计时 → beforeToolCall 钩子 → execute`。

### Q12 pending 挂起怎么实现？（必问中的必问）
- `approvals.create(req, {timeoutMs, signal})` 登记审批单 → `await approvals.wait(approval)` **挂起该次工具调用**；外部任意时机 `resolve(id, approved)` 唤醒；denied / timeout / cancelled 均生成 `[blocked]` 结果保持消息配对；未配置 ApprovalManager 时 pending 保守 deny。

### Q13 审批等待占用工具超时吗？（最容易被问倒）
- **不占用**——超时计时在裁决之后才启动（源码注释明确：审批等待不占工具执行超时）。

### Q14 进程重启后未决审批单怎么办？
- FileApprovalStore 布局：`~/.aipack/approvals/<id>.json`（未决单，temp+rename 原子写，结算即删）+ `history.jsonl`（审计流水追加写）；启动时 `restore()` 恢复孤儿审批单（`restored: true`，已过期的立即 timeout 结算），幂等 settle 防重复结算。

### Q15 跨进程文件锁怎么做的？
- `O_EXCL('wx')` 独占创建锁文件，内容 pid + 时间戳 + UUID token；release 校验 token 归属防误删；陈旧锁回收前 `kill(pid, 0)` 探测持有进程存活；指数退避 + jitter。

---

## 四、多模型层（简历第 4 条）

### Q16 13 家提供商怎么统一？
- 目录每条目带 `api: 'openai-completions' | 'anthropic-messages'`，OpenAI 兼容厂商全部归并到同一协议实现，只有 Anthropic 单独一套；能力元数据（contextWindow/maxTokens/reasoning/input）统一。

### Q17 tool_call 参数是流式碎片，怎么解析？
- SSE 解析 + 增量 JSON 解析（partial-json）边收边补全；ai 流的 `toolcall_start` 无 id/name 时用 `contentIndex` + known Map 补齐生成 `tool_call_start`。

### Q18 提供商怪癖怎么处理？
- 发送前 `transformMessages` 预修复：跳过 error/aborted assistant、为孤立 toolCall 合成 toolResult、按 `ProviderCompat` 处理 DeepSeek 空 assistant 桥接——**修复发生在发送方而不是等报错**。

### Q19 重试怎么做？
- 指数退避 `retry()`；错误分类区分可重试/不可重试；`RetryRecord` 逐 attempt 上报（provider/attempt/HTTP status/退避 delayMs）。

---

## 五、上下文工程三件套（简历第 5 条，高频）

### Q20 BM25 + 向量怎么融合？为什么要归一化？
- 双路**独立**召回 top-3×limit（向量路不依赖 BM25 候选池），各自 min-max 归一化后加权融合（默认 0.5/0.5）。
- 关键：BM25 原始分**除以查询理论满分 Σidf 归一到 [0,1]**，与 cosine 量纲统一才能共用绝对阈值——这是两路可融合的前提（单调变换，min-max 路径幂等）。

### Q21 中文为什么用 bigram 不用单字或分词器？
- 零依赖设计：不引 jieba（依赖 + 词典体积）；单字区分度低噪声大，相邻两字 bigram 明显更好；奇数长度尾部补单字保证单字查询可命中；BM25 索引不去停用词，仅概念抽取过滤。

### Q22 记忆怎么注入？为什么不用 system？（细节题）
- 每轮**先剥除所有 user_message 中的旧 sentinel 块**（含已持久化的）再检索 top-5 前插最新 user 消息。
- 不注入 system：buildContext 每次重建会过滤 system，注入必丢；不新增独立 user：避免连续两条 user 消息触发部分提供商校验；sentinel `<<<AIPACK_MEMORY>>>` 放 content 内随消息持久化，跨轮可识别剥离。

### Q23 合并怎么防 O(N²)？
- **增量候选窗口**：只对上次合并后 updatedAt 变化的条目判重（updatedAt 稳定为内容修改时间，touchRecall 只更新召回统计不碰它）；≥0.85 合并（content 取较长者、concepts 并集、confidence max+0.05 防饱和、recallCount 求和）；**先 save 幸存者再 delete 被并项**（修复过先删后存丢数据）；随后 prune 低置信度与超量淘汰。

### Q24 压缩双水位为什么要有间距？
- 0.70 预压缩（后台 fork 产内存）→ 0.80 同步压缩 → 0.40 一次压到位：高低水位**迟滞**防每 turn 反复触发 fork；预压缩产物 8 turn 过期、sourceIds 失效即弃，请求路径零 fork。

### Q25 trim 为什么 tail→head？
- 释放够即停，**保住消息前缀不变以命中 KV-cache / prompt cache**；三操作：剥离 thinking 块、tool_result 按 token 预算裁剪（head10 + error/warn 关键行 + tail10，行级裁不动按 0.8 迭代收缩）、空白规范化（修复 v1 行数判定漏掉单行 minified JSON）。

### Q26 truncate 怎么防悬空 tool_call？
- 工具对（tool_call + tool_result + assistant 依赖）经**不动点迭代**求"不可丢集合"，整组丢弃；保护最近 minWorkingSet=2 条；pinned（system/摘要）与 state_snapshot 永不丢。

### Q27 压不下去怎么办？（陷阱题）
- 压缩器只发 `ContextExhaustedEvent`（reason: pinned_overload / protected_overload），携带 fork 生成的五段交接文档（原始任务/已完成/当前状态/待办/关键上下文）；**检查点与换会话由 host 决策**——框架不越权替宿主做生命周期决定。

### Q28 skills 渐进式披露省了什么？"零开销"指什么？
- system 只注入 `<available_skills>` 目录段（name + description，token 极小），全文由内置 `skill` 工具按需拉取；无 skill 时**零注册零注入**（extensions 空数组）；loader 加载时正文入 content，运行时零 fs 依赖。

---

## 六、多 Agent 与 MCP（简历第 6 条）

### Q29 AgentGraph 怎么表达并行 / 条件 / 环？怎么防死循环？
- 单节点多条出边同时匹配 → wave 式 fan-out（concurrency 限流，parallel_start/done 事件）；`edge.condition` 谓词过滤；**边指回上游即成环**，`maxVisitsPerNode`（默认 10）安全阀，超限 stopReason='max_visits_exceeded'；abort 转 'aborted' 并保留最后完成节点输出。

### Q30 Supervisor 的 auto 调度怎么分层？
- 依据显式 `dependsOn` + inputMapping 隐式依赖做**拓扑分层**：同层并行、层间串行，成环报错；失败策略 fail-fast | skip（skip 记 failedAgents、stopReason='partial_failure'）。

### Q31 MCP 三种传输层差异？
- stdio（spawn 子进程 + 行分隔 JSON-RPC，stderr 缓冲诊断，优雅关闭 2s 强杀兜底）；Streamable HTTP（POST 单条 JSON/SSE/202 + GET 长连收主动消息 + Mcp-Session-Id）；legacy SSE 降级（GET 取 endpoint 事件再 POST）。

### Q32 tools/list 为什么要分页拉全？
- 协议本身分页，恶意 server 可无限吐 → **上限 100 页**防失控；tools/call 带 AbortSignal → notifications/cancelled 取消传播。

### Q33 反向暴露为 MCP Server 时，server→client 的 sampling 请求怎么路由？
- HTTP 模式多 session：**AsyncLocalStorage 把 session 绑到 handleRequest 调用栈**，出站 sampling 请求据此找到正确连接；stdio 模式天然单连接。

### Q34 MCPBridge 是什么？
- 把 AgentGraph 的 run/status 暴露为 MCP 工具，`toMcpServerHost()` 补 stdio 传输——Claude Desktop / Cursor 可直接调用编排图；工具调用经 `authorize` 钩子裁决，未知方法 -32601。

---

## 七、可观测性（简历第 7 条前半）

### Q35 埋点记什么？为什么延迟要分段？
- 6 类记录（Run/Span/ToolCall/Permission/Event/Retry）；延迟分 **ttftMs（首 token）/ activeMs（执行）/ queuedMs（排队）**——优化方向不同：TTFT 是模型侧、queued 是并发闸侧；cacheRead/cacheWrite 单列（成本差异大）；W3C traceparent 打通分布式链路。

### Q36 上报丢了怎么办？
- 批量上报（定时 5s 或攒 50 条），失败写**本地缓存文件**下次补报、全成功才删、上限 2000 条裁最旧；4xx 不可重试直接丢；send 串行、并发批次合并；事件路径零阻塞。

### Q37 PII 怎么处理？
- 内置脱敏规则（mask/hash/drop）默认启用；`export-eval` trace 回流**强制脱敏**。

### Q38 为什么 MySQL + ClickHouse 双库？
- 读写模式完全不同：业务数据（app/user/project/alert/modelPrice，事务 + v1–v3 迁移）vs 监控明细（runs/spans/tool_calls 海量追加读）；CH 走 HTTP 端点，`TRACE_STORE=clickhouse` 切换。

### Q39 高吞吐怎么扛？
- `MQ_ENABLED` 时 collector 只做鉴权 + 限流 + produce `aipack.ingest`，独立 worker（独立 bin）消费落 CH，死信队列兜底；聚合器三档 memory/redis/hybrid（L1 本地 1min + L2 Redis 60min）。

### Q40 trace 回流 eval 是什么？
- `POST /api/v1/export-eval` 把线上 trace 转成 EvalCase 入库（origin=bugfix）——**线上问题一键变回归用例**。

---

## 八、评测与工程化（简历第 7 条后半 + 交付）

### Q41 mock 回放怎么做到免 API Key 且零改 Runtime？
- `createMockStreamFn(script)` 经 `RuntimeOptions.streamFn` 注入脚本化 LLM 响应，**第 n 次调用消费第 n 轮脚本**，耗尽按 fallbackText/infiniteTool 兜底（infiniteTool 配合 maxSteps 断言截断）；6 个标准内存工具按 case 深拷贝隔离——Runtime 完全无感。

### Q42 baseline 门禁怎么判回归？
- ok = 整体通过率 ≥ baseline − 2% **且无任一套件回归超阈值**（baseline 有但本次未跑的套件不判回归）；失败退出码 1 卡 CI；`compare --models` 输出通过率矩阵 Markdown。

### Q43 llm-judge 为什么拒绝同源模型？
- 同一模型评自己 = 自我偏好偏差，必须异源；规则评分器（8 个确定性规则）零 LLM 成本优先用。

### Q44 内置工具沙箱怎么防路径逃逸？
- `resolveInWorkspace` **realpath + relative 双重校验**：realpath 解符号链接后再 relative 判前缀——同时防 `../` 越界与软链逃逸；二进制文件检测。

### Q45 版本与发布怎么管？
- Changesets（changeset → version-packages → release），pnpm -r 递归构建，tsup 打包，`@aipack-ai/*` npm v1.3.1；测试 runner 自研脚本枚举 `node --import tsx --test`（修复 Windows shell 不展开 glob 的"假绿"问题）。

---

## 九、数字要脱口而出

| 指标 | 值 |
|---|---|
| 单仓包数 | 11 包 monorepo，核心约 3 万行 TS |
| 模型提供商 | 13 家，2 种协议归一 |
| 生命周期钩子 | 12 个（beforeRun / beforeModelCall / beforeToolCall 等 5 个可改写数据） |
| 内置 Transformer | 5 个（ToolPairing 必须链尾） |
| 权限档位 | 4 档，deny-by-default |
| 编排模式 | 5 种（Pipeline/Router/Supervisor/Debate/MapReduce） |
| MCP | 客户端 3 种传输 + 服务端 2 入口 |
| 埋点记录 | 6 类，批量 5s/50 条 + 本地缓存补报 |
| Eval | 8 类断言、8 规则评分器 + semantic/llm-judge、42 用例 × 4 套件 |
| 测试 | 11 包 70+ 测试文件，agent 包 24 个（约 174 describe） |
| 版本 | v1.3.1，npm `@aipack-ai/*` |

---

## 十、最容易被问倒的三个追问

1. **审批等待占不占工具超时？** → 不占——超时计时在权限裁决之后才启动（裁决 → 计时 → 钩子 → execute）。
2. **BM25 和 cosine 怎么放在一起比？** → BM25 原始分除以查询理论满分 Σidf 归一到 [0,1]，两路再各自 min-max 后加权融合；向量路独立召回不依赖 BM25 候选池。
3. **悬空 tool_call 怎么防？** → 三层：截断/预算按配对组整组丢 → truncate 不动点迭代求"不可丢集合" → ToolPairing 链尾兜底清理（孤立 tool_call 发给模型是 400）。
