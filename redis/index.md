# Redis 八股文

## Q1: Redis 是什么？为什么这么快？

### 定位

基于**内存**的 key-value NoSQL 数据库，支持丰富的数据结构，常用于缓存、分布式锁、计数、消息队列等。C 语言编写，核心是**单线程事件循环 + IO 多路复用**。

### 快的原因

| 因素 | 说明 |
|------|------|
| 纯内存操作 | 读写都在内存，比磁盘快几个数量级 |
| 单线程，无锁竞争 | 避免多线程上下文切换和竞态，命令天然原子 |
| IO 多路复用 | epoll/kqueue 事件驱动，单线程支撑数万连接（reactor 模式） |
| 高效数据结构 | SDS、跳表、listpack、quicklist 等针对场景定制 |
| 渐进式/异步化设计 | 渐进式 rehash、异步删除（lazyfree）、后台线程做 fsync 等重活 |

### 关键理解（加分点）

- **"单线程"指命令执行单线程**：Redis 6.0 起网络读写与协议解析可多线程（`io-threads`），但**命令执行仍是单线程**，所以原子性语义不变；后台还有 fsync AOF、异步关闭、lazyfree 等专用 BIO 线程。
- 瓶颈通常不在 CPU 而在**内存和网络**，单机可跑 10 万+ QPS。

## Q2: 常用数据类型与底层编码？

| 类型 | 底层编码（Redis 7.x） | 典型场景 |
|------|----------------------|----------|
| **String** | int / embstr / raw | 缓存对象、计数器、分布式锁、session |
| **Hash** | listpack / hashtable | 对象存储、购物车 |
| **List** | quicklist（listpack 组成的双向链表） | 消息队列（LPUSH+BRPOP）、最新列表 |
| **Set** | intset / hashtable | 去重、抽奖、共同好友（交并差集） |
| **ZSet** | listpack / skiplist + dict | 排行榜、延迟队列、范围排名 |
| **BitMap**（基于 String） | 位数组 | 签到、活跃用户统计、布隆过滤器 |
| **HyperLogLog** | 概率结构，固定 12KB | UV 基数估算（误差 0.81%） |
| **GEO** | 底层 ZSet（geohash 编码为 score） | 附近的人/门店 |
| **Stream** | Radix Tree + listpack | 消息队列（消费组、ACK、Pending） |

- 编码转换由 `hash-max-listpack-entries` 等阈值控制：小数据用紧凑编码省内存，超阈值转标准结构。
- 7.0 用 **listpack 全面取代 ziplist**（ziplist 级联更新的缺陷：每个节点记录前驱长度，中间改动可能连锁更新）。

## Q3: SDS 是什么？比 C 字符串好在哪？

SDS（Simple Dynamic String）是 Redis 自己的字符串结构：`len + alloc + flags + 字节数组`。

| 问题（C 字符串） | SDS 的解决 |
|------------------|-----------|
| strlen O(n) 遍历 | len 字段 O(1) 取长度 |
| 拼接可能缓冲区溢出 | alloc 记录剩余空间，先检查、不够自动扩容（空间预分配：扩后小于 1MB 翻倍，否则多分配 1MB） |
| 缩短字符串浪费内存 | 惰性释放，截断的空间保留复用 |
| 二进制不安全（\0 截断） | 按 len 判断长度，可存图片/序列化数据（二进制安全） |

- **embstr vs raw**：长度 ≤ 44 字节时 embstr 把 SDS 头与 robj 一次分配在连续内存（只读，改即转 raw），省一次分配且缓存友好。

## Q4: 为什么 ZSet 用跳表不用红黑树/B+ 树？

### 跳表结构

多层有序链表 + 每个节点随机"建层"（每层概率 25%，最高 64 层），查找自顶层向下、逐层下沉，平均 **O(logN)**；`score` 排序，相同 score 按成员字典序；node 里还有 `backward` 指针支持反向遍历，`span` 字段可 O(logN) 算排名（ZREVRANK）。

