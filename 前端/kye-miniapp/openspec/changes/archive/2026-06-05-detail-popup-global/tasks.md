# Tasks: detail-popup 组件迁移到 order-global-package

## Overview

将 detail-popup 及其子组件（11 个文件）从 `kye-miniapp-order` 迁移到 `order-global-package`，采用适配层模式实现零 `@order-public` 依赖。

**内部引用策略**：`order-global-package` 内部组件间引用统一使用相对路径，不使用 `@order-global-package` 别名（详见 proposal.md「核心约束」部分）。

---

## Phase 0: 准备工作与依赖确认

- [ ] **T-0.1** 确认 order-global-package 目录结构，创建 `components/business/estimated-cost/components/` 目录
- [ ] **T-0.2** 创建 `order-global-package/types/estimated-cost.ts` — 迁移 EstimateFeeByTaskIdResponseResultItem 等类型定义
- [ ] **T-0.3** 合并 `handleMoneyAmountShow` 到 `order-global-package/utils/index.ts` — 金额格式化纯函数
- [ ] **T-0.4** 合并 `specialText` 到 `order-global-package/utils/index.ts` — 特殊文本处理纯函数
- [ ] **T-0.5** ~~创建 showSimpleDialog~~ → 不再需要，showKyDialog 通过 event 上报由适配层处理
- [ ] **T-0.6** 迁移 `AddedValueTipsType` 常量到 `order-global-package/types/estimated-cost.ts`
- [ ] **T-0.7** 确认 `@order-global-package` 中 svg-icon 可用性；迁移 `ky-noticebar` 到 `order-global-package/components/base/ky-noticebar/`，替换其内部 `@order-public` 依赖为相对路径

---

## Phase 1: 叶子组件迁移（无内部子组件依赖）

### 1.1 feedback-issue 迁移
- [ ] **T-1.1.1** 复制 `feedback-issue.vue` → `order-global-package/.../estimation-cost-content/components/feedback-issue.vue`
- [ ] **T-1.1.2** 替换 `@order-public/store` (waybillNumber) → prop `waybillNumber`
- [ ] **T-1.1.3** 替换 `@order-public/report/exposureReport` → 注释
- [ ] **T-1.1.4** 替换 `@order-public/reportUmp/sceneReport/umpotherReport` → 注释
- [ ] **T-1.1.5** 保留 `Taro.navigateTo`（全局 API，直接迁移）

### 1.2 example 迁移
- [ ] **T-1.2.1** 复制 `example.vue` + `example.scss` → 目标路径
- [ ] **T-1.2.2** 替换 `@order-public/components/ui/svg-icon` → 相对路径 `ui/svg-icon`
- [ ] **T-1.2.3** 替换 `@order-public/components/base/ky-noticebar` → 相对路径 `base/ky-noticebar`
- [ ] **T-1.2.4** 更新 fee-popup import 为内部相对路径
- [ ] **T-1.2.5** 替换 `@order-public/styles/index.scss` → 相对路径 `styles/index.scss`

### 1.3 addressInfoItem 迁移
- [ ] **T-1.3.1** 复制 `addressInfoItem/index.vue` + `index.scss` → 目标路径
- [ ] **T-1.3.2** 替换 `@order-public/components/ui/svg-icon` → global-package 同类组件
- [ ] **T-1.3.3** 替换 `@order-public/apis/waybill/estimated-cost` (类型) → 相对路径 `types/estimated-cost`
- [ ] **T-1.3.4** 替换 `@order-public/report/exposureReport` → 注释
- [ ] **T-1.3.5** 替换 `@order-public/validate/effect/effectDialog` (showKyDialog) → emit `noEstimateTips` event，由适配层监听处理
- [ ] **T-1.3.6** 替换 `@order-public/constants` (AddedValueTipsType) → 相对路径 `types/estimated-cost`
- [ ] **T-1.3.7** 替换 `../../../../utils` (handleMoneyAmountShow/specialText) → 相对路径 `utils/index.ts` 统一导出
- [ ] **T-1.3.8** 替换 `@order-public/styles/index.scss` → 相对路径 `styles/index.scss`

### 1.4 detailItem 迁移
- [ ] **T-1.4.1** 复制 `detailItem/index.vue` + `index.scss` → 目标路径
- [ ] **T-1.4.2** 替换 `@order-public/apis/waybill/estimated-cost` (类型) → 相对路径 `types/estimated-cost`
- [ ] **T-1.4.3** 更新 costItem/addressInfoItem/feedback-issue import 为内部相对路径
- [ ] **T-1.4.4** 替换 `../../../../utils` (handleMoneyAmountShow) → 相对路径 `utils/index.ts` 统一导出
- [ ] **T-1.4.5** 替换 `@order-public/styles/index.scss` → 相对路径 `styles/index.scss`

