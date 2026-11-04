# 物流多租户 RAG 智能知识问答平台 — 面试必问题清单

> 配套简历：`物流RAG智能知识问答平台-简历项目经验.md`
> 代码：`project/RAG-ai`（以下引用均已在源码 / docs 中核对）

---

## 一、总体架构与多租户（简历第 1 条）

### Q1 为什么 PostgreSQL 是 Source of Truth、其他库都是"派生索引"？
- PG 存文档 / 版本 / chunk / 实体 / 关系 / Job / Outbox；Qdrant / OpenSearch / Neo4j 都可由 PG 里的 chunk **全量重建**。
- 收益：① Embedding 模型升级、切片策略调整、索引库损坏 → 重跑对账即重建；② 任一索引写入失败只影响"检索可见性"，不丢数据；③ 写入链路只依赖 PG，架构上把"一致性问题"收敛到一个对账循环里。

### Q2 RLS 具体怎么落的？为什么不只靠应用层 WHERE？（高频追问）
- 事务内 `SELECT set_config('app.tenant_id', $1, true)` 绑定租户；21 张租户表 `ENABLE + FORCE ROW LEVEL SECURITY`，策略 `tenant_id = current_setting('app.tenant_id', true)`。
- 三个关键细节（说出来是加分项）：
  1. `set_config` 第三参 `true` = `SET LOCAL`，**事务结束自动还原**，连接池复用不会把租户绑定泄漏给下一个请求；
  2. `FORCE` 让表 owner 连接也必须走策略，无法绕过；
  3. `current_setting(..., true)` 取不到时返回 NULL → 未绑定租户的查询返回**空结果**（安全失败方向，不是报错更不是越权）。
- 定位：应用层过滤是第一道，RLS 是数据库层兜底（defense in depth）——应用代码迟早有漏写 WHERE 的一天。

### Q3 数据集版本怎么设计的？
- 版本 = 文档集合快照，**只增不改**；上传必须归属 `versionId`，检索不传则查激活版本；切回旧版本激活即"回滚"，旧口径立即可查。
- 版本过滤的实现：版本 → `documentIds` 集合 → Qdrant / OpenSearch 检索时带 filter，回表阶段再兜底校验一次。

### Q4 Provider Adapter 抽象了什么？无 Key 时怎么跑？
- Domain 只依赖 `LLMProvider` / `EmbeddingProvider` 接口，不 import 厂商 SDK；未配置 Key 回退确定性实现（feature-hashing 哈希向量 + 规则生成），端到端零成本可跑、可回归。
- **陷阱追问：无 Key 的"语义检索"是什么水平？** → 哈希 embedding 是词面特征哈希，只保证工程链路通、可自动化回归，**不产生真语义**——别吹成"离线也有语义检索"。

---

## 二、文档摄入与切片（简历第 2 条）

### Q5 完整写入链路？为什么返回 202？
- 单事务落 `documents` / `document_versions` / `jobs`（任一失败整体回滚，无孤儿状态）→ 返回 `202 + jobId` → BullMQ `rag-index` 队列 → Worker（concurrency=4）切片落库 → 写 Outbox 事件 → Reconcile 写派生索引。
- 202 的原因：解析 / 切片 / embedding 是重活，同步做会占死请求线程；前端轮询 `GET /documents/:id` 看 Job 状态。写入与索引解耦后 Worker 可独立扩容。

### Q6 Parent-Child 两个尺寸怎么定的？为什么不直接切 400 就完了？
- child ~400 字符 = **检索单元**（小块召回准）；parent ~2000 字符 = **上下文单元**（命中 child 回表 parent 喂 LLM，避免只见树木不见森林）。二者职责分离，这是 Parent-Child Retrieval 的核心。
- 切分不做字符级硬切：lookbehind 正则按句切分（保留分隔符在句尾）再贪心聚合；单句超长独立成块。
- Markdown 专用切分器：标题当语义锚点、**parent 带标题前缀**（命中可定位章节）、代码块 / 表格整体保留为一个 child（拆开结构就坏了）。
- 演进史（展示迭代思维）：Phase 1 段落 1000+200 overlap 一刀切 → Phase 2 Parent-Child → Phase 3 按 `metadata.language` 分类型分发，与 Parser 对称，所有 splitter 统一返回 `ParentChildChunk[]`，下游零改动。

