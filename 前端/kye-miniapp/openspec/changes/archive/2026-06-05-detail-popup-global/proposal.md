## Why

`detail-popup`（预估费用详情弹窗）组件当前位于 `kye-miniapp-order` 模块内，`freight-time`（运费时效）模块也需要类似的费用详情弹窗能力，但当前无法复用。需要将 `detail-popup` 及其核心依赖抽取到 `order-global-package` 全局共享位置，让 `freight-time` 等新模块可以直接使用。

**核心约束**：Taro 小程序分包机制下，`order-global-package` 中**绝对不能引用 `@order-public`**，否则整个 `kye-miniapp-order` 模块会被打入 `freight-time` 分包，导致分包体积超限。因此迁移过程中必须对 `@order-public` 的依赖进行解耦。

**内部引用策略**：`order-global-package` 内部的组件间引用**统一使用相对路径**，不使用 `@order-global-package` 别名。原因是 `order-global-package` 需要被多个模块（`kye-miniapp-order`、`freight-time` 等）通过不同别名引用（如 `@order-global-package-order`、`@order-global-package-freight-time`），如果内部使用 `@order-global-package` 别名，则别名解析结果取决于消费方配置，可能指向错误的路径或无法解析。使用相对路径可彻底避免此问题，确保组件在任何消费方中都能正确定位依赖。

## What Changes

- **将 `detail-popup` 组件及依赖子组件复制到 `src/modules/order-global-package/components/business/estimated-cost/`**，移除所有 `@order-public` 依赖
- **在 `kye-miniapp-order` 原位置保留 `detail-popup/index.vue` 作为适配层（wrapper）**，自动注入所有 `@order-public` 依赖，确保 `cell.vue` 等调用方零改动
- **迁移 `fee-popup` 弹窗组件**到 `order-global-package/components/business/estimated-cost/components/fee-popup/`
- **迁移 `estimation-cost-content` 内容组件及其子组件**（costItem、addressInfoItem、detailItem、example、feedback-issue）到 `order-global-package/components/business/estimated-cost/components/estimation-cost-content/`
- **迁移相关样式文件**（index.scss 等）
- **重构全局组件依赖**，将所有 `@order-public` 依赖解耦为 props/events 通信（详见下方「下单业务解耦方案」）
- **freight-time 接入**：替换 `service-mode` 中 `handleDetail` 的占位实现（当前仅 `Taro.showToast` 提示"功能开发中"），通过 `@order-global-package-freight-time` 别名导入全局组件

## Capabilities

### New Capabilities

- `detail-popup-global`: 将预估费用详情弹窗（detail-popup）及其子组件抽取为 `order-global-package` 全局共享组件，零 `@order-public` 依赖，支持跨模块复用

### Modified Capabilities

（无既有 spec 的需求变更）

## Impact

**受影响的代码模块：**

| 模块 | 影响类型 | 说明 |
|------|---------|------|
| `order-global-package/components/business/estimated-cost/` | 新增 | detail-popup + fee-popup + estimation-cost-content 及子组件、样式 |
| `order-global-package/types/` | 新增 | 费用相关类型定义（EstimateFeeByTaskIdResponseResultItem 等） |
| `order-global-package/utils/` | 修改 | 本地化工具函数（handleMoneyAmountShow、specialText）合并导出到 `utils/index.ts` |
| `kye-miniapp-order/.../detail-popup/index.vue` | 修改 | 改为适配层 wrapper，注入 @order-public 依赖 |
| `kye-miniapp-order/.../estimated-cost/index.vue` | 修改 | hooks import 路径改为 `./hooks/useDetailMode` |
| `kye-miniapp-order/.../estimated-cost/hooks/useDetailMode.ts` | 新增 | 持有 isDetailMode/goBack/currentIndex 状态 |
| `freight-time/components/service-mode/` | 修改 | 接入全局 detail-popup 组件，通过 `@order-global-package-freight-time` 别名导入 |

---

### 完整迁移文件清单

#### 1. detail-popup 弹窗组件

| 文件 | 类型 | 说明 |
|------|------|------|
| `components/detail-popup/index.vue` | 主组件 | 预估费用详情弹窗入口 |
| `components/detail-popup/index.scss` | 样式 | 弹窗样式 |

#### 2. fee-popup 弹窗基础组件

| 文件 | 类型 | 说明 |
|------|------|------|
| `components/fee-popup/index.vue` | 主组件 | 底部弹窗外壳（遮罩+头部+关闭按钮） |
| `components/fee-popup/index.scss` | 样式 | 弹窗样式 |

#### 3. estimation-cost-content 内容组件

