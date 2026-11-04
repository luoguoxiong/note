## Why

小程序司机评价功能此前部分依赖 H5 离线包（netc-h5-order）实现：

- 查件列表卡片、搜索结果卡片的「取货评价 / 派货评价 / 修改评价」4 个动作仍通过 `openURL` 跳转 H5 离线包页面（`/evaluation-driver-list`），而原生司机维度评价页 `pages/evaluation-driver-list` 已在 `src/subpackages.ts` 注册却从未接入（从未上线）。
- 原生 driver-list 页骨架已有，但功能与 H5 对照存在大量缺失：成功弹窗按钮为纯静态 view、批量评价成功无积分汇总反馈、source 硬编码、无规则横幅/评价记录入口/在线客服/埋点、全选含过期单、计数口径与分页大小与 H5 不一致。

本次需求将上述 H5 链路全部原生化，H5 页面（`/evaluation-driver-list`）仅作为功能与交互对照参考（H5 仓库本地路径：`C:\Users\674741\Desktop\git\netc-h5-order`）。

## What Changes

### A. 入口切换：跳 H5 改为 Taro.navigateTo 原生页

统一目标路由：`/modules/waybill-build/pages/evaluation-driver-list/index?flag=add|modify&waybillNo=xxx&orderNo=xxx&scoreType=0|1`

- A1：`components/waybill-search/index.vue` 的 `handlePickUpEvaluation` / `handleUrgeDeliveryEvaluate`（取货/派货评价及修改评价 4 个动作）由 `waybillAppH5Url` + `openURL` 改为 `Taro.navigateTo`，保留 `needRefresh.value = true`；清理该文件内不再使用的 `waybillAppH5Url` 导入（`externalLink.ts` 中的定义被其他十余处使用，不删）。
- A2：主仓 `src/modules/search/components/search-result/waybill-list.vue` 同样两个 handler 改法一致（现状为硬编码离线包路径拼接）。
- A3：「更多」菜单已跳原生聚合页，无需改动。

### B. 原生司机维度评价页按 H5 逐项补齐（以 H5 为对齐基准，原生缺的结构一律补上）

- B1 成功弹窗（P0）：「返回列表」「继续评价」按钮接线；显隐条件 `hasMoreFlag === 1 && 非修改评价`，不满足时「返回列表」通栏；触发时机对齐 H5 `list.length === 1`；弹窗内补「评价记录」入口（H5 有原生无）；`v-html` 改 rich-text 安全渲染（含 `evaluationStr`）。
- B2 批量评价积分汇总（P0）：全部评价完成后复用同一成功弹窗展示累计积分（responses 累加）、scoreTips 二选一文案（按 hasScoreTotal > 0）、提交时间——对齐 H5 `onEvaluatedSuccess`（L493-L513）。
- B3 单票提交 source 动态化（P1）：沿用 `evaluation-list/components/success-dialog` 的 `getSource()`（devtools=3 / ios=2 / android=1），替换硬编码 `source = 1`。
- B4 司机信息卡片（P1）：补 `driverInfo.scoreTips`（rich-text 渲染）；工号按 H5 条件 `driverType !== '1'` 显隐。
- B5 规则横幅/规则弹窗/评价记录入口（P1）：复用 `evaluation-list` 的 `rule-banner` / `rule-dialog` / `records-entry`；补 `useDidShow` 中 `evaluationRecordsChanged` 返回刷新逻辑。
- B6 在线客服入口（P2）：按 `evaluation-list` 现状实现（`Taro.navigateTo` 跳 `/modules/webview/pages/online-service/index`，**不带**运单号参数）。⚠️ 本项偏离需求单原文「保留 H5 版参数 paramsNum=waybillNo&type=query」，经探索评审拍板按 evaluation-list 现状对齐；展示条件对齐 evaluation-list（非支付宝等）。
- B7 埋点补齐（P2）：`tools.ts` 注册页面 pageCode；补页面曝光、批量底部栏曝光、一键评价点击、单票提交点击、在线客服点击、成功弹窗曝光/按钮点击埋点；并在需求单清单之外补充 H5 实际存在的 3 个 code：规则详情点击 `clk_order_search_driverevaluate_ruler_button_v1`、评价记录点击 `clk_driverevaluate_notes_button_v1`、成功弹窗内评价记录点击 `clk_driverevaluate_notes_button_v2`。
- B8+B9+B10 作为一组联动改动（P2）：全选按可评价状态过滤过期单（不再 `slice(0, 100)` 全收）；「该司机还有 N 票」计数口径改为按 `scoreStatus === 0` 统计（且剩余 > 0 才显示横幅）；分页 `pageSize` 由 10 对齐为 100。

### C. 每日任务「司机评价」入口原生化（服务端配置变更，前端不改动）

服务端/运营修改任务配置（taskCode `okPingJia`）：`gotoType` 改 2、`gotoLink` 改 `/modules/waybill-build/pages/evaluation-list/index`。前端跟随配置生效，联调时验证即可。

## Capabilities

### New Capabilities

- `driver-evaluation-native-page`：原生司机维度评价页（`pages/evaluation-driver-list`）的入口切换、页面功能（列表/批量选择/成功弹窗/积分汇总/规则与记录入口/客服/埋点）规范，全部以 H5 `/evaluation-driver-list` 为对齐基准。

### Modified Capabilities

<!-- 无：生产在用的 evaluation-list 聚合页本次不动（既有能力 driver-evaluation-aggregation-page 不受影响） -->

## Impact

- 代码改动：
  - `src/modules/kye-miniapp-waybill/src/components/waybill-search/index.vue`（A1）
  - `src/modules/search/components/search-result/waybill-list.vue`（A2，主仓源码）
  - `src/modules/kye-miniapp-waybill/src/pages/evaluation-driver-list/index.vue` 及 `index.scss`
  - `src/modules/kye-miniapp-waybill/src/pages/evaluation-driver-list/components/evaluation-success-dialog/index.vue` 及 `index.scss`（B1/B2/B4 弹窗扩展）
  - `src/modules/kye-miniapp-waybill/src/utils/tools.ts`（B7 pageCode 注册）
  - 复用组件仅做**向后兼容的可选 props 扩展**（决策 8，2026-09-29 视觉走查补充）：`evaluation-list/components/list-item` 新增 `variant` / `entryWaybillNo` / `isEdit`，`rule-banner` / `records-entry` 新增 `trackCode`——默认值保持聚合页原行为，生产页无感知。
- 构建链路：`waybill-build` 为构建产物，改 `kye-miniapp-waybill/src` 后需重新构建子包生效。
- 每日任务入口（C）依赖服务端配置变更排期，需与后端/运营对齐生效时间。
- 风险：driver-list 页首次启用需全量回归；搜索结果卡片入口在主仓 `modules/search`，与子包发版节奏需对齐。

## 明确不做

1. H5 `/evaluation` 单票评价页（两端入口均已断链）。
2. H5 死代码不对照移植：离开确认弹窗（H5 未接线）、batchLimit（拉取未使用）、评价引导浮层（调用被注释）。
3. 生产中的 `evaluation-list` 聚合页（含其全选过期单问题）本次不动。
4. H5 仓库（netc-h5-order）侧任何代码改动。
