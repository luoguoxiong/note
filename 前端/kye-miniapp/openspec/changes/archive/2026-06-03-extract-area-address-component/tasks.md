# Tasks: AreaAddress 省市区选择弹窗组件迁移

## Overview

将 AreaAddress 组件（4 文件）+ 3 个地址 API 函数从 `@order-public` 迁移到 `order-global-package`，更新 18 处使用方的 import 路径。

---

## Phase 0: 准备工作与 API 适配层

### 0.1 确认 http 函数引入方案
- [x] **T-0.1.1** 确认 `@order-public/utils/request` 的 `http` 函数是否可在 global-package 中复用
  - 如果可从 `@order-global-package-order/utils/request` 引入 → 直接使用
  - 如果有下单包上下文耦合 → 在 global-package 创建独立的 request 封装
- [x] **T-0.1.2** 决定 API 层方案:
  - **方案 A**: re-export from `@order-public/apis/address` (最简，但仍有跨包依赖)
  - **方案 B**: 在 `order-global-package/apis/address/` 中 copy 实现 (完全独立)

### 0.2 创建 API 适配文件
- [x] **T-0.2.1** 创建 `order-global-package/apis/address/types-area.ts`:
  ```typescript
  export interface MultilevelLinkage {
    commonId: string
    levelType: string
  }
  export interface MultilevelLinkageResponse { ... }
  export interface MapAddressSearchResponse { ... }
  export interface HotCityNameListResponse { ... }
  ```
- [x] **T-0.2.2** 扩展 `order-global-package/apis/address/index.ts`:
  - 新增 `multilevelLinkage()`
  - 新增 `hotCityNameList()`
  - 新增 `mapAddressSearch()`

---

## Phase 1: 组件文件迁移

### 1.1 文件复制
- [x] **T-1.1.1** 复制 `area-address/index.vue` → `order-global-package/components/business/area-address/index.vue`
- [x] **T-1.1.2** 复制 `area-address/types.ts` → 同目标路径
- [x] **T-1.1.3** 复制 `area-address/index.scss` → 同目标路径
- [x] **T-1.1.4** 复制 `area-address/README.md` → 同目标路径

---

## Phase 2: 依赖替换（index.vue 内部）

### 2.1 API 层替换
- [x] **T-2.1.1** 替换 `import { multilevelLinkage, hotCityNameList, mapAddressSearch } from '@order-public/apis/address'`
  - → `from '@order-global-package/apis/address'`

### 2.2 工具函数替换
- [x] **T-2.2.1** 替换 `import { getValueOrEmpty } from '@order-public/utils'`
  - → `from '@order-global-package/utils'`
- [x] **T-2.2.2** 替换 `import { setFooterZIndex } from '@order-public/hooks/asynrender'`
  - → `from '@order-global-package/components/ui/types/footer'`
- [x] **T-2.2.3** **内联 `updateCommonDisabledScroll`**:
  - 删除 `import { updateCommonDisabledScroll } from '@order-public/hooks/address/useCommon'`
  - `handleClose()` 中替换为:
    ```typescript
    const handleClose = () => {
      console.log(pickerRef.value, 'pickerRef.value')
      state.show = false
      // 内联: 重置页面滚动位置
      if (process.env.TARO_ENV === 'weapp') {
        wx?.pageScrollTo({ scrollTop: 0, duration: 0 })
      }
    }
    ```

### 2.3 上报处理
- [x] **T-2.3.1** 注释 `open()` 中的曝光上报:
  ```typescript
  // umpOtherReport('OTHER', { eventCode: 'other_express_receiver_city_perception_v1' })
  ```
- [x] **T-2.3.2** 注释或删除 `import umpOtherReport from '@order-public/reportUmp/sceneReport/umpotherReport'`

### 2.4 样式更新
- [x] **T-2.4.1** 替换 `@import '@order-public/styles/index.scss'` → `@import '@order-global-package/styles/index.scss'`

### 2.5 验证
- [x] **T-2.5.1** lint 检查: 无新增 ERROR/WARNING
- [x] **T-2.5.2** 确认所有 import 路径解析正确

---

## Phase 3: 使用方适配

### 3.1 kye-miniapp-order 内（10 处）

路径规则: `@order-public/components/business/area-address` → `@order-global-package-order/components/business/area-address`

- [x] **T-3.1.1** `components/business/sender/unfold/index.vue`
- [x] **T-3.1.2** `components/business/sender/page/address-page/index.vue`
- [x] **T-3.1.3** `components/business/receive/unfold/index.vue`
- [x] **T-3.1.4** `components/business/receive/page/address-page/index.vue`
- [x] **T-3.1.5** `components/business/address-book/sender/index.vue`
- [x] **T-3.1.6** `components/business/address-book/receive/index.vue`
- [x] **T-3.1.7** `hooks/address/sender/useFields.ts` (useArea hook 中的 ref 类型)
- [x] **T-3.1.8** `hooks/address/receive/useFields.ts`
- [x] **T-3.1.9** `hooks/address/address-book/sender/hooks/useFields.ts`
- [x] **T-3.1.10** `hooks/address/address-book/receive/hooks/useFields.ts`

### 3.2 order-build-sub-pages 内（8 处）

路径规则: `@order-public-sub-public/components/business/area-address` → `@order-global-package-order-sub/components/business/area-address`

