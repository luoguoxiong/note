## Why

禅道需求 #567866（TY567866-提交下单推荐模板交互调整）：寄件模板无值时，旧逻辑在下单成功后弹出寄件模板设置弹窗，交互打断感强。本次优化（仅移动端）改为在下单成功页展示"保存模板横幅"，降低打扰、引导用户主动保存模板。

## What Changes

- 下单成功页接口 `web.order.single.app.getSingleSaveBaseResult` 的返回 `templateVo` 新增字段 `showSaveBanner`，为 `true` 时在下单成功页展示保存模板横幅
- 横幅内容：图标 + 标题"保存为「寄件模板」" + 文案"保存为寄件模板，下次寄件直接使用" + 【保存模版】按钮，点击整个横幅模块跳转新增寄件模板页（H5，交互与线上一致）
- `templateVo` 类型定义与 `useOrderSuccess` 中两处兜底赋值同步补充该字段
- 寄件模板有值时的线上逻辑（Footer「保存模板」按钮 + 气泡）保持不变
- 非目标：埋点（本次不做）、旧弹窗逻辑移除（后端处理）、`showSaveBanner` 与 `showSaveTemplate` 互斥性（后端保证，前端不处理）

## Capabilities

### New Capabilities
- `order-success-template-banner`: 下单成功页保存模板横幅的展示条件、内容与跳转交互

### Modified Capabilities

## Impact

- 代码（均为 git 追踪的真实源码，位于 `src/modules/order-build-sub-pages/`）：
  - `order-public/types/waybill.ts`：`templateVo` 接口新增 `showSaveBanner` 字段
  - `pages/order-success/hooks/useOrderSuccess.ts`：两处 `extInfo` 兜底赋值补充默认值
  - `pages/order-success/index.vue`：新增横幅 UI（运单卡片与 Footer 之间），点击复用 `toSaveTemplate` 的 H5 跳转链路（`#/detail?pageFrom=100`）
- 接口：`web.order.single.app.getSingleSaveBaseResult`（后端已支持/即将支持 `templateVo.showSaveBanner`）
- 影响端：微信小程序 / 支付宝小程序 / H5 移动端（需求仅移动端，无 PC 特殊处理）