| 文件 | 类型 | 说明 |
|------|------|------|
| `components/estimation-cost-content/index.vue` | 主组件 | 费用内容展示（地址列表/费用明细/详情模式切换） |
| `components/estimation-cost-content/index.scss` | 样式 | 内容区样式 |
| `components/estimation-cost-content/costItem.vue` | 子组件 | 单条费用明细（基础运费+增值服务+优惠券） |
| `components/estimation-cost-content/costItem.scss` | 子组件样式 | 费用明细样式 |
| `components/estimation-cost-content/components/addressInfoItem/index.vue` | 子组件 | 地址信息条目 |
| `components/estimation-cost-content/components/addressInfoItem/index.scss` | 子组件样式 | 地址信息样式 |
| `components/estimation-cost-content/components/detailItem/index.vue` | 子组件 | 费用详情明细 |
| `components/estimation-cost-content/components/detailItem/index.scss` | 子组件样式 | 详情样式 |
| `components/estimation-cost-content/components/example.vue` | 子组件 | 示例说明二级弹窗（使用 FeePopup） |
| `components/estimation-cost-content/components/example.scss` | 子组件样式 | 示例说明样式 |
| `components/estimation-cost-content/components/feedback-issue.vue` | 子组件 | 费用反馈入口 |

**总计迁移：11 个文件**

> **注意**：以上文件是**复制到** `order-global-package`，`kye-miniapp-order` 原位置文件的处理遵循「原文件移除策略」（详见下方）。`estimation-cost-content/hooks.ts`（isDetailMode/currentIndex/goBack）不迁移到全局目录，保留原位。`utils.ts`、`hooks/data.ts` 也保留原位。

---

### 子组件外部使用情况分析

| 子组件 | 是否被 detail-popup 树外使用 | 使用方 | 结论 |
|---|---|---|---|
| `detail-popup/index.vue` | ✅ 是 | `estimated-cost/index.vue`、`cell.vue` | 原文件改为适配层 wrapper |
| `fee-popup/index.vue` | ❌ 否 | 仅 detail-popup、example 使用 | 安全复制 |
| `estimation-cost-content/index.vue` | ❌ 否 | 仅 detail-popup 使用 | 安全复制 |
| `costItem.vue` | ❌ 否 | 仅 estimation-cost-content、detailItem 使用 | 安全复制 |
| `addressInfoItem/index.vue` | ❌ 否 | 仅 estimation-cost-content、detailItem 使用 | 安全复制 |
| `detailItem/index.vue` | ❌ 否 | 仅 estimation-cost-content 使用 | 安全复制 |
| `feedback-issue.vue` | ❌ 否 | 仅 costItem、detailItem 使用 | 安全复制 |
| `example.vue` | ❌ 否 | 仅 detail-popup 使用 | 安全复制（使用 FeePopup，样式内联） |

**共享状态/工具函数有外部依赖**（不迁移到全局目录，在 `kye-miniapp-order` 原位保留）：

| 文件 | 外部使用方 | 策略 |
|---|---|---|
| `estimation-cost-content/hooks.ts`（isDetailMode/goBack/currentIndex） | `estimated-cost/index.vue` 直接引用 | 保留原位，适配层 import 同一 ref 实例；全局组件改为 prop 接收 |
| `hooks/data.ts`（orderBatch/showSingleEstimatedCost） | `cell.vue`、`coupon-poper`、`estimated-cost-content` | 保留原位，适配层 import 后传 prop；全局组件通过 prop 接收 |
| `utils.ts`（handleMoneyAmountShow/specialText） | `cell.vue` 直接引用 | 保留原位；全局组件合并导出到 `utils/index.ts` |

---

### 原文件移除策略

**原则**：迁移完成后，`kye-miniapp-order` 原位置的文件处理规则：
- **未被 kye-miniapp-order 中其它文件引用** → 删除原文件（全局组件已内置）
- **有被 kye-miniapp-order 中其它文件引用** → 保留原文件

#### 迁移文件移除决策表

| 迁移文件 | 树外引用 | 处理方式 |
|---|---|---|
| `detail-popup/index.vue` | ✅ 有（estimated-cost/index.vue、cell.vue） | **移除原内容，改为适配层 wrapper**（文件路径保留，引用方无需改 import 路径） |
| `detail-popup/index.scss` | ❌ 无 | **删除**，全局组件内置 |
| `fee-popup/` (index.vue + index.scss) | ❌ 无 | **删除**，全局组件内置 |
| `estimation-cost-content/index.vue` | ❌ 无 | **删除**，全局组件内置 |
| `estimation-cost-content/index.scss` | ❌ 无 | **删除**，全局组件内置 |
| `estimation-cost-content/hooks.ts` | ✅ 有（estimated-cost/index.vue 引用 isDetailMode/goBack） | **保留原位**，不迁移 |
| `costItem.vue` + `costItem.scss` | ❌ 无 | **删除**，全局组件内置 |
| `addressInfoItem/` (index.vue + index.scss) | ❌ 无 | **删除**，全局组件内置 |
| `detailItem/` (index.vue + index.scss) | ❌ 无 | **删除**，全局组件内置 |
| `example.vue` + `example.scss` | ❌ 无 | **删除**，全局组件内置 |
| `feedback-issue.vue` | ❌ 无 | **删除**，全局组件内置 |
| `utils.ts`（handleMoneyAmountShow/specialText） | ✅ 有（cell.vue 引用 specialText） | **保留原位**，不迁移；全局组件合并导出到 `utils/index.ts` |
| `hooks/data.ts`（orderBatch/showSingleEstimatedCost） | ✅ 有（cell.vue、coupon-poper） | **保留原位**，不迁移 |

#### 需保留原位的文件总结

