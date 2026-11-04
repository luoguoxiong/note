## 1. 开关取值与透传

- [x] 1.1 在 `pages/evaluation-list/index.vue` 的列表接口（searchToBeEvaluated）响应处理中读取 `data.newScoreRuleSwitch`，存入页面 ref（严格 `=== true` 语义），并以 props 传给 rule-banner、rule-dialog、success-dialog 三个组件
- [x] 1.2 三个组件声明对应 prop（Boolean，默认 false），缺失/异常时回落旧文案

## 2. 横幅与规则弹窗

- [x] 2.1 `components/rule-banner/index.vue`：新旧横幅文案常量化，按开关渲染，旧文案逐字保留
- [x] 2.2 `components/rule-dialog/index.vue`：segments 拆为新旧两套常量，新版第 1 条含「同个司机单月上限3次」（高亮：同一取/派日、同一司机评价、上限3次）、第 5 条为中评/差评+评价记录新文案；第 2/3/4 条两版一致

## 3. 批量确认弹窗

- [x] 3.1 `components/success-dialog/index.vue`：提示句按开关切换，新文案「共N票，同一取/派日对同一司机评价仅获得一次取/派评积分，同个司机单月上限3次」，票数与提交逻辑不变

## 4. 自测验证

- [ ] 4.1 _mock/联调验证开关 true/false/缺失三种取值下三处触点文案符合 spec_
- [ ] 4.2 逐字比对 git diff，确认旧文案行零改动（仅新增并列分支）
- [ ] 4.3 回归聚合页既有功能：横幅规则详情跳转、批量评价提交、卡片 scoreTips 富文本展示
