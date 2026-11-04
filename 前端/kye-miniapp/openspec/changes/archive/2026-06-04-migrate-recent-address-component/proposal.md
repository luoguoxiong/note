## Why

`RecentAddress`（最近寄件地址）组件当前分散在 `@order-public` 和 `order-build-sub-pages` 两个包中，freight-time 模块需要使用该功能但目前只有静态占位 UI。将组件统一迁移到 `order-global-package` 可实现跨模块复用，消除代码冗余，并为 freight-time 提供完整的功能支持。

## What Changes

- **迁移源文件**：从 `@order-public/components/business/recent-address/` 复制 4 个文件到 `order-global-package/components/business/recent-address/`
  - `index.vue` — 主组件（模板 + 脚本，含滑动删除、选中、清空等交互）
  - `index.scss` — 样式文件（141 行，卡片圆角、滑动删除按钮、BEM 命名）
  - `report/index.ts` — 上报工具函数
  - `readme.md` — 组件说明
- **依赖解耦与路径替换**：
  - API: `historyAddress`, `deleteHistoryAddress`, `HistoryAddressResponse` → 已存在于 `global-package/apis/address`
  - 工具函数: `getValueOrEmpty`, `joinAt` → 已存在于 `global-package/utils`
  - 组件: `SvgIcon`, `KyReport` → 保持 order 包引用或评估是否一并迁移
  - 样式: `@import '@order-public/styles/index.scss'` → script 引入方式 + 相对路径 scss
  - 上报: `clickDeleteRecentAddressReport`, `clickDeleteAllRecentAddressReport`, `umpOtherReport` → 注释调用点保留签名
- **使用方适配**：更新 4 处 import 路径（kye-miniapp-order 2 + order-build-sub-pages 2）
- **freight-time 接入**：替换 `adress/index.vue` 中静态占位为真实 `<RecentAddress>` 组件实例

## Capabilities

### New Capabilities
- `recent-address`: 最近寄件/收件地址列表组件，支持历史地址查询、滑动删除、清空全部、选中回填

### Modified Capabilities
（无 spec 级别行为变更，纯实现层迁移）

## Impact

### 源组件依赖分析

| 依赖 | 来源 | 迁移策略 |
|------|------|----------|
| `historyAddress`, `deleteHistoryAddress` | `apis/address` | ✅ global-package 已有 |
| `HistoryAddressResponse` | `apis/address/types` | ✅ global-package 已有 |
| `getValueOrEmpty` | `utils/index` | ✅ global-package 已有 |
| `joinAt` | `utils/index` | ✅ global-package/utils/address.ts |
| `showToast` | hooks/useShowToast | ✅ 保持 order 包 |
| `SvgIcon` | ui/svg-icon | ✅ 保持 order 包 |
| `KyReport` | base/ky-report | ⚠️ 评估：如依赖深则注释/移除 |
| `clickDeleteRecentAddressReport` 等 | report/sender | ⚠️ 上报：注释调用+保留签名 |
| `umpOtherReport` | reportUmp | ⚠️ 上报：注释调用+保留签名 |

### 使用方影响

| 使用方 | 当前路径 | 目标路径 |
|--------|----------|----------|
| kye-miniapp-order sender/address-page | `@order-public/.../recent-address` | `@order-global-package-order/.../recent-address` |
| kye-miniapp-order receive/address-page | 同上 | 同上 |
| order-build-sub-pages sender/address-page | `@order-public-sub-public/.../recent-address` | `@order-global-package-order-sub/.../recent-address` |
| order-build-sub-pages receive/address-page | 同上 | 同上 |
| freight-time/adress | 静态占位 HTML | `<RecentAddress>` 组件实例 |
