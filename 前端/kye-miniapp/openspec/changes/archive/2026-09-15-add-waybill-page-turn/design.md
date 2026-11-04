# Design: add-waybill-page-turn

## Context

- 查件列表（waybill-search）按状态 tab 展示运单卡片，点击卡片进入路由页或详情页。
- PRD 要求路由页/详情页支持在「同状态运单合集」内上一票/下一票连续查看，含浮条 UI、边界提示、手动折叠、埋点。

## Goals / Non-Goals

- Goals：单例上下文 + URL 模式参数驱动，覆盖列表首次进入 / 翻页重建 / 路由进详情 / 外部进入四类来源，行为正确且可排查。
- Non-Goals：不做跨状态 tab 的混合合集翻页；不做合集本地持久化缓存。

## Decisions

### D1. 合集来源：pageTurning 锚点分页接口一次拉满

以点中的运单为锚点（`entryWaybillNumber` + 当前列表查询参数），调用 `pageTurning`（`web.query.waybill.pageTurning`）按 `page=1`、`pageSize=PAGE_SIZE_MAX` 一次拉满合集并缓存在模块级上下文；翻页切换纯前端定位，不再请求后端。

### D2. 上下文单例与会话隔离

hook 内部持有模块级 `pageTurnContext`；`setPageTurnContext` 每次写入**强制重置 `waybills: []`**：

- 列表点新卡片 = 必然新会话，重新拉合集；
- 翻页 redirectTo 的 URL 参数不变（`pageTurn=showTurn`），重建页面命中缓存 = 同会话复用。

### D3. 翻页模式：字符串枚举，URL 直读零转换

`PageTurnMode`（types.ts）：`ShowTurn = 'showTurn'`、`ShowTurnAndData = 'showTurnAndData'`。

- 页面从 `router.params.pageTurn` 读到的字符串即枚举值，直接比较，无 `Number()`/`String()` 转换层；URL 抓包即可读，排查直观；
- 数字枚举方案（需一层转换）被否决：转来转去排查问题难查；
- 早期设计的 `showPageTurn` 布尔标记、`firstEnterBlocked` 阻断标记、hook `enabled` 入参、`modeRef` 均已移除：URL 只表达来源意图（不可变），显隐只由数据派生，不需要运行时改写的开关。

### D4. 显隐规则：visible = signCount > 1

浮条只在「成功定位到合集且总票数 > 1」时展示（`visible = computed(() => signCount.value > 1)`）：

- 不带 `pageTurn` 的入口不初始化，总票数恒为 0，自然不显示；
- 合集只有 1 票不显示；
- 无独立 enabled 开关。

### D5. 初始化时机：mode 仅作 initPageTurn 入参

`initPageTurn(num, mode?)`：mode 为空直接 return；有缓存 `locate`；`mode !== ShowTurnAndData` 时 return（只定位不重拉）；否则拉合集后 `locate`，异常置 `signCount = 0`。

| 场景 | mode | 时机 | 行为 |
| --- | --- | --- | --- |
| 列表首次进入 | showTurnAndData | 路由页主接口成功 `.then` / 详情页 onMounted | 无缓存拉合集后定位 |
| 翻页 redirectTo 重建 | showTurn | 路由页 onMounted | 缓存命中即时定位，不等主接口 |
| 路由页进详情 | showTurn | 详情页 onMounted | 同上 |
| 外部进入 | 不带 | — | 不初始化 |

异常差异化处理：游客验证 / 运单不存在 / 网络异常时主接口不成功，自然不初始化；**不维护额外阻断标记**，验证通过或重试成功后走 `.then` 正常初始化展示。行为变化：旧方案 `firstEnterBlocked` 会永久禁用翻页，已确认弃用（重试成功正常展示为预期行为）。

### D6. hook 签名

```ts
// 列表页写入（每次点卡片调用，强制新会话）
setPageTurnContext({ queryParams, entryWaybillNumber, totalCount })

// 页面接入（路由页 pageSource=Route，详情页 pageSource=Detail）
useWaybillPageTurn({ pagePath, pageSource, buildRedirectParams })
  => { signCount, currentIndex, visible, initPageTurn, pageTurn, reportCollapse, notifyStatusChanged }

// 状态变更 code 集合与判断
WAYBILL_STATUS_CHANGED_CODES / isWaybillStatusChanged(code)
```

## Risks / Trade-offs

- [上下文为模块单例] 多页面同时挂 hook 共享同一份 → 靠「每次 setPageTurnContext 重置」+ 跳转时序保证；redirectTo 重建页面的时序已实测验证。
- [合集一次拉满] 依赖 `PAGE_SIZE_MAX` 上限 → 超上限部分翻不到；后端按 pageSource 校验开关。
- [异常时浮条暂不出现] 游客验证/断网时无浮条，重试成功后出现 → 已确认可接受。

## Open Questions

- 无（均已随实现确认）。