### Q7 幂等怎么保证？重跑同一版本会怎样？
- `hashChunk = sha256(documentVersionId + kind + content)`，**kind 区分 parent/child**（防两级内容相同哈希碰撞）；
- 唯一索引 `(documentVersionId, contentHash)` + `onConflictDoNothing`；
- 先清后插：算"期望哈希集合"，不在集合里的旧 chunk 先删 `index_status` 再删 `chunks`（防外键 / 唯一索引冲突），并投 `chunk.removed` 事件同步清理派生索引；保证 `chunkIndex` 版本内唯一连续。
- 结果：重跑 / 重试得到同一批 chunk，可安全重复执行。

### Q8 为什么只有 child 进索引？引用指向谁？
- 仅 child 进 Qdrant / OpenSearch（parent 不参与检索）；命中 child 回表其 `parentId` → parent 内容作 LLM 上下文。
- **Evidence.chunkId 仍指向 child**：引用精确到命中的小块，上下文却完整——"用 child 召回，用 parent 作答"。

---

## 三、混合检索与精排（简历第 3 条，最高频必问）

### Q9 为什么向量之外还要 BM25？
- 向量管语义相关（换说法也能命中），BM25 管**术语精确匹配**；物流场景单号、海关编码、专业术语必须字面精确命中，纯向量会"糊"掉这类查询。这也是混合检索在指标上主要提升 Recall / HitRate 的原因。

### Q10 RRF 公式？k=60 什么含义？为什么不用加权分数？（必问中的必问）
- `score(d) = Σ 1/(k + rank)`，rank 从 1 开始；k=60 起平滑作用（rank1 得 1/61，rank60 得 1/120），头部优势被缓和。
- 用 RRF 的原因：**两路分数量纲不可比**（cosine 相似度 vs BM25 分），RRF 只依赖相对排序——免调权重、免归一化；同一文档被两路命中天然得分叠加（hybrid > 单路）。
- 追问"k 调大调小会怎样"：k 越大曲线越平，排序越保守、越看重大路数命中；k→0 接近纯排名相加、头部主导。60 是经验默认值，敏感性应该用评估集验证（展示"用指标说话"）。

### Q11 重排为什么放融合后一次，而不是每路一次？
- multi-query N 个变体各自重排是 N 次冗余 LLM 调用——多路本来就要 RRF 融合，**融合后统一重排一次**即可（省 N-1 次）；
- 证据 `< 4` 条（`RERANK_MIN_EVIDENCE=4`）跳过重排：2~3 条按融合分排序已足够可信，重排收益趋近 0 还多付一次 LLM；
- 追问"为什么是 4"：工程权衡值，在评估集上对比过收益——没有绝对答案，重要的是有量化验证的习惯。

### Q12 LLM Reranker 怎么实现的？失败怎么办？
- 候选编号 `[1]…[n]` 喂给 LLM，要求只输出编号序列如 `3,1,2`（temperature=0）；解析时去重、**补齐缺失索引**（LLM 漏编号也能兜住），完全解析失败回退原始顺序。
- LLM 超时 / 异常 → **降级 LexicalReranker**（归一化融合分 0.5 + query↔content 词面重叠 0.5），不阻塞检索主链路；无 Key 时干脆直接用 Lexical。

### Q13 单路检索挂了 / 慢了会怎样？
- 两路 `Promise.all` 并行，每路套 `raceTimeout`（默认 3s，`RETRIEVER_TIMEOUT_MS`）：到点未返回降级为空结果——**只停止等待，不中断底层 HTTP**（避免引入 AbortController 级联复杂度），真正的基础设施错误照常抛出（不掩盖故障）。
- 关键词路故障返回空 → 自动退化为纯向量检索；`unhandled rejection` 已提前挂空 catch。

