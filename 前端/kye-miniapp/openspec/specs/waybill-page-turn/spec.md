# waybill-page-turn Specification

## Purpose

运单路由页/详情页的「上一票 / 下一票」翻页能力：在状态一致的运单合集内连续查看运单，含合集拉取缓存、浮条 UI、边界提示、异常差异化处理与埋点。

## Requirements

### Requirement: 列表入口按状态 tab 写入翻页上下文

查件列表 SHALL 在用户点击运单卡片时，按当前状态 tab 决定是否启用翻页并写入翻页上下文：

- 当前状态属于支持翻页的状态集合（`PAGE_TURN_STATUSES`）时，以被点运单为锚点（`entryWaybillNumber`）、当前 tab 对应的统计总数（`STATUS_COUNT_KEY` 映射字段）为 `totalCount`、列表查询参数为 `queryParams` 调用 `setPageTurnContext`，跳转 URL SHALL 携带 `pageTurn=showTurnAndData`（`PageTurnMode.ShowTurnAndData`）；
- 当前状态不支持翻页时，MUST NOT 写入翻页上下文，跳转 URL MUST NOT 携带 `pageTurn` 参数。

跳转 URL 的状态判断 SHALL 复用 `displayStatus`（跟随列表数据刷新），而非 header 的实时 tab。

#### Scenario: 支持翻页的状态点卡片

- **WHEN** 用户在支持翻页的状态 tab 点击运单卡片
- **THEN** 写入翻页上下文（锚点、totalCount、查询参数），详情页/路由页 URL 携带 `pageTurn=showTurnAndData`

#### Scenario: 不支持翻页的状态点卡片

- **WHEN** 用户在不在 `PAGE_TURN_STATUSES` 内的状态 tab 点击运单卡片
- **THEN** 不写入翻页上下文，跳转 URL 不携带 `pageTurn` 参数

### Requirement: 翻页上下文模块单例共享

翻页上下文 SHALL 为模块级单例。`setPageTurnContext` 每次写入 MUST 强制重置 `waybills` 为空数组，保证：

- 列表点新卡片必然构成新会话（重新拉取合集）；
- 翻页 redirectTo 的 URL 参数不变（`pageTurn=showTurn`），重建页面命中缓存即同会话复用合集。

#### Scenario: 会话隔离

- **WHEN** `setPageTurnContext` 被调用
- **THEN** 上下文中 `waybills` 被重置为空数组，旧会话合集不会泄漏到新会话

### Requirement: pageTurning 锚点分页接口一次拉取缓存

翻页合集 SHALL 通过 `pageTurning`（`web.query.waybill.pageTurning`）接口按锚点一次拉取：`entryWaybillNumber` + 列表查询参数 + `pageSource`，`page=1`、`pageSize=PAGE_SIZE_MAX`；结果缓存在模块级上下文，翻页切换纯前端定位，MUST NOT 逐票请求后端。

#### Scenario: 无缓存初始化拉取

- **WHEN** `initPageTurn` 以 `ShowTurnAndData` 模式执行且上下文无缓存合集
- **THEN** 调用 `pageTurning` 一次拉满合集写入上下文并定位当前票

#### Scenario: 缓存命中仅定位

- **WHEN** `initPageTurn` 执行时上下文已有缓存合集
- **THEN** 不请求接口，仅按运单号定位（locate）

### Requirement: pageSource 页面来源与后端开关语义

`pageSource` SHALL 使用 `PageTurnSource` 枚举：路由页传 `Route = 10`，详情页传 `Detail = 20`（已与后端确认；不传时后端默认按 `20` 详情页处理），由后端按来源区分翻页开关校验。

浮条显隐 SHALL 仅由数据派生：`visible = signCount > 1`（成功定位到合集且总票数 > 1）。不带 `pageTurn` 参数的入口 MUST NOT 初始化翻页，总票数恒为 0、不展示浮条；合集合计仅 1 票时同样不展示。

#### Scenario: 成功定位且多票展示

- **WHEN** 页面成功定位到合集且 `signCount > 1`
- **THEN** 展示翻页浮条

#### Scenario: 外部进入不展示

- **WHEN** 用户从外部链接进入路由页/详情页（URL 无 `pageTurn` 参数）
- **THEN** 不初始化翻页，总票数为 0，不展示浮条

### Requirement: 翻页浮条 UI 与手动折叠

翻页浮条 SHALL 展示上一票按钮、当前页码（当前索引/总票数）、下一票按钮。用户手动折叠时 SHALL 收起浮条并上报 `reportCollapse` 埋点，且可通过手动展开恢复。

#### Scenario: 手动折叠

- **WHEN** 用户点击浮条的折叠操作
- **THEN** 浮条收起，上报 `reportCollapse`，并可手动展开恢复