| 文件 | 保留原因 |
|---|---|
| `estimation-cost-content/hooks.ts` | isDetailMode/goBack/currentIndex 被树外读写 |
| `utils.ts` | specialText 被 cell.vue、estimated-cost/index.vue 引用 |
| `hooks/data.ts` | orderBatch/showSingleEstimatedCost 被树外引用 |

> **注意**：`detail-popup/index.vue` 文件路径保留（引用方不用改 import 路径），但原内容已移除，改写为适配层 wrapper。

> **注意**：`utils.ts` 中的 `handleMoneyAmountShow` 虽然没有被树外 import（cell.vue 使用本地重定义，外部同名函数来自 `@order-public/utils` 不同来源），但 `specialText` 有树外引用，因此整个 `utils.ts` 保留。全局组件将 `handleMoneyAmountShow` 和 `specialText` 合并导出到 `utils/index.ts`，不再使用独立文件。

---

### 下单业务解耦方案

全局组件不持有跨组件的共享可变状态，所有与下单业务耦合的依赖改为 **props 下发 + events 上报**。
不耦合 `@order-public` 的依赖可直接随组件迁移。

#### 依赖分类：耦合 vs 不耦合

**不耦合 `@order-public`，直接随组件迁移**：

| 项 | 所在组件 | 说明 |
|---|---|---|
| `Taro.navigateTo(...)` | `feedback-issue` | `Taro` 是全局 API，页面路径是字符串，不耦合 `@order-public` |
| `handleMoneyAmountShow` / `specialText` | `costItem`、`detailItem`、`addressInfoItem`、`example` | 纯函数，合并导出到 `utils/index.ts` |
| `showKyDialog`（无预估提示弹窗） | `addressInfoItem` | `addressInfoItem` 改为 emit `noEstimateTips` event，由适配层监听后调用完整的 `showKyDialog`，全局组件不持有弹窗逻辑 |
| `isWechatEnv` / `isWxAppIosEnv` | `costItem` | 来自 `@/public/utils`，非 `@order-public`，但需本地化 |
| `Taro.getSystemInfoSync` 等 | `costItem` | Taro 全局 API，直接迁移 |

**耦合 `@order-public`，需解耦为 props/events**：

| 原耦合项 | 所在组件 | 原获取方式 | 解耦方式 |
|---|---|---|---|
| `isDetailMode` | `estimation-cost-content`、`detail-popup` | `hooks.ts` 共享 ref | prop `isDetailMode` + event `update:isDetailMode` |
| `currentIndex` | `estimation-cost-content` | `hooks.ts` 共享 ref | prop `currentIndex` + event `update:currentIndex` |
| `piniaStore.order.batchWaybillInfoList` | `estimation-cost-content` | `@order-public/store` | prop `batchWaybillInfoList` |
| `piniaStore.order.waybillNumber` | `feedback-issue` | `@order-public/store` | prop `waybillNumber`（删除 store fallback，调用方必须传入） |
| `iosDisablePenetration` | `costItem` | `@pages/order-single/hooks/state` | prop `onIosDisablePenetration` callback |
| `AddedValueTipsType.取派专车费` | `addressInfoItem` | `@order-public/constants` | 常量值迁移到 `order-global-package/types/` |
| `orderBatch` | `estimation-cost-content` | `hooks/data.ts` | prop `orderBatch` |
| `showSingleEstimatedCost` | `estimation-cost-content` | `hooks/data.ts` | prop `showSingleEstimatedCost` |
| `useOrderExposureReport` / `umpOtherReport` | 多处 | `@order-public/report` | 暂时注释，待后续恢复 |
| `@order-public/components/ui/svg-icon` | 多处 | UI 组件 | 替换为 `@order-global-package` 同类组件 |
| `@order-public/components/base/ky-noticebar` | `estimation-cost-content`、`example` | UI 组件 | 迁移到 `order-global-package/components/base/ky-noticebar/`，替换其内部 `@order-public` 依赖为相对路径 |
| `@order-public/apis/...` 类型 | 多处 | 类型定义 | 迁移到 `types/` 目录，相对路径引用 |
| `@order-public/styles/index.scss` | 多处 | 样式 | 替换为相对路径 `styles/index.scss` |
| `@order-public/utils/common` (getTaroDom) | `costItem` | 工具函数 | 内联实现 |

#### 共享状态处理原则

**被 detail-popup 树内外同时读写的共享 ref，一律不迁移**，留在 `kye-miniapp-order` 原位。迁移后的全局组件通过 prop 接收值 + event 上报变更，由适配层桥接。

| 共享状态 | 位置 | 是否迁移 | 谁持有 ref | 怎么传到全局组件 |
|---|---|---|---|---|
| `isDetailMode` / `goBack` / `currentIndex` | `estimation-cost-content/hooks.ts` | **不迁移** | 原文件 | 适配层 import → 传 prop |
| `orderBatch` | `hooks/data.ts` | **不迁移** | 原文件 | 适配层 import → 传 prop |
| `showSingleEstimatedCost` | `hooks/data.ts` | **不迁移** | 原文件 | 适配层 import → 传 prop |

#### isDetailMode/goBack 状态迁移方案

原 `estimation-cost-content/hooks.ts` 中的 `isDetailMode`/`goBack` 是共享可变状态，同时被 detail-popup 内部和外部 `estimated-cost/index.vue` 读写。

