## Why

司机评价聚合页（查件列表「更多 → 司机评价」进入的 `pages/evaluation-list`）在全部待评价运单提交完成后，会自动 `switchTab` 闪跳回查件列表 tab；评价完成后刷新页面同样触发跳转。用户在完成评价后被突然带离当前页面，体验割裂（禅道 #564591，父需求 #564870 体验走查）。

## What Changes

- 移除一键评价（批量评价）成功且列表已无待评价运单时自动 `switchTab` 跳转查件 tab（`/layout/pages/waybill/index`）的逻辑：页面停留在聚合页，由列表组件渲染既有空状态（`ky-empty`「暂无待评价运单」+「去寄件」按钮）。
- 空状态下下拉刷新 / 页面重新拉取数据后仍无待评价运单时，页面保持当前页展示空状态，不跳转。
- 顶部规则横幅（RuleBanner）与评价记录入口（RecordsEntry）保持现有导航结构不变。
- 单票评价提交、评价记录页跳转、在线客服、去寄件等其他跳转与交互不在本次范围，保持不变。
- 不涉及接口、埋点、权限与业务流程变更（PRD 明确无埋点需求）。

## Capabilities

### New Capabilities
- `driver-evaluation-aggregation-page`: 司机评价聚合页（`pages/evaluation-list`）的列表展示、评价提交后页面行为与空状态展示规范——全部评价提交完成后停留当前页展示空状态，不自动跳转查件列表。

### Modified Capabilities
<!-- 无：现有 driver-evaluation-records-miniapp 规范仅覆盖评价记录页，不涉及聚合页提交后的跳转行为 -->

## Impact

- 代码：`src/modules/kye-miniapp-waybill/src/pages/evaluation-list/index.vue`
  - `onEvaluatedSuccess` 中两处 `onToBack()` 调用及其 `nextTick` 跳转判断块移除。
  - `onToBack` 函数（`Taro.switchTab` 至查件 tab）移除（全项目仅此页使用）。
- 不影响接口（`searchToBeEvaluated` / `Addscore` / 批量评价轮询逻辑不变）、不影响埋点。
- 空状态 UI 复用现有 `ky-list-standard` 的 `#empty` 插槽与 `ky-empty` 样式，无需新增 UI。
- 端覆盖：微信小程序、支付宝小程序、H5 同一份代码同步生效（APP 端通过 H5/小程序容器承接，不在本仓库）。