- [x] **T-3.2.1** `components/business/sender/unfold/index.vue`
- [x] **T-3.2.2** `components/business/sender/page/address-page/index.vue`
- [x] **T-3.2.3** `components/business/receive/unfold/index.vue`
- [x] **T-3.2.4** `components/business/receive/page/address-page/index.vue`
- [x] **T-3.2.5** `components/business/address-book/share-page/index.vue`
- [x] **T-3.2.6** `components/business/address-book/sender/index.vue`
- [x] **T-3.2.7** `components/business/address-book/receive/index.vue`
- [x] **T-3.2.8** `components/business/added-service/receipter-info/index.vue`

### 3.3 freight-time 接入
- [x] **T-3.3.1** `freight-time/pages/adress/index.vue` 引入 AreaAddress，handleCityClick 调用 open() 弹出省市区选择

---

## Phase 4: 清理与验证

### 4.1 全局搜索清理
- [x] **T-4.1.1** 全局搜索 `@order-public/components/business/area-address` 确认无残留
- [x] **T-4.1.2** 全局搜索 `@order-public-sub-public/components/business/area-address` 确认无残留

### 4.2 删除原文件
- [x] **T-4.2.1** ~~删除 `kye-miniapp-order/src/order-public/components/business/area-address/` (4 文件)~~ → **暂保留**（后续定位问题对比用）
- [x] **T-4.2.2** ~~删除 `order-build-sub-pages/order-public/components/business/area-address/` (如有副本)~~ → **同上**

### 4.3 回归验证
- [x] **T-4.3.1** 寄件展开页: 点击城市/区域 → 弹出省市区选择 → 选择省份→城市→区县 → 确定 → 回填正确
- [x] **T-4.3.2** 寄件详情页: 同上流程
- [x] **T-4.3.3** 收件展开页/详情页: 同上流程
- [x] **T-4.3.4** 地址簿寄件/收件编辑页: 同上流程
- [x] **T-4.3.5** 热门城市点击: 快速选中城市 → 区县联动正确
- [x] **T-4.3.6** 搜索功能: 输入关键词 ≥ 2 字 → 搜索结果展示 → 点击回填
- [x] **T-4.3.7** 微信小程序端: 弹窗打开/关闭时页面滚动锁定/解锁正常
- [x] **T-4.3.8** 支付宝小程序端: 兼容性正常（当前支付宝滚动控制已注释）

---

## 任务统计

| Phase | 任务数 | 状态 |
|-------|-------|------|
| Phase 0 | 3 | ✅ 完成 |
| Phase 1 | 4 | ✅ 完成 |
| Phase 2 | 9 | ✅ 完成 |
| Phase 3 | 19/19 | ✅ 完成 (含 freight-time 接入) |
| Phase 4 | 12/12 | ✅ 完成 (原文件保留，不删除) |
| **总计** | **47/47** | **✅ 全部完成** |

---

## 迁移后修复记录

| # | 问题 | 修复内容 | 文件 |
|---|------|---------|------|
| 1 | ky-input 入口文件错误 | `index.vue` → `input.vue` | area-address/index.vue × 2 |
| 2 | picker 不显示滚动选项 | 补充 `:poppable="false"`, `:show-toolbar="false"`, 修正属性名 `visible-option-num` | area-address/index.vue × 2 |
| 3 | 搜索结果不显示 | 移入 `#scroll-after` slot, 修正 v-if 条件, 改用 v-html 渲染高亮 | area-address/index.vue × 2 |
| 4 | onTouchstart 报错 | `$el.querySelector is not a function` → 改用 `document.activeElement.blur()` | area-address/index.vue × 2 |
| 5 | 引入路径遗漏 | `receive/page/address-page/index.vue` 未替换为 global-package 路径 | kye-miniapp-order |

---

## 依赖分析汇总: 可迁移 vs 不可迁移

### ✅ 可迁移（8 项）

| 依赖 | 来源文件 | 迁移目标 | 状态 |
|------|---------|---------|------|
| `multilevelLinkage` | `apis/address/index.ts:69` | `global-package/apis/address` | 已完成 |
| `hotCityNameList` | `apis/address/index.ts:170` | 同上 | 已完成 |
| `mapAddressSearch` | `apis/address/index.ts:183` | 同上 | 已完成 |
| `getValueOrEmpty` | `utils/index.ts` | `global-package/utils` | 已完成 (OCR迁移) |
| `setFooterZIndex` | `hooks/asynrender` | `global-package/components/ui/types/footer.ts` | 已完成 (OCR迁移) |
| `highlightText` | — | `global-package-order/utils` | 保持 (属order包) |
| `showToast` / `PickerInstance` | — | `global-package-order/hooks/useShowToast` | 保持 (属order包) |
| `@order-public/styles` | — | `global-package/styles` | 路径已替换 |

### ❌ 不可迁移 / 保持原路径（5 项）

| 依赖 | 保持原因 |
|------|---------|
| `BottomPopup` | `@order-global-package-order/components/ui/bottom-popup` — order 包基础 UI |
| `KyInput` | `@order-global-package-order/components/base/ky-input` — order 包基础输入框 |
| `KyButton` | `@order-global-package-order/components/base/ky-button` — order 包基础按钮 |
| `ky-picker` | `@order-global-package-order` 内部 picker 组件 — order 包独有 |
| `lodash-es` | npm 通用依赖，非业务耦合 |

### ⚠️ 特殊处理（2 项）

| 依赖 | 处理方式 |
|------|---------|
| `umpOtherReport` | 注释掉唯一调用点（open() 曝光上报），删除 import |
| `updateCommonDisabledScroll` | **内联**: `wx.pageScrollTo({ scrollTop: 0, duration: 0 })` — 仅微信端滚动重置 |