### Q14 版本过滤怎么保证不串版本？
- 索引侧：Qdrant / OpenSearch filter 按 `documentIds`；回表侧：`assembleEvidence` 再校验 `documentIds.includes(child.documentId)`，不符直接丢弃——**索引侧漏过滤也兜得住**（双重防线，与 RLS 同一思想）。
- 图检索在 Cypher 里用 `all(r IN rels WHERE r.sourceDocumentId IN $docIds)` 过滤边（实体跨文档共享，必须在关系边上过滤才防串）。

---

## 四、查询智能（简历第 4 条）

### Q15 为什么规则优先？什么时候升级 LLM？
- cheap-first：规则意图分析（意图正则 / 实体抽取 / 复杂度）零成本零延迟，高置信直接出检索计划，**零 LLM 调用**；仅 `unknown`（低置信）且配了 Key 才升级。
- 优化点（主动讲）：原实现 Analyzer 与 Router 是两次串行 LLM（最坏 2 次往返），合并为**一次调用同时产出 analysis + plan**，任一部分解析失败整体回退规则结果——低置信路径也只付一次 LLM。

### Q16 四种变换为什么互斥？优先级？
- `Rewrite > MultiQuery > HyDE > Direct`：
  - 含糊指代（它 / 这个 / 上述，或 ≤6 字含"的"）→ Rewrite 改写补全实体；
  - 宽泛（所有 / 任何，或短查询无实体）→ MultiQuery 拆子查询多路召回；
  - 概念型 / 多跳（原理 / 机制 / 为什么）→ HyDE 假设文档；
  - 都不命中 → Direct 直连。
- 互斥原因：三种变换对应三类不同"病症"，叠加会多付多次 LLM 且变体互相污染；一次针对性变换已足够改善召回。

### Q17 HyDE 原理与边界？
- 让 LLM 先生成"假设性答案文档"，用它替代原查询做向量检索——假设文档与真实文档同处一个语义空间，短查询 / 概念查询召回更好。
- 边界：假设文档可能引入幻觉术语，对术语精确匹配类查询反而有害——所以只在概念型 / 多跳意图启用。

### Q18 MultiQuery 的成本怎么控？
- N 个变体**合并为一次批量 embedding**（一次 API 请求）；各变体检索传 `useReranker:false`，全局 RRF 融合后**统一回表一次、统一重排一次**；默认 `MULTI_QUERY_COUNT=3`。

---

## 五、GraphRAG（简历第 5 条）

### Q19 实体消解四级顺序？为什么 cheap-first？
- 精确匹配 `(tenantId, normalizedName, type)` → 归一化名（NFKC + lowercase，跨 type 可归并 / 升级 type）→ 别名（`aliases jsonb @>`）→ 全未命中新建。
- 从最便宜的匹配逐级放宽；同一实体跨 chunk / 跨文档共享一个 ID（实体生命周期独立于文档）。

### Q20 为什么 Neo4j 是派生索引而不是事实源？怎么重建？
- PG `entities / entity_mentions / relations` 是事实源（关系带 `sourceChunkId` 证据溯源、五元组唯一索引去重）；Neo4j 只是投影（`MERGE` by tenantId+entityId），损坏可清空由 Reconcile 重新投影重建。
- 两条铁律：Neo4j 写入**绝不进 DB 事务**（见 Q25 故障）；图索引失败只标 `index_status.graph=failed`，不阻塞向量 / 关键词就绪。

### Q21 子图遍历怎么防串租户 / 串版本？
- Cypher：`MATCH path=(seed)-[rels:REL *1..maxHops]-(other) WHERE all(n IN nodes(path) WHERE n.tenantId=$tenantId)`（租户过滤到路径上每个节点）+ 边级 `sourceDocumentId IN $docIds`（版本过滤），`LIMIT 50`；
- 子图实体经 `entity_mentions` 回表 chunk 证据，并入 Evidence 参与下游 RRF / 重排 / 生成。

### Q22 Text2Cypher 的安全怎么做？
- LLM 生成 Cypher → **只读子句白名单校验**（MATCH / WHERE / WITH / RETURN / ORDER BY / LIMIT），禁止 CREATE / MERGE / SET / DELETE / DROP → 以只读方式执行 + tenantId 参数注入（不走字符串拼接）→ 结果转 Evidence。

