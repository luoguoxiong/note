# Tasks

> 禅道 #564203　｜　所有改动仅限 `src/modules/kye-miniapp-waybill/src/`，**禁止**改动 `src/modules/waybill-build/` 构建期副本
>
> **范围原则：PRD 未写的不做调整。** 导出记录「重新导出」链路 PRD 未涉及，本次不动（详见 proposal / design 的注意事项 N1）。

## 1. 运单详情「其他资料」隐藏托寄物资料卡片

文件：`src/modules/kye-miniapp-waybill/src/pages/waybill-detail/components/waybill-info/index.vue`

- [x] 1.1 注释掉 `phoneGroup` 中的 `{ title: '托寄物资料', list: goodsTypeFilesList.value, key: 'goodsType' }`，并补充禅道单号注释说明
- [x] 1.2 注释掉 `phoneGroup` 的 `filter` 中 `item.key === 'goodsType' && goodsTypeFilesList.value.length === 0` 这条判断（该项已移除，成为死代码）
- [x] 1.3 确认 `goodsTypeFilesList` ref 声明与 `getOtherPictureData()` 中的 `res.data.goodsTypeFiles` 赋值**保持不动**
- [x] 1.4 确认模板中 `phone.key === 'goodsType'` 的 `<template>` 分支**保留不删**（已不可达）
- [x] 1.5 确认 `goGoodsTypeFiles()` 函数**保留不删**（已无调用方）
- [x] 1.6 确认「包装照片」的空数据过滤逻辑未被误改

## 2. 导出页移除托寄物资料勾选项

文件：`src/modules/kye-miniapp-waybill/src/pages/waybill-export/index.vue`

- [x] 2.1 新增 `waybillMaterialListShow` computed：`WAYBILL_MATERIAL_LIST.filter((v) => v.value !== 150)`，参照同文件既有 `waybillInfoListShow` 的写法与位置
- [x] 2.2 勾选区模板 `v-for="(item, index) in WAYBILL_MATERIAL_LIST"` 改为 `waybillMaterialListShow`
- [x] 2.3 `onChangeWaybillMaterialAll`：全选取值改用 `waybillMaterialListShow.value.map(...)`
- [x] 2.4 `onChangeWaybillMaterial`：全选态长度比较改用 `waybillMaterialListShow.value.length`
- [x] 2.5 确认 `onSetWaybillExportTypeList` 的相册黑名单 `['20','100','110','130','150']` **保持原样不动**

## 3. 常量与既有链路保持不动（确认项，不改代码）

- [x] 3.1 确认 `pages/waybill-export/constant.ts` 的 `WAYBILL_MATERIAL_LIST` **未删除** `{ label: '托寄物资料', value: 150 }`；可在该项上方加注释说明「仅隐藏入口，保留以兼容历史记录文案」
- [x] 3.2 确认 `utils/formatter.ts` 的 `formatterExportContentType` **未做任何改动**（继续使用全量列表翻译）
- [x] 3.3 确认 `pages/export-record/components/export-detail-pop/index.vue` **未做任何改动**（`importantContent`、`submit`、`onResetExport` 全部保持原样）
- [x] 3.4 确认 `pages/waybill-export/index.vue` 中 `onMounted` 的 `exportParams?.types` 回填逻辑 **未做任何改动**（PRD 未涉及「重新导出」，见 N1）

## 4. 静态检查

- [x] 4.1 `GetDiagnostics` 检查 3 个改动文件无 TS / ESLint 报错
- [x] 4.2 检查无遗留未使用变量告警（若 lint 对注释后产生的未使用变量报错，按项目 lint 规则处理）
- [x] 4.3 全仓库检索 `150` 与 `goodsTypeFiles`，确认无其他遗漏的托寄物资料渲染入口（排除副本目录）

## 5. 功能验证（微信小程序 dev）

### 5.1 运单详情 - 其他资料

- [x] 5.1.1 找一票**有托寄物资料数据**的运单（状态需为待签收 30 或已签收 40 且 `waybillType !== 20`，否则「其他资料」Tab 不出现），进入详情 →「运单资料」→「其他资料」，确认无「托寄物资料」卡片
- [x] 5.1.2 切换平铺 / 列表两种视图，确认两种视图下均无该卡片
- [x] 5.1.3 确认复磅照片、取货照片、派货照片、木架照片、包装照片展示与点击预览正常
- [x] 5.1.4 确认下半组「派货资料」「取货资料」展示与跳转正常
- [x] 5.1.5 确认「电子存根」「签收联」两个 Tab 及「保存存根」按钮不受影响

### 5.2 导出 - 列表入口

- [x] 5.2.1 查件列表 →「更多」→「导出」→ 导出页，确认「运单资料」区为 11 项且无「托寄物资料」
- [x] 5.2.2 点击「全选」，确认 11 项全选中；控制台确认选中值不含 `150`
- [x] 5.2.3 手动逐个勾选 11 项，确认「全选」checkbox 自动置为选中态
- [x] 5.2.4 提交导出，确认 `downloadCreateTask` 请求 `types` 不含 `150`

### 5.3 导出 - 运单详情「下载资料」入口（重点）

- [x] 5.3.1 运单详情页底部点击「下载资料」进入导出页，确认无「托寄物资料」勾选项
- [x] 5.3.2 确认该入口默认全选生效，且选中值不含 `150`（此入口 `onMounted` 会主动调 `onChangeWaybillMaterialAll(true)`，是最容易漏测的路径）
- [x] 5.3.3 提交导出，确认 `types` 不含 `150`

### 5.4 导出记录（仅确认未被破坏，不校验 150）

- [x] 5.4.1 打开一条**历史含托寄物资料**的导出记录详情，确认「导出内容」文案仍完整显示「托寄物资料」
- [x] 5.4.2 对 `exportStatus === 3` 的记录点击「重新导出」，确认能正常跳转导出页且回填不报错（**不要求**选中值剔除 `150`，见 N1）
- [x] 5.4.3 对普通状态记录点击「重新导出」（走 `downloadRetryTask`），确认功能未被破坏

### 5.5 回归

- [x] 5.5.1 导出格式、文件命名、邮箱、导出次数等区块行为无变化
- [x] 5.5.2 「保存至手机相册」在仅勾选图片类资料时仍可选（未被误改）

## 6. 多端验证

- [x] 6.1 支付宝小程序：重点验证 5.1 与 5.3
- [x] 6.2 H5：重点验证 5.1 与 5.3

## 7. 交付

- [x] 7.1 自查 `git diff`，确认改动仅涉及预期的 3 个文件，且无副本目录改动
- [x] 7.2 逐条对照禅道移动端 3 处涉及范围截图确认
- [x] 7.3 向测试同步范围说明与注意事项：导出记录「重新导出」两条路径 PRD 未涉及故不处理（N1）；`goods-type-files` 页面保留为孤岛（N2）
