## Why

`order-build` 主包体积接近微信小程序 2MB 子包上限，频繁触发体积告警。`address-book`（地址簿）模块含列表页 `page`、寄件编辑页 `sender`、收件编辑页 `receive` 及其子组件，体积可观，是主包体积压力的主要来源之一。

此前 `share-page`、`clear-addr` 已迁至 `order-build-sub-pages` 并注册生效。但 `page`/`sender`/`receive` 三个页面仍留在主包 `kye-miniapp-order/src/order-public/components/business/address-book/` 下注册。且 `order-build-sub-pages` 下虽存在这三个页面的副本，但副本**已过期**（缺少 `handleOutClick`、`handleUnLoginHandler`、`addr-l` 等新逻辑，navbar 仍启用而源已注释），且 `wx.config.ts` 未注册这三个页面——这正是上次迁移遗留「编辑页不能滚动、管理标签点击无响应」两个 Bug 的根因。

本次将 `address-book` 的 `page`/`sender`/`receive` 及其依赖的 `components`/`report`/`constants`/`types` 全量迁至 `order-build-sub-pages`，用源覆盖过期副本，完成路由切换与引用更新。

## What Changes

- **用源覆盖 sub-pages 过期副本**：将 `kye-miniapp-order/src/order-public/components/business/address-book/` 下的 `page`/`sender`/`receive`/`components`/`report`/`constants.ts`/`types.ts`/`index.vue` 内容覆盖到 `order-build-sub-pages/order-public/components/business/address-book/` 对应位置（`share-page`、`clear-addr` 保持不动）。
- **页面注册切换**：
  - `wx.config.ts` 的 `order-build-sub-pages` root 新增 3 个页面：`address-book/page/index`、`address-book/sender/index`、`address-book/receive/index`。
  - `kye-miniapp-order/src/app.config.ts` 注释掉对应 3 行注册（保留源文件，降低风险；体积收益在二阶段删除源后落地）。
- **引用路径更新**（3 处，`order-build` → `order-build-sub-pages`）：
  - `freight-time/components/sendAndReceive/index.vue` 的 `navigateTo` URL。
  - `freight-time/report/index.ts` 的 `getPageCode` codeMap key。
  - `order-global-package/report/index.ts` 的 `getPageCode` codeMap key。
- **不动的范围**（严格遵循「只迁 address-book」最高优先级）：
  - `sender/page/address-page/index`、`receive/page/address-page/index`（顶层 sender/receive 模块的编辑页，非 address-book）。
  - `share-page/`、`clear-addr/`（已迁移且注册生效）。
  - `order-global-package/validate/pageConfig.ts`（使用相对路径 `indexOf` 匹配，`address-book/page/index` 等 key 对 order-build 与 order-build-sub-pages 路径均能命中，无需改动）。

## Capabilities

### Modified Capabilities

- `address-book-sub-pages-migration`: 将地址簿列表页、寄件编辑页、收件编辑页从主包 `order-build` 迁移至子包 `order-build-sub-pages`，路由切换、引用更新、过期副本修正，确保地址簿功能在子包下正常运行。

## Impact

### 引用路径变更

| 文件                                                           | 行  | 变更                                                                                |
| -------------------------------------------------------------- | --- | ----------------------------------------------------------------------------------- |
| `src/modules/freight-time/components/sendAndReceive/index.vue` | 110 | `navigateTo` URL: `/modules/order-build/...` → `/modules/order-build-sub-pages/...` |
| `src/modules/freight-time/report/index.ts`                     | 181 | codeMap key: `modules/order-build/...` → `modules/order-build-sub-pages/...`        |
| `src/modules/order-global-package/report/index.ts`             | 384 | codeMap key: `modules/order-build/...` → `modules/order-build-sub-pages/...`        |

### 注册变更

| 文件                                              | 变更                                                                                             |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `src/wx.config.ts`                                | `order-build-sub-pages` root pages 数组新增 3 行                                                 |
| `src/alipay.config.ts`                            | `order-build-sub-pages` root pages 数组新增 3 行（与 wx 对齐）                                   |
| `src/modules/kye-miniapp-order/src/app.config.ts` | 注释掉 `address-book/page/index`、`address-book/sender/index`、`address-book/receive/index` 3 行 |

### 体积影响

| 阶段             | order-build 体积                 | order-build-sub-pages 体积 |
| ---------------- | -------------------------------- | -------------------------- |
| 本次（保留源）   | 不变（源仍被复制到 order-build） | 增加（新增 3 页面注册）    |
| 二阶段（删除源） | 减少                             | 不变                       |

> 本次为路由切换与验证阶段，保留源以降低风险；验证通过后删除源目录即可落地体积收益。
