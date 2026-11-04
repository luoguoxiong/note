# proposal: limit-recipient-review

> 需求来源：TY250981【司机评价】【移动端】限制收件人评价（禅道子需求 #571687，父需求 #569253）

## Why

现有派货司机评价的准入角色为「收件人 + 签收人」，不适配现阶段减少积分发放的经营目标。本需求将派货司机评价准入角色收窄为「仅签收人」，由后端角色限制开关控制新旧规则切换。前端职责仅为**规则弹窗第二句文案随开关切换**，评价入口隐藏与聚合页数据剔除均由后端处理，前端零改动。

## What Changes

- 聚合页规则弹窗（rule-dialog）第 2 条文案按接口下发的 `pickupRestrictSwitch` 开关切换：
  - 开关 `=== true`（限制）：「下单手机号评价取货司机，签收手机号评价派货司机」
  - 开关 `false` / 缺失 / 非布尔 / 接口异常（兜底，旧文案逐字保留）：「下单手机号评价取货司机，收件/签收手机号评价派货司机」
- 聚合页 `searchToBeEvaluated` 响应中读取 `pickupRestrictSwitch`（与 `newScoreRuleSwitch` 同接口下发、同构语义），存入页面 ref（默认 `false`）并 props 透传给 rule-dialog
- `ruleList` 由模块级常量改为组件内派生数据，仅第 2 条受开关影响，第 1/3/4/5 条保持不动
- **不做**：列表卡片评价入口隐藏（后端 functionInfo 收窄）、聚合页待评价数据剔除（后端 ES 查询收窄）、新增埋点

## Capabilities

### New Capabilities

- `evaluation-rule-recipient-restrict`: 司机评价规则弹窗第二句文案按收方评价限制开关（pickupRestrictSwitch）切换，含开关取值决策与文案口径

### Modified Capabilities

（无——现有 spec 均不涉及评价规则弹窗文案行为）

## Impact

- **代码**：仅 `src/modules/kye-miniapp-waybill/src/pages/evaluation-list/` 下 2 个文件
  - `index.vue`：listFetch 响应读取开关 → ref → props 透传
  - `components/rule-dialog/index.vue`：ruleList 常量改造 + 第 2 条文案二选一
- **接口**：`web.query.evaluation.searchToBeEvaluated` 响应 `data.pickupRestrictSwitch`（后端新增下发，前端兼容缺失）
- **关联端**：H5（netc-h5-order，`searchToBeDriverEvaluated`）与 PC（netc-pc-web-waybill，`searchToBeEvaluated` + `listSameDriverToBeEvaluated`）由各自仓库同名 change 同步实现，文案口径三端一致
- **依赖约束**：上个 change `driver-eval-score-copy-switch`（newScoreRuleSwitch 文案族）已开发完成，位于独立分支，与本需求**同批上线**（分支合并由开发自行处理）；实现时 rule-dialog 第 1/5 条不得改动，避免与该 change 冲突
