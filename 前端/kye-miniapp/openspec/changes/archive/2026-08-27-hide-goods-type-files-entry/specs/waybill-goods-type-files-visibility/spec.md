## ADDED Requirements

### Requirement: 运单详情「其他资料」不展示托寄物资料卡片

小程序端运单详情页「运单资料」-「其他资料」Tab 中，系统 MUST NOT 展示「托寄物资料」卡片，且该行为 MUST 与接口是否返回 `goodsTypeFiles` 数据无关。

#### Scenario: 接口返回托寄物资料数据时仍不展示

- **WHEN** 用户进入运单详情页，切换到「运单资料」-「其他资料」Tab，且 `web.query.waybill.getOtherPicture` 返回的 `goodsTypeFiles` 非空
- **THEN** 「其他资料」上半组卡片中 MUST NOT 出现标题为「托寄物资料」的卡片
- **AND** 其余卡片（复磅照片、取货照片、派货照片、木架照片、包装照片）的展示与排序 MUST 保持原有行为不变

#### Scenario: 接口未返回托寄物资料数据时不展示

- **WHEN** 用户进入「其他资料」Tab，且 `goodsTypeFiles` 为空数组或字段缺失
- **THEN** 「其他资料」中 MUST NOT 出现「托寄物资料」卡片

#### Scenario: 平铺与列表两种视图下均不展示

- **WHEN** 用户在「其他资料」Tab 点击右上角视图切换按钮，在平铺态与列表态之间切换
- **THEN** 两种视图下 MUST NOT 出现「托寄物资料」卡片

#### Scenario: 下半组取货派货资料不受影响

- **WHEN** 用户查看「其他资料」下半组「在寄件时上传的取货派货资料」区域
- **THEN** 「派货资料」与「取货资料」两张卡片 MUST 保持原有展示与跳转行为不变

### Requirement: 托寄物资料详情页不再可达

`pages/goods-type-files`（托寄物资料详情页）在小程序端 MUST NOT 存在任何用户可触达的入口。

#### Scenario: 详情页无跳转入口

- **WHEN** 用户在运单详情页「其他资料」Tab 内进行任意点击操作
- **THEN** 系统 MUST NOT 跳转至 `pages/goods-type-files` 页面

#### Scenario: 页面代码保留

- **WHEN** 开发者检查 `waybill-build` 子包构建产物
- **THEN** `pages/goods-type-files` 页面文件与子包注册 MUST 保持存在，以便后续恢复入口时无需重建页面

### Requirement: 运单导出不提供托寄物资料选项

运单导出页（`pages/waybill-export`）的「导出内容」-「运单资料」勾选区 MUST NOT 渲染「托寄物资料」选项。用户通过正常选取路径（查件列表导出、运单详情下载资料）提交的 `types` MUST NOT 包含类型码 `150`。

> 从导出记录「重新导出」进入的参数回填路径不在本要求约束范围内，见「注意事项 N1」。

#### Scenario: 从查件列表进入导出页

- **WHEN** 用户在查件列表通过「更多」-「导出」进入运单导出页
- **THEN** 「运单资料」勾选区 MUST 仅渲染 11 个选项（回单资料、电子存根、签收联、复磅照片、取货照片、派货照片、木架照片、包装照片、取货资料、派货资料、安装照片）
- **AND** MUST NOT 出现「托寄物资料」勾选项

#### Scenario: 从运单详情「下载资料」进入导出页

- **WHEN** 用户在运单详情页点击底部「下载资料」按钮进入运单导出页（`pageSource=waybill-detail`，页面默认执行全选）
- **THEN** 「运单资料」勾选区 MUST NOT 出现「托寄物资料」勾选项
- **AND** 默认全选后的选中值 MUST NOT 包含 `150`

#### Scenario: 点击全选

- **WHEN** 用户勾选「运单资料」区的「全选」checkbox
- **THEN** 选中值 MUST 为 11 个可见选项的类型码，MUST NOT 包含 `150`

#### Scenario: 手动勾满全部可见选项时全选态自动置中

- **WHEN** 用户逐个手动勾选「运单资料」区全部 11 个可见选项
- **THEN** 「全选」checkbox MUST 自动变为选中态

#### Scenario: 正常路径提交导出

- **WHEN** 用户经查件列表导出或运单详情下载资料路径完成勾选并提交导出（`downloadCreateTask`）
- **THEN** 请求参数 `types` MUST NOT 包含 `150`

### Requirement: 历史导出记录的托寄物资料文案保持可回显

「托寄物资料」的类型码到中文名称的映射关系 MUST 保留，以确保历史导出记录中已包含该类型的记录仍能正确显示导出内容文案。

#### Scenario: 导出记录详情展示历史含托寄物资料的记录

- **WHEN** 用户打开一条历史 `types` 为 `[40, 150, 50]` 的导出记录详情弹窗
- **THEN** 「导出内容」文案 MUST 完整显示为「电子存根/托寄物资料/签收联」
- **AND** MUST NOT 因入口隐藏而丢失「托寄物资料」一项

#### Scenario: 导出记录列表文案

- **WHEN** 导出记录相关视图调用 `formatterExportContentType` 格式化含 `150` 的 `types`
- **THEN** 返回文案 MUST 包含「托寄物资料」

### Requirement: 后端能力与数据链路保持不变

本次变更 MUST 仅限前端入口隐藏，MUST NOT 涉及任何接口、参数结构或后端行为的改动。

#### Scenario: 接口调用不变

- **WHEN** 运单详情页加载「其他资料」数据
- **THEN** 系统 MUST 仍按原有方式调用 `web.query.waybill.getOtherPicture`，请求参数不变

#### Scenario: 导出接口契约不变

- **WHEN** 用户提交导出或系统初始化导出页
- **THEN** `fileExportInit`、`downloadCreateTask`、`getExportRequest` 的接口地址与参数结构 MUST 保持不变

#### Scenario: 导出记录「重新导出」链路保持原有行为

- **WHEN** 用户在导出记录详情弹窗点击「重新导出」（无论走 `onResetExport` 回填导出页，或走 `downloadRetryTask` 直接重试）
- **THEN** 该链路的参数构造与回填逻辑 MUST 与改动前完全一致，MUST NOT 增加针对 `150` 的过滤
- **AND** PRD 未涉及该链路，若历史记录含托寄物资料仍可能被携带，属已知且接受的行为（见注意事项 N1）

### Requirement: 变更可逆

所有隐藏实现 MUST 采用注释或渲染层过滤方式，MUST NOT 物理删除托寄物资料相关的常量项、页面文件与数据链路，以保证后续恢复入口的成本最小。

#### Scenario: 常量未被删除

- **WHEN** 开发者检查 `pages/waybill-export/constant.ts` 的 `WAYBILL_MATERIAL_LIST`
- **THEN** `{ label: '托寄物资料', value: 150 }` MUST 仍然存在于常量定义中

#### Scenario: 改动仅位于源码目录

- **WHEN** 开发者检查本次变更涉及的文件
- **THEN** 所有改动 MUST 位于 `src/modules/kye-miniapp-waybill/src/` 源码目录
- **AND** MUST NOT 改动 `src/modules/waybill-build/` 构建期副本目录