1. **`hooks.ts` 保留原位**，不迁移到 `order-global-package`
2. **全局组件**：`isDetailMode`/`currentIndex` 改为 prop 接收 + event 上报，不再内部持有共享 ref
3. **kye-miniapp-order 侧**：新建 `estimated-cost/hooks/useDetailMode.ts` 作为统一导出点，内部 re-export `hooks.ts` 的值（保持同一 ref 实例）

```ts
// kye-miniapp-order 侧新建：estimated-cost/hooks/useDetailMode.ts
// 统一导出点，未来 hooks.ts 废弃后可直接在此文件管理状态
export { isDetailMode, currentIndex, goBack } from './components/estimation-cost-content/hooks'
```

```diff
// estimated-cost/index.vue
- import { goBack, isDetailMode } from './components/estimation-cost-content/hooks'
+ import { goBack, isDetailMode } from './hooks/useDetailMode'
```

4. **适配层 bridge**：适配层 import 同一个 ref 实例，传给全局组件

#### DetailPopup（全局组件）新增 Props/Events 接口

| Prop / Event | 类型 | 说明 | 原获取方式 |
|---|---|---|---|
| `isDetailMode` | `Boolean` prop | 详情/列表模式切换 | `hooks.ts` 共享 ref |
| `update:isDetailMode` | Event | 模式变更通知 | - |
| `currentIndex` | `Number` prop | 当前选中地址索引 | `hooks.ts` 共享 ref |
| `update:currentIndex` | Event | 索引变更通知 | - |
| `orderBatch` | `Boolean` prop | 是否批量寄 | `hooks/data.ts` |
| `batchWaybillInfoList` | `Array` prop | 批量运单列表 | `piniaStore.order.batchWaybillInfoList` |
| `showSingleEstimatedCost` | `Boolean` prop | 是否显示单票预估 | `hooks/data.ts` |
| `waybillNumber` | `String` prop | 运单号（feedback-issue 使用） | `piniaStore.order.waybillNumber` |
| `onIosDisablePenetration` | `Function` callback | iOS 穿透控制 | `costItem` 内部 iosDisablePenetration |
| `noEstimateTips` | Event | 无预估费用提示弹窗 | `addressInfoItem` 内部 `showKyDialog` → 改为 emit |

> **注意**：`onFeedback` 不再需要（`Taro.navigateTo` 直接迁移）。`noEstimateTips` event 需要：`addressInfoItem` 原本直接调用 `showKyDialog`，改为 emit event 后由适配层处理。

---

### 适配层方案：保证 kye-miniapp-order 零风险

**核心思路**：`kye-miniapp-order` 原位置的 `detail-popup/index.vue` 改为适配层（wrapper），自动注入所有 `@order-public` 依赖后渲染全局组件。调用方（`cell.vue`、`estimated-cost/index.vue`）**无需任何改动**（除 hooks import 路径）。

#### 架构图

```
kye-miniapp-order 侧:
  cell.vue ──import──> detail-popup/index.vue (适配层 wrapper，原位置)
  estimated-cost/index.vue ──import──> 同上
                              │
                              ├── 自动注入所有 @order-public 依赖
                              └── 渲染 <DetailPopup v-bind="..." />

  estimated-cost/index.vue ──import──> hooks/useDetailMode.ts ──re-export──> hooks.ts (原位置)

order-global-package 侧 (零 @order-public 依赖):
  DetailPopup ──prop 接收──> EstimationCostContent
  feedback-issue ──prop──> waybillNumber + Taro.navigateTo (直接迁移)
```

#### 适配层代码

`kye-miniapp-order/.../detail-popup/index.vue` 改为：

