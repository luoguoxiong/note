## Context

司机评价聚合页 `src/modules/kye-miniapp-waybill/src/pages/evaluation-list/index.vue` 是通过 `navigateTo` 打开的分包普通页（入口：查件列表「更多」菜单 → 司机评价，`waybill-search-header/constant.ts` 中 `url: '/modules/waybill-build/pages/evaluation-list/index'`），非 tabBar 页。

当前批量（一键）评价成功回调 `onEvaluatedSuccess` 中：

1. `await evaluationListRef.value?.init()` 重新拉取第一页数据；
2. `nextTick` 内判断列表已空（两处分支：`allData.length === 0` 或 `allData.length < 10 && rowTotal === 0`）后调用 `onToBack()`；
3. `onToBack()` 执行 `Taro.switchTab({ url: '/layout/pages/waybill/index' })` 跳回查件 tab —— 即 PRD 描述的「闪跳」。

空状态渲染机制（已核实 `@kye-netc/kye-miniui@0.3.3` 源码）：`ky-list-standard` 内部维护 `isEmpty` ref，`init()`/`fetch` 返回空数组后自动置 `true` 并渲染 `#empty` 插槽；该组件**未声明** `isEmpty` prop，页面上的 `:isEmpty="!isALIPAY ? false : isEmpty"` 绑定是无效的 fallthrough attr，微信/支付宝/H5 三端空列表均会正常渲染 `#empty` 插槽（`ky-empty`「暂无待评价运单」+「去寄件」按钮）。因此移除跳转后无需任何额外空状态处理。

## Goals / Non-Goals

**Goals:**
- 全部评价提交完成（批量评价成功且无剩余待评价运单）后，页面停留在聚合页，由列表组件展示既有空状态。
- 空状态下下拉刷新 / 重新拉取数据仍为空时，保持当前页空状态，不跳转查件列表。
- 顶部规则横幅、评价记录入口、空状态缺省图与「去寄件」按钮保持不变。

**Non-Goals:**
- 不改单票评价提交逻辑（`handleSubmit` 本就不跳转、不刷新列表，仅本地打 `isUpdate` 标记）。
- 不改接口、埋点、权限、弹窗（SuccessDialog）轮询逻辑。
- 不清理页面上既有的无效代码（`:isEmpty` 绑定、`pageSource === 'activites'` 死分支等），它们与本次需求无关。
- APP 原生端不在本仓库范围（本仓库为小程序/H5 代码，APP 通过容器承接）。

## Decisions

### 决策 1：直接删除 `onToBack` 跳转逻辑，而非改为条件不触发

- **选择**：移除 `onEvaluatedSuccess` 中 `nextTick` 内的整段跳转判断（两处 `onToBack()` 调用），并删除不再被引用的 `onToBack` 函数。`init()` 刷新与 `checks`/`allChecked` 重置保留。
- **理由**：跳转是唯一被移除的行为；`onToBack` 全项目仅此页使用（已全局搜索确认），保留函数会成为死代码。空状态由 `ky-list-standard` 内部机制自动呈现，不需要页面侧补任何逻辑。
- **备选方案**：保留 `onToBack` 但不再调用 —— 拒绝，留下死代码且 `Taro.switchTab` 引用易误导后续维护。

### 决策 2：不新增空状态相关状态变量或 UI

- **选择**：完全复用现有 `#empty` 插槽（`ky-empty` + 「去寄件」按钮）与顶部 `RuleBanner`/`RecordsEntry`。
- **理由**：PRD 明确「缺省图样式沿用现有司机评价模块空状态样式，顶部两个入口保持现有导航结构不变」；且组件内部 `isEmpty` 机制在三端均生效，无需页面控制。
- **备选方案**：修复/启用页面级 `isEmpty` 受控逻辑 —— 拒绝，组件库未暴露该 prop，且现有内部机制已满足需求，属过度改动。

## Risks / Trade-offs

- [风险] 用户评价完所有运单后停留在空页，缺少「返回查件列表」的显式引导 → 缓解：空状态已有「去寄件」按钮，顶部导航栏（原生胶囊/标题栏）返回键可回到查件列表（navigateTo 打开的页面，返回即回到来源页）；PRD 已确认该交互为预期行为。
- [风险] 改动极小但涉及评价核心链路 → 缓解：仅删除跳转，不触碰提交/轮询/刷新逻辑；按 PRD 灰度策略随周迭代发布，可随版回滚。
