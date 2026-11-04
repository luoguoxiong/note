## Context

司机评价聚合页（`src/modules/kye-miniapp-waybill/src/pages/evaluation-list/`）当前 3 处规则文案为前端硬编码：顶部横幅 rule-banner、规则详情弹窗 rule-dialog（segments 数组结构）、批量评价确认弹窗 success-dialog。需求 TY250981 新增「同个司机单月上限3次」规则，后端在 `web.query.evaluation.searchToBeEvaluated` 响应 `data` 下新增 `newScoreRuleSwitch`（false=旧规则，true/缺失/异常=新规则，默认开启），前端需按开关渲染新旧两套文案。移动端设计稿小程序与 H5 共用，H5 侧改动在 netc-h5-order 同名 change，PC 侧在 netc-pc-web-waybill 同名 change。

## Goals / Non-Goals

**Goals:**

- 聚合页 3 处规则文案按 `newScoreRuleSwitch` 切换：默认显示新文案（true/缺失/接口异常），仅开关显式为 `false` 时逐字回落旧文案（兜底）
- 规则详情弹窗第 1、5 条同步切换（segments 结构新旧两套），第 2/3/4 条不变
- 改动最小化，不动模板结构与样式

**Non-Goals:**

- 卡片积分引导文案（`rows[].scoreTips` 富文本）由后端下发，前端不改
- 积分数值（200/300）展示逻辑不改
- 原生 `pages/evaluation-driver-list/`（无活入口旧页面）不改
- 提交后结果展示（卡片内联 `isUpdateInfo.score`，后端 Addscore 下发）不改
- 死代码清理（不在本 change 范围）

## Decisions

### D1：开关随列表接口读取，页面级 ref 持有，props 透传

`listFetch`（searchToBeEvaluated）响应 `data.newScoreRuleSwitch` 存入页面 `ref`，以 props 传给 rule-banner / rule-dialog / success-dialog。

- 理由：开关与列表数据同接口返回，无需新增请求；三处触点都在本页组件树内，props 足够，不引入 Pinia。
- 备选：写入 store / 全局缓存 —— 过度设计，开关即时生效以最后一次接口响应为准，页面级状态天然满足。

### D2：新旧文案常量化，组件内按开关二选一渲染

每处触点定义 `OLD_COPY` / `NEW_COPY` 常量（rule-dialog 为新旧两套 segments 数组），模板按 `newScoreRuleSwitch === false` 判断回落旧文案，其余取值均渲染新文案。

- 理由：旧文案逐字保留是产品硬性要求（开关关时与现网完全一致）；常量化避免散落在模板里出现新旧混排。
- 默认走新文案：产品倾向默认开启新功能，开关仅作线上投诉过多时的兜底回退；字段缺失、接口异常、非布尔脏数据均展示新文案，仅接口显式返回 `false` 才回落旧文案。

### D3：新文案与三端统一口径

新规则句统一为：「同一取/派日对同一司机评价仅获得一次取/派评积分，同个司机单月上限3次」（设计稿定稿，小程序/H5/PC 同版）。规则弹窗第 5 条新文案：「评价了中评或差评在30个自然日内可以修改为好评。可在「查件列表」-「修改评价」或前往「评价记录」进行修改」。

## Risks / Trade-offs

- [开关在分页/刷新间隙被管理员切换，用户看到旧文案] → PRD 明确「以最后一次切换状态为准，即时生效」，列表每次 fetch 刷新开关值即可，可接受。
- [success-dialog 为提交前确认弹窗，打开时开关可能已变化] → 弹窗数据源自最近一次列表响应，与横幅口径一致，符合即时生效语义。
- [旧文案被误改] → 落地时逐字比对 git diff，旧文案行只允许新增并列分支、不允许修改。

## Open Questions

- score=0 分支文案「当天已对该司机做过评价，本次评价不计积分」不属本次文案族（产品口径仅覆盖「获得一次积分」族），保持原样；月度上限命中场景的解释由后端 `scoreTips`/Addscore 响应覆盖。