```vue
<template>
  <!-- v-bind="$attrs" 透传未声明的 attrs（isShowLineInfo、estimationPopupIndex 等）和 events（@getEstimationPopupIndex、@onClickHeader） -->
  <DetailPopupGlobal
    ref="globalRef"
    v-bind="$attrs"
    :onClose="onClose"
    :title="title"
    :footerSectionHeight="footerSectionHeight"
    :estimationFee="estimationFee"
    :couponFee="couponFee"
    :showModal="showModal"
    :isShowTotal="isShowTotal"
    :results="results"
    v-model:isDetailMode="isDetailMode"
    v-model:currentIndex="currentIndex"
    @goBack="goBack"
    :orderBatch="orderBatch"
    :showSingleEstimatedCost="showSingleEstimatedCost"
    :batchWaybillInfoList="piniaStore.order.batchWaybillInfoList"
    :waybillNumber="piniaStore.order.waybillNumber"
    :onIosDisablePenetration="handleIosDisablePenetration"
    @noEstimateTips="handleNoEstimateTips"
  />
</template>

<script setup lang="ts">
// 导入全局组件（解耦后的核心实现）
import DetailPopupGlobal from '@order-global-package-order/components/business/estimated-cost/components/detail-popup/index.vue'

// 导入共享状态（同一 ref 实例，保证与 estimated-cost/index.vue 联动）
import { isDetailMode, currentIndex, goBack } from '../estimation-cost-content/hooks'
import { orderBatch, showSingleEstimatedCost } from '../../hooks/data'

// 导入 @order-public 依赖（仅适配层持有，全局组件不感知）
import { useStore } from '@order-public/store'
import { iosDisablePenetration } from '@pages/order-single/hooks/state'
import { showKyDialog } from '@order-public/validate/effect/effectDialog'

const piniaStore = useStore()
const globalRef = ref()

// 透传原有 props（与原 detail-popup/index.vue 的 defineProps 完全一致）
const props = defineProps({
  onClose: { type: Function as PropType<() => void>, required: true },
  title: { type: String },
  footerSectionHeight: { type: Number, required: true },
  estimationFee: { type: Object },
  couponFee: { type: Object },
  showModal: { type: Boolean, default: false },
  isShowTotal: { type: Boolean, default: false },
  results: { type: Object },
})

// 暴露与原组件一致的接口，保证 detailPopRef.value.show 可读可写
// ⚠️ 必须同时提供 getter 和 setter！cell.vue 和 estimated-cost/index.vue
//    都会写入 detailPopRef.value.show = xxx，只有 getter 会静默失败
defineExpose({
  get show() { return globalRef.value?.show },
  set show(val) { if (globalRef.value) globalRef.value.show = val },
})

// 回调实现：与迁移前行为完全一致
const handleIosDisablePenetration = (val: boolean) => {
  iosDisablePenetration.value = val
}
const handleNoEstimateTips = (message: string) => {
  showKyDialog({
    title: '温馨提示',
    message,
    confirmButtonText: '我知道了',
    showCancelButton: false,
    allowHtml: false,
    zIndex: 99999,
  })
}
</script>
```

---

### 依赖变更详情

##### detail-popup 组件依赖替换（全局组件）

| 原依赖 | 替换为 | 说明 |
|--------|--------|------|
| `@order-public/.../fee-popup` | 内部相对路径 `./components/fee-popup/` | 同目录迁移 |
| `@order-public/.../estimation-cost-content/components/example` | 内部相对路径 | 同目录迁移 |
| `@order-public/.../estimation-cost-content/hooks` (isDetailMode/goBack) | props + events | 状态由适配层注入 |
| `@order-public/apis/waybill/estimated-cost` (EstimateFeeByTaskIdResponseResultItem) | 相对路径 → `types/estimated-cost` | 类型迁移 |
| `@order-public/styles/index.scss` | 相对路径 → `styles/index.scss` | 样式引用更新 |

##### fee-popup 组件依赖替换

| 原依赖 | 替换为 | 说明 |
|--------|--------|------|
| `@order-public/components/ui/svg-icon` | 相对路径 → `ui/svg-icon` | UI 组件替换 |
| `@/public/utils` (isH5FSEnv) | 内联判断 | 工具函数本地化 |
| `@order-public/styles/index.scss` | 相对路径 → `styles/index.scss` | 样式引用更新 |

##### estimation-cost-content 组件依赖替换

| 原依赖 | 替换为 | 说明 |
|--------|--------|------|
| `@order-public/store` (useStore → batchWaybillInfoList) | prop `batchWaybillInfoList` | Store 解耦 |
| `@order-public/components/ui/svg-icon` | 相对路径 → `ui/svg-icon` | UI 组件替换 |
| `@order-public/components/base/ky-noticebar` | 相对路径 → `base/ky-noticebar`（替换内部 `@order-public` 依赖为相对路径） | UI 组件迁移 |
| `@order-public/apis/waybill/estimated-cost` (类型) | 相对路径 → `types/estimated-cost` | 类型迁移 |
| `@order-public/report/exposureReport` | 注释，待后续恢复 | 上报暂不迁移 |
| `../../hooks/data` (orderBatch/showSingleEstimatedCost) | props 注入 | 适配层 bridge |
| `./hooks` (isDetailMode/currentIndex) | props + events | 适配层 bridge |
| `@order-public/styles/index.scss` | 相对路径 → `styles/index.scss` | 样式引用更新 |

##### example 子组件依赖替换

| 原依赖 | 替换为 | 说明 |
|--------|--------|------|
| `@order-public/components/ui/svg-icon` | 相对路径 → `ui/svg-icon` | UI 组件替换 |
| `@order-public/components/base/ky-noticebar` | 相对路径 → `base/ky-noticebar`（替换内部 `@order-public` 依赖为相对路径） | UI 组件迁移 |
| `@order-public/.../fee-popup` | 相对路径 `../../fee-popup/` | 同目录迁移 |
| `@order-public/styles/index.scss` | 相对路径 → `styles/index.scss` | 样式引用更新 |

##### costItem 子组件依赖替换

