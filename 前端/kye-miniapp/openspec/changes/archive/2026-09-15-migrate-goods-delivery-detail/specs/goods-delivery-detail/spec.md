## ADDED Requirements

### Requirement: 发货明细入口提示
系统 SHALL 在 `product-name` 与 `groups` 中提供 `goods-delivery-detail-entry` 入口组件，当托寄物命中「发货明细」管控时展示提示与上传入口。

#### Scenario: 命中发货明细管控展示入口
- **WHEN** `goodsRestrict.tips` 中存在 `type === ProductInfoTips.发货明细('50')` 的记录
- **THEN** 展示提示文案（默认「该物品需要上传发货明细」）与「去上传」按钮

#### Scenario: 展示已上传数量
- **WHEN** `goodsRestrict.goodsDeliveryDetailFileCount` 大于 0
- **THEN** 入口按钮文案显示「已上传」

#### Scenario: 点击进入上传页
- **WHEN** 用户点击「去上传/已上传」
- **THEN** 通过 `Taro.navigateTo` 跳转到发货明细上传页

### Requirement: 发货明细清单上传页
系统 SHALL 在 `goods-delivery-detail` 页面提供发货明细清单上传能力，文件数上限 5、单文件 10M。

#### Scenario: 下载模板
- **WHEN** 用户点击「下载模板」
- **THEN** 调用 `downLoadFile` 下载 `发货明细清单.xlsx` 并提示下载成功

#### Scenario: 添加文件
- **WHEN** 用户点击「添加文件」
- **THEN** 调用 `chooseFiles`（type=file，扩展名 xls/xlsx/doc/docx/pdf）选择文件并进入上传流程

#### Scenario: 添加图片
- **WHEN** 用户点击「添加图片」
- **THEN** 调用 `chooseFiles`（type=image，扩展名 jpg/png/jpeg）选择图片并进入上传流程

#### Scenario: 上传文件
- **WHEN** 用户选择文件/图片后
- **THEN** 通过 `onChangeSingleFile` 携带 `bizCode`（`getBizCode(MaterialTypes.发货明细) || fileBizCode.发货明细临时`）与 `bizId` 上传，并展示上传状态

#### Scenario: 预览文件
- **WHEN** 用户点击已上传条目
- **THEN** 图片走 `openPreviewImg`，PDF/其他文件走 `openPreviewFile` 预览

#### Scenario: 删除文件
- **WHEN** 用户点击删除图标
- **THEN** 弹出确认弹窗，确认后从列表移除并调用 `deleteFileFunAsync` 删除服务端文件

#### Scenario: 提交
- **WHEN** 用户点击「提交」
- **THEN** 上传所有待上传文件后，调用 `submitConfig` 提交，更新 `goodsRestrict.goodsDeliveryDetailFileCount` 为成功数量，toast 提示并返回上一页

### Requirement: 常量与类型补齐
系统 SHALL 在 `constants` 与 `types` 中补齐「发货明细」相关定义。

#### Scenario: 常量定义
- **WHEN** 构建时引用发货明细相关常量
- **THEN** `ProductInfoTips.发货明细 = '50'`、`MaterialTypes.发货明细 = '60'`、`fileBizCode.发货明细临时 = 'WEB_ORDER_GOODS_DELIVERY_DETAIL_TEMPORARY'` 均可用

#### Scenario: 类型定义
- **WHEN** 引用 `GoodsRestrict.goodsDeliveryDetailFileCount`
- **THEN** 该字段为可选 `number` 类型
