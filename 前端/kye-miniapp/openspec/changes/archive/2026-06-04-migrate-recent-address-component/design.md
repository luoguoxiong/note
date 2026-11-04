## Context

`RecentAddress` 组件当前存在于两个位置：
- **主源**：`kye-miniapp-order/src/order-public/components/business/recent-address/`（功能完整版，含清空/编辑态切换、KyReport 曝光上报、umpOtherReport 点击上报）
- **副本**：`order-build-sub-pages/order-public/components/business/recent-address/`（简化版，无编辑态，使用 v-exposure-report 指令）

freight-time 模块 (`pages/adress/index.vue`) 目前只有静态 HTML 占位，需要接入真实组件。

**迁移约束**（来自项目规则）：模板和 SCSS 必须 1:1 保留原样，仅修改 script 层的 import 路径和依赖解耦。

## Goals / Non-Goals

**Goals:**
- 将 RecentAddress 组件迁移至 `order-global-package/components/business/recent-address/`
- 解耦 `@order-public` 依赖，替换为 global-package 内部路径或已迁移依赖
- 更新 4 处使用方的 import 路径
- freight-time 接入真实组件替换静态占位

**Non-Goals:**
- 不修改 `<template>` 结构或 class 命名
- 不修改 `index.scss` 样式内容
- 不删除原始文件（保留原位置）
- 不实现新的业务逻辑变更

## Decisions

### D1: 以 kye-miniapp-order 版本为主源
- **选择**：采用 `kye-miniapp-order` 版本作为迁移主源（功能最完整）
- **理由**：包含编辑态切换、清空全部、KyReport 曝光、ump 上报等完整能力；order-build-sub-pages 版本是简化子集
- **备选**：合并两版本 → 否决，增加复杂度且 order-build 版可统一升级

### D2: KyReport 组件处理
- **选择**：保留 `KyReport` 引用，改为相对路径 `'../../base/ky-report'` 或评估后一并迁移到 base/
- **理由**：曝光上报是核心功能，不可简单移除
- **风险**：如果 ky-report 依赖过深，则注释掉并保留 TODO

### D3: 上报函数处理
- **选择**：注释调用点，保留函数签名（与 detail-address 迁移一致）
- **涉及**：
  - `clickDeleteRecentAddressReport` — 删除单条/全部时触发
  - `clickDeleteAllRecentAddressReport` — 进入编辑态/清空/完成时触发
  - `umpOtherReport` — 选中地址时触发
- **report/index.ts** 中的 `getOtherParams` / `getOtherParams2` — 保留，内部 `joinAt` 改为 global-package 路径

### D4: 样式引入方式
- **选择**：`<style lang="scss">@import ...</style>` → `import './index.scss'` (script 引入)
- **理由**：与 detail-address 迁移保持一致，避免 scss 编译作用域问题

### D5: freight-time 接入方式
- **选择**：替换静态占位 div 为 `<RecentAddress>` 组件，配置 props 和事件绑定
- **Props**: `addressType`, `title`, `companyNameEdit`
- **Events**: `@onSelect`, `@onChange`, `@clearAll`

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| KyReport 依赖链深 | 可能无法正常渲染曝光 | 评估后决定保留或注释 |
| 上报函数缺失 | 迁移后埋点数据丢失 | 保留签名+TODO，后续接通 |
| 两版本模板差异 | freight-time 看到的 UI 与其他模块不同 | 统一用 kye-master-order 主源 |
| hairline mixin 依赖 | index.scss 使用了 `@include hairline` | 确认 global-package styles 中有此 mixin |
