# specs: evaluation-rule-recipient-restrict

## ADDED Requirements

### Requirement: 规则弹窗第二句文案按收方评价限制开关切换

司机评价聚合页规则弹窗（rule-dialog）第 2 条文案 SHALL 按接口 `web.query.evaluation.searchToBeEvaluated` 响应 `data.pickupRestrictSwitch` 切换：开关为 `=== true`（限制收方评价）时展示新文案「下单手机号评价取货司机，签收手机号评价派货司机」；其余情况展示旧文案「下单手机号评价取货司机，收件/签收手机号评价派货司机」。旧文案 MUST 逐字保留现网原文，禁止任何措辞调整。规则弹窗第 1/3/4/5 条 MUST 保持不动。

#### Scenario: 开关开启展示新文案
- **WHEN** `searchToBeEvaluated` 响应 `data.pickupRestrictSwitch === true` 且用户打开规则弹窗
- **THEN** 第 2 条展示「下单手机号评价取货司机，签收手机号评价派货司机」

#### Scenario: 开关关闭展示旧文案
- **WHEN** `searchToBeEvaluated` 响应 `data.pickupRestrictSwitch === false` 且用户打开规则弹窗
- **THEN** 第 2 条展示「下单手机号评价取货司机，收件/签收手机号评价派货司机」

#### Scenario: 开关缺失或异常兜底旧文案
- **WHEN** `pickupRestrictSwitch` 字段缺失、非布尔值或接口异常
- **THEN** 第 2 条展示旧文案「下单手机号评价取货司机，收件/签收手机号评价派货司机」（与开关关闭一致）

#### Scenario: 开关切换不影响其他规则条目
- **WHEN** `pickupRestrictSwitch` 在任一取值下用户打开规则弹窗
- **THEN** 第 1/3/4/5 条内容与现网完全一致，无任何变化

### Requirement: 开关读取与透传链路

聚合页 SHALL 在 `listFetch`（`searchToBeEvaluated`）成功响应中读取 `data.data.pickupRestrictSwitch`，以严格等于 `true` 判定开启，存入页面响应式状态（初始值 MUST 为 `false`），并通过 props 透传给 rule-dialog 组件。rule-dialog 组件内第 2 条文案 SHALL 由该 prop 派生，派生结构 MUST 不改变模板中第 1/3/4/5 条的 segment 数据结构。

#### Scenario: 页面状态默认关闭
- **WHEN** 聚合页刚加载、接口尚未返回或返回失败
- **THEN** 开关状态为 `false`，规则弹窗展示旧文案

#### Scenario: 开关状态响应后更新
- **WHEN** `listFetch` 成功且响应含 `pickupRestrictSwitch: true`
- **THEN** 页面开关状态更新为 `true`，此后打开的规则弹窗展示新文案