---

## 六、Outbox + 对账 + 故障复盘（简历第 6 条，准备一个完整故障故事）

### Q23 为什么用 Outbox？为什么不直接写索引 / 不用 MQ？
- 痛点："PG 事务成功但写 Qdrant 失败"就永久不一致。Outbox 事件与业务变更**同事务**写入（不会丢），消费失败指数退避（`2^attempts` 秒）重试。
- 不用 MQ：MQ 无法与 PG 事务原子绑定，且派生索引本就可重建——"重试 + 对账"足够，少一个组件。
- 双重驱动：Worker 定时器每 5s 一轮（主）+ BullMQ `reconciliation` 系统 Job（辅）。

### Q24 对账循环四步各自兜什么底？
1. `dispatchOutbox`：派发 pending 事件（每轮 ≤200 条防单轮过长）；**先检查 chunk 是否还在**（处理事件与删除竞争）；图索引单独 try/catch；
2. `repairIndexStatus`：扫三路任一 ≠ ready 的记录重投；**特意包含 `graph=pending`**——为引入 Neo4j 之前索引的旧 chunk 补建图索引（向后兼容）；chunk 已删则清孤儿记录；
3. `recoverStuckJobs`：`processing` 超 10 分钟重置 pending 重新入队（BullMQ `attempts:5` 指数退避）——Worker 崩溃兜底；
4. `rebuildCommunitiesIfNeeded`：实体数与 community_members 数不一致才触发社区重建（按需，不每轮全跑）。

### Q25 讲一次你排查过的线上故障（必准备，故障链路要能画出来）
- **现象**：最新上传文档永远 pending；Job 在 DB 是 pending、在 BullMQ 里却 active 一直续租；前端轮询刷不出来。
- **排查**：`pg_stat_activity` 实测 5 个 `idle in transaction`（对账事务内等外部调用）+ 5 个 active 等锁（并发事务互写 `index_status`）——连接池（默认 max=10）全部占死。
- **根因链**（五环）：① 长事务包外部 I/O：embedding / Qdrant / OpenSearch / LLM 实体抽取全在 `withTenantTx` 事务内；② 外部调用无超时，上游挂起事务无限期开着；③ 对账间隔 5s < 单轮耗时，多轮并发叠加；④ 事务互写 `index_status` 等锁（`lock_timeout=0` 永久阻塞）；⑤ 池满后新 Job 的第一步 `markJob` 拿不到连接永久挂起——而 `recoverStuckJobs` 只救 `processing` 态，救不了卡在 markJob 之前的，**兜底机制对这类卡死失效**。
- **修复**：
  1. **三段式短事务**：读事务拉事件（立即提交）→ 事务外做外部 I/O → 写事务落 `index_status` + 标 outbox done。注意：因 RLS 强制开启，外部调用期间不能裸查 DB，所以拆成**读写两个独立短事务**，而不是彻底无事务；
  2. `runReconcile` 防重入标志（上轮未结束直接返回，杜绝 5s 间隔叠加）；
  3. 外部调用加超时：embedding 30s / LLM 60s（`AbortSignal.timeout`）；
  4. 连接池兜底：`connectionTimeoutMillis=10s`（池满快速失败而非无限等待）+ `idle_in_transaction_session_timeout=60s`（僵尸事务服务端断开）；
  5. 现场 `pg_terminate_backend` 杀 10 个卡死连接后重启 worker。
- **结果**：文档 pending→ready，`pg_stat_activity` 无等锁连接，outbox 积压持续消费。
- **一句话原则**（收尾）：外部 I/O 永不进 DB 事务——连接是池化稀缺资源，事务内等 30s 的 HTTP 等于白占一个连接。

---

## 七、性能优化（简历第 6 条后半）

