# 跨越速运智能客服 Agent — 面试必问题清单

> 配套简历：`物流智能客服 Agent-简历项目经验.md`
> 代码：`project/RAG-ai/logistics-cs-demo`（以下引用均已在源码中核对）

---

## 一、Agent 编排（简历第 1 条）

### Q1 为什么用 LangGraph 而不是手写 ReAct 循环？图画成什么样？
- `START → agent ⇄ tools`：`ToolNode` + `toolsCondition` 条件边，agent 出 `tool_calls` 走 tools、否则 END；`bindTools` 挂 4 个业务工具（运单/运费/知识库/网点），`transfer_human` 不在图内。
- 编排交给框架后，代码只处理"会话层"：拼上下文（SystemPrompt + 记忆 + 历史）、转人工快速路径、槽位恢复、记忆调度。

### Q2 双流 SSE 怎么实现？
- `streamMode: ['updates', 'messages']`：`messages` 流拿 token 增量转 `delta` 事件；`updates` 流拿节点级更新，遇 `__interrupt__` 取出补参 payload 转 `ask_location` 事件。

### Q3 recursionLimit 撞了怎么办？（陷阱题，答出兜底即加分）
- 捕获 `GraphRecursionError`，向前端推一句收口文案结束本轮，不让用户卡在"思考中"。

---

## 二、interrupt + 检查点（简历第 2 条，最高频必问）

### Q4 interrupt() 到底发生了什么？状态存哪？
- 工具内缺参调用 `interrupt(payload)` → 整张图在该节点冻结 → **当前超步的状态（messages、channel 值）已由 `compile({ checkpointer })` 自动按 `thread_id` 写入 PostgreSQL**（`PostgresSaver`，与业务表共用连接池，`setup()` 幂等建 checkpoint* 表）。
- 随后进程层登记：`pending_threads` 注册表**先 INSERT**（保证后续任何失败都能被清理）+ Redis 挂起槽位，前端弹窗。

### Q5 resume 怎么续跑？interrupt 的返回值是什么？（必问中的必问）
- 用户提交弹窗 → `new Command({ resume: slots })` + **同一个 thread_id** 再跑图 → LangGraph 从 PG 读回检查点、重放上下文、**重跑那个被中断的工具** → 此时 `interrupt()` 的返回值就是用户选的地址（`picked.destination` 直接可用），LLM 不需要重新抽取。
- 关键细节：补的参数经 interrupt 返回值注入，**不出现在工具入参 JSON 里**。

### Q6 为什么用 PostgresSaver 不用 MemorySaver？
- 三点：① A 实例挂起 B 实例可续跑（跨实例）；② 重启不丢（5 轮 SIGTERM 注入验证）；③ Node 内存不随挂起数增长。

### Q7 重复提交怎么防？残留检查点怎么清？
- `takePending` 用 Redis **GETDEL 原子取出**：多进程/并发重复提交只有一个成功，天然幂等；槽位 `SET PX ttl` 10 分钟原生过期。
- 清理三保险：正常轮结束 `finally releaseThread`（`deleteThread`）；TTL 过期主动释放；兜底 sweeper 扫 `pending_threads` 过期行 `DELETE ... RETURNING` 后删检查点。

### Q8 缺参有两条路径，什么时候走哪条？（能说出修复史是大加分）
- 规则快速路径：意图词明确（运费/网点正则）但消息无城市 → 不进图直接弹窗，省一次 LLM 往返；复杂口语化表述由图内 `interrupt()` 兜底。
- 踩过的坑：政策咨询词优先级高于运费判断（"保价怎么收费"不能弹运费窗）；省份名视为地点明确（"浙江有哪些网点"直接查）。

### Q9 thread 生命周期？
- interrupt 挂起 → `keepThread=true` 保留检查点；正常收尾 `finally` 释放。
- thread 是"短生命周期状态"，不是会话——会话历史在 PG messages 表，两套体系。

---

## 三、长期记忆（简历第 3 条）

### Q10 双层记忆怎么设计？
- L1 `memory_summaries` 会话摘要（情景）、L2 `memory_facts` 用户画像事实（语义）；召回时合并排序取 Top 8 注入 SystemPrompt。
- 用途：历史偏好识别（"和上次一样"）+ 工具参数预填（缺寄出城市时兜底）。

### Q11 写入并发怎么控制？为什么 advisory lock 而不是 SELECT FOR UPDATE？（高频追问）
- `withUserLock`：单事务 + `pg_advisory_xact_lock(hashtextextended(user_id))` 串行化同一用户。
- 用 advisory lock 的原因：**新用户还没有行，FOR UPDATE 无行可锁**；哈希作锁键不依赖行存在；事务级锁自动释放。
- 事务内只改内存态，提交前按 id 签名 diff，精确落盘 INSERT/UPDATE/DELETE，不整批重写；`bumpFact` 等高频计数走原子 SQL 不进读改写路径。

### Q12 异步记忆任务怎么保证不丢、不重、不并发写脏？
- 任务落 `memory_jobs` 表：
  - `FOR UPDATE SKIP LOCKED` 认领（多实例不重复消费）；
  - `dedupe_key` **部分唯一索引** `WHERE status='pending'` 实现去抖合并（`ON CONFLICT ... payload || EXCLUDED.payload` 合并 + 刷 run_at）；
  - 失败指数退避 5s→10s、3 次置 dead 留表排查。
