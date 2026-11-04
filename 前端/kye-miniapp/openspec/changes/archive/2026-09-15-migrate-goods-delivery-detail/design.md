## Context

原生端「发货明细清单」由两个文件组成：

- 入口提示 `goods-delivery-detail-entry`：在 `product-name` 和 `groups` 中渲染，命中 `ProductInfoTips.发货明细` 时展示「去上传/已上传」。
- 上传页 `goods-delivery-detail`：独立路由 `/goods-delivery-detail`，支持下载模板、添加文件/图片、上传列表、预览删除、提交。

小程序端 `order-build-sub-pages/order-public` 下已有成熟的上传参考实现 `receipt-resources`（回单资料上传页），其 `chooseFiles` + `onChangeSingleFile` + `useUpload` + `useInitMulitFielConfigChild` 链路可直接复用。

**迁移约束**（来自项目规则）：template 结构与 class 命名、SCSS 从原生端 1:1 保留，仅 script 层做依赖替换/解耦；上传方法改用小程序端 `receipt-resources` 的既有写法。

## Goals / Non-Goals

**Goals:**

- 补齐 `发货明细` 相关的常量与类型。
- 新增 `goods-delivery-detail-entry` 入口组件与 `goods-delivery-detail` 上传页。
- 在 `product-name` 与 `groups` 两处挂载入口。
- 上传链路复用 `receipt-resources` 的既有方法（含 H5FS 与微信 PC/企业微信 pcUpload 分支）。

**Non-Goals:**

- 不修改 原生端任何文件。
- 不迁移角度校验相关功能（`uploadAngle`、`angle_reg_type`、`replaceFile`、`replaceFileItem`、角度相关埋点）。
- 不改变既有组件的既有行为，仅做增量挂载。

## Decisions

### D1: 上传实现方式

- **选择**：template/SCSS 从原生端 `goods-delivery-detail` 1:1 搬运，script 方法照抄 `receipt-resources` 的 `chooseFiles` + `onChangeSingleFile` + `useUpload` + `useInitMulitFielConfigChild`。
- **理由**：原生端的 `van-uploader` / `fileUpload` 在小程序端不可用；`receipt-resources` 是项目内已验证的小程序上传范式。
- **备选**：改用 `goods-type-files` 的 `FileList`/`UploadFile` 封装 → 否决，用户明确要求参考 `receipt-resources` 的写法。

### D2: bizCode 取值

- **选择**：`getBizCode(MaterialTypes.发货明细) || fileBizCode.发货明细临时`。
- **理由**：与原生端 完全一致，优先取后端 `materialInitList` 返回的正式/动态 bizCode，兜底用临时 bizCode。

### D3: 上传能力范围

- **选择**：完整对齐 `receipt-resources` 的 H5FS（base64/file）与微信 PC/企业微信 pcUpload 分支，但**移除角度校验相关逻辑**（`uploadAngle`、`angle_reg_type`、`replaceFile`、角度埋点）。
- **理由**：小程序端确实存在 H5FS 与微信 PC 上传场景；角度校验是回单专属能力，发货明细不需要。

### D4: 入口渲染位置

- **选择**：`product-name/index.vue` 与 `groups/index.vue` 两处都渲染 `<GoodsDeliveryDetailEntry />`，并在 `product-name` 的 `restrictTips` 中过滤 `type === '50'`。
- **理由**：与原生端 对齐（原生端的 `product-name` 在 tips 循环中排除 `发货明细`，再由入口组件独立渲染）。

### D5: 模板下载

- **选择**：复用 原生端的 `DOWNLOAD_TEMPLATE_URL`，文件名 `发货明细清单.xlsx`，通过小程序 `downLoadFile(url, 'xlsx', '发货明细清单.xlsx')` 下载。
- **理由**：模板资源为同一个文件中心下载链接。

### D6: 提交后回填

- **选择**：`handleSubmit` 中 `await handleUpload()` → `submitConfig()` → `setRestrictData({ restrictData: { goodsRestrict: { ...goodsRestrict, goodsDeliveryDetailFileCount: successCount } } })` → toast + `router.back()`。
- **理由**：入口组件据此显示「已上传/去上传」，与原生端 行为一致。

## Risks / Trade-offs

| Risk                                       | Impact                     | Mitigation                                                                                                                                     |
| ------------------------------------------ | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `order-build-sub-pages` 为子包构建产物目录 | 改动可能被构建覆盖         | 本项目 `kye-miniapp-order/src` 未本地检出，`order-build-sub-pages/order-public` 为当前唯一可编辑源码；与现有 `goods-type-files` 等同级目录一致 |
| 后端未返回 `goodsDeliveryDetailFileCount`  | 入口始终显示「去上传」     | 该字段为前端 `setRestrictData` 写入维护（原生端同款逻辑），不依赖后端返回                                                                      |
| H5FS / pcUpload 分支复杂                   | 迁移遗漏导致 PC 端上传异常 | 逐行对照 `receipt-resources` 的 `afterRead/onAfterRead/handleUpload` 实现                                                                      |
| 角度校验误迁入                             | 引入无关功能               | 明确排除 `uploadAngle`、`angle_reg_type`、`replaceFile` 及角度埋点                                                                             |
