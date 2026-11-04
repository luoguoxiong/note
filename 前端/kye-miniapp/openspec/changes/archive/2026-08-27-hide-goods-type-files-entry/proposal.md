# 运单资料与导出隐藏托寄物资料入口

> 禅道需求：[#564203 【查件】【两端】运单资料和导出隐藏托寄物资料入口](https://zentao.ky-tech.com.cn/platform-home/#/need-detail/564203)
> 迭代：【查件/打单】0827 迭代　｜　产品：隋曼琪　｜　上线计划：2026-08-28

## Why

产品要求下线「托寄物资料」这一资料类型对外的可见入口。需求原文强调两点：

1. **「只做前端入口隐藏！！！！！」** —— 后端接口、数据、下载能力全部保持不动，不做任何服务端改造。
2. **「虽然逻辑是没有内容不展示入口，但前端也要隐藏」** —— 现状是「有数据才展示」的条件渲染，产品认为不够，要求前端**无条件**不再展示，不能依赖接口是否返回数据。

需求覆盖客户端（PC Web）与移动端（小程序）两端共 7 处，本 change 仅承接**移动端小程序**（`kye-miniapp` 仓库）的 3 处；客户端 4 处不在本仓库。

## What Changes

移动端 3 处入口，收敛为 2 个代码落点（详情页卡片、导出勾选项），因为「导出」与「运单详情-下载资料」共用同一个 `waybill-export` 页面。

### 1. 运单详情 - 其他资料：移除「托寄物资料」卡片

`pages/waybill-detail/components/waybill-info/index.vue`

- `phoneGroup` 中注释掉 `{ title: '托寄物资料', list: goodsTypeFilesList.value, key: 'goodsType' }`
- 同步注释 `filter` 内针对 `item.key === 'goodsType'` 的空数据过滤分支（该项已不存在，判断成为死代码）
- 模板中 `phone.key === 'goodsType'` 的 `<template>` 特殊分支保留但不再可达（该分支是「点击整卡跳托寄物资料页」而非图片预览，与其他卡片行为不同）
- `goodsTypeFilesList` ref 与 `getOtherPictureData()` 中的赋值保留（不影响渲染，保留便于回滚）

### 2. 导出页 - 移除「托寄物资料」勾选项

`pages/waybill-export/index.vue` + `constant.ts`

- `constant.ts` 的 `WAYBILL_MATERIAL_LIST` **保持全量不动**（`150` 保留），另在页面内新增 `waybillMaterialListShow` computed 过滤 `value !== 150`
- 勾选区 `v-for` 改用 `waybillMaterialListShow`
- 全选逻辑 `onChangeWaybillMaterialAll` / `onChangeWaybillMaterial` 的取值与长度比较改用 `waybillMaterialListShow`

### 3. 运单详情 - 下载资料

无需独立改动。该按钮跳转同一个 `waybill-export` 页（`pageSource=waybill-detail`，默认触发全选），第 2 点完成后自动生效。

## Capabilities

### New Capabilities

- `waybill-goods-type-files-visibility`: 托寄物资料入口可见性 —— 约束小程序端「运单详情-其他资料」与「运单导出」两处对托寄物资料的展示与选取行为

### Modified Capabilities

（无。`openspec/specs/` 下现有 spec 未覆盖运单资料 / 导出能力）

## Impact

| 影响范围 | 说明 |
|---|---|
| **修改文件** | `pages/waybill-detail/components/waybill-info/index.vue`、`pages/waybill-export/index.vue`、`pages/waybill-export/constant.ts`（仅加注释说明，不改数据） |
| **不新增文件** | 纯删减型改动 |
| **接口** | 零改动。`web.query.waybill.getOtherPicture` 仍返回 `goodsTypeFiles`，前端不再消费用于渲染 |
| **历史数据兼容** | `WAYBILL_MATERIAL_LIST` 保留 `150`，`utils/formatter.ts` 的 `formatterExportContentType` 继续用全量列表，**导出记录里历史含托寄物资料的记录文案仍能正常回显** |
| **孤岛页面** | `pages/goods-type-files`（托寄物资料详情页）唯一入口被移除后不可达。**页面代码与子包注册均保留**，后续恢复只需放开入口 |
| **子包体积** | 无新增资源，`waybill-build` 体积不增 |
| **多端** | 微信 / 支付宝 / H5 三端表现一致（纯条件渲染改动，无平台差异 API） |
| **回滚成本** | 全部改动为注释 / 过滤，取消注释即可恢复 |

### 可逆性设计（关键决策）

本次采用**「注释 + 渲染层过滤」而非物理删除**：

- `constant.ts` 中 `150` 不删 —— 否则历史导出记录详情的「导出内容」文案会丢失「托寄物资料」一项（`formatter.ts` 复用同一常量做数字→中文翻译）
- `goods-type-files` 页面不删 —— 减少改动面，且避免误判其他跳转来源
- 详情页 ref 与数据赋值不删 —— 与渲染解耦，留着无副作用

## 注意事项（已知但本次不处理）

> 原则：**PRD 未写的不做调整**，等产品明确提出需求再说。以下为开发过程中发现的关联行为，仅作记录，供后续产品决策与测试沟通参考。

### N1：「重新导出」链路仍可能携带托寄物资料

导出记录详情弹窗的「重新导出」按钮（`export-record/components/export-detail-pop/index.vue` 的 `submit()`）按 `exportStatus` 分两条路径，**两条都不做处理**：

| 路径 | 触发条件 | 行为 | 前端可否干预 |
|---|---|---|---|
| A：重新配置后导出 | `exportStatus === 3` | `getExportRequest` 取回原 `types` → 写入 `exportParams` → 跳导出页，`onMounted` 回填 `waybillMaterialCheck` | 可（但本次不做） |
| B：直接重试 | 其他状态 | `downloadRetryTask({ mobileExportId })`，后端沿用原 `types` 重跑 | 不可，前端不经手参数 |

**路径 A 的已知表现**：历史记录 `types` 含 `150` 时会被回填进选中数组，但界面已无对应 checkbox，形成「不可见却会提交」的隐形勾选；同时该场景下 `isRestartExport = true` 会 disabled 全部 checkbox，用户无法手动取消。另外 `waybillMaterialCheckAll` 的长度判断会因多一个值而错位。

**为什么不处理**：PRD 涉及范围表只列了「导出」「运单详情-其他资料」「运单详情-下载资料」三处，未提及导出记录的重新导出。产品口径是「只做前端入口隐藏」，重新导出属于对历史记录的重放，不是新的选取入口。贸然过滤等于替产品做决定 —— 用户原本导出过托寄物资料，重导时静默少一项，是否符合预期需产品确认。

**若测试提出**：按上表说明两条路径的性质，路径 A 前端可改（改动量约 1 行），路径 B 需后端配合。等产品明确后再评估。

### N2：`goods-type-files` 页面成为孤岛

入口移除后该页不可达，页面代码与子包注册保留。见 Impact 表。

### N3：「保存至手机相册」黑名单残留 `150`

`onSetWaybillExportTypeList` 的 `['20','100','110','130','150']` 中 `150` 永不命中，保持原样不动（删除无收益，反而扩大回归面）。该函数上方注释本就未同步 `130`/`150`，属存量问题。

### 明确不在本次范围

| 项 | 原因 |
|---|---|
| 客户端（PC Web）4 处：列表-操作-运单资料、列表-导出、运单详情、查看运单资料-导出 | 不在 `kye-miniapp` 仓库 |
| 后端不再下发 `goodsTypeFiles` / 类型码 `150` 下线 | 需求明确「只做前端入口隐藏」 |
| 导出记录「重新导出」两条路径 | 见 N1，PRD 未涉及 |
| 下单侧「上传托寄物资料」页 | 需求未提及；且其源码在 `kye-miniapp-order` 仓库中缺失，本仓库仅有 `order-build-sub-pages` 副本 |
| `waybill-export/index.vue` 中「保存至手机相册」黑名单 | 见 N3 |
| 埋点调整 | 需求未提出埋点变更 |
