## 1. 共享基础设施

- [ ] 1.1 统一 `FeeAuthApplyStatus` 常量到 `order-global-package/constants/`，保留 `const` 对象形式，下游从共享包引入
- [ ] 1.2 创建共享组件目录 `order-global-package/components/business/estimated-cost/components/apply-popup-content/`

## 2. 共享组件 `apply-popup-content`

- [ ] 2.1 编写 `index.vue` 模板：以下单侧完整内容为基准，状态展示区（`v-if="status !== FeeAuthApplyStatus.申请查看"`）+ 输入框（`v-else`），含商务二维码
- [ ] 2.2 定义 Props：status / title / applyTime / applyReason / contactTypeDesc / contactButtonName / showBusinessQr / modalShow / modelValue / textDisable / trackingId / exposureReport
- [ ] 2.3 定义 Events：`update:modelValue`、`contact`
- [ ] 2.4 编写 `index.module.scss`：以下单侧 `index.scss` 为基准，类名精简为 `apply-content` / `apply-status` / `status-icon` / `status-title` / `status-time` / `apply-reason` / `apply-commerce` / `commerce-desc` / `commerce-qr` / `commerce-btn`
- [ ] 2.5 埋点相关：`trackingId` 不为空时渲染 `id` 属性，`exposureReport` 不为空时绑定 `:exposure-report` directive；不传则不渲染
- [ ] 2.6 保留 H5 端 `#ifdef h5` 的条件样式（svg icon 宽度 `0.7rem`）

## 3. 下单侧适配层改造

- [ ] 3.1 精简 `order-public/.../apply-popup/index.vue`：模板中的状态展示区和输入框替换为 `<ApplyPopupContent>` 组件，保留外层 `BottomPopup`、埋点注册、`contactPopup` 逻辑
- [ ] 3.2 传入 `trackingId` 和 `exposureReport` props，确保埋点行为不变
- [ ] 3.3 保留 `useOrderExposureReport(['exp_express_cost_commerce_already_v1'])` 在适配层
- [ ] 3.4 引入 `FeeAuthApplyStatus` 改为从 `@order-global-package-order` 导入，删除本地定义
- [ ] 3.5 删除 `apply-popup/index.scss`（样式已迁移到共享组件）
- [ ] 3.6 删除 `apply-popup/index.vue` 中 `@import './index.scss'` 引用

## 4. 运费时效侧适配层改造

- [ ] 4.1 精简 `freight-time/.../estimated-shipping-popup/index.vue`：两个内容分支（`v-if="!isApplyView"` / `v-else`）替换为 `<ApplyPopupContent>`
- [ ] 4.2 传入 `showBusinessQr="true"`（新增商务二维码）
- [ ] 4.3 `@contact` 事件绑定 `showContact = true`（替换原 `openContact`）
- [ ] 4.4 不传 `trackingId` / `exposureReport`（运费时效侧无埋点需求）
- [ ] 4.5 删除 `freight-time/.../estimated-shipping-popup/index.module.scss`（样式已迁移到共享组件）
- [ ] 4.6 删除模板中 `<ContactBusiness>` 组件调用（仍在适配层保留，放在 `BottomPopup` 内、`ApplyPopupContent` 外）
- [ ] 4.7 引入 `FeeAuthApplyStatus` 改为从共享包导入，删除 `freight-time/constants/index.ts` 中的本地定义

## 5. Bug 修复

- [ ] 5.1 **下单侧**：`useApplyPopup.ts` 中 `onConfirm` 的 `modalShow.value = false` 移到 `.then()` 成功分支内；失败时不关闭弹窗
- [ ] 5.2 **运费时效侧**：`estimated-shipping-popup/index.vue` 中 `contactPhone` 从 `ref('95324')` 改为 `computed(() => userInfo?.phone || '95324')`，引入 `useUserInfo` from `@public/hooks/useUserInfo`

## 6. 验证与清理

- [ ] 6.1 下单侧功能回归：三种状态（申请查看 / 申请中 / 申请失败）展示正确，输入提交正常，埋点正常上报，联系人拨打正常
- [ ] 6.2 运费时效侧功能回归：三种状态展示正确，商务二维码正常显示，联系人拨打正常
- [ ] 6.3 确认 `order-global-package` 中无 `@order-public` 依赖引入
- [ ] 6.4 确认运费时效侧 `freight-time/constants/index.ts` 中 `FeeAuthApplyStatus` 删除不影响其他引用
