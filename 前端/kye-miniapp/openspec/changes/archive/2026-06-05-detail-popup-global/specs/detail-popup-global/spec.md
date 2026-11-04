# Spec: detail-popup 组件迁移到 order-global-package

## Overview

将预估费用详情弹窗（detail-popup）及其子组件从 `kye-miniapp-order` 迁移到 `order-global-package`，采用适配层模式实现零 `@order-public` 依赖的通用组件。

**涉及组件**: 11 个文件
- detail-popup 弹窗主入口 (2 文件)
- fee-popup 弹窗外壳 (2 文件)
- estimation-cost-content 内容组件及子组件 (8 文件，含 example.scss)

---

## Requirements

### R1: DetailPopup 全局组件独立性

**As a** 开发者
**I want** detail-popup 组件完全独立于 kye-miniapp-order 下单业务包
**So that** freight-time 等其他模块可以直接引用，无需依赖下单包

#### Acceptance Criteria

- **AC-1.1**: 组件位于 `order-global-package/components/business/estimated-cost/components/detail-popup/`，内部引用统一使用相对路径（不使用 `@order-global-package` 别名）
- **AC-1.2**: 不 import 任何 `@order-public/*` 模块
- **AC-1.3**: 所有原通过 `piniaStore` 获取的数据改为 Props 注入
- **AC-1.4**: `iosDisablePenetration` 改为 `onIosDisablePenetration` callback prop
- **AC-1.5**: `isDetailMode`/`currentIndex` 改为 v-model prop
- **AC-1.6**: 埋点相关函数（useOrderExposureReport、umpOtherReport）暂时注释

#### Test Scenarios

| ID | 场景 | 预期结果 |
|----|------|---------|
| T-1.1 | 全局搜索 `@order-public` import | 在 detail-popup 树中零匹配 |
| T-1.2 | 不传入 batchWaybillInfoList prop | 组件正常渲染，列表为空 |
| T-1.3 | 不传入 waybillNumber prop | feedback-issue 正常跳转（无运单号参数） |
| T-1.4 | 不传入 onIosDisablePenetration callback | costItem 不触发 iOS 穿透控制 |

---

### R2: 适配层桥接正确性

**As a** 下单模块开发者
**I want** kye-miniapp-order 侧调用方（cell.vue）零改动
**So that** 迁移风险最小化

#### Acceptance Criteria

- **AC-2.1**: `cell.vue` 的 `import DetailPopup from './detail-popup/index.vue'` 无需修改
- **AC-2.2**: 适配层通过 `v-bind="$attrs"` 透传未声明的 attrs（isShowLineInfo、estimationPopupIndex）
- **AC-2.3**: 适配层通过 `v-bind="$attrs"` 透传 events（@getEstimationPopupIndex、@onClickHeader）
- **AC-2.4**: 适配层 `defineExpose({ get show() {...}, set show(val) {...} })` 保持 ref 接口一致（可读可写）
  - ⚠️ **关键**：cell.vue 和 estimated-cost/index.vue 都会写入 `detailPopRef.value.show = xxx`，只有 getter 会静默失败
- **AC-2.5**: 适配层 defineProps 与原 detail-popup 完全一致

#### Test Scenarios

| ID | 场景 | 预期结果 |
|----|------|---------|
| T-2.1 | cell.vue 打开弹窗 → detailPopRef.value.show() | 弹窗正常打开 |
| T-2.2 | estimated-cost/index.vue 传入 isShowLineInfo | 值正确透传到全局组件 |
| T-2.3 | estimated-cost/index.vue 传入 estimationPopupIndex | 值正确透传到全局组件 |
| T-2.4 | 全局组件 emit getEstimationPopupIndex | event 正确冒泡到 estimated-cost/index.vue |
| T-2.5 | 全局组件 emit onClickHeader | event 正确冒泡到 estimated-cost/index.vue |

---

### R3: 共享状态一致性

**As a** 下单模块开发者
**I want** isDetailMode/currentIndex 在树内外保持同一 ref 实例
**So that** 详情/列表模式切换和地址索引选中状态正确联动