### 对比

| 结构 | 为什么不选 |
|------|-----------|
| 红黑树/AVL | 范围查询要中序遍历，实现复杂；跳表范围查询直接沿底层链表走，代码简单 |
| B+ 树 | 为磁盘设计（节点=页、矮胖减少 IO）；内存数据结构不需要，跳表实现更简单且无旋转 |
| 哈希表 | 无序，不支持范围/排名；ZSet 用 skiplist+dict 双结构兼得 |

### 关键理解（加分点）

- ZSet 同时维护 **skiplist（范围/排名）+ dict（O(1) 查 score）**，内存换时间；两结构通过 robj 指针共享成员，不存两份字符串。
- 插入/删除只需改前后指针，无树的旋转再平衡，实现和维护都更简单——作者 antirez 的原话："它们差不多，跳表更简单"。

## Q5: RDB 和 AOF 的原理与取舍？生产怎么选？

| 维度 | RDB | AOF |
|------|-----|-----|
| 内容 | 某时刻全量数据的**二进制快照** | 每条**写命令**的文本追加 |
| 触发 | save（阻塞）/ bgsave（fork 子进程） | 写命令追加 aof_buf，按策略刷盘 |
| 刷盘 | — | `appendfsync`：always（每命令 fsync，最安全最慢）/ **everysec（默认，最多丢 1 秒）** / no（交给 OS） |
| 体积/恢复 | 小、恢复快 | 大、重放慢 |
| 数据安全 | 两次快照间的数据会丢 | 更完整 |
| 性能影响 | fork 瞬间阻塞 + COW 内存压力 | 写盘持续开销，重写时也 fork |

### 原理要点

- **fork + COW（写时复制）**：bgsave/AOF 重写都 fork 子进程，父子共享内存页；主进程修改某页时复制该页，保证子进程看到一致快照。代价：写压力瞬间内存可能接近翻倍（`info stats` 看 `latest_fork_usec`）。
- **AOF 重写（bgrewriteaof）**：把当前数据反推成最小命令集（如 100 次 INCR 重写为 SET k 100）；重写期间新写命令同时进 aof_buf 和重写缓冲，完成后追加并原子替换。
- **混合持久化（4.0+，`aof-use-rdb-preamble`）**：重写时文件头为 RDB 全量、之后追加增量 AOF 命令——恢复快 + 丢失少，**生产默认开启**。

### 生产选择

- 缓存为主、可容忍丢失：RDB 或混合。
- 数据重要：**RDB + AOF 都开**；重启恢复优先用 AOF（`aof-load-truncated yes` 容忍截断）。

## Q6: 过期删除和内存淘汰策略？

### 过期删除（key 到了 TTL 怎么删）

| 策略 | 机制 |
|------|------|
| **惰性删除** | 访问 key 时检查过期，过期才删（CPU 友好，冷 key 占内存） |
| **定期删除** | 每个事件循环抽查：每次从过期的 key 里随机抽 20 个，删过期的；过期比例 > 25% 再来一轮；另有每 100ms 的 slow 模式限时限次，防止阻塞主线程 |

（过期 key 放在独立的过期字典；主从场景从库不主动删，等主库同步 DEL。）

### 内存淘汰（内存达 maxmemory 时踢谁）

| 策略 | 范围 | 说明 |
|------|------|------|
| noeviction（默认） | — | 不淘汰，写入报错 OOM |
| volatile-* | 只淘汰**设了 TTL** 的 key | lru / lfu / random / ttl（剩存活时间最短） |
| allkeys-* | 全部 key | lru / lfu / random |

- Redis 的 LRU 是**近似 LRU**：不维护全局链表，随机抽样 5 个（`maxmemory-samples`）淘汰其中最久未用的，省内存但可能不精确。
- **LFU（4.0+）**：24 位 lru 字段复用为 16 分钟级访问计数 + 8 位衰减时间；计数用对数增长（Morris 算法，越大越难 +1），按 `lfu-decay-time` 衰减——防"历史热点赖着不走"。
- 缓存场景建议：`allkeys-lru`（纯缓存）或 `volatile-lfu`（有重要数据不能丢时）。