| 原依赖 | 替换为 | 说明 |
|--------|--------|------|
| `@order-public/components/ui/svg-icon` | 同 fee-popup 替换策略 | UI 组件替换 |
| `@order-public/report/exposureReport` | 注释，待后续恢复 | 上报暂不迁移 |
| `@order-public/reportUmp/sceneReport/umpotherReport` | 注释，待后续恢复 | 上报暂不迁移 |
| `@order-public/utils/common` (getTaroDom) | 内联实现 | 工具函数本地化 |
| `@pages/order-single/hooks/state` (iosDisablePenetration) | prop `onIosDisablePenetration` callback | 页面状态解耦 |
| `../../utils` (handleMoneyAmountShow) | `../../utils` (从 `utils/index.ts` 统一导出) | 纯函数合并导出 |
| `@/public/utils` (isWechatEnv/isWxAppIosEnv) | 内联判断 | 非业务耦合，本地化 |
| `Taro.getSystemInfoSync` / `wx.getWindowInfo` | 直接迁移 | Taro 全局 API |
| `@order-public/styles/index.scss` | 相对路径 → `styles/index.scss` | 样式引用更新 |

##### detailItem 子组件依赖替换

| 原依赖 | 替换为 | 说明 |
|--------|--------|------|
| `@order-public/apis/waybill/estimated-cost` (类型) | 相对路径 → `types/estimated-cost` | 类型迁移 |
| `../../costItem.vue` | 内部相对路径 | 同目录迁移 |
| `../addressInfoItem/index.vue` | 内部相对路径 | 同目录迁移 |
| `../feedback-issue.vue` | 内部相对路径 | 同目录迁移 |
| `../../../../utils` (handleMoneyAmountShow) | `../../../../utils` (从 `utils/index.ts` 统一导出) | 纯函数合并导出 |
| `@order-public/styles/index.scss` | 相对路径 → `styles/index.scss` | 样式引用更新 |

##### addressInfoItem 子组件依赖替换

| 原依赖 | 替换为 | 说明 |
|--------|--------|------|
| `@order-public/components/ui/svg-icon` | 相对路径 → `ui/svg-icon` | UI 组件替换 |
| `@order-public/apis/waybill/estimated-cost` (类型) | 相对路径 → `types/estimated-cost` | 类型迁移 |
| `@order-public/report/exposureReport` | 注释，待后续恢复 | 上报暂不迁移 |
| `@order-public/validate/effect/effectDialog` (showKyDialog) | 改为 emit `noEstimateTips` event，适配层监听后调用完整 `showKyDialog` | 弹窗不迁移，全局组件零弹窗副作用 |
| `@order-public/constants` (AddedValueTipsType) | 迁移到 `types/estimated-cost`，相对路径引用 | 常量迁移 |
| `../../../../utils` (handleMoneyAmountShow/specialText) | `../../../../../../../utils` (从 `utils/index.ts` 统一导出) | 纯函数合并导出 |
| `@order-public/styles/index.scss` | 相对路径 → `styles/index.scss` | 样式引用更新 |

##### feedback-issue 子组件依赖替换

| 原依赖 | 替换为 | 说明 |
|--------|--------|------|
| `@order-public/store` (useStore → waybillNumber) | prop `waybillNumber`（删除 store fallback） | Store 解耦 |
| `@order-public/report/exposureReport` | 注释，待后续恢复 | 上报暂不迁移 |
| `@order-public/reportUmp/sceneReport/umpotherReport` | 注释，待后续恢复 | 上报暂不迁移 |
| `Taro.navigateTo` 到反馈问卷页 | **直接迁移，不需要 callback** | `Taro` 是全局 API，不耦合 `@order-public` |

---

### kye-miniapp-order 侧改动详情

#### 1. `estimated-cost/components/detail-popup/index.vue`（改动量：重写为适配层）

| 改动项 | 说明 |
|--------|------|
| 原有组件逻辑 | 全部删除，改为适配层 wrapper |
| 导入全局组件 | `import DetailPopup from '@order-global-package-order/...'` |
| 导入共享状态 | `import { isDetailMode, currentIndex, goBack } from '../estimation-cost-content/hooks'` |
| 导入下单依赖 | `import { useStore } from '@order-public/store'`、`iosDisablePenetration` 等 |
| 透传 props | `v-bind="$attrs"` + 显式传原有 props |
| 注入解耦 props | `:isDetailMode`、`:orderBatch`、`:batchWaybillInfoList` 等 |
| 实现回调 | `handleNoEstimateTips`、`handleIosDisablePenetration` |

#### 2. `estimated-cost/index.vue`（改动量：小）

| 改动项 | 说明 |
|--------|------|
| `import { goBack, isDetailMode } from './components/estimation-cost-content/hooks'` | → 改为 `import { goBack, isDetailMode } from './hooks/useDetailMode'` |

其余逻辑完全不变（`detail-popup/index.vue` 适配层接口与原组件一致，`<DetailPopup>` 用法不变）。

#### 3. `estimated-cost/components/cell.vue`（改动量：零）

**无需任何改动**。`cell.vue` 仍 `import DetailPopup from './detail-popup/index.vue'`，适配层自动注入所有依赖，行为与迁移前完全一致。

#### 4. `estimated-cost/hooks/useDetailMode.ts`（新增文件）

```ts
// 统一导出点，保持与 hooks.ts 同一 ref 实例
export { isDetailMode, currentIndex, goBack } from '../components/estimation-cost-content/hooks'
```

#### 5. 不改动的文件

| 文件 | 原因 |
|------|------|
| `hooks/data.ts` | 仍被 `cell.vue`、`coupon-poper` 使用，保留原位；适配层 import 后传 prop |
| `utils.ts` | 仍被 `cell.vue` 使用（specialText），保留原位；全局组件内置本地副本 |
| `components/estimation-cost-content/hooks.ts` | 保留原位，`useDetailMode.ts` re-export 同一 ref 实例 |