### Q26 13.45s 是怎么定位的？
- 拆解：检索 5.76s + 生成 7.69s = 13.45s（数字自洽）；瓶颈是「检索段多次串行 LLM 调用 + 生成段上下文膨胀」。
- 配置了 Key 且开启查询智能时，典型查询 = 2~3 次 LLM + 1 次 embedding：变换 +1、重排 +1（证据全文进 prompt）、生成 +1（无截断无 max_tokens）；最贵是 MultiQuery——N 个变体各付一次 embedding + 一次重排。每次方舟调用 1~3s，串行累计即 5.76s。

### Q27 五板斧分别砍什么？
1. MultiQuery 各变体跳过重排，融合后统一一次（省 N-1 次 LLM）；
2. 证据 ≤3 条跳过重排；
3. 生成段上下文截断（单条 1500 字符 / 总预算 8000 字符，按相关度丢尾部证据）+ `maxTokens: 1024`；
4. 多路变体合并一次批量 embedding；
5. Redis 结果缓存：键 `sha256(tenantId | topK | intelligence | query)`，TTL 600s（0 关闭）。
- 效果：LLM 调用 2~3 → 1，13.45s → ~3s，缓存命中 ~5ms。

### Q28 缓存的一致性与语义保护？（陷阱题）
- **评估请求（带 goldChunkIds）不读不写缓存**——否则指标在测缓存而不是检索（指标语义保护，说出来很加分）；
- Redis 不可用 / 解析失败静默降级为未命中，不阻塞主链路；
- **主动承认短板**：文档重索引不会主动失效缓存，600s 内新索引内容不可见——改进方案：按 tenantId 前缀失效 / TTL 按查询类型分级。

### Q29 还能怎么优化？
- SSE 流式输出（降感知延迟，未实施）；检索与生成流水线化；embedding 降维 / 蒸馏；热门查询缓存预热。重点是能说出"下一步做什么 + 为什么"。

---

## 八、评估与自优化 Agent（简历第 7 条）

### Q30 八个指标分别度量什么？怎么实现的？
- 检索四项（输入 = gold chunk 集合 + 检索结果）：Recall@K（gold 被召回进 topK 的比例）、Hit Rate（topK 内是否命中任一）、MRR（首个 gold 的倒数排名）、NDCG@K（二值折损累计增益，`1/log2(rank+1)`）；
- 生成四项：Context Precision（相关证据越靠前越高）、Context Recall（上下文覆盖 gold 的比例）、Faithfulness（回答逐句断言是否被上下文支撑）、Answer Relevance（回答切题度）。
- 全部**纯函数**实现、归一化 [0,1]；评估运行记录 indexVersion / embeddingVersion / topK / llmModel / reranker 溯源，结果可复现可对比。

### Q31 Faithfulness 具体怎么判？
- LLM Judge：回答按句拆断言，逐条判 supported，要求输出 JSON `{"claims":[{"text","supported"}]}`；解析失败回退逐行 yes/no 解析；
- 兜底 LexicalJudge：句子有**合法引用编号**（`[ev_N]` / `[N]` 且不越界）或与上下文词面重叠即算受支撑——引用校验与 Faithfulness 共用同一套"断言↔证据"对齐逻辑；
- LLM 失败自动回退确定性实现，评估永不中断。

### Q32 回归门禁怎么工作？
- 基线 = 同一数据集最近一次 ready 运行；容忍度 `EVAL_BASELINE_TOLERANCE=0.1`：任一指标 < 基线 × 0.9 记入 `regressedMetrics`，非空 → `gatePassed=false` 落库；
- CLI 检测到回退以**非 0 退出码**结束，可直接挂 CI 阻断合并；无基线时先建立基线不判回归；Markdown 报告含汇总对比 + 逐查询明细。
- 使用方式（主动讲）：每次改 embedding / 切片 / 重排 / prompt 后重跑评估，指标驱动迭代——召回不足优先加关键词路 / 查询智能，排序不足优先加重排。

