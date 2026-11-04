# Technical Design: detail-popup 组件迁移到 order-global-package

## Context & Problem Statement

`detail-popup`（预估费用详情弹窗）组件当前位于 `kye-miniapp-order` 模块内，与 `@order-public` 存在多层耦合：

1. **Store 耦合**：直接使用 `piniaStore.order.batchWaybillInfoList`、`piniaStore.order.waybillNumber`
2. **共享状态耦合**：`isDetailMode`/`currentIndex`/`goBack` 是树内外同时读写的共享 ref
3. **页面状态耦合**：`iosDisablePenetration` 来自 `@pages/order-single/hooks/state`
4. **UI 组件耦合**：依赖 `@order-public/components/ui/svg-icon`、`@order-public/components/base/ky-noticebar`（均为 order-public 内部组件，需迁移到 order-global-package）
5. **常量/类型耦合**：依赖 `@order-public/constants`（AddedValueTipsType）、`@order-public/apis`（类型定义）

目标：将 `detail-popup` 及其子组件（共 12 个文件）迁移到 `order-global-package`，采用 **适配层模式**（调用方→适配层→全局组件），确保 `kye-miniapp-order` 侧零风险。

**核心约束**：Taro 小程序分包机制下，`order-global-package` 中**绝对不能引用 `@order-public`**，否则整个 `kye-miniapp-order` 模块会被打入 `freight-time` 分包，导致分包体积超限。

**内部引用策略**：`order-global-package` 内部的组件间引用**统一使用相对路径**，不使用 `@order-global-package` 别名。原因是 `order-global-package` 需要被多个模块（`kye-miniapp-order`、`freight-time` 等）通过不同别名引用（如 `@order-global-package-order`、`@order-global-package-freight-time`），如果内部使用 `@order-global-package` 别名，则别名解析结果取决于消费方配置，可能指向错误的路径或无法解析。使用相对路径可彻底避免此问题，确保组件在任何消费方中都能正确定位依赖。

## Goals

- [G1] detail-popup 及其子组件**完整迁移**到 `order-global-package`，零 `@order-public` 依赖
- [G2] 所有外部依赖替换为 props/events 通信或本地化副本
- [G3] `kye-miniapp-order` 侧调用方（cell.vue）**零改动**，`estimated-cost/index.vue` 仅改 hooks import 路径
- [G4] `freight-time` 模块可直接使用全局 `DetailPopup` 组件

## Non-Goals

1. 不重构组件内部功能逻辑，仅做物理迁移 + 依赖解耦
2. 不改变组件 props 接口签名（全局组件新增 props 除外）
3. 不迁移 `estimation-cost-content/hooks.ts`（isDetailMode/goBack/currentIndex 共享状态）
4. 不迁移 `utils.ts`（specialText 被树外引用）
5. 不迁移 `hooks/data.ts`（orderBatch/showSingleEstimatedCost 被树外引用）
6. 埋点函数暂时注释，不迁移到全局组件

---

## Component Architecture (迁移目标架构)

```
order-global-package/
├── components/
│   └── business/
│       └── estimated-cost/
│           └── components/
│               ├── detail-popup/                    # [迁移] 预估费用详情弹窗主入口
│               │   ├── index.vue                    #   主组件（FeePopup + EstimationCostContent）
│               │   └── index.scss                   #   弹窗样式
│               │
│               ├── fee-popup/                       # [迁移] 底部弹窗外壳
│               │   ├── index.vue                    #   遮罩+头部+关闭按钮
│               │   └── index.scss                   #   弹窗样式
│               │
│               └── estimation-cost-content/         # [迁移] 费用内容展示
│                   ├── index.vue                    #   地址列表/费用明细/模式切换
│                   ├── index.scss                   #   内容区样式
│                   ├── costItem.vue                 #   单条费用明细
│                   ├── costItem.scss                #   费用明细样式
│                   └── components/
│                       ├── addressInfoItem/          #   地址信息条目
│                       │   ├── index.vue
│                       │   └── index.scss
│                       ├── detailItem/               #   费用详情明细
│                       │   ├── index.vue
│                       │   └── index.scss
│                       ├── example.vue               #   示例说明二级弹窗（使用 FeePopup）
│                       ├── example.scss               #   示例说明样式
│                       └── feedback-issue.vue        #   费用反馈入口
│
├── types/
│   └── estimated-cost.ts                            # [新增] 费用相关类型定义
│
└── utils/
    └── index.ts                                       # [修改] 合并导出 handleMoneyAmountShow、specialText

kye-miniapp-order 侧 (适配层):
├── estimated-cost/
│   ├── index.vue                                    # [修改] hooks import 路径
│   ├── hooks/
│   │   ├── useDetailMode.ts                         # [新增] 统一导出 isDetailMode/goBack/currentIndex
│   │   └── data.ts                                  # [保留] orderBatch/showSingleEstimatedCost
│   ├── utils.ts                                     # [保留] handleMoneyAmountShow/specialText
│   └── components/
│       ├── detail-popup/
│       │   └── index.vue                            # [改写] 适配层 wrapper
│       ├── cell.vue                                 # [不动] 零改动
│       └── estimation-cost-content/
│           └── hooks.ts                             # [保留] isDetailMode/goBack/currentIndex
```