#### 6. 需删除/移除原内容的文件

| 文件 | 处理方式 |
|------|------|
| `detail-popup/index.vue` | **移除原内容**，改写为适配层 wrapper（文件路径保留） |
| `detail-popup/index.scss` | **删除**，全局组件已内置 |
| `components/fee-popup/` | **删除**，全局组件已内置 |
| `components/estimation-cost-content/index.vue` | **删除**，全局组件已内置 |
| `components/estimation-cost-content/index.scss` | **删除**，全局组件已内置 |
| `components/estimation-cost-content/costItem.vue` | **删除**，全局组件已内置 |
| `components/estimation-cost-content/costItem.scss` | **删除**，全局组件已内置 |
| `components/estimation-cost-content/components/addressInfoItem/` | **删除**，全局组件已内置 |
| `components/estimation-cost-content/components/detailItem/` | **删除**，全局组件已内置 |
| `components/estimation-cost-content/components/example.vue` | **删除**，全局组件已内置（样式内联，无单独 scss） |
| `components/estimation-cost-content/components/feedback-issue.vue` | **删除**，全局组件已内置 |

---

### 迁移风险排查

#### `kye-miniapp-order` 侧风险（优先保证）

| # | 风险项 | 严重度 | 应对 | 状态 |
|---|---|---|---|---|
| 1 | `cell.vue` 缺少新 props 导致运行时崩溃 | 高 | 适配层自动注入，`cell.vue` 零改动 | ✅ 已规避 |
| 2 | `estimated-cost/index.vue` hooks import 断裂 | 高 | 新建 `useDetailMode.ts`，re-export 同一 ref 实例 | ✅ 已规避 |
| 3 | `hooks/data.ts` 引用断裂 | 无 | 保留原位，不迁移 | ✅ 无风险 |
| 4 | `utils.ts` 引用断裂 | 无 | 保留原位，不迁移 | ✅ 无风险 |
| 5 | `estimation-cost-content/hooks.ts` 引用断裂 | 无 | 保留原位，适配层直接 import | ✅ 无风险 |
| 6 | 适配层与原组件 props 接口不一致 | 高 | 适配层 defineProps 与原组件完全一致 | ✅ 已规避 |
| 7 | `isDetailMode` ref 实例不一致导致标题不联动 | 高 | `useDetailMode.ts` re-export 同一 ref 实例 | ✅ 已规避 |
| 8 | `$attrs` 透传丢失（`isShowLineInfo`、`estimationPopupIndex` 等） | 高 | 适配层模板中使用 `v-bind="$attrs"` 透传，全局组件也必须透传 | ✅ 已规避 |
| 9 | `estimated-cost/index.vue` 对 `iosDisablePenetration` 的直接使用受影响 | 低 | 它直接从 `@pages/order-single/hooks/state` 导入同一 ref 实例，不受适配层影响 | ✅ 无风险 |
| 10 | 适配层缺少 `defineExpose({ show })` 导致 `detailPopRef.value.show` 失效 | 高 | 适配层必须 expose 与原组件一致的接口 | ⚠️ 需补充 |
| 11 | 全局组件 `DetailPopup` 的 props 和 events 与适配层不匹配 | 高 | 全局组件的 props 必须包含适配层传入的所有 props + events | ⚠️ 需在实现时严格对齐 |
| 12 | `fee-popup` 中 `@goBack` event 链路：FeePopup → DetailPopup → 适配层 | 中 | 全局组件内部 event 必须正确冒泡，适配层需监听并转发 | ⚠️ 需在实现时验证 |

#### `order-build-sub-pages` 侧风险

**无风险**。`order-build-sub-pages` 是独立代码副本，使用 `@order-public-sub-public` 别名，不受本次迁移影响。

---

### 深度排查：调用方 → 适配层 → 全局组件 完整链路验证

#### 链路 1：`estimated-cost/index.vue` → 适配层 → 全局组件

`estimated-cost/index.vue` 传给 `DetailPopup` 的所有 props/events：

```html
<DetailPopup
  key="detail-popup"
  ref="detailPopRef"
  :footerSectionHeight="footerSectionHeight"
  :showModal="showModal"
  :estimationFee="dataValue || {}"
  :onClose="detailPopupClose"
  :title="estimatedTitle"
  :isShowLineInfo="orderBatch"           ← 通过 $attrs 透传
  @getEstimationPopupIndex="getEstimationPopupIndex"  ← event
  @onClickHeader="onClickHeader"          ← event
  :estimationPopupIndex="btnSectionIndex" ← 通过 $attrs 透传
  :results="resultsCmp || []"
></DetailPopup>
```

