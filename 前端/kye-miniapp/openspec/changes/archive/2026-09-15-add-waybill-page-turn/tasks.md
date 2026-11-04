# Tasks: add-waybill-page-turn

## 1. 类型与接口

- [x] 1.1 types.ts 新增 `PageTurnSource`（Route=10 / Detail=20，已与后端确认；不传默认按 Detail=20 处理）
- [x] 1.2 types.ts 新增 `PageTurnMode` 字符串枚举（ShowTurn='showTurn' / ShowTurnAndData='showTurnAndData'，URL 直读零转换）
- [x] 1.3 types.ts 新增 `PageTurningRequest` / `IPageTurningResponse` / `IPageTurningItem`
- [x] 1.4 apis/waybill-search/index.ts 新增 `pageTurning` 封装（直连 `web.query.waybill.pageTurning`）

## 2. 翻页上下文 hook

- [x] 2.1 新建 `src/hooks/useWaybillPageTurn.ts`：模块级上下文 + `setPageTurnContext`（每次写入强制重置 `waybills: []`，会话隔离）
- [x] 2.2 `initPageTurn(num, mode?)`：空 mode 直接 return；有缓存 locate；`mode !== ShowTurnAndData` 不重拉；否则拉合集定位，异常置 `signCount = 0`
- [x] 2.3 `visible = computed(() => signCount.value > 1)`，无 `enabled` 入参
- [x] 2.4 `pageTurn` 切换：边界 toast、跳转锁防重、埋点上报、redirectTo（`buildRedirectParams` 携带 `pageTurn=showTurn`）
- [x] 2.5 `isWaybillStatusChanged` / `notifyStatusChanged`：状态/信息变更 toast 由主接口 code 驱动
- [x] 2.6 `reportCollapse`：手动折叠埋点

## 3. 浮条组件

- [x] 3.1 新增 `waybill-detail/components/page-turn/`：上一票 / 页码（当前/总数）/ 下一票，手动折叠 `defineExpose({ collapse })`
- [x] 3.2 多端适配（picker 类模板由 `@kye-netc/miniapp-plugins` 统一处理，无需特判）

## 4. 列表接入（waybill-search）

- [x] 4.1 `STATUS_COUNT_KEY` 取当前状态 tab 统计总数写入 `totalCount`
- [x] 4.2 `handleWaybillCardTap`：支持翻页的状态拼 `pageTurn=showTurnAndData`；不支持的入口不拼参数
- [x] 4.3 `getPageTurnStatus` 复用 `displayStatus`（跟随数据刷新，不依赖 header ref 实时 tab）

## 5. 路由页接入（waybill-route）

- [x] 5.1 onMounted：`pageTurn === PageTurnMode.ShowTurn` 立即缓存定位，不等主接口
- [x] 5.2 `queryRouteMobile` 成功 `.then`：带 `pageTurnMode` 才 `initPageTurn`（主接口成功才拉合集）
- [x] 5.3 接口失败不初始化、不维护阻断标记（无 firstEnterBlocked）；游客验证/重试成功走 `.then` 正常展示
- [x] 5.4 浮条随浮动面板 `heightChange` 自动 `collapse`

## 6. 详情页接入（waybill-detail）

- [x] 6.1 onMounted：带 `pageTurnMode` 才 `initPageTurn`（与 `getWaybillDetail` 并行）
- [x] 6.2 `getWaybillDetail` 异常时 `isWaybillStatusChanged` → `notifyStatusChanged`（不判 showPageTurn）
- [x] 6.3 `buildRedirectParams` 携带 `pageTurn=showTurn`
- [x] 6.4 routeCard prop 改名 `pageTurnEnabled`，跳转 URL 拼 `pageTurn=showTurn`

## 7. 埋点

- [x] 7.1 翻页点击上报（pagePath、pageSource、方向、页码）；手动折叠上报 reportCollapse

## 8. 验证

- [x] 8.1 H5 实测：列表 `pageTurn=showTurnAndData` 进入拉合集、翻页 `showTurn` redirectTo 重建缓存定位、外部进入无浮条
- [x] 8.2 grep 校验无 `showPageTurn` / `firstEnterBlocked` / `fromRoute=1` 残留
