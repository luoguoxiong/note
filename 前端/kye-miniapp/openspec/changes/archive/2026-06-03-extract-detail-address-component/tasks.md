# Tasks: DetailAddress 详细地址选择弹窗组件迁移

## Overview

将 DetailAddress 组件（7 文件）+ ListRefreshLoad（KyTextarea 已迁移✅）从 `@order-public` 迁移到 `order-global-package`，更新 16 处使用方的 import 路径。

---

## Phase 0: 准备工作与依赖确认

### 0.1 确认待迁移组件
- [x] **T-0.1.1** 确认 `@order-public/components/ui/list-refresh-load/` 文件清单和依赖
- [x] **T-0.1.2** ~~确认 `@order-public/components/base/ky-textarea/`~~ → **已迁移** ✅ (`global-package/components/base/ky-textarea/`)
- [x] **T-0.1.3** ~~评估 ListRefreshLoad 和 KyTextarea 的 @order-public 依赖~~ → KyTextarea 已就绪，仅需评估 ListRefreshLoad

### 0.2 创建目标目录
- [x] **T-0.2.1** 确认 `order-global-package/components/business/detail-address/` 目录存在
- [x] **T-0.2.2** 确认 `order-global-package/components/ui/` 目录存在（ListRefreshLoad 目标）
- [x] **T-0.2.3** 确认 `order-global-package/components/base/` 目录存在 → **KyTextarea 已在此** ✅

---

## Phase 1: 附属组件迁移（KyTextarea ✅已迁移 + ListRefreshLoad）

### 1.1 KyTextarea — 已完成 ✅
- [x] **T-1.1.1** ~~复制 ky-textarea/~~ → 已存在于 `global-package/components/base/ky-textarea/`
- [x] **T-1.1.2** ~~替换 @order-public 引用~~ → 迁移时已完成
- [x] **T-1.1.3** 验证可正常 import → detail-address/index.vue 直接引用相对路径即可

### 1.2 ListRefreshLoad 迁移
- [x] **T-1.2.1** 复制 `list-refresh-load/` → `order-global-package/components/ui/list-refresh-load/`
- [x] **T-1.2.2** 替换 list-refresh-load 内部 @order-public 引用为相对路径或 global-package 路径
- [x] **T-1.2.3** 验证 list-refresh-load 在 global-package 中可正常 import（样式已改 script 引入）

---

## Phase 2: DetailAddress 主组件文件迁移

### 2.1 文件复制
- [x] **T-2.1.1** 复制 `detail-address/index.vue` → 目标路径
- [x] **T-2.1.2** 复制 `detail-address/types.ts` → 同目标路径
- [x] **T-2.1.3** 复制 `detail-address/index.scss` → 同目标路径
- [x] **T-2.1.4** 复制 `detail-address/readme.md` → 同目标路径（无 readme.md，跳过）
- [x] **T-2.1.5** 复制 `detail-address/report/index.ts` → 同目标路径（report 目录存在）
- [x] **T-2.1.6** 复制 `detail-address/components/list/index.vue` → 同目标路径
- [x] **T-2.1.7** 复制 `detail-address/components/list/index.scss` → 同目标路径（样式已修复卡片样式）

### 2.2 index.vue 依赖替换

#### 2.2.1 已迁移依赖 — 改路径
- [x] **T-2.2.1.1** `import { showToast } from '@order-global-package-order/hooks/useShowToast'` → 保持不变 ✅
- [x] **T-2.2.1.2** `import BottomPopup from '@order-global-package-order/components/ui/bottom-popup'` → 保持不变 ✅
- [x] **T-2.2.1.3** `import SvgIcon from '@order-global-package-order/components/ui/svg-icon'` → 保持不变 ✅
- [x] **T-2.2.1.4** `import KyButton from '@order-global-package-order/components/base/ky-button'` → 保持不变 ✅

#### 2.2.2 新迁移组件 — 改相对路径
- [x] **T-2.2.2.1** `import KyTextarea from '../../base/ky-textarea/index.vue'` ✅
- [x] **T-2.2.2.2** `import ListRefreshLoad from '../../ui/list-refresh-load/index.vue'` ✅
- [x] **T-2.2.2.3** `import List from './components/list/index.vue'` ✅

#### 2.2.3 API / 工具函数替换
- [x] **T-2.2.3.1** `import { findSuggest, aiAddrAnalysis } from '../../../apis/address'` ✅
- [x] **T-2.2.3.2** `import { FindSuggestItem, AiAddrAnalysisRes } from '../../../apis/address/types'` ✅
- [x] **T-2.2.3.3** `import { getValueOrEmpty } from '../../../utils'` ✅
- [x] **T-2.2.3.4** `filterEmojis` 内联到组件内 ✅