### Requirement: 翻页切换、边界提示与跳转锁防重

点击上一票/下一票 SHALL 通过 `redirectTo` 重建目标页（URL 携带 `pageTurn=showTurn`，`PageTurnMode.ShowTurn`），同会话缓存定位目标运单：

- 已是第一票点上一票 / 最后一票点下一票时，SHALL toast 提示且不跳转；
- 跳转进行中的重复点击 SHALL 被跳转锁拦截，MUST NOT 重复跳转。

#### Scenario: 正常切换

- **WHEN** 用户点击上一票/下一票且目标票存在
- **THEN** `redirectTo` 重建页面，URL 携带 `pageTurn=showTurn`，缓存定位展示目标票

#### Scenario: 边界提示

- **WHEN** 当前已是第一票点上一票（或最后一票点下一票）
- **THEN** toast 提示已到边界，不发生跳转

#### Scenario: 跳转锁防重

- **WHEN** 跳转尚未完成时重复点击翻页按钮
- **THEN** 重复点击被拦截，不产生多次跳转

### Requirement: 路由页首次进入与翻页切换的异常差异化处理

翻页初始化 SHALL 以「主接口成功为前提、按 URL `pageTurn` 模式区分时机」，MUST NOT 维护额外的阻断标记（如 firstEnterBlocked）：

- 路由页 onMounted：URL `pageTurn=showTurn` 时立即用缓存合集定位当前票（翻页重建场景，不等主接口）；
- 路由页主接口 `queryRouteMobile` 成功 `.then`：带 `pageTurnMode` 时按模式初始化（`showTurnAndData` 无缓存时拉合集）；
- 主接口失败（游客验证、运单不存在、网络异常等）时本次不初始化；验证通过或重试成功后走 `.then` 正常初始化展示。

#### Scenario: 翻页重建即时显示不等主接口

- **WHEN** URL 携带 `pageTurn=showTurn` 进入路由页（上一票/下一票 redirectTo 重建）
- **THEN** onMounted 即用缓存合集定位当前票并展示浮条，不等待主接口返回

#### Scenario: 游客验证暂不展示、通过后正常展示

- **WHEN** 首次进入触发游客验证（滑块/手机后四位），主接口未成功
- **THEN** 本次不初始化翻页；验证通过后主接口重试成功，按 `pageTurnMode` 正常初始化并展示浮条

#### Scenario: 异常暂不展示、刷新成功后展示

- **WHEN** 主接口因网络异常/运单不存在而失败
- **THEN** 本次不初始化翻页且不维护阻断标记；刷新成功后正常初始化展示

### Requirement: 路由页浮条随浮动面板自动收起

路由页底部浮动面板（路线/节点信息）展开或收起引起页面高度变化时，浮条 SHALL 自动收起（collapse），面板收起后浮条恢复展示。

#### Scenario: 面板展开自动收起

- **WHEN** 路由页浮动面板展开引起高度变化（heightChange）
- **THEN** 浮条自动 collapse；面板收起后浮条恢复

### Requirement: 状态/信息变更 toast 由主接口 code 驱动

翻页会话内主接口返回状态/信息变更 code 时（`isWaybillStatusChanged`，code 集合 `WAYBILL_STATUS_CHANGED_CODES`），SHALL 通过 `notifyStatusChanged` toast 提示用户，浮条保留、可继续翻页。

#### Scenario: 翻页会话内状态变更

- **WHEN** 翻页会话内主接口返回状态变更类 code
- **THEN** toast 提示状态/信息变更，浮条保留可继续翻页

### Requirement: 路由与详情间跳转的页面栈与返回行为

路由页跳详情 SHALL 使用 `navigateTo`（保留路由页页面栈，详情页返回即回路由页）；翻页切换 SHALL 使用 `redirectTo` 替换当前页（避免栈内堆积重复页面）。

#### Scenario: 路由页进详情

- **WHEN** 用户从路由页进入某票详情
- **THEN** `navigateTo` 压栈，详情页返回时回到路由页

#### Scenario: 翻页切换

- **WHEN** 用户在路由页/详情页点击上一票/下一票
- **THEN** `redirectTo` 替换当前页，返回行为不经过被替换的旧票页面

### Requirement: 翻页埋点口径

翻页点击 SHALL 上报埋点，参数包含 `pagePath`（页面路径）、`pageSource`（来源枚举）、翻页方向（prev/next）、当前页码与总票数；手动折叠 SHALL 上报 `reportCollapse`。

#### Scenario: 翻页点击上报

- **WHEN** 用户点击上一票/下一票触发跳转
- **THEN** 上报翻页埋点（pagePath、pageSource、方向、页码、总票数）