#### Acceptance Criteria

- **AC-3.1**: `estimation-cost-content/hooks.ts` 保留原位，不迁移
- **AC-3.2**: 新建 `estimated-cost/hooks/useDetailMode.ts` re-export 同一 ref 实例
- **AC-3.3**: `estimated-cost/index.vue` 改为从 `./hooks/useDetailMode` 导入
- **AC-3.4**: 适配层 import 同一 ref 实例，通过 `v-model:isDetailMode` 和 `v-model:currentIndex` 传给全局组件
- **AC-3.5**: `goBack` 函数保留原位，适配层监听 `@goBack` event 后调用

#### Test Scenarios

| ID | 场景 | 预期结果 |
|----|------|---------|
| T-3.1 | 全局组件内部切换 isDetailMode | estimated-cost/index.vue 标题联动更新 |
| T-3.2 | 全局组件内部切换 currentIndex | 地址选中状态联动更新 |
| T-3.3 | 点击弹窗头部返回 | goBack 正确触发，弹窗关闭 |
| T-3.4 | estimated-cost/index.vue 直接修改 isDetailMode | 全局组件内部状态同步更新 |

---

### R4: iosDisablePenetration 链路完整性

**As a** iOS 用户
**I want** 费用详情弹窗正确控制页面穿透
**So that** 弹窗打开时底部页面不可滚动

#### Acceptance Criteria

- **AC-4.1**: 全局组件 costItem 通过 `onIosDisablePenetration` callback 上报变更
- **AC-4.2**: 适配层接收 callback 后写入 `iosDisablePenetration.value`
- **AC-4.3**: `estimated-cost/index.vue` 对 `iosDisablePenetration` 的直接使用不受影响
- **AC-4.4**: `order-single/index.vue` 的 `:catch-move="iosDisablePenetration"` 行为不变

#### Test Scenarios

| ID | 场景 | 预期结果 |
|----|------|---------|
| T-4.1 | iOS 环境打开弹窗 | iosDisablePenetration 为 true，底部不可滚动 |
| T-4.2 | iOS 环境关闭弹窗 | iosDisablePenetration 为 false，底部可滚动 |
| T-4.3 | estimated-cost/index.vue 直接设置 iosDisablePenetration | 与全局组件行为一致，操作同一 ref |

---

### R5: FeePopup 弹窗组件完整性

**As a** 用户
**I want** 底部弹窗正常打开/关闭/滑动
**So that** 可以查看预估费用详情

#### Acceptance Criteria

- **AC-5.1**: 组件位于 `order-global-package/.../fee-popup/`，内部引用使用相对路径
- **AC-5.2**: 弹窗正常打开（从底部滑入）、关闭（下滑或点击遮罩）
- **AC-5.3**: 头部标题和关闭按钮正常显示
- **AC-5.4**: `svg-icon` 替换为相对路径引用的同类组件
- **AC-5.5**: `@order-public/styles/index.scss` 替换为相对路径 `styles/index.scss`
- **AC-5.6**: `@goBack` event 正确冒泡

#### Test Scenarios

| ID | 场景 | 预期结果 |
|----|------|---------|
| T-5.1 | 打开弹窗 | 从底部滑入，遮罩显示 |
| T-5.2 | 下滑关闭弹窗 | 弹窗下滑消失 |
| T-5.3 | 点击遮罩关闭弹窗 | 弹窗关闭 |
| T-5.4 | 点击关闭图标 | 弹窗关闭 |
| T-5.5 | 点击头部区域 | 触发 onClickHeader event |

---

### R6: EstimationCostContent 内容组件完整性

**As a** 用户
**I Want** 费用内容展示完整，支持地址列表/费用明细/模式切换
**So that** 可以查看详细的费用明细信息

#### Acceptance Criteria

