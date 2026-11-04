## Why

业务调整司机评价积分发放规则（禅道 TY250981）：在「同一取/派货日对同一司机评价仅获一次积分」基础上新增「同个司机单月上限3次」。后端在评价相关查询接口下发 `newScoreRuleSwitch` 开关控制新旧发放逻辑，前端聚合页需随开关切换规则文案展示，保障新旧规则平滑切换、用户感知一致。

## What Changes

- 司机评价聚合页（`pages/evaluation-list`）按 `newScoreRuleSwitch` 切换 3 处规则文案：
  1. 顶部横幅（rule-banner）
  2. 规则详情弹窗（rule-dialog）第 1、5 条
  3. 批量评价确认弹窗（success-dialog）规则提示句
- 开关为 `true` → 展示新文案「同一取/派日对同一司机评价仅获得一次取/派评积分，同个司机单月上限3次」；开关为 `false` 或字段缺失 → 旧文案逐字保持不变
- 卡片积分引导文案（`rows[].scoreTips` 富文本）由后端下发，前端不改动

## Capabilities

### New Capabilities

- `driver-eval-score-rule-copy`: 司机评价聚合页积分规则文案按 `newScoreRuleSwitch` 开关切换展示，覆盖横幅、规则详情弹窗、批量确认弹窗三类触点，含开关取值、新旧文案对照与缺失兜底规则。

### Modified Capabilities

（无）

## Impact

- 代码：`src/modules/kye-miniapp-waybill/src/pages/evaluation-list/` 下 `index.vue`、`components/rule-banner/`、`components/rule-dialog/`、`components/success-dialog/`
- API：`web.query.evaluation.searchToBeEvaluated` 响应 `data` 新增 `newScoreRuleSwitch` 字段（后端下发，前端只读）
- 关联：需求 TY250981（`netc-waybill-doc/查件/需求/TY250981-司机评价积分发放逻辑调整/`）；兄弟仓库 netc-h5-order、netc-pc-web-waybill 存在同名 change，三端文案口径一致
- 无新增埋点、无破坏性变更；开关关闭时表现与现网完全一致