## Q7: 缓存穿透、击穿、雪崩？分别怎么解决？

| 问题 | 定义 | 解决方案 |
|------|------|----------|
| **穿透** | 查询**不存在**的数据，缓存和 DB 都没有，每次都打 DB（恶意攻击常见） | ① 缓存空值（短 TTL 如 60s）；② **布隆过滤器**前置拦截；③ 参数校验、限流 |
| **击穿** | 某个**热点 key 过期**瞬间，大量并发同时打到 DB 重建 | ① 互斥锁重建（SETNX，一个线程重建，其余等待/返回旧值）；② **逻辑过期**（value 里带过期时间，异步刷新，永不过期）；③ 热点数据不过期 |
| **雪崩** | **大量 key 同时过期**，或 Redis 整体宕机，请求全涌向 DB | ① TTL 加随机值打散；② 多级缓存（本地 Caffeine + Redis）；③ Redis 高可用（哨兵/集群）；④ 限流降级熔断兜底 |

### 布隆过滤器

- 位数组 + k 个哈希函数：插入把 k 个位置置 1；查询要求全 1 才"可能存在"，有 0 则**一定不存在**。
- 特点：有误判率（可能把不存在的判为存在）、**不支持删除**（标准版；可用 Counting Bloom）、位数组不能扩。
- 适用：穿透防护、爬虫去重、推荐已读过滤。误判率与位数组大小、哈希个数有关，容量需提前按预期元素量规划。

## Q8: 缓存与数据库的一致性怎么保证？

### 常用模式：Cache Aside（旁路缓存）

- 读：先读缓存，miss 则读 DB 回填缓存。
- 写：**先更新 DB，再删除缓存**（不是更新缓存）。

### 为什么"删缓存"而不是"更新缓存"

1. 懒加载：不删掉等下次读时加载，避免写入后根本没人读的白算；
2. 并发写 A、B 交错时，"更新缓存"可能用旧值覆盖新值（A 先写 DB 后写缓存、B 后写 DB 先写缓存 → 缓存是 A 的旧值）；
3. 若缓存值是多表聚合计算结果，更新代价大。

### 为什么"先更新 DB 再删缓存"而不是反过来

先删缓存的话：删完 → 读请求 miss 并读到**旧 DB 值** → 回填旧值 → 此时写请求才更新 DB → 脏缓存长期留存。概率低但存在。先更 DB 再删缓存的坏窗口（读旧值+删前回填）更小。

### 兜底方案（删失败/要求更严）

| 方案 | 做法 | 特点 |
|------|------|------|
| 重试 | 删缓存失败进消息队列/MQ 异步重试 | 最终一致 |
| **延迟双删** | 更新 DB → 删缓存 → 延迟几百 ms → 再删一次（清掉"删前 miss 读旧值回填"的脏缓存） | 简单粗暴，延迟取读请求耗时+业务耗时 |
| 订阅 binlog | canal 伪装从库订阅 MySQL binlog，收到变更后删/更新缓存 | **业务解耦**（代码里只管写 DB）、可靠（基于 binlog），主流方案 |

### 关键理解（加分点）

- 缓存+DB 是两个独立系统，**强一致做不到，追求最终一致**；真要强一致：读走主库/加分布式锁，代价是性能，一般不值得——不如把这类数据不进缓存。

## Q9: 主从复制的原理？全量和增量怎么切换？

### 流程

```
slave: replicaof master
  → 发送 psync <replid> <offset>（首次 replid=? offset=-1）
master: 返回 FULLRESYNC <replid> <offset> → bgsave 生成 RDB 发送（期间新写命令存 repl_backlog）
slave: 清空自身数据 → 载入 RDB → 接收 backlog 增量
之后：命令传播（异步），心跳保活（REPLCONF ACK offset）
```