### Q33 自优化 Agent 怎么防止 LLM 乱改生产参数？（亮点题）
- **参数空间白名单 + 钳制**：LLM 只负责"提案"，只开放低风险参数 topK(1-20) / useReranker / intelligence / multiQueryCount(1-5)，zod 校验 + `clampConfig` 逐字段钳制，非法回退基线；**切片策略与 Embedding 模型明确排除在外**（会触发大规模重索引）；
- 流程：LLM 提案 → 钳制 → 离线评测 → **硬约束门禁（回归门禁，安全底线）** → 效用函数排序 `J = 0.4·答案相关性 + 0.3·检索质量(Recall/NDCG 均值) + 0.2·忠实度 − 0.1·成本代理`；
- 成本代理用参数复杂度近似（变体数 ×0.15 + 重排 0.25 + 智能链路 0.15 + topK 偏移）；配置指纹去重防重复实验；单轮实验预算上限（默认 6）。
- 设计哲学一句话：**安全与最低质量由硬约束保证，效用函数只在门禁通过者之间排序**。

### Q34 Badcase 诊断怎么定位"错在哪一步"？
- 规则分阶段定位：gold 未召回 → 检索问题；召回了但排位靠后 → 排序问题；证据在但没进上下文 → 截断 / 组装问题；上下文对但答错 → 生成问题；再叠加 LLM 复核，输出样本级结论与整体分析报告。

---

## 九、数字要脱口而出

| 指标 | 优化前（单路向量） | 优化后（混合检索全链路） |
|---|---|---|
| Recall@5 | 0.61 | 0.78（+27.9%） |
| HitRate@5 | 0.72 | 0.87（+20.8%） |
| MRR | 0.55 | 0.74（+34.5%） |
| NDCG@5 | 0.63 | 0.80（+27.0%） |
| 生成侧 | Faithfulness 0.94 / Answer Relevance 0.86 / Context Recall 0.83 / Context Precision 0.68 | |
| 延迟 | 13.45s（检索 5.76 + 生成 7.69） | ~3s；缓存命中 ~5ms |
| LLM 调用 | 每查询 2~3 次 | 1 次 |

**口径提示（必背，被追问"数据怎么来的"时的标准答案）：**
- 口径：ground truth 评估集、topK=5、基线 = 单路向量检索；提升率按 `(新-旧)/旧`。
- 关键默认值：`DEFAULT_TOP_K=6`（服务默认，评估用 `--topK 5` 别混）、`MULTI_QUERY_COUNT=3`、单路超时 3s、缓存 TTL 600s、对账间隔 5s、回归容忍度 0.1、RRF k=60、child 400 / parent 2000、`RERANK_MIN_EVIDENCE=4`、重排跳过阈值与缓存预算（1500/8000 字符）。
- 归因要能分维度说：**BM25 并行召回 + RRF 主提 Recall / HitRate**（术语精确命中），**LLM 重排主提 MRR / NDCG**（排序质量），**查询智能提宽泛 / 模糊查询的召回**，回归门禁负责防劣化。
- 数字与"基线是什么、topK 取几、怎么归因"三者必须自洽；建议面试前跑 `pnpm eval:run --topK 5` 实测校准一遍。

---

## 十、最容易被问倒的五个追问

1. **RRF 的 k=60 调大调小会怎样？** → k 越大 `1/(k+rank)` 曲线越平，头部分差被压缩、更看重大路数命中；k→0 接近纯排名相加、头部主导。60 是社区经验默认，敏感性用评估集验证。
2. **缓存与文档更新的一致性怎么处理？** → 主动承认：当前 TTL 600s 自然过期，重索引不主动失效（已知短板）；方案是按 tenantId 前缀失效 / TTL 分级。坦诚 + 给方案比硬撑好。
3. **为什么证据 <4 跳重排、k=60、topK 默认 6？** → 都是工程权衡值 + 评估集验证口径；面试官要的不是"标准参数"，而是"你有量化验证的习惯"。
4. **RLS 会不会拖性能？** → 策略本质是每查询多一个 `tenant_id = ?` 条件，字段在索引内；本系统瓶颈在 LLM / 网络而非 RLS。
5. **无 Key 的确定性回退是什么水平？** → feature-hashing 词面特征 + 规则生成，保证链路通、可自动化回归，不产生真语义——用于零成本开发 / CI，生产必须接真实模型。