#### 2.2.4 类型 / 常量替换
- [x] **T-2.2.4.1** `Address` 常量内联为对象 `{ SENDER: 'SENDER', RECEIVE: 'RECEIVE' }` ✅
- [x] **T-2.2.4.2** `import { DetailAddressState } from './types'` → 保持不变 ✅

#### 2.2.5 Hooks 解耦
- [x] **T-2.2.5.1** `updateCommonDisabledScroll` 内联; `useOriginalAddress` 改为内部 ref + emit 回传 ✅
- [x] **T-2.2.5.2** `import { setFooterZIndex } from '../../ui/types/footer'` ✅

#### 2.2.6 Store 解耦
- [x] **T-2.2.6.1** 删除 useStore/piniaStore，使用 props.waybillNumber ✅

#### 2.2.7 工具函数内联
- [x] **T-2.2.7.1** `getDetailAddressSceneType` 内联为箭头函数 ✅

#### 2.2.8 上报处理
- [x] **T-2.2.8.1** `umpOtherReport` 所有调用点已注释 ✅
- [x] **T-2.2.8.2** `detailPopupClosedReport`, `pasteReport` 函数体已注释，保留接口签名 ✅

#### 2.2.9 样式替换
- [x] **T-2.2.9.1** 样式改为 script 引入 `import './index.scss'` ✅

### 2.3 子组件 list/index.vue 改造
- [x] **T-2.3.1** `import { FindSuggestItem } from '../../../../../apis/address/types'` ✅
- [x] **T-2.3.2** `import highlightText from '../../../../../utils/highlightText'` ✅
- [x] **T-2.3.3** 样式改为 script 引入，CSS 已修复卡片样式（border-radius/border/box-shadow）✅

### 2.4 report/index.ts 改造
- [x] **T-2.4.1** Address 常量字符串替代 ✅
- [x] **T-2.4.2** umpOtherReport 注释掉，函数体注释 ✅

### 2.5 验证
- [x] **T-2.5.1** lint 检查无 ERROR/WARNING ✅
- [x] **T-2.5.2** 所有 import 路径解析正确 ✅

---

## Phase 3: 使用方适配

### 3.1 kye-miniapp-order 内（7 处）

路径规则: `@order-public/components/business/detail-address` → `@order-global-package-order/components/business/detail-address`

- [x] **T-3.1.1** `components/business/sender/unfold/index.vue` ✅
- [x] **T-3.1.2** `components/business/sender/page/address-page/index.vue` ✅
- [x] **T-3.1.3** `components/business/receive/unfold/index.vue` ✅
- [x] **T-3.1.4** `components/business/receive/page/address-page/index.vue` ✅ 已修复
- [x] **T-3.1.5** `components/business/address-book/sender/index.vue` ✅
- [x] **T-3.1.6** `components/business/address-book/receive/index.vue` ✅
- [x] **T-3.1.7** ~~`components/ui/address-unfold/index.vue`~~ → 不同组件，不在范围 ✅

### 3.2 order-build-sub-pages 内（9 处）

路径规则: `@order-public-sub-public/components/business/detail-address` → `@order-global-package-order-sub/components/business/detail-address`

- [x] **T-3.2.1** `components/business/sender/unfold/index.vue` ✅
- [x] **T-3.2.2** `components/business/sender/page/address-page/index.vue` ✅
- [x] **T-3.2.3** `components/business/receive/unfold/index.vue` ✅
- [x] **T-3.2.4** `components/business/receive/page/address-page/index.vue` ✅
- [x] **T-3.2.5** `components/business/address-book/sender/index.vue` ✅
- [x] **T-3.2.6** `components/business/address-book/receive/index.vue` ✅
- [x] **T-3.2.7** `components/business/address-book/share-page/index.vue` ✅
- [x] **T-3.2.8** `components/business/added-service/receipter-info/index.vue` ✅
- [x] **T-3.2.9** ~~`components/ui/address-unfold/index.vue`~~ → 不同组件，不在范围 ✅

---

## Phase 4: freight-time 接入

- [x] **T-4.1** `freight-time/pages/adress/index.vue`:
  - import DetailAddress from `@order-global-package-freight-time/components/business/detail-address/index.vue`
  - 模板中添加 `<DetailAddress>` 组件实例
  - 配置 props: area, addressType
  - 绑定事件: @onSelect, @onConfirmDetailAddress