### 断线重连：全量 or 增量？

- 靠 **repl_backlog（环形缓冲区）**：主库记录写命令的环形缓冲（默认 1MB），从库带着 `offset` 重连：
  - offset 还在缓冲区范围内 → **部分重同步**（只发缺的增量）；
  - 已被覆盖 → 退化为全量复制。
- 主库故障切换后 replid 变化，新主带 `psync` 的 second replid 支持从"旧主的从库"增量同步。
- 优化：调大 `repl-backlog-size`；**无盘复制**（`repl-diskless-sync`）适合磁盘慢的场景。

### 关键理解（加分点）

- 复制是**异步**的 → 主从延迟 + 故障切换可能丢最近写入（这也是 Cluster 不保证强一致的原因）。
- `min-replicas-to-write` / `min-replicas-max-lag`：从库不足或延迟过大时拒绝写入，降低丢数据窗口。

## Q10: 哨兵（Sentinel）的原理？脑裂是什么？

### 三个任务

1. **监控**：每秒 ping 主从/其他哨兵；超时未响应 → **主观下线（SDOWN）**；询问其他哨兵，达到 `quorum` 票确认 → **客观下线（ODOWN）**（防单个哨兵误判网络抖动）。
2. **选 leader**：哨兵之间用类 Raft 投票（先到先得 + 任期），leader 执行故障转移；需过半哨兵同意。
3. **通知/故障转移**：
   - 从库中选新主：**优先级（replica-priority）> 复制 offset 最大（数据最新）> runid 最小**；
   - 其余从库 replicaof 新主；旧主降级为从；通过发布订阅 + `+switch-master` 事件通知客户端。

### 脑裂

- 场景：主库与哨兵/从库**网络分区**，哨兵切了新主，旧主还带着客户端在写；分区恢复后旧主被降级为从、清空数据，**分区期间写入的数据丢失**。
- 缓解：`min-replicas-to-write 1` + `min-replicas-max-lag 10`——主库发现没有健康从库就拒绝写入，让旧主"写不进去"。

### 关键理解（加分点）

- 哨兵本身要部署**奇数个 ≥3** 且跨机房/机器（自身就是分布式一致性问题的应用）；
- quorum 只管"判定客观下线"，执行转移还需**过半哨兵**存活——所以哨兵数不宜只配到 quorum。

## Q11: Cluster 集群的原理？为什么是 16384 个槽？

### 核心机制

- 数据分片：全库划分为 **16384 个 slot**，`slot = CRC16(key) mod 16384`；每节点负责一段槽，主从结构，故障转移由节点间 Gossip 完成（不再需要哨兵）。
- **hash tag**：`{user1000}.profile` 与 `{user1000}.orders` 同槽，支持多 key 命令/事务/ Lua。
- 路由：客户端随便连任一节点；key 不归它管则返回 **MOVED** 重定向（smart client 本地缓存槽位映射表）；槽迁移中目标节点返回 **ASK**（只重定向这一次，不改映射）。
- 节点间 **Gossip 协议**：ping/pong/meet/fail 消息传播集群状态；故障判定类似哨兵（PFAIL → 过半主节点确认 → FAIL → 从库发起选举，需持有该槽的过半主节点投票）。

### 为什么 16384？

官方（antirez）回答：
1. 心跳包携带自己负责的槽位**位图**，16384 位 = 2KB；若 65536 则 8KB，ping/pong 频繁，带宽浪费；
2. Redis Cluster 建议不超过 1000 个主节点，16384 个槽足够划分；
3. CRC16 产生的 hash 有 16 位，mod 16384 后分布均匀性更好。

### 关键理解（加分点）

- Cluster 不支持跨槽的多 key 操作（除非 hash tag）、只有 db0、事务/Lua 限制同上。
- 集群模式下**所有写仍是异步复制**，failover 可能丢少量数据——它解决的是容量/可用性，不是强一致。

