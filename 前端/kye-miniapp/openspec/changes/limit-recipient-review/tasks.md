# tasks: limit-recipient-review

> 基线说明：`driver-eval-score-copy-switch`（newScoreRuleSwitch）已合并至本分支且已测完待上线，其代码为冻结基线一行不改，本 change 全部为增量扩展。

## 1. rule-dialog 组件改造

- [x] 1.1 `pages/evaluation-list/components/rule-dialog/index.vue`：props 联合类型追加 `pickupRestrictSwitch?: boolean`（withDefaults 默认 `false`，与 newScoreRuleSwitch 并列）；新增文案常量 `RECIPIENT_RESTRICT_COPY = '下单手机号评价取货司机，签收手机号评价派货司机'`（旧文案已在 OLD/NEW 两个常量数组中，无需新增）
- [x] 1.2 改造 L106 `ruleList` computed 为「基组 + 第 2 条替换」：`base = props.newScoreRuleSwitch === true ? NEW_RULE_LIST : OLD_RULE_LIST`；`pickupRestrictSwitch !== true` 时直接返回 base；否则 `base.map` 将 index 1 替换为 `[{ text: RECIPIENT_RESTRICT_COPY }]`；两个常量数组完全不动

## 2. 聚合页开关读取与透传

- [x] 2.1 `pages/evaluation-list/index.vue`：L124 旁新增 `const pickupRestrictSwitch = ref(false)`；listFetch 内 L157 旁新增 `pickupRestrictSwitch.value = data?.data?.pickupRestrictSwitch === true`
- [x] 2.2 仅 RuleDialog 调用处（L84）追加 `:pickupRestrictSwitch` 透传；RuleBanner / SuccessDialog 不涉及第 2 条文案，不透传

## 3. 自测验证

- [ ] 3.1 编译通过（dev 启动无报错），聚合页规则弹窗打开/曝光埋点正常
- [ ] 3.2 mock 4 个开关组合态（newScoreRuleSwitch × pickupRestrictSwitch 各 true/false），验证第 2 条文案正确、第 1/3/4/5 条与基线版本截图逐条对比一致
- [ ] 3.3 mock `pickupRestrictSwitch` 缺失 / 非布尔 / 接口异常场景，验证第 2 条均展示「收件/签收手机号」旧文案原文

## 4. 归档与同步

- [ ] 4.1 产物（proposal.md、spec.md、design.md、tasks.md）归档至 `d:\project\netc-waybill-doc\查件\需求\TY250981-限制收件人评价\质检目录\前端质检目录\kye-miniapp_limit-recipient-review\`，并同步更新同目录「前端质检报告.md」