---

## Dependency Analysis (完整依赖图)

### 全局组件依赖解耦全景

```
┌─────────────────────────────────────────────────────────────────────┐
│              DetailPopup (全局组件 - order-global-package)          │
│         零 @order-public 依赖                                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────┐  ┌─────────────────────┐                  │
│  │   FeePopup          │  │ EstimationCostContent│                  │
│  │  底部弹窗外壳       │  │  费用内容展示         │                  │
│  └─────────────────────┘  └─────────────────────┘                  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────┐           │
│  │  Props 接收 (由适配层注入)                           │           │
│  ├────────────────────────┬────────────────────────────┤           │
│  │ isDetailMode           │ Boolean (v-model)          │           │
│  │ currentIndex           │ Number  (v-model)          │           │
│  │ orderBatch             │ Boolean                    │           │
│  │ showSingleEstimatedCost│ Boolean                    │           │
│  │ batchWaybillInfoList   │ Array                      │           │
│  │ waybillNumber          │ String                     │           │
│  │ onIosDisablePenetration│ Function callback          │           │
│  └────────────────────────┴────────────────────────────┘           │
│                                                                     │
│  ┌─────────────────────────────────────────────────────┐           │
│  │  本地化依赖 (直接随组件迁移，无需 props)              │           │
│  ├────────────────────────┬────────────────────────────┤           │
│  │ Taro.navigateTo       │ 全局 API，直接迁移          │           │
│  │ handleMoneyAmountShow │ 纯函数，合并导出到 utils/index.ts│        │
│  │ specialText            │ 纯函数，合并导出到 utils/index.ts│        │
│  │ showKyDialog           │ emit noEstimateTips event，适配层处理 │ │
│  │ isWechatEnv/isWxAppIos │ 来自 @/public/utils，本地化│           │
│  │ AddedValueTipsType     │ 常量迁移到 types/          │           │
│  └────────────────────────┴────────────────────────────┘           │
│                                                                     │
│  ┌─────────────────────────────────────────────────────┐           │
│  │  UI 组件替换                                        │           │
│  ├────────────────────────┬────────────────────────────┤           │
│  │ svg-icon              │ → global-package 同类组件   │           │
│  │ ky-noticebar          │ → 迁移到 global-package/components/base/ky-noticebar/ │ │
│  │ @order-public/styles  │ → 相对路径引用 styles/                    │           │
│  └────────────────────────┴────────────────────────────┘           │
│                                                                     │
│  ┌─────────────────────────────────────────────────────┐           │
│  │  暂时注释                                          │           │
│  ├────────────────────────┬────────────────────────────┤           │
│  │ useOrderExposureReport│ 待后续恢复                  │           │
│  │ umpOtherReport        │ 待后续恢复                  │           │
│  └────────────────────────┴────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────────┘
```

### 适配层依赖注入