## Q12: 用 Redis 怎么实现分布式锁？有哪些坑？

### 标准姿势

```
加锁：SET lock_key <uuid:threadId> NX PX 30000   （原子：不存在才设 + 过期时间）
业务…
解锁：Lua 脚本（原子）：value 匹配才 DEL          （防止删了别人的锁）
```

- **value 必须唯一**（如 UUID+线程 ID）：否则 A 超时被释放后，B 拿到锁，A 执行完误删 B 的锁。
- **必须有过期时间**：持有者崩溃锁不死；且 SET NX + EXPIRE 必须一条命令（两条命令之间宕机 = 死锁）。

### 三个经典坑与进阶

| 坑 | 现象 | 方案 |
|----|------|------|
| 业务没执行完锁先过期 | 并发进入临界区 | **看门狗自动续期**（Redisson watchdog：默认锁 30s，每 10s 检查续到 30s） |
| 不可重入 | 同线程二次加锁死锁 | Redisson 用 **Hash 结构**（field=线程标识，value=重入次数） |
| 主从切换锁丢失 | 主库加锁成功未同步就从库升主，另一客户端也加锁成功 | **RedLock**：向 N 个（≥5）独立 Redission 实例依次加锁，**过半成功且总耗时 < 锁有效期**才算成功 |

### RedLock 的争议（加分点）

- Martin Kleppmann 质疑：进程 GC 停顿/时钟跳变下，锁可能"名义持有但已失效"，RedLock 的安全性论证不成立；应使用 **fencing token**（单调递增令牌，存储层校验拒绝旧令牌）。
- antirez 反驳：前提是时钟是准单调的。工程实践：**对正确性要求极高 → 用 DB 唯一约束/乐观锁或 ZooKeeper/etcd**；Redis 锁用于"效率"场景（防重复计算）足够。

## Q13: Redis 事务是什么？为什么不支持回滚？和 Lua 什么关系？

### MULTI / EXEC

- `MULTI` 后命令**入队不执行**，`EXEC` 一次性按序执行；`DISCARD` 放弃；`WATCH key` 乐观锁（EXEC 前 key 被改则事务作废，配合重试）。
- 两类错误：
  - **入队时语法错**：整个事务 EXEC 时全部不执行；
  - **执行时运行错**（如对 String 执行 LPUSH）：**跳过该条继续执行后续**——所以**不支持回滚**。

### 为什么不支持回滚（官方理由）

1. 运行时错误多为**编程 bug**，生产环境几乎不出现；
2. 不回滚实现简单、执行快，不需要为回滚维护 undo。

### Lua 脚本

- `EVAL/EVALSHA` 整段脚本**原子执行**（执行期间不插入其他命令），能做"读-判断-写"复合逻辑（如解锁、令牌桶），比事务灵活得多——**实际工程里 Lua 用得远多于 MULTI/EXEC**。
- 注意：脚本超时会阻塞（busy），`script kill` 只能杀未写过数据的脚本，写过数据的只能 `shutdown nosave`；脚本里所有 key 应同槽（Cluster）。7.0 用 Function 管理。

## Q14: 大 key 和热 key 是什么？怎么发现和治理？

| 问题 | 定义（参考） | 危害 | 治理 |
|------|-------------|------|------|
| **大 key** | String > 10KB；集合元素过多（如 hash 几万元素） | 读写/删除**阻塞单线程**、网络拥塞、集群数据倾斜、del 大集合卡顿 | 拆分（hash 分段、按字段拆 key）、压缩 value、**异步删除 `UNLINK`**（lazyfree，`lazyfree-lazy-expire` 等）、`redis-cli --bigkeys` / RDB 离线分析（rdb-tools） |
| **热 key** | 某 key QPS 极高集中在个别节点 | 单节点 CPU/网卡打满、集群倾斜、热点打挂 | 本地缓存（Caffeine 一级缓存 + 主动失效）、**key 加随机后缀打散成多份**、读写分离扛读、`redis-cli --hotkeys`（LFU 下）/监控发现 |

