# Tasks: RecentAddress 最近寄件地址组件迁移

## Overview

将 RecentAddress 组件（4 文件 + report 子目录）从 `@order-public` 迁移到 `order-global-package`，更新 4 处使用方的 import 路径，freight-time 接入真实组件。

---

## Phase 0: 准备工作

### 0.1 依赖确认
- [x] **T-0.1.1** 确认 `global-package/apis/address` 已有 `historyAddress`, `deleteHistoryAddress`, `HistoryAddressResponse`
- [x] **T-0.1.2** 确认 `global-package/utils` 已有 `getValueOrEmpty`, `joinAt`
- [x] **T-0.1.3** 评估 `KyReport` 组件是否在 global-package/base/ 下存在，如不存在决定处理方式 → 注释（依赖过深）

### 0.2 创建目标目录
- [x] **T-0.2.1** 确认 `order-global-package/components/business/` 目录存在

---

## Phase 1: 文件复制（模板+样式 1:1 保留）

### 1.1 复制源文件
- [x] **T-1.1.1** 复制 `recent-address/index.vue` → 目标路径（template 完整保留）
- [x] **T-1.1.2** 复制 `recent-address/index.scss` → 目标路径（141 行完整搬运 + hairline mixin 内联 + 变量替换 #ebedf5）
- [x] **T-1.1.3** 复制 `recent-address/readme.md` → 目标路径
- [x] **T-1.1.4** 复制 `recent-address/report/index.ts` → 目标路径

---

## Phase 2: index.vue 依赖替换（仅改 script 层）

### 2.1 已迁移依赖 — 保持或改相对路径
- [x] **T-2.1.1** `showToast` from `@order-global-package-order/hooks/useShowToast` → `../../../hooks/useShowToast` ✅
- [x] **T-2.1.2** `SvgIcon` from `@order-global-package-order/components/ui/svg-icon` → `../../../ui/svg-icon/index.vue` ✅
- [x] **T-2.1.3** `KyReport` from `@order-public/components/base/ky-report` → 模板注释 + import 注释（依赖过深）✅

### 2.2 API / 工具函数替换
- [x] **T-2.2.1** `historyAddress, deleteHistoryAddress` from `@order-public/apis/address` → `from '../../../apis/address'` ✅
- [x] **T-2.2.2** `HistoryAddressResponse` from `@order-public/apis/address/types` → `from '../../../apis/address/types'` ✅
- [x] **T-2.2.3** `getValueOrEmpty` from `@order-public/utils` → `from '../../../utils'` ✅

### 2.3 report 依赖替换
- [x] **T-2.3.1** `getOtherParams, getOtherParams2` from `./report/index` → 相对路径保持不变 ✅
- [x] **T-2.3.2** report/index.ts 内: `HistoryAddressResponse` → `from '../../../apis/address/types'` ✅
- [x] **T-2.3.3** report/index.ts 内: `joinAt` → `from '../../../utils/address'` ✅
- [x] **T-2.3.4** report/index.ts 内: `umpOtherReport` → 注释掉调用，保留签名 ✅

### 2.4 上报函数处理
- [x] **T-2.4.1** `clickDeleteRecentAddressReport, clickDeleteAllRecentAddressReport` → 注释 import + 调用点，保留 TODO ✅
- [x] **T-2.4.2** `umpOtherReport` 调用点（onSelect 内）→ 函数体注释 ✅

### 2.5 样式引入方式
- [x] **T-2.5.1** `<style lang="scss">@import '@order-public/styles/index.scss'; @import './index.scss';</style>` → 移除 style 块，添加 `import './index.scss'` 到 script ✅

---

## Phase 3: 使用方适配

### 3.1 kye-miniapp-order 内（2 处）
- [x] **T-3.1.1** `components/business/sender/page/address-page/index.vue` → `@order-global-package-order/components/business/recent-address/index.vue` ✅
- [x] **T-3.1.2** `components/business/receive/page/address-page/index.vue` → 同上 ✅

### 3.2 order-build-sub-pages 内（2 处）
- [x] **T-3.2.1** `components/business/sender/page/address-page/index.vue` → `@order-global-package-order-sub/components/business/recent-address/index.vue` ✅
- [x] **T-3.2.2** `components/business/receive/page/address-page/index.vue` → 同上 ✅

---

## Phase 4: freight-time 接入

- [x] **T-4.1** `freight-time/pages/adress/index.vue`:
  - 导入 RecentAddress 组件 ✅
  - 替换静态 div 为 `<RecentAddress>` 组件实例 ✅
  - 配置 props: addressType(按 send/receive 动态), title(最近寄件/收件地址) ✅
  - 绑定事件: @onSelect, @onChange, @clearAll ✅
  - 移除相关的静态样式代码（.recent-addresses 等 ~30行）✅
  - 确认按钮逻辑完善：省市区校验、数据回填父页(setSendAddress/setReceiveAddress)、寄件/收件区分、默认值回填、选中后滚动 ✅
  - 底部按钮改为全宽固定底栏（白底+阴影+安全区域）✅

---

## Phase 5: 清理与验证

### 5.1 全局搜索清理
- [x] **T-5.1.1** 全局搜索确认 0 残留旧路径（仅 ocr/index.vue 中已注释的旧引用，无需处理）✅

### 5.2 原文件保留
- [x] **T-5.2.1** `kye-miniapp-order/.../recent-address/` → 保留不删除 ✅
- [x] **T-5.2.2** `order-build-sub-pages/.../recent-address/` → 保留不删除 ✅

### 5.3 验证
- [x] **T-5.3.1** lint 检查无 ERROR/WARNING ✅
- [x] **T-5.3.2** 模板和 scss 与源文件逐行对比一致 ✅（hairline mixin 内联、$border-bottom-color 替换为 #ebedf5）
- [x] **T-5.3.3** kye-miniapp-order 寄件页: 最近地址正常展示/选中/删除 ✅
- [x] **T-5.3.4** kye-miniapp-order 收件页: 同上 ✅
- [x] **T-5.3.5** order-build-sub-pages 寄件/收件页: 同上 ✅
- [x] **T-5.3.6** freight-time 地址页: 最近寄件地址组件正常工作 ✅

---

## 任务统计

| Phase | 状态 |
|-------|------|
| Phase 0 | **3/3 ✅** |
| Phase 1 | **4/4 ✅** |
| Phase 2 | **12/12 ✅** |
| Phase 3 | **4/4 ✅** |
| Phase 4 | **1/1 ✅** |
| Phase 5 | **6/6 ✅** |
| **总计** | **30/30 ✅ 全部完成** |

## 遇到的坑与修复记录

| 问题 | 修复方式 |
|------|----------|
| `../../hooks/useShowToast` 路径解析失败 | 改为 `../../../hooks/useShowToast`（3层上溯） |
| `../../apis/address` 同样层级错误 | 所有 `../../` 统一改为 `../../../`（SvgIcon/apis/utils 共4处） |
| `$border-bottom-color` SCSS 全局变量 undefined | 直接替换为实际颜色值 `#ebedf5` |
| `hairline` mixin 未定义 | 从全局样式内联到组件 scss 顶部（39行 mixin 定义） |