### 1.5 costItem 迁移
- [ ] **T-1.5.1** 复制 `costItem.vue` + `costItem.scss` → 目标路径
- [ ] **T-1.5.2** 替换 `@order-public/components/ui/svg-icon` → global-package 同类组件
- [ ] **T-1.5.3** 替换 `@order-public/report/exposureReport` → 注释
- [ ] **T-1.5.4** 替换 `@order-public/reportUmp/sceneReport/umpotherReport` → 注释
- [ ] **T-1.5.5** 替换 `@order-public/utils/common` (getTaroDom) → 内联实现
- [ ] **T-1.5.6** 替换 `@pages/order-single/hooks/state` (iosDisablePenetration) → prop `onIosDisablePenetration` callback
- [ ] **T-1.5.7** 替换 `../../utils` (handleMoneyAmountShow) → 相对路径 `utils/index.ts` 统一导出
- [ ] **T-1.5.8** 替换 `@/public/utils` (isWechatEnv/isWxAppIosEnv) → 内联判断
- [ ] **T-1.5.9** 替换 `@order-public/styles/index.scss` → 相对路径 `styles/index.scss`

---

## Phase 2: 中间组件迁移

### 2.1 estimation-cost-content 迁移
- [ ] **T-2.1.1** 复制 `estimation-cost-content/index.vue` + `index.scss` → 目标路径
- [ ] **T-2.1.2** 替换 `@order-public/store` (batchWaybillInfoList) → prop `batchWaybillInfoList`
- [ ] **T-2.1.3** 替换 `@order-public/components/ui/svg-icon` → global-package 同类组件
- [ ] **T-2.1.4** 替换 `@order-public/components/base/ky-noticebar` → 相对路径 `base/ky-noticebar`
- [ ] **T-2.1.5** 替换 `@order-public/apis/waybill/estimated-cost` (类型) → 相对路径 `types/estimated-cost`
- [ ] **T-2.1.6** 替换 `@order-public/report/exposureReport` → 注释
- [ ] **T-2.1.7** 替换 `../../hooks/data` (orderBatch/showSingleEstimatedCost) → props
- [ ] **T-2.1.8** 替换 `./hooks` (isDetailMode/currentIndex) → props + events (v-model)
- [ ] **T-2.1.9** 更新子组件 import 为内部相对路径（costItem、addressInfoItem、detailItem）
- [ ] **T-2.1.10** 替换 `@order-public/styles/index.scss` → 相对路径 `styles/index.scss`

### 2.2 fee-popup 迁移
- [ ] **T-2.2.1** 复制 `fee-popup/index.vue` + `index.scss` → 目标路径
- [ ] **T-2.2.2** 替换 `@order-public/components/ui/svg-icon` → 相对路径 `ui/svg-icon`
- [ ] **T-2.2.3** 替换 `@/public/utils` (isH5FSEnv) → 内联判断
- [ ] **T-2.2.4** 替换 `@order-public/styles/index.scss` → 相对路径 `styles/index.scss`

---

## Phase 3: 根组件迁移

### 3.1 detail-popup 迁移
- [ ] **T-3.1.1** 复制 `detail-popup/index.vue` + `index.scss` → 目标路径
- [ ] **T-3.1.2** 替换内部 fee-popup/estimation-cost-content/example import 为内部相对路径
- [ ] **T-3.1.3** 替换 `@order-public/.../hooks` (isDetailMode/goBack) → props + events (v-model + @goBack)
- [ ] **T-3.1.4** 替换 `@order-public/apis/waybill/estimated-cost` (类型) → 相对路径 `types/estimated-cost`
- [ ] **T-3.1.5** 替换 `@order-public/styles/index.scss` → 相对路径 `styles/index.scss`
- [ ] **T-3.1.6** 新增 Props: isDetailMode、currentIndex、orderBatch、showSingleEstimatedCost、batchWaybillInfoList、waybillNumber、onIosDisablePenetration；新增 Event: noEstimateTips
- [ ] **T-3.1.7** 新增 Events: update:isDetailMode、update:currentIndex、goBack
- [ ] **T-3.1.8** 确保 $attrs 继续透传（isShowLineInfo、estimationPopupIndex、@getEstimationPopupIndex、@onClickHeader）

---

## Phase 4: 适配层 + 调用方改造

### 4.1 适配层改写
- [ ] **T-4.1.1** 改写 `kye-miniapp-order/.../detail-popup/index.vue` 为适配层 wrapper（删除原组件逻辑）
- [ ] **T-4.1.2** 适配层导入全局组件: `import DetailPopupGlobal from '@order-global-package-order/...'`
- [ ] **T-4.1.3** 适配层导入共享状态: `import { isDetailMode, currentIndex, goBack } from '../estimation-cost-content/hooks'`
- [ ] **T-4.1.4** 适配层导入下单依赖: `import { useStore } from '@order-public/store'`、`iosDisablePenetration`
- [ ] **T-4.1.5** 适配层模板: `<DetailPopupGlobal ref="globalRef" v-bind="$attrs" ... />`
- [ ] **T-4.1.6** 适配层 defineProps 与原组件完全一致
- [ ] **T-4.1.7** 适配层 defineExpose: 必须同时提供 getter 和 setter（cell.vue 和 estimated-cost/index.vue 都会写入 `detailPopRef.value.show = xxx`）
  ```ts
  defineExpose({
    get show() { return globalRef.value?.show },
    set show(val) { if (globalRef.value) globalRef.value.show = val },
  })
  ```