- **AC-6.1**: 地址列表正常展示（batchWaybillInfoList 通过 prop 传入）
- **AC-6.2**: 费用明细正常展示（estimationFee/couponFee/results 通过 prop 传入）
- **AC-6.3**: 详情/列表模式切换正常（isDetailMode 通过 v-model 传入）
- **AC-6.4**: `ky-noticebar` 迁移到 `order-global-package/components/base/ky-noticebar/`，内部引用使用相对路径
- **AC-6.5**: `@order-public/store` 依赖已消除
- **AC-6.6**: `svg-icon` 替换为相对路径引用的同类组件

#### Test Scenarios

| ID | 场景 | 预期结果 |
|----|------|---------|
| T-6.1 | 列表模式展示 | 显示各地址费用概览 |
| T-6.2 | 切换到详情模式 | 显示当前选中地址的详细费用 |
| T-6.3 | 点击不同地址项 | currentIndex 更新，费用明细联动 |
| T-6.4 | 有增值服务费时 | 显示增值服务费明细 |
| T-6.5 | 有优惠券时 | 显示优惠券信息 |

---

### R7: 子组件功能完整性

**As a** 用户
**I want** 各子组件功能正常
**So that** 费用详情弹窗各交互环节可用

#### Acceptance Criteria

- **AC-7.1**: `costItem` 正确展示基础运费+增值服务+优惠券（handleMoneyAmountShow 本地化）
- **AC-7.2**: `addressInfoItem` 正确展示地址信息（showKyDialog 通过 noEstimateTips event 上报，适配层处理；AddedValueTipsType 常量迁移）
- **AC-7.3**: `detailItem` 正确展示费用详情明细
- **AC-7.4**: `example` 示例弹窗正常打开/关闭
- **AC-7.5**: `feedback-issue` 反馈入口正常跳转（Taro.navigateTo 直接迁移，waybillNumber 通过 prop 传入）

#### Test Scenarios

| ID | 场景 | 预期结果 |
|----|------|---------|
| T-7.1 | costItem 展示金额 | 格式正确（保留小数、千分位） |
| T-7.2 | addressInfoItem 点击无预估提示 | 弹窗提示正常（showDialog，与原 UI 一致） |
| T-7.3 | feedback-issue 点击反馈入口 | 跳转反馈页面 |
| T-7.4 | example 弹窗打开/关闭 | 正常展示/关闭 |

---

### R8: 原文件移除策略

**As a** 开发者
**I want** 迁移完成后 kye-miniapp-order 中不留无用代码
**So that** 代码库保持整洁

#### Acceptance Criteria

- **AC-8.1**: 无树外引用的迁移文件从 `kye-miniapp-order` 中删除
- **AC-8.2**: 有树外引用的文件（hooks.ts、utils.ts、hooks/data.ts）保留原位
- **AC-8.3**: `detail-popup/index.vue` 原内容移除，改写为适配层 wrapper
- **AC-8.4**: 删除的文件清单：fee-popup/、estimation-cost-content/(Vue/SCSS)、costItem、addressInfoItem、detailItem、example、feedback-issue、detail-popup/index.scss

---

### R9: freight-time 接入

**As a** freight-time 模块开发者
**I want** 直接使用全局 DetailPopup 组件
**So that** 运费时效页面可以展示费用详情弹窗

#### Acceptance Criteria

- **AC-9.1**: freight-time 通过 `@order-global-package-freight-time` 别名导入 DetailPopup
- **AC-9.2**: freight-time 传入必要的 props（estimationFee、results、onClose 等）
- **AC-9.3**: freight-time 自行管理 isDetailMode/currentIndex 等状态（不依赖 kye-miniapp-order 共享状态）

---

## Out of Scope

- 不重构组件内部功能逻辑（仅物理迁移 + 依赖解耦）
- 不迁移 `estimation-cost-content/hooks.ts`（共享状态保留原位）
- 不迁移 `utils.ts`、`hooks/data.ts`（有树外引用，保留原位）
- 不删除原 `showKyDialog` 文件（大量其它地方使用），全局组件改为 emit event 由适配层调用
- 不迁移埋点函数（暂时注释，待后续统一处理）
