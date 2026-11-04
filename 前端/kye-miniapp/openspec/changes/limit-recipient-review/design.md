# design: limit-recipient-review

## Context

- 需求：TY250981 限制收件人评价（禅道 #571687）。派货司机评价准入由「收件人 + 签收人」收窄为「仅签收人」，角色判定在后端 ES 查询层完成。
- 前端职责已收敛（已与产品/后端确认）：**仅规则弹窗第二句文案切换**。评价入口隐藏、聚合页数据剔除、提交防绕过均由后端处理。
- 现状代码（driver-eval-score-copy-switch 分支已合并后）：
  - `pages/evaluation-list/components/rule-dialog/index.vue`：已有 `newScoreRuleSwitch` prop（withDefaults 默认 `false`）；`OLD_RULE_LIST` / `NEW_RULE_LIST` 两个完整常量数组，第 2 条均为「收件/签收手机号」文案（L60、L87）；`ruleList = computed(() => props.newScoreRuleSwitch === true ? NEW_RULE_LIST : OLD_RULE_LIST)`（L106）。
  - `pages/evaluation-list/index.vue`：`newScoreRuleSwitch = ref(false)`（L124）；listFetch 中 `newScoreRuleSwitch.value = data?.data?.newScoreRuleSwitch === true`（L157）；模板透传给 RuleBanner（L5）/ SuccessDialog（L80）/ RuleDialog（L84）。
  - 第二句文案（收件/签收手机号评价派货司机）全仓仅存在于 rule-dialog 两个常量数组中，SuccessDialog / RuleBanner 不涉及，`pickupRestrictSwitch` 无需透传给它们。
- 上个 change `driver-eval-score-copy-switch` 已合并至本分支，与本需求**同批上线**；开关读取与 props 透传链路按既有模式平铺复用。

## Goals / Non-Goals

**Goals:**

- 聚合页 rule-dialog 第 2 条文案按 `pickupRestrictSwitch` 切换，`=== true` 才展示新文案
- 开关读取 → ref（默认 false）→ props 透传链路落地
- 旧文案逐字保留，兜底行为与 `newScoreRuleSwitch` 语义完全一致

**Non-Goals:**

- 不改列表卡片评价入口（后端 functionInfo 收窄）
- 不做聚合页数据剔除（后端 ES 查询收窄）
- 不改 rule-dialog 第 1/3/4/5 条（属 `driver-eval-score-copy-switch` 范围，避免两 change 冲突）
- 不新增埋点
- 不改 H5/PC（各自仓库同名 change 处理）

## Decisions

### D1：开关字段与取值语义

- 接口：`web.query.evaluation.searchToBeEvaluated` 响应 `data.pickupRestrictSwitch`（与 `newScoreRuleSwitch` 同接口下发）。
- 取值：`=== true` 限制（新文案）；`false` / 缺失 / 非布尔 / 接口异常 → 不限制（旧文案）。
- 理由：与 PRD 异常场景「开关读取失败默认走旧规则」一致；与既有 `newScoreRuleSwitch` 的「仅显式 true 生效」硬约束同构，降低认知与测试成本。
- 备选：`false` 也显式开启新规则 → 否决，违背默认关闭原则。

### D2：开关读取与透传链路（平铺复用已测通的 newScoreRuleSwitch 链路）

- `newScoreRuleSwitch` 版本已完成测试、待上线，视为**冻结基线**：其已有代码（两个常量数组、L124 ref、L157 读取、L5/L80/L84 透传）一行不改，本 change 只做增量平铺。
- `index.vue`：在 L124 旁新增 `const pickupRestrictSwitch = ref(false)`；在 L157 旁新增 `pickupRestrictSwitch.value = data?.data?.pickupRestrictSwitch === true`；仅 RuleDialog 调用处（L84）追加透传，RuleBanner / SuccessDialog 不涉及第 2 条文案、不透传。
- 理由：与已测通实现逐行同构（ref 默认 false、严格 `=== true`、props 透传），评审与回归成本最低；不透传无关组件，避免放大改动面。

### D3：ruleList 派生方式（基组 + 第 2 条替换，不动两个常量数组）

- `OLD_RULE_LIST` / `NEW_RULE_LIST` 两个常量数组**完全不动**（含其中第 2 条「收件/签收手机号」文案，它们就是本需求的旧文案兜底）。
- 仅改造 L106 computed，新增文案常量 `RECIPIENT_RESTRICT_COPY`：`下单手机号评价取货司机，签收手机号评价派货司机`：

  ```ts
  const ruleList = computed(() => {
    const base = props.newScoreRuleSwitch === true ? NEW_RULE_LIST : OLD_RULE_LIST
    if (props.pickupRestrictSwitch !== true) return base
    return base.map((item, index) => (index === 1 ? [{ text: RECIPIENT_RESTRICT_COPY }] : item))
  })
  ```

- 理由：两开关正交组合只有 4 态，若仿照上个 change 建 4 份完整数组会造成文案四处重复、维护易漂移；「基组 + 单条替换」使 `newScoreRuleSwitch` 相关代码零改动、`pickupRestrictSwitch` 增量独立，模板 v-for 与 segment 结构不变。

### D4：高亮样式边界

- 第 2 条新旧文案均**无高亮 segment**（现网即纯文本），保持 `{ text: '...' }` 单 segment 结构，不引入高亮。

## Risks / Trade-offs

- [冻结基线回归风险] → `newScoreRuleSwitch` 已测完待上线，其代码一行不改；本 change 仅增量新增 ref/读取行/props/computed 改造，4 个开关组合态（newScoreRuleSwitch × pickupRestrictSwitch）回归截图对比即可覆盖。
- [后端接口未按时下发字段] → 前端兜底为旧文案（默认关闭），无感知上线，不阻塞发版。
- [computed 替换引发渲染差异] → 模板 v-for 与 segment 结构不变，仅数据来源变化；测试覆盖 4 个组合态弹窗截图对比。