- 陷阱细节：worker 锁键带 `memjob:` 前缀，与 `withUserLock` 的用户键分命名空间——**否则自己锁死自己**（说出来面试官会眼睛一亮）。

### Q13 冲突消解/衰减怎么做的？
- 提取时 LLM 基于已有事实做冲突消解（纠正更新实测通过）；事实白名单 8 个 type.key 组合（每用户事实上限）；active 超 100 按 updatedAt 淘汰；`bumpFact` 命中 hits+1、confidence 微升。

---

## 四、多实例扩展（简历第 5 条）

### Q14 SSE 怎么跨实例推？
- 本地 Map 直写 + Redis `PUBLISH` 桥接（`cs:bus:session:{id}`，payload=`event:json`）。
- 实现坑：订阅连接必须先初始化普通连接再 `duplicate`。

### Q15 两个实例同时抢着接入人工怎么办？
- `activate()` 用 CAS：`UPDATE ... WHERE human_status='queued'`，只有一个实例改得动。
- 客服在线状态走 Redis 心跳 `SETEX 20s`（10s 刷新），最后连接断开 DEL。
- 人工会话内存缓存加 **2s TTL 回源**防跨实例脏读。

### Q16 Redis 挂了会怎样？（陷阱）
- 全链路内存降级（槽位 Map、限流窗口、SSE 单机直写），退化为单机语义但功能不挂。

---

## 五、可靠性 / 评测（简历第 4、6 条）

### Q17 SIGTERM 重启恢复怎么验证的？
- 两场景（排队中/接入中）× 5 轮：会话状态每次变更都写 PG，重启后惰性恢复（首次 `getSession` 回源，queued 且 joinAt 已过立即补推接入）+ 检查点在 PG → 100% 恢复。

### Q18 压测数据怎么来的？瓶颈在哪？
- 10 并发 50 请求成功率 100%，首 Token P50 2.14s / P95 2.53s（Redis 模式约 185 req/min）。
- 瓶颈是 **DeepSeek 首 token 延迟**，不是框架；优化方向是流式 + 早推状态事件，而不是堆并发。

### Q19 评测怎么设计的？
- 六阶段 `npm run eval`（tools/slots/memory/recall/load/restart）；数据带 `eval-<RUN>-` 前缀自动清理防污染；报告落盘 `data/eval-*.json` 可回归对比。
- 踩坑：eval 子进程要 `delete env.NODE_OPTIONS`（本地 shim 破坏 `crypto`）。

### Q20 如何保证多次请求不重复发送？（分层答，配 Q7）
- **前端互斥锁（第一道）**：`state.busy` 标志，请求在途即 `setInputEnabled(false)` 锁死输入区 + 禁用发送按钮；Enter 快捷键路径再判一次双保险；弹窗补参、转人工、新会话同样互斥。关键是 `finally` 里复位 `busy`，异常不会把用户永久锁死。
- **服务端原子取出（第二道）**：挂起槽位 `takePending` 用 GETDEL 语义"取出即删"——并发/双开标签页重复补参只有一个成功，其余 409/410；`/api/chat/slots` 进 SSE 前先 `hasPendingSlots` 只读探测，重复提交提前拦截（与 Q7 同一机制，只是面试官换了个问法）。
- **服务端幂等键（第三道，已落地）**：`msgId` 由前端每条消息生成（`crypto.randomUUID`），随 `POST /api/chat`、`POST /api/chat/slots` 上报；服务端 `idempotency.js` 以 `SET key __processing__ NX PX ttl` 抢占，同 id 并发请求在进 SSE 前直接 `409 duplicate_request` 拦下（不占并发闸、不触发 LLM）；执行成功后把可重放 SSE 事件序列（token 增量已合并为整段）写回同 key 并重置 TTL——幂等窗口内同 id 重复请求**直接重放第一次结果**（不重复落库/记忆提取）；执行失败 `DEL` 释放占位，允许客户端带同一 msgId 重试。Redis 故障按"可用性优先"放行（退化为无幂等，不影响正常请求）。前端锁挡不住的重放和多端登录，由这一层兜住——三层按"请求粒度"各管一段，分层清晰。

---

## 六、数字要脱口而出

| 指标 | 值 |
|---|---|
| 工具选择/参数组装 | 24 条话术 × 6 类意图，100% |
| 缺参补全 | 4 场景，100% |
| Recall@8 | 15 条探测，100% |
| 压测 | 10 并发 50 请求 100%，P50 2.14s / P95 2.53s，约 185 req/min |
| 故障注入 | 5 轮 SIGTERM，100% 恢复 |

---

## 七、最容易被问倒的三个追问

1. **interrupt 返回值怎么进工具的？** → 检查点重放 + `interrupt()` 以 resume 值返回。
2. **为什么 advisory lock 不用 FOR UPDATE？** → 新用户无行可锁，哈希锁键不依赖行存在。
3. **memory_jobs 为什么部分唯一索引？** → 只对 pending 去抖，dead/running 不占去重名额，允许同 key 再次入队。
