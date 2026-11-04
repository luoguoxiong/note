# 【货物信息】【移动端】新增二类精神药品标识及发货明细上传

> 禅道需求：[#560822 【货物信息】【移动端】新增二类精神药品标识及发货明细上传](https://zentao.ky-tech.com.cn/platform-home/#/need-detail/560822)
> 产品：秦瑛　｜　上线计划：2026-08-27

## Why

原生端已有「发货明细清单」上传能力（`goods-delivery-detail` 上传页 + `goods-delivery-detail-entry` 入口提示），用于托寄物命中「发货明细」管控时引导用户下载模板并上传清单。小程序端（Taro）缺少该能力，命中管控时无法完成上传，导致下单流程受阻。

## What Changes

- **新增常量/类型**（补齐后端已返回、前端尚未声明/映射的字段）：
  - `ProductInfoTips.发货明细 = '50'`
  - `MaterialTypes.发货明细 = '60'`
  - `fileBizCode.发货明细临时 = 'WEB_ORDER_GOODS_DELIVERY_DETAIL_TEMPORARY'`
  - `GoodsRestrict.goodsDeliveryDetailFileCount?: number`
- **新增入口组件** `goods-delivery-detail-entry`：展示「该物品需要上传发货明细」提示 + 「去上传/已上传」入口。
- **新增上传页** `goods-delivery-detail`：下载模板、添加文件/图片、上传列表、删除、预览、提交。
- **挂载入口**：`product-name` 与 `groups` 两处渲染入口组件，并在 `product-name` 的 tips 过滤中排除「发货明细」避免重复渲染。
- **路由**：新增 `/goods-delivery-detail` 路径映射。

## Capabilities

### New Capabilities

- `goods-delivery-detail`: 发货明细清单上传页 + 入口提示，支持模板下载、文件/图片上传、预览删除、提交后回填已上传数量。

### Modified Capabilities

（无 spec 级别行为变更，其余为常量/类型补齐与入口挂载）

## Impact

### 源组件依赖分析（原生端 → 小程序）

| 原生端依赖                                   | 原生端来源                        | 小程序策略                                                       |
| -------------------------------------------- | --------------------------------- | ---------------------------------------------------------------- |
| `van-uploader` / `useVanUploader`            | vant                              | 改用 `receipt-resources` 的 `chooseFiles` + `onChangeSingleFile` |
| `fileUpload` API                             | `apis/pickup`                     | 改用 `onChangeSingleFile`（`utils/upload`）                      |
| `getFileByMultiBizCodeAndBizId`              | `apis/pickup`                     | 已存在，直接复用                                                 |
| `useInitMulitFielConfigChild` / `getBizCode` | `hooks/useInitFile`               | 已存在，直接复用                                                 |
| `useUpload`（`deleteFileFunAsync`）          | `pickup-information/hooks/upload` | 已存在，直接复用                                                 |
| `ImagePreview`                               | `business/image-preview`          | 已存在，直接复用                                                 |
| `setRestrictData`                            | store                             | 已存在，直接复用                                                 |
| `downLoadFileUtils`                          | `utils/downLoadFile`              | 改用 `downLoadFile`（`utils/downLoadFile`）                      |
| 角度校验 `uploadAngle` / `angle_reg_type`    | receipt-resources（回单组件）     | **不迁移**（明确移除）                                           |

### 使用方影响

| 使用方                   | 改动                                                            |
| ------------------------ | --------------------------------------------------------------- |
| `product-name/index.vue` | 新增 `<GoodsDeliveryDetailEntry />`，`restrictTips` 过滤 `'50'` |
| `groups/index.vue`       | 新增 `<GoodsDeliveryDetailEntry />`                             |
