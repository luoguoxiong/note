# Proposal

## Why

绑码能力已完成原生化（H5 web-view → 原生半屏弹窗组件），「我的」及个人中心入口已切换且跳转速度缩减至 100ms 以下（父需求 576403）。本次将剩余三个绑码入口一并切换为原生半屏弹窗，消除 H5 web-view 跳转链路长、首屏慢、体验割裂的痛点。

- 禅道需求：https://zentao.ky-tech.com.cn/platform-home/#/need-detail/577614 （首页立即绑码/切换客户编码入口）
- 禅道需求：https://zentao.ky-tech.com.cn/platform-home/#/need-detail/578367 （预存运费入口）
- 需求文档：`d:\code\netc-base-doc\用户中心组\需求\578681-企业认证入口内绑码组件切换原生\578681-企业认证入口内绑码组件切换-v0.2.0.md`（企业认证入口，禅道 ID 578681）

## What Changes

- 首页「立即绑码 / 切换客户编码」按钮（三态文案：去切换/立即绑码/去更换）：由跳转 H5 绑码页改为当前页拉起 `CustomerBindDialog` 半屏弹窗，弹窗按用户绑定状态自动进入 bind/switch/change 模式；绑码完成后停留首页，刷新按钮三态文案
- 首页「预存运费」菜单（未绑码点击时）：由 `openCustomerPage('预存运费')` 跳 H5 改为拉起半屏绑码弹窗；弹窗内绑码成功后停留首页（已确认：不自动续跳预存运费，用户再次点击进入）
- 实名认证页「企业认证」卡片（未绑码且未企业认证时）：由跳 H5 绑码页改为拉起半屏绑码弹窗；绑码完成后关闭弹窗、停留实名认证页并刷新入口展示状态，按绑码企业类型与认证状态执行回流路由（平台客企业不展示入口；非平台客按认证状态展示未认证/已认证态）
- 埋点：三入口仅新增传入各自的 `express-type`（沿用现有取值方式），弹窗组件内部自动上报 `exp_customer_code_bind_page`（`isPopUp: true`）；企业认证入口保留既有 `exp_id_company_popup` 事件在拉起弹窗时机上报，口径不变、不新增埋点事件
- 清理实名认证页遗留死代码：`showBindCodeConfirmDialog` ref（模板无绑定的历史遗留状态）
- 无灰度开关代码（已确认：现有灰度即放量过程本身，前端不判断新旧路径，统一走半屏弹窗；低版本端天然不支持原生组件、继续走原 H5 路径，无需额外兜底逻辑）
- 页面级绑码 H5 返回刷新逻辑（`useBindCustomer` 的 `useDidShow`）保留不动，作为 H5 场景兼容

## Capabilities

### New Capabilities

- `bind-code-popup-entries`：绑码半屏弹窗入口切换——首页绑码入口、首页预存运费入口、实名认证页企业认证入口三个场景由 H5 web-view 跳转改为当前页拉起原生半屏弹窗的统一行为规范（触发条件、弹窗交互、绑码完成/关闭后的回流行为、埋点口径）

### Modified Capabilities

无

## Impact

- **代码影响**：
  - `src/layout/pages/home/components/bind-code/index.vue`（首页绑码入口，主包）
  - `src/layout/pages/home/components/market-area/index.vue`（首页预存运费入口，主包）
  - `src/modules/user/pages/realname/home/index.vue`（实名认证页，`modules/user` 分包）
  - 复用组件 `src/modules/user/pages/customer-code/customer-code-popup/index.vue`（不改动组件本体）
- **小程序平台**：微信 weapp、支付宝 alipay、H5 三端；组件内部已含 H5 环境底部偏移适配，三端行为一致
- **包体积**：弹窗壳已被主包「我的」页静态引入，重组件（bind-code/switch-code/change-code 等）已 `defineAsyncComponent` 懒加载且被分包页面共用，本次改动主包体积增量≈0（仅入口胶水代码）
- **风险面**：不改动绑码组件本体内部逻辑；已绑码/已企业认证用户及其他绑码入口（寄件流程 order-customer、notice-bar、payment-share 等）路径不动
