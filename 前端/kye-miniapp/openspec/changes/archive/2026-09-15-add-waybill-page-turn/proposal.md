# Proposal: add-waybill-page-turn

## Why

查件列表与运单页目前只能查看单票运单，用户处理一批运单（如待签收）时需要反复返回列表再点进下一票，操作路径长。PRD 要求在运单路由页/详情页提供「上一票 / 下一票」浮条，让用户在**状态一致的运单合集**内连续查看。

## What Changes

1. 新增翻页上下文模块单例 `useWaybillPageTurn`（`src/hooks/useWaybillPageTurn.ts`）：
   - 查件列表点卡片时按当前状态 tab 取同状态运单合集（`pageTurning` 锚点分页接口一次拉满缓存），写入模块级上下文；
   - 上下文每次 `setPageTurnContext` 强制重置 `waybills: []`，保证列表换卡片 = 新会话，翻页 redirectTo = 同会话复用缓存。
2. URL 以 `pageTurn` 参数表达翻页模式（字符串枚举 `PageTurnMode`，值与枚举同名、直接可读、无需转换）：
   - `pageTurn=showTurnAndData`：列表点卡片首次进入，无缓存时拉取围绕锚点的合集；
   - `pageTurn=showTurn`：点上一票/下一票 redirectTo 重建 / 路由页进详情，合集已缓存只定位不重拉；
   - 不带 `pageTurn`：不启用翻页（外部短信/公众号/其他业务页/不支持状态 tab 的入口自然不初始化）。
3. 翻页浮条（`page-turn` 组件）在「成功定位到合集且总票数 > 1」（`visible = signCount > 1`）时展示，支持手动折叠；
4. 路由页接入：onMounted 时 `pageTurn=showTurn` 立即缓存定位（不等主接口）；主接口成功 `.then` 后按 `pageTurnMode` 初始化——主接口成功才拉合集，验证/异常后重试成功正常展示，不维护额外阻断标记；
5. 详情页接入：onMounted 按 `pageTurnMode` 初始化（与 `getWaybillDetail` 并行）；
6. routeCard 跳转 prop 由 `showPageTurn` 改名为 `pageTurnEnabled`，URL 拼 `pageTurn=showTurn`。

## Capabilities

### New Capabilities

- `waybill-page-turn`：运单路由页/详情页上一票/下一票翻页。

## Impact

- `src/apis/waybill-search/types.ts`：新增 `PageTurnSource`、`PageTurnMode`、`PageTurningRequest`/`IPageTurningResponse` 等类型；
- `src/apis/waybill-search/index.ts`：新增 `pageTurning` 接口封装（直连 `web.query.waybill.pageTurning`）；
- `src/hooks/useWaybillPageTurn.ts`：新增；
- `src/components/waybill-search/index.vue`：列表写翻页上下文 + 跳转 URL 拼 `pageTurn`；
- `src/pages/waybill-route/index.vue`、`src/pages/waybill-route/components/routeCard/index.vue`：路由页接入与卡片跳转参数；
- `src/pages/waybill-detail/index.vue`、`src/pages/waybill-detail/components/page-turn/`：详情页接入与浮条组件。