### 关键理解（加分点）

- 大 key 删除用 `UNLINK` 而不是 `DEL`：UNLINK 交给后台线程异步释放；同样 `FLUSHDB ASYNC`。
- 惰性释放相关参数：`lazyfree-lazy-expire / lazyfree-lazy-server-del / lazyfree-lazy-user-del`。

## Q15: pipeline 是什么？和 mget、事务、Lua 的区别？

- **pipeline**：客户端把一批命令一次性发出、一次性收结果，省 N-1 次 **RTT**（网络往返），大幅提升吞吐；命令之间可能插入其他客户端的命令，**不保证原子**。
- 对比：

| 方式 | 省往返 | 原子性 | 适用 |
|------|--------|--------|------|
| pipeline | 是 | 否 | 批量读写、可乱序 |
| mget/mset | 是（一条命令） | 是 | 同类型批量；Cluster 需同槽 |
| MULTI/EXEC | 是 | 是（无运行时回滚） | 简单打包 |
| Lua | 是 | 是 | 读-判-写复合逻辑 |

- 注意：pipeline 攒的命令和响应都在客户端内存里，**一次别打几十万条**，分批（如每批 500~1000）。

## Q16: 怎么做延迟队列、排行榜、签到、限流？（场景题速答）

| 场景 | 方案 | 要点 |
|------|------|------|
| **延迟队列** | ZSet，score = 执行时间戳 | 生产 ZADD；消费线程 `ZRANGEBYSCORE now -inf/+inf limit 0 N` 扫描，**用 Lua"查+删"原子取任务**（防多消费者重复消费）；失败回投 |
| **排行榜** | ZSet | ZINCRBY 加分、ZREVRANGE 取 TopN、**ZRANK/ZREVRANK 取排名 O(logN)**（跳表 span）；并列名次需业务层处理 |
| **签到/打卡** | BitMap | `SETBIT uid:202611:sign 3 1`（3 号）；`BITCOUNT` 月签天数、`BITPOS` 连续签到；亿级活跃统计用 RoaringBitmap 落库 |
| **UV 统计** | HyperLogLog | PFADD/PFCOUNT/PFMERGE；12KB 固定内存、误差 0.81%；精确 UV 走 BitMap（用户 ID 稠密）或 Set（小规模） |
| **附近的人** | GEO | GEOADD（geohash 存 ZSet）、GEOSEARCH 半径/矩形查询 |
| **简单限流** | INCR + EXPIRE | 固定窗口，临界突刺问题 |
| **滑动窗口限流** | ZSet（score=时间戳） | ZREMRANGEBYSCORE 清窗口外 + ZCARD 计数 + Lua 原子化 |
| **令牌桶** | Lua | 脚本内按时间补给令牌 + 扣减，Redisson RRateLimiter 已封装 |
| **全局唯一 ID** | INCR / 号段 | `INCR order:id` 取号段批量缓存在应用；趋势递增、无时钟问题（对比雪花） |
| **消息队列** | List（简单） / Stream（完整） | List：LPUSH+BRPOP 无 ACK 会丢；Stream：消费组、XACK、XPENDING 补偿、MAXLEN 限长 |

## Q17: Redis 和 Memcached 怎么选？

| 维度 | Redis | Memcached |
|------|-------|-----------|
| 数据结构 | 丰富（5 大基础+扩展） | 仅 String（k-v） |
| 持久化 | RDB/AOF/混合 | 无（重启全丢） |
| 高可用 | 主从/哨兵/Cluster | 无原生方案（客户端分片） |
| 线程模型 | 核心单线程（6.0 多线程 IO） | 多线程 |
| 集群 | 原生 Cluster | 客户端一致性哈希 |
| 原子操作 | 事务/Lua/丰富命令 | CAS |
| 适用 | 绝大多数场景 | 纯缓存、超大并发、结构简单、已有多 Mem 运维积累 |