---

## Phase 5: 清理与验证

### 5.1 全局搜索清理
- [x] **T-5.1.1** 全局搜索 `@order-public/components/business/detail-address` 确认 0 残留（排除原文件）✅
- [x] **T-5.1.2** 全局搜索 `@order-public-sub-public/components/business/detail-address` 确认 0 残留 ✅

### 5.2 原文件保留（不删除）
- [x] **T-5.2.1** `kye-miniapp-order/src/order-public/components/business/detail-address/` → **保留**
- [x] **T-5.2.2** `order-build-sub-pages/order-public/components/business/detail-address/` → **保留**

### 5.3 回归验证
- [x] **T-5.3.1** 寄件展开页: 点击详细地址 → 弹窗打开 → 输入搜索 → 列表展示 → 点击选中 → 回填正确 ✅
- [x] **T-5.3.2** 寄件详情页: 同上流程 ✅
- [x] **T-5.3.3** 收件展开页/详情页: 同上流程 ✅
- [x] **T-5.3.4** 地址簿寄件/收件编辑页: 同上流程 ✅
- [x] **T-5.3.5** 确定 AI 解析: 手动输入 → 点确定 → aiAddrAnalysis 返回结果 → 回填省市区+详细地址+公司名 ✅
- [x] **T-5.3.6** 下拉刷新/上拉加载: 列表翻页正常 ✅
- [x] **T-5.3.7** freight-time 地址页: 详细地址功能正常 ✅
- [x] **T-5.3.8** 微信小程序端: 弹窗滚动正常 ✅

---

## 任务统计

| Phase | 任务数 | 状态 |
|-------|-------|------|
| Phase 0 | 3 | **3/3 ✅ 完成** |
| Phase 1 | 6 | **6/6 ✅ 完成** (KyTextarea + ListRefreshLoad) |
| Phase 2 | ~25 | **~25/25 ✅ 完成** (主组件改造+样式修复) |
| Phase 3 | 16 | **16/16 ✅ 完成** (7+9 使用方适配) |
| Phase 4 | 1 | **1/1 ✅ 完成** (freight-time 接入) |
| Phase 5 | 11 | **11/11 ✅ 完成** (清理验证+回归测试通过) |
| **总计** | **~62** | **~62/62 ✅ 全部完成** |

---

## 依赖分析汇总: 可迁移 vs 不可迁移

### ✅ 可迁移 / 已就绪

| 依赖 | 来源文件 | 迁移目标 | 状态 |
|------|---------|---------|------|
| `findSuggest`, `aiAddrAnalysis` | `apis/address` | `global-package/apis/address` | ✅ 已有 |
| `FindSuggestItem`, `AiAddrAnalysisRes` | `apis/address/types` | `global-package/apis/address/types` | ✅ 已有 |
| `getValueOrEmpty` | `utils/index` | `global-package/utils` | ✅ 已有 |
| `filterEmojis` | `utils/pattern` | `types/constants.ts` | ✅ 已有 |
| `setFooterZIndex` | `hooks/asynrender` | `types/footer.ts` | ✅ 已有 |
| `showToast` | — | `hooks/useShowToast` | ✅ 保持 order 包 |
| `highlightText` | — | `utils/highlightText` | ✅ 保持 order 包 |
| `BottomPopup` | — | `components/ui/bottom-popup` | ✅ 保持 order 包 |
| `SvgIcon` | — | `components/ui/svg-icon` | ✅ 保持 order 包 |
| `KyButton` | — | `components/base/ky-button` | ✅ 保持 order 包 |
| **KyTextarea** | `base/ky-textarea` | `global-package/base/ky-textarea` | ✅ **已迁移** |
| **ListRefreshLoad** | `ui/list-refresh-load` | `global-package/ui/list-refresh-load` | 🆕 一并迁移 |

### ⚠️ 解耦处理（6 项）

| 依赖 | 当前用法 | 处理方式 |
|------|---------|---------|
| `useStore()` (piniaStore) | 获取 waybillNumber | Props 注入（已有 waybillNumber prop）|
| `useOriginalAddress` | 设置原始地址显示值 | 内部 ref + emit 回传 |
| `updateCommonDisabledScroll` | 关闭时重置滚动 | 内联 wx.pageScrollTo |
| `getDetailAddressSceneType` | AI 场景类型映射 | 内联简单映射函数 |
| `Address` 常量 | SENDER/RECEIVE 枚举 | 字符串直接比较 |
| `umpOtherReport` + `report/*` | 上报函数 | 注释掉调用点和函数体 |
