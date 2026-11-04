## Why

小程序端司机评价只能「向前看」：用户在聚合评价页提交后，历史评价内容无处可查，中差评的修改入口也只能在原运单评价链路里偶然遇到（业务允许 30 天内向上修改 2 次）。

后端已提供 `web.query.evaluation.records` 支撑按评价时间 + 评价类型检索历史评价。PC 端已完成同名需求（`add-driver-evaluation-records`），本 change 为小程序端实现，产品/后端/测试的口径沿用 PC 已确认结论，不重复确认。

## What Changes

- **新增「评价记录」页**：新建子包页面 `pages/evaluation-records`，含评价时间区间筛选 + 好评/一般/差评三类型筛选 + 评价记录卡片列表（分页加载）
- **新增列表接口封装**：在 `apis/waybill-search`（或评价相关 api 文件）新增 `getEvaluationRecords`，对接 `web.query.evaluation.records`，`appkey: 55262`
- **新增记录卡片组件** `record-item`：承载「可编辑态 / 平铺只读态」双形态，并实现 PC 已有但小程序端缺失的「仅支持向上修改」校验
- **聚合评价页接入入口**：`pages/evaluation-list` 在 `RuleBanner` 下方新增一行「查询更多历史评价内容，请点击 评价记录 >」
- **评价结果弹窗接入入口**：`components/waybill-search/components/evaluation-popup` 与 `evaluation-popup-all`（查件「更多」→「查看取货评价 / 查看派货评价 / 查看评价」）底部新增「评价记录 >」入口，含埋点 `clk_driverevaluate_notes_button_v2`
- **修改评价复用既有链路**：提交仍走 `Addscore`（`web.query.score.add`），参数结构与聚合页 `handleSubmit` 一致
- **埋点登记**：在 `utils/tools.ts` 的 `getPageCode()` `codeMap` 中注册新页面路径 → `page_driverevaluate_notes_v1`
- 无破坏性变更。纯增量，不改动 `evaluation-list/components/list-item` 等存量组件

## Capabilities

### New Capabilities
- `driver-evaluation-records-miniapp`: 小程序端司机评价记录查询与修改 —— 按评价时间区间与评价类型（好评/一般/差评）检索历史评价记录，并对 `canModifyStatus === 1` 的记录发起向上修改

### Modified Capabilities
（无。`openspec/specs/` 下无既有 spec 覆盖司机评价能力，本次为新增）

## Impact

| 影响范围 | 说明 |
|---|---|
| **新增文件** | `pages/evaluation-records/{index.vue, index.config.ts, index.scss}`、`pages/evaluation-records/components/record-item/{index.vue, index.scss}`、`pages/evaluation-records/constant.ts` |
| **修改文件** | `pages/evaluation-list/index.vue`（插入入口行）、`pages/evaluation-list/components/records-entry`（新增入口组件）、`components/waybill-search/components/evaluation-popup/{index.vue, index.scss}`（底部加入口）、`components/waybill-search/components/evaluation-popup-all/{index.vue, index.scss}`（底部加入口）、评价 api 文件（新增接口）、`utils/tools.ts`（`codeMap` 登记） |
| **接口依赖** | 新增 `web.query.evaluation.records`；复用 `web.query.score.add` |
| **子包注册** | `src/subpackages.ts` 由 `@kye-netc/miniapp-plugins` 自动生成，插件扫描 `pages/*/index` 自动收录，**不可手改** |
| **子包体积** | `waybill-build` 有 2MB 上限（插件仅 `console.error` 不中断构建），新增页面后需自查 |
| **多端** | 需覆盖微信 / 支付宝 / H5 三端；`record-item` 禁止使用 `document`（小程序端不存在） |
| **不改动存量** | `evaluation-list/components/list-item` 及聚合页评价主链路零改动，避免回归风险；`evaluation-popup` / `evaluation-popup-all` 仅在底部追加入口行，原有展示逻辑与数据获取不变 |

### 明确不在本次范围

| 项 | 原因 |
|---|---|
| PC 端全部用例 | 已由 `add-driver-evaluation-records` 完成 |
| 单个评价页 / 修改评价页入口 | 小程序端该链路走 H5（`waybillAppH5Url('evaluation-driver-list')` → `openURL`），不在本仓库 |
| 激活 `pages/evaluation-driver-list` 与 `evaluation-success-dialog` | 该页与其内置弹窗全仓库无跳转引用（弹窗按钮无 `@click`），本次不恢复其可达性；结果弹窗入口落在可达的 `evaluation-popup` / `evaluation-popup-all` 上（见 design D14） |
| 排序 / 角色权限 / 150h 过期过滤 / XD 拆分 / 100 票上限 | 后端职责 |
| 积分规则（同司机同日仅 1 次、修改不再给分） | 后端职责，前端仅展示 `scoreNumber` |