- 结论：新项目基本默认 Redis；Memcached 的多线程在极端大 value 高并发下有优势。

## Q18: 内存满了/变慢了，怎么排查？

### 内存

1. `info memory`：`used_memory_human`、`mem_fragmentation_ratio`（>1.5 碎片严重，<1 说明用到 swap 很危险）、`mem_allocator`；
2. 碎片治理：4.0+ **active defrag**（`activedefrag yes`，在线整理）；
3. 检查大 key、过期 key 堆积、惰性删除堆积。

### 性能

| 排查点 | 手段 |
|--------|------|
| 慢命令 | `slowlog get`（`slowlog-log-slower-than` 默认 10ms）；禁用/重命名 `KEYS *`、`FLUSHALL` 等危险命令 |
| 大 key 操作 | `--bigkeys`、命令耗时（LRANGE 全量、SMEMBERS、HGETALL） |
| 集合全量聚合 | 改 SSCAN/HSCAN 游标分批 |
| swap | `used_memory` > 物理内存、`mem_fragmentation_ratio < 1` |
| CPU/网络 | 单线程打满：拆实例/读写分离/集群；`latency monitor` 记录延迟事件 |
| fork 卡顿 | `latest_fork_usec` 大 → 控制实例大小（单实例建议 < 10GB）、降低 RDB/AOF 频率、开启 `lazy-free` |
| AOF 刷盘 | everysec 下磁盘慢导致阻塞（aof_delayed_fsync 增长）→ 换盘/调策略 |

## Q19: 一句话快问快答（高频送分/送命题）

| 问题 | 要点 |
|------|------|
| Redis 单 key/value 最大多少？ | 单 String 512MB；集合元素个数理论上限 2^32-1 |
| 重启后数据加载顺序？ | 同时开 RDB+AOF 时**优先 AOF**（更完整）；只开 RDB 用 RDB |
| Redis 有几种 db？ | 单机 16 个（select 0~15），Cluster 只有 db0；业务上不推荐用多 db 区分 |
| 过期时间存在哪？ | 独立的过期字典（expires dict），expire key 更新 TTL；持久化 RDB/AOF 都保留 TTL 信息 |
| 惰性删除 + 定期删除为什么还不够？ | 冷 key 永不访问 → 惰性删不到；定期有抽样上限 → 最终靠**内存淘汰**兜底 |
| 渐进式 rehash？ | 扩容时新旧两张表，后续每次增删改查顺带搬一个桶 + 定时任务搬批，避免一次性卡顿 |
| Redis 6.0/7.0 重要特性？ | 6.0：多线程 IO、ACL 权限、RESP3、客户端缓存（tracking）；7.0：Function、listpack 取代 ziplist、Multi-Part AOF、Sharded Pub/Sub（Cluster 广播风暴治理） |
| 客户端缓存？ | 6.0 tracking：服务端记客户端读过的 key，失效时推送 invalidation 消息，减少重复请求 |
| 主从延迟大怎么排查？ | `info replication` 看 master_repl_offset 与 slave offset 差值；大命令/大 key/带宽/从库负载 |
| KEYS 误用会怎样？ | O(N) 阻塞主线程，全站卡死；用 SCAN（游标、可能重复、需去重） |
| Redis 瓶颈在哪？ | 内存容量、网络带宽、单线程 CPU；不是并发连接（epoll 轻松数万） |
| 缓存预热？ | 上线前/大促前主动灌热点数据（脚本/流量回放），防冷启动打 DB |
| Redis 挂了缓存全失效怎么办？ | 高可用（哨兵/集群）+ 服务端**熔断限流降级**兜底 + 多级缓存 |
| Redis 可以做持久化数据库吗？ | 可以但一般不：异步复制+淘汰策略下不保证不丢；重要数据 DB 为准，Redis 作加速层 |