```
┌─────────────────────────────────────────────────────────────────────┐
│              detail-popup/index.vue (适配层 wrapper)                │
│         位于 kye-miniapp-order 原位置                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────┐           │
│  │  导入 @order-public 依赖 (仅适配层持有)              │           │
│  ├────────────────────────┬────────────────────────────┤           │
│  │ useStore               │ → piniaStore.order.batch..│           │
│  │                        │   piniaStore.order.waybill │           │
│  │ iosDisablePenetration  │ → @pages/order-single/..   │           │
│  │ isDetailMode           │ → hooks.ts (同一 ref 实例) │           │
│  │ currentIndex           │ → hooks.ts (同一 ref 实例) │           │
│  │ goBack                 │ → hooks.ts (同一 ref 实例) │           │
│  │ orderBatch             │ → hooks/data.ts            │           │
│  │ showSingleEstimatedCost│ → hooks/data.ts            │           │
│  └────────────────────────┴────────────────────────────┘           │
│                                                                     │
│  ┌─────────────────────────────────────────────────────┐           │
│  │  透传机制                                          │           │
│  ├────────────────────────┬────────────────────────────┤           │
│  │ v-bind="$attrs"       │ 透传 isShowLineInfo,       │           │
│  │                        │ estimationPopupIndex,      │           │
│  │                        │ @getEstimationPopupIndex,  │           │
│  │                        │ @onClickHeader             │           │
│  │ defineExpose({ show }) │ 保证 detailPopRef.value.show│          │
│  └────────────────────────┴────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Design Decisions

### Decision 1: 适配层模式 — 调用方→适配层→全局组件

**选择**: 在 `kye-miniapp-order` 原位置保留 `detail-popup/index.vue` 作为适配层 wrapper

| 方案 | 优点 | 缺点 |
|------|------|------|
| **适配层模式** ✅ | 调用方零改动；共享状态桥接清晰 | 多一层间接 |
| 直接迁移 | 简单直接 | 调用方需改 import 路径 + 注入依赖；共享 ref 需跨模块管理 |

**理由**: `detail-popup/index.vue` 被 `cell.vue` 和 `estimated-cost/index.vue` 直接引用，且需要桥接大量 `@order-public` 依赖和共享状态。适配层模式确保调用方零改动，风险最低。

### Decision 2: 共享状态不迁移，通过 v-model 桥接

**选择**: `isDetailMode`/`currentIndex`/`goBack` 保留在 `hooks.ts` 原位，适配层 import 同一 ref 实例后通过 `v-model` 传给全局组件

```typescript
// 适配层: import 同一 ref 实例
import { isDetailMode, currentIndex, goBack } from '../estimation-cost-content/hooks'

// v-model 语法糖: :isDetailMode="isDetailMode" + @update:isDetailMode="val => isDetailMode = val"
<DetailPopupGlobal v-model:isDetailMode="isDetailMode" v-model:currentIndex="currentIndex" @goBack="goBack" />
```

**理由**: 这些 ref 被 `estimated-cost/index.vue` 和 detail-popup 内部同时读写，迁移到全局组件会导致 ref 实例不一致。

### Decision 3: showKyDialog 通过 event 上报，适配层处理

**选择**: `addressInfoItem` 不再直接调用 `showKyDialog`，改为 emit `noEstimateTips` event，由适配层监听后调用完整的 `showKyDialog`

**理由**:
1. `showKyDialog` 内部调用了 `setDefaultScrollTop()`（页面滚动复位）和 `getDialogRootClass()`（弹窗容器选择），这些都是下单页特有的副作用
2. 不需要复制简化版 `showSimpleDialog`，不需要 `setDefaultScrollTop` prop 逐层传递，不需要 `getDialogRootClass` 固定值替代
3. 全局组件更纯粹：零弹窗副作用，freight-time 使用时无需关心弹窗逻辑
4. event 链路：addressInfoItem → EstimationCostContent → DetailPopupGlobal → 适配层 → `showKyDialog`

### Decision 4: iosDisablePenetration 通过 callback 解耦

**选择**: 全局组件通过 `onIosDisablePenetration` callback prop 上报变更，适配层接收后写入原 ref

```typescript
// 适配层
const handleIosDisablePenetration = (val: boolean) => {
  iosDisablePenetration.value = val
}

