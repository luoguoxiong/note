# Tasks: 发货明细清单（goods-delivery-detail）迁移

## Overview

将原生端的 `goods-delivery-detail` 上传页与 `goods-delivery-detail-entry` 入口组件迁移到小程序：入口组件放入主包 `order-build/order-public`，上传页放入分包 `order-build-sub-pages/order-public`，补齐相关常量/类型，挂载入口并注册路由。

---

## Phase 0: 准备工作

### 0.1 通读规则与技能文档

- [x] **T-0.1.1** 通读 `.agents/rules/` 下项目规则（06 组件规范、09 样式规范、05 API 规范、10 埋点规范）
- [x] **T-0.1.2** 通读 `kye-miniui-components`、`miniapp-page-development`、`api-integration`、`report-tracking` 技能文档

### 0.2 依赖确认

- [x] **T-0.2.1** 确认 `chooseFiles` / `onChangeSingleFile` / `openPreviewImg` / `openPreviewFile` / `isOverFilesize` / `formatFileSize` 已存在于 `@order-public-sub-public/utils/upload`
- [x] **T-0.2.2** 确认 `useInitMulitFielConfigChild` / `getBizCode` 已存在于 `@order-public-sub-public/hooks/useInitFile`
- [x] **T-0.2.3** 确认 `useUpload`（`deleteFileFunAsync`）已存在于 `@order-public-sub-public/components/business/pickup-information/hooks/upload`
- [x] **T-0.2.4** 确认 `ImagePreview`、`downLoadFile` 已存在

---

## Phase 1: 常量与类型补齐

- [x] **T-1.1** 主包 `order-build/order-public/constants/waybill.ts`：`ProductInfoTips` 枚举新增 `发货明细 = '50'`
- [x] **T-1.2** 分包 `order-build-sub-pages/order-public/constants/file.ts`：`fileBizCode` 新增 `发货明细临时: 'WEB_ORDER_GOODS_DELIVERY_DETAIL_TEMPORARY'`
- [x] **T-1.3** 分包 `order-build-sub-pages/order-public/constants/file.ts`：`MaterialTypes` 枚举新增 `发货明细 = '60'`
- [x] **T-1.4** `GoodsRestrict` 接口新增 `goodsDeliveryDetailFileCount?: number`（主包 `order-build/order-public/types/waybill.ts` 与分包 `order-build-sub-pages/order-public/types/waybill.ts` 均需补齐）

---

## Phase 2: 新增入口组件 goods-delivery-detail-entry（主包）

- [x] **T-2.1** 创建 `order-build/order-public/components/business/product-info/components/goods-delivery-detail-entry/index.vue`：template 1:1 从原生端搬运，script 用 `useStore` 读取 `goodsRestrict` + `Taro.navigateTo` 跳转
- [x] **T-2.2** 创建 `order-build/order-public/components/business/product-info/components/goods-delivery-detail-entry/index.scss`：1:1 从原生端搬运
- [x] **T-2.3** 逻辑：`tips.find(type === '50')` 有值才展示；`goodsDeliveryDetailFileCount > 0` → 「已上传」否则「去上传」

---

## Phase 3: 新增上传页 goods-delivery-detail（分包）

- [x] **T-3.1** 创建 `order-build-sub-pages/order-public/components/business/product-info/components/goods-delivery-detail/index.vue`：template 结构/class 从原生端 1:1 搬运（模板下载条 + 添加文件/图片 + 上传列表 + 空态 + 底部提交）
- [x] **T-3.2** 创建 `order-build-sub-pages/order-public/components/business/product-info/components/goods-delivery-detail/index.scss`：1:1 从原生端搬运，单位保留 px
- [x] **T-3.3** script 参考 `receipt-resources`：`chooseFiles` + `onChangeSingleFile` + `useUpload` + `useInitMulitFielConfigChild`
- [x] **T-3.4** 上传参数：`bizCode = getBizCode(MaterialTypes.发货明细) || fileBizCode.发货明细临时`，`bizId` 取 `configData.bizId`
- [x] **T-3.5** 完整保留 H5FS（base64/file）与微信 PC/企业微信 pcUpload 分支
- [x] **T-3.6** 移除角度校验相关逻辑：`uploadAngle`、`angle_reg_type`、`replaceFile`、`replaceFileItem`、角度埋点
- [x] **T-3.7** 文件数 5、单文件 10M；模板下载 `downLoadFile(url, 'xlsx', '发货明细清单.xlsx')`
- [x] **T-3.8** 提交：`handleUpload` → `submitConfig` → `setRestrictData` 更新 `goodsDeliveryDetailFileCount` → toast + `router.back()`

---

## Phase 4: 挂载入口与路由

- [x] **T-4.1** 主包 `order-build/order-public/components/business/product-info/components/product-name/index.vue`：`restrictTips` 过滤 `type !== '50'`，tips 后新增 `<GoodsDeliveryDetailEntry />`
- [x] **T-4.2** 主包 `order-build/order-public/components/business/product-info/groups/index.vue`：新增 `<GoodsDeliveryDetailEntry />`
- [x] **T-4.3** 分包 `order-build-sub-pages/order-public/vue-router/hooks/use-router-map.ts`：新增 `/goods-delivery-detail` 路由映射，指向分包 `goods-delivery-detail` 页

---

## Phase 5: 验证

- [x] **T-5.1** template 与 scss 与原生端源文件逐行对比一致（仅替换依赖引入方式）
- [x] **T-5.2** 常量/类型无 TS 编译错误（`GetDiagnostics` 检查）
- [x] **T-5.3** 单票 `product-name` 命中发货明细时展示入口，点击可跳转上传页
- [x] **T-5.4** 批量 `groups` 命中发货明细时展示入口
- [x] **T-5.5** 上传页：下载模板 / 添加文件 / 添加图片 / 预览 / 删除 / 提交 全链路可用

---

## 任务统计

| Phase    | 任务数 |
| -------- | ------ |
| Phase 0  | 6      |
| Phase 1  | 4      |
| Phase 2  | 3      |
| Phase 3  | 8      |
| Phase 4  | 3      |
| Phase 5  | 5      |
| **总计** | **29** |