| 传入项 | 适配层 defineProps 是否声明 | 透传方式 | 全局组件是否需要接收 |
|--------|---------------------------|---------|-------------------|
| `footerSectionHeight` | ✅ 声明 | 显式传 prop | ✅ 需接收 |
| `showModal` | ✅ 声明 | 显式传 prop | ✅ 需接收 |
| `estimationFee` | ✅ 声明 | 显式传 prop | ✅ 需接收 |
| `onClose` | ✅ 声明 | 显式传 prop | ✅ 需接收 |
| `title` | ✅ 声明 | 显式传 prop | ✅ 需接收 |
| `results` | ✅ 声明 | 显式传 prop | ✅ 需接收 |
| `isShowLineInfo` | ❌ 未声明 | `v-bind="$attrs"` 透传 | ✅ 需透传到 FeePopup |
| `estimationPopupIndex` | ❌ 未声明 | `v-bind="$attrs"` 透传 | ✅ 需透传到 EstimationCostContent |
| `@getEstimationPopupIndex` | — | `v-bind="$attrs"` 透传 | ✅ 需冒泡 event |
| `@onClickHeader` | — | `v-bind="$attrs"` 透传 | ✅ 需冒泡 event |
| `ref="detailPopRef"` | — | 需 `defineExpose` | ✅ 需 expose `show` |

**关键结论**：适配层**必须**使用 `v-bind="$attrs"` 透传未声明的属性和事件，否则 `isShowLineInfo`、`estimationPopupIndex`、`@getEstimationPopupIndex`、`@onClickHeader` 会丢失。全局组件也必须继续透传这些 attrs。

#### 链路 2：`cell.vue` → 适配层 → 全局组件

`cell.vue` 传给 `DetailPopup` 的所有 props/events：

```html
<DetailPopup
  key="detail-popup"
  ref="detailPopRef"
  :footerSectionHeight="footerSectionHeight"
  :showModal="showModal"
  :estimationFee="feeResponseItem"
  :onClose="onClose"
  title="预估费用"
  :results="resultsItem"
/>
```

| 传入项 | 适配层 defineProps 是否声明 | 透传方式 |
|--------|---------------------------|---------|
| `footerSectionHeight` | ✅ 声明 | 显式传 prop |
| `showModal` | ✅ 声明 | 显式传 prop |
| `estimationFee` | ✅ 声明 | 显式传 prop |
| `onClose` | ✅ 声明 | 显式传 prop |
| `title` | ✅ 声明 | 显式传 prop |
| `results` | ✅ 声明 | 显式传 prop |

**无透传项，链路安全**。但 `ref="detailPopRef"` + `detailPopRef.value.show` 需要适配层 expose。

#### 链路 3：`iosDisablePenetration` 完整链路

```
costItem (全局组件) ──prop callback──> onIosDisablePenetration
适配层 ──handleIosDisablePenetration──> iosDisablePenetration.value = val
                                          ↕ 同一 ref 实例
estimated-cost/index.vue (L408) ──直接写入──> iosDisablePenetration.value = true
order-single/index.vue (L2) ──读取──> :catch-move="iosDisablePenetration"
```

**链路安全**：`estimated-cost/index.vue` 直接从 `@pages/order-single/hooks/state` 导入同一 ref 实例，不走适配层，不受影响。

#### 链路 4：`isDetailMode` 完整链路

```
hooks.ts (原位) ──export──> useDetailMode.ts ──re-export──> estimated-cost/index.vue (只读)
         │                                                          │
         └──export──> 适配层 ──:isDetailMode──> 全局组件 (prop 接收)
                                    │
                    v-model:isDetailMode ──> 适配层写入同一 ref
```

**链路安全**：`estimated-cost/index.vue` 和适配层引用同一个 ref 实例，双向绑定正确。

#### 链路 5：`goBack` 完整链路

```
hooks.ts (原位) ──export──> useDetailMode.ts ──re-export──> estimated-cost/index.vue (函数调用)
         │
         └──export──> 适配层 ──@goBack──> 全局组件 emit goBack → FeePopup emit goBack
```

**注意**：原来 `detail-popup` 内部 `onClickHeader` 调用 `goBack()`，迁移后全局组件改为 emit `goBack` event，适配层监听后调用 `goBack()`。`estimated-cost/index.vue` 的 `goBack()` 调用路径不变。

#### 适配层补充：`defineExpose`

原 `detail-popup` 有 `defineExpose({ show })`，`estimated-cost/index.vue` 和 `cell.vue` 都通过 `ref` 引用 `detailPopRef.value.show`。**适配层必须 expose 全局组件的 `show`**：

```ts
const globalRef = ref()

// ⚠️ 必须同时提供 getter 和 setter
// cell.vue: detailPopRef.value.show = showModal.value
// estimated-cost/index.vue: detailPopRef.value.show = showModal.value / false
defineExpose({
  get show() { return globalRef.value?.show },
  set show(val) { if (globalRef.value) globalRef.value.show = val },
})
```

```html
<DetailPopupGlobal ref="globalRef" ... />
```

---

### freight-time 接入点

| 文件 | 当前实现 | 迁移后 |
|------|---------|--------|
| `freight-time/components/service-mode/hooks/useServiceMode.ts` | `handleDetail` → `Taro.showToast('功能开发中')` | 打开全局 `detail-popup` 组件展示费用明细 |
| `freight-time/components/service-mode/index.vue` | 无弹窗 | 集成 `DetailPopup` 组件，通过 `@order-global-package-freight-time` 别名导入，传入 `isDetailMode`、`orderBatch` 等 props |