// 传给全局组件
<DetailPopupGlobal :onIosDisablePenetration="handleIosDisablePenetration" />
```

**理由**: `iosDisablePenetration` 来自 `@pages/order-single/hooks/state`，全局组件不能直接引用。通过 callback 上报变更，适配层写入同一 ref 实例，保证 `estimated-cost/index.vue` 和 `order-single/index.vue` 读取一致。

### Decision 5: 埋点暂时注释

**选择**: `useOrderExposureReport`、`umpOtherReport` 等上报函数暂时注释

**理由**: 上报函数依赖 `@order-public/report`，迁移成本高且不影响核心功能。待后续统一处理。

### Decision 6: 原文件移除策略

**选择**: 迁移后按「有无树外引用」决定是否删除原文件

| 分类 | 文件 | 处理方式 |
|------|------|---------|
| 无树外引用 | fee-popup、estimation-cost-content(Vue/SCSS)、costItem、addressInfoItem、detailItem、example(Vue+SCSS)、feedback-issue、detail-popup/index.scss | **删除** |
| 有树外引用 | hooks.ts、utils.ts、hooks/data.ts | **保留原位** |
| 适配层 | detail-popup/index.vue | **移除原内容，改写为适配层** |

---

## Risk Analysis

| Risk | 影响 | 缓解措施 | 状态 |
|------|------|---------|------|
| **R1: cell.vue 缺少新 props 导致运行时崩溃** | 高 | 适配层自动注入，cell.vue 零改动 | ✅ 已规避 |
| **R2: isDetailMode ref 实例不一致** | 高 | useDetailMode.ts re-export 同一 ref 实例 + v-model 双向绑定 | ✅ 已规避 |
| **R3: $attrs 透传丢失** | 高 | 适配层 v-bind="$attrs" 透传 isShowLineInfo/estimationPopupIndex/events | ✅ 已规避 |
| **R4: defineExpose 缺失** | 高 | 适配层 expose 全局组件的 show 方法（含 getter + setter） | ✅ 已规避 |
| **R5: iosDisablePenetration 链路断裂** | 中 | callback 模式 + 适配层写入同一 ref | ✅ 已规避 |
| **R6: goBack event 链路** | 中 | 全局组件 emit goBack → 适配层监听 → 调用原 goBack() | ✅ 已规避 |
| **R7: 全局组件 props 与适配层不匹配** | 高 | 实现时严格对齐，逐一验证 | ⚠️ 需实现时验证 |
| **R8: fee-popup @goBack event 冒泡链** | 中 | 全局组件内部 event 正确冒泡 | ⚠️ 需实现时验证 |
| **R9: showKyDialog event 冒泡链** | 低 | addressInfoItem emit → EstimationCostContent 透传 → DetailPopupGlobal 透传($attrs) → 适配层监听 | ✅ 低风险 |
| **R10: 样式替换（svg-icon/noticebar）导致 UI 差异** | 中 | 逐组件对比验证 | ⚠️ 需实现时验证 |

---

## Migration Plan (实施阶段规划)

### Phase 0: 准备工作
- [ ] 创建 order-global-package 目录结构
- [ ] 创建类型定义（`types/estimated-cost.ts`）
- [ ] 创建工具函数本地副本（handleMoneyAmountShow、specialText），合并导出到 `utils/index.ts`
- [ ] 迁移 `ky-noticebar/noticebar.vue` 到 `order-global-package/components/base/ky-noticebar/`，替换其内部 `@order-public` 依赖为相对路径

### Phase 1: 叶子组件迁移（无内部依赖）
1. 迁移 `feedback-issue.vue`
2. 迁移 `example.vue` + `example.scss`
3. 迁移 `addressInfoItem/`（index.vue + index.scss）
4. 迁移 `detailItem/`（index.vue + index.scss）
5. 迁移 `costItem.vue` + `costItem.scss`

### Phase 2: 中间组件迁移
6. 迁移 `estimation-cost-content/`（index.vue + index.scss）
7. 迁移 `fee-popup/`（index.vue + index.scss）

### Phase 3: 根组件迁移
8. 迁移 `detail-popup/`（index.vue + index.scss）

### Phase 4: 适配层 + 调用方改造
9. 改写 `kye-miniapp-order` 侧 `detail-popup/index.vue` 为适配层
10. 新建 `useDetailMode.ts` 统一导出
11. 修改 `estimated-cost/index.vue` hooks import 路径

### Phase 5: 清理
12. 删除 `kye-miniapp-order` 侧无树外引用的原文件

### Phase 6: freight-time 接入
13. 在 freight-time 中集成全局 DetailPopup 组件