- [ ] **T-4.1.8** 实现 handleIosDisablePenetration callback
- [ ] **T-4.1.9** 实现 handleNoEstimateTips callback（`import { showKyDialog } from '@order-public/validate/effect/effectDialog'`，调用完整 showKyDialog）

### 4.2 hooks 统一导出
- [ ] **T-4.2.1** 新建 `estimated-cost/hooks/useDetailMode.ts`，re-export isDetailMode/currentIndex/goBack
- [ ] **T-4.2.2** 修改 `estimated-cost/index.vue`: import 路径从 `./components/estimation-cost-content/hooks` → `./hooks/useDetailMode`

### 4.3 验证
- [ ] **T-4.3.1** 验证 cell.vue 打开弹窗 → detailPopRef.value.show() 正常
- [ ] **T-4.3.2** 验证 estimated-cost/index.vue → isShowLineInfo/estimationPopupIndex 透传正常
- [ ] **T-4.3.3** 验证 @getEstimationPopupIndex/@onClickHeader event 冒泡正常
- [ ] **T-4.3.4** 验证 isDetailMode 双向绑定联动
- [ ] **T-4.3.5** 验证 iosDisablePenetration 链路完整性
- [ ] **T-4.3.6** 验证 goBack 链路完整性

---

## Phase 5: 原文件清理

- [ ] **T-5.1** 确认所有功能回归测试通过后，删除以下 kye-miniapp-order 侧文件：
  - `components/detail-popup/index.scss`
  - `components/fee-popup/` (index.vue + index.scss)
  - `components/estimation-cost-content/index.vue`
  - `components/estimation-cost-content/index.scss`
  - `components/estimation-cost-content/costItem.vue`
  - `components/estimation-cost-content/costItem.scss`
  - `components/estimation-cost-content/components/addressInfoItem/` (index.vue + index.scss)
  - `components/estimation-cost-content/components/detailItem/` (index.vue + index.scss)
  - `components/estimation-cost-content/components/example.vue` + `example.scss`
  - `components/estimation-cost-content/components/feedback-issue.vue`
- [ ] **T-5.2** 全局搜索残留的旧路径引用，确保无遗漏
- [ ] **T-5.3** 确认以下文件保留原位不动：
  - `components/estimation-cost-content/hooks.ts`（isDetailMode/goBack/currentIndex 被树外引用）
  - `utils.ts`（specialText 被 cell.vue、estimated-cost/index.vue 引用）
  - `hooks/data.ts`（orderBatch/showSingleEstimatedCost 被树外引用）
- [ ] **T-5.4** Code Review: 确认全局组件中零 `@order-public` import

---

## Phase 6: freight-time 接入

- [ ] **T-6.1** `freight-time/components/service-mode/hooks/useServiceMode.ts`: 替换 `handleDetail` 占位实现
- [ ] **T-6.2** `freight-time/components/service-mode/index.vue`: 集成 `DetailPopupGlobal` 组件（通过 `@order-global-package-freight-time` 别名导入）
- [ ] **T-6.3** 传入必要 props: estimationFee、results、onClose、title、footerSectionHeight 等
- [ ] **T-6.4** freight-time 自行管理 isDetailMode/currentIndex 状态
- [ ] **T-6.5** 验证 freight-time 费用详情弹窗功能正常

---

## 任务统计

| Phase | 任务数 | 完成 | 状态 |
|-------|-------|------|------|
| Phase 0 | 7 | 0 | ⏳ 待开始 |
| Phase 1 | 24 | 0 | ⏳ 待开始 |
| Phase 2 | 14 | 0 | ⏳ 待开始 |
| Phase 3 | 8 | 0 | ⏳ 待开始 |
| Phase 4 | 14 | 0 | ⏳ 待开始 |
| Phase 5 | 4 | 0 | ⏳ 待开始 |
| Phase 6 | 5 | 0 | ⏳ 待开始 |
| **总计** | **~76** | **0** | **0%** |

## 已知 TODO 项（后续迭代优化）

- [ ] 迁移 `@order-public/reportUmp/sceneReport/umpotherReport` → global-package（已注释，待后续恢复）
- [ ] 迁移 `@order-public/report/exposureReport` useOrderExposureReport → global-package（已注释，待后续恢复）
- [ ] 替换 `@order-public/components/ui/svg-icon` → 相对路径 `ui/svg-icon`
- [ ] 迁移 `@order-public/components/base/ky-noticebar` → `order-global-package/components/base/ky-noticebar/`，替换内部 `@order-public` 依赖为相对路径
