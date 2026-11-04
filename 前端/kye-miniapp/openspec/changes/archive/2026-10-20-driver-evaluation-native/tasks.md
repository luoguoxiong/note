## 1. 入口切换（A1/A2）

- [x] 1.1 A1：修改 `src/modules/kye-miniapp-waybill/src/components/waybill-search/index.vue` 的 `handlePickUpEvaluation` / `handleUrgeDeliveryEvaluate`（L1615-L1650）：`waybillAppH5Url` + `openURL` 改为 `Taro.navigateTo({ url: '/modules/waybill-build/pages/evaluation-driver-list/index?flag=...&waybillNo=...&orderNo=...&scoreType=0|1' })`，参数拼装沿用现有 `queryParams`，保留 `needRefresh.value = true`。完成标准：4 个动作（取/派评价、修改评价）均进入原生页，无 H5 webview
- [x] 1.2 A1：清理该文件内不再使用的 `waybillAppH5Url` 导入（确认文件内无其他引用；`externalLink.ts` 定义保留）。完成标准：无未使用导入、TS 编译通过
- [x] 1.3 A2：修改主仓 `src/modules/search/components/search-result/waybill-list.vue` 的同名两个 handler（约 L858-L886）：删除 `/h5-offline/netc-h5-order-offline/#/evaluation-driver-list` 字符串拼接，改为同样的 `Taro.navigateTo`，参数规则一致。完成标准：搜索结果卡片 4 个动作均进入原生页
- [x] 1.4 未登录验证：未登录状态点击评价入口 → 登录 → 登录成功后直达目标评价页。完成标准：与「更多 → 司机评价」入口行为一致

## 2. 成功弹窗补齐（B1 + B4 弹窗部分）

- [x] 2.1 扩展 `pages/evaluation-driver-list/components/evaluation-success-dialog/index.vue`：「返回列表」绑定 `Taro.navigateBack()`；「继续评价」绑定跳转 `/modules/waybill-build/pages/evaluation-list/index`。完成标准：两个按钮事件生效
- [x] 2.2 显隐逻辑对齐 H5（successDialog.vue L76/L87）：「继续评价」仅 `hasMoreFlag === 1 && 非修改评价` 时展示；不满足时「返回列表」通栏（`all-line` 样式）。完成标准：修改评价场景不展示「继续评价」
- [x] 2.3 `evaluationStr` 的 `v-html` 改为 rich-text 安全渲染（转换 `<text style="color:#FF9300">` 为 rich-text nodes 或文本分段+class），弹窗内新增富文本同样走 rich-text。完成标准：小程序端「已成功评价 N 票取货/派货运单」正确渲染且无 v-html 残留
- [x] 2.4 弹窗内补「评价记录」入口（对照 H5 successDialog.vue L53-58），点击跳原生评价记录页并上报 `clk_driverevaluate_notes_button_v2`。完成标准：入口展示、跳转、埋点生效
- [x] 2.5 弹窗曝光/按钮点击埋点：`exp_order_search_driverevaluate_success_V1`、`clk_order_search_driverevaluate_success_return_button_v1`、`clk_order_search_driverevaluate_success_continue_button_v1`。完成标准：埋点上报与 H5 eventCode 一致

## 3. 提交链路对齐（B1 触发时机 + B2 + B3）

- [x] 3.1 `pages/evaluation-driver-list/index.vue` `handleSubmit`：单票成功弹窗触发条件由 `rowTotal.value === 0` 改为列表仅 1 票（对齐 H5 L397 `list.length === 1`）。完成标准：仅 1 票待评价时提交后立即弹成功弹窗
- [x] 3.2 B2：`onEvaluatedSuccess` 对齐 H5（L493-513）——刷新后列表为空时，弹积分汇总弹窗：累计积分 = `responses.reduce(score)`、scoreTips 按累计积分 > 0 二选一（「同一取货/派货日对相同司机评价分别获得一次积分」/「当天已对该司机做过评价，本次评价不计积分」）、提交时间取 `responses[0].submitTime`，复用同一 `evaluation-success-dialog`。完成标准：批量评价全部完成后展示积分汇总（实施说明：汇总弹窗 `hasMoreFlag` 对齐 H5 L499 为 `await onGetScoreFlag()` 实时查询值，非写死 0）
- [x] 3.3 B3：新增 `getSource()`（与 `evaluation-list/components/success-dialog` L244-257 一致：devtools=3 / ios=2 / android=1），单票提交 `source` 动态获取，删除 `source = ref(1)` 硬编码。完成标准：三端 source 上报正确（开发者工具=3）

## 4. 司机信息卡片（B4）

- [x] 4.1 `index.vue` 头部司机卡片：工号按 `driverInfo.driverType !== '1'` 显隐。完成标准：内部员工司机不展示工号（实施说明：工号与姓名同行展示，对齐 H5 driverInfoCard 布局，见 9.7）
- [x] 4.2 司机卡片补 `driverInfo.scoreTips` 一行（rich-text 渲染，非 v-html），样式对照 H5 driverInfoCard。完成标准：接口返回 scoreTips 时正确渲染

## 5. 规则横幅 / 规则弹窗 / 评价记录入口 / 客服（B5 + B6）

- [x] 5.1 接入 `evaluation-list` 的 `rule-banner` / `rule-dialog` / `records-entry` 组件（仅 import 复用，不改组件源码），展示位置对照 H5。完成标准：规则详情弹窗可打开、评价记录入口可跳转（实施说明：为 rule-banner / records-entry 增加可选 `trackCode` prop 以区分埋点编码，默认值保持聚合页原编码，行为对生产页无影响）
- [x] 5.2 补 `useDidShow` 判断 `Taro.getApp().evaluationRecordsChanged`（对照 evaluation-list L330-333）：从记录页返回且有修改时刷新列表并重置标记。完成标准：记录页修改评价后返回列表正确刷新
- [x] 5.3 补横幅出口埋点：规则详情 `clk_order_search_driverevaluate_ruler_button_v1`、评价记录 `clk_driverevaluate_notes_button_v1`。完成标准：埋点上报正确
- [x] 5.4 B6：列表尾部 `#finished` 插槽补在线客服 tip（对照 evaluation-list L51-56 写法），点击 `Taro.navigateTo({ url: '/modules/webview/pages/online-service/index' })`（不带运单号参数），展示条件对齐 evaluation-list（非支付宝环境），埋点 `clk_order_search_driverevaluate_online_v1`。完成标准：客服入口可用且跳转正确

## 6. 批量选择口径一组改（B8 + B9 + B10，联动）

- [x] 6.1 B10：`commonQueryParams` 的 `pageSize: 10` 改为 `100`。完成标准：一次拉取覆盖全部待评价运单
- [x] 6.2 B9：新增 computed 按未评价口径统计 `scoreStatus === 0` 的运单数（对齐 H5 `evaluationListTotal`）；「还有 N 票」文案与横幅显隐改用该口径，且仅在 `统计值 - 1 > 0` 时展示。完成标准：已评价/超时效项不计入 N；剩余 0 票时横幅不显示（实施说明：以 `scoreStatusTotal` ref 在 listFetch page=1 时从接口 rows 统计、单票提交非修改场景递减，替代 computed 直读列表以保证响应性）
- [x] 6.3 B8：`handleCheckBoxChange` 全选时按可评价状态过滤（复用列表项禁用条件；插槽参数 `isDisabledTime` 在 driver-list 模板内重命名接收为 `isEnabledTime`，判断方向同步翻转；`evaluation-list/components/list-item` 组件本身不改）。完成标准：全选后勾选项不含超时效单，与列表项 checkbox 禁用态一致（实施说明：过滤条件取 `leftTime > 0 && !isUpdate`，与 list-item 内 `isDisabledTime` computed 同源）
- [x] 6.4 检查 `rowTotal` 递减逻辑与新口径的一致性：`isBatch` 保留 `rowTotal >= 2`；确认单票弹窗触发（3.1）切换后无残留死分支。完成标准：无 unused/矛盾逻辑，TS 编译通过

## 7. 埋点注册（B7）

- [x] 7.1 `src/modules/kye-miniapp-waybill/src/utils/tools.ts` pageCode 映射注册 `'modules/waybill-build/pages/evaluation-driver-list/index': 'page_order_search_driverevaluate_v1'`。完成标准：页面曝光 page_code 正确
- [x] 7.2 页面曝光 `exp_order_search_driverevaluate_v1`、批量底部栏曝光 `exp_order_search_multi_driverevaluate_v1`、一键评价点击 `clk_order_search_multi_drive_batch_evaluation_v2`、单票提交按钮点击（对照 H5 list-item 提交按钮埋点）——使用 `reportExp` / `reportClick`（`../../report`）。完成标准：各埋点上报与 H5 eventCode 一致（注意 `multi_drive_batch` 与 `multi_drivere_batch` 两个相似 code 勿混淆）（实施说明：H5 driver-list 的 list-item 提交按钮经核实无埋点，故单票提交不新增上报）

## 8. 自检验证（全量回归准备）

- [x] 8.1 微信小程序：查件列表 / 搜索结果卡片 4 个评价动作均进入原生页；评价完成后返回，列表自动刷新且按钮状态正确
- [x] 8.2 单票评价：仅 1 票提交后立即弹成功弹窗；「返回列表」/「继续评价」按条件展示且跳转正确；修改评价场景不展示「继续评价」
- [x] 8.3 批量评价：全选过滤过期单、100 票上限 toast 拦截、一键评价全流程、全部完成后积分汇总弹窗（累计积分/不计积分提示/提交时间）
- [x] 8.4 规则横幅/弹窗/评价记录入口可用；记录页修改后返回列表刷新；在线客服入口可用
- [x] 8.5 内部员工（driverType=1）、超时效（scoreStatus 特殊值）展示与拦截核对；token 过期/变更后列表刷新
- [x] 8.6 支付宝小程序：重复 8.1/8.3 关键场景（客服入口不展示）；埋点按端验证 source（iOS=2 / android=1 / 工具=3）
- [x] 8.7 C 节联调确认：服务端将每日任务（taskCode `okPingJia`）改为 `gotoType=2` + `/modules/waybill-build/pages/evaluation-list/index` 后，每日任务跳转原生聚合页（前端无代码改动）

## 9. 列表项视觉走查对齐（2026-09-29 补充，方案见 design 决策 8）

- [x] 9.1 共用 list-item 新增 `variant` / `entryWaybillNo` / `isEdit` 可选 props（聚合页默认形态行为不变）。完成标准：evaluation-list 生产页无感知
- [x] 9.2 运单号行「当前运单/运单号」前置标签（对齐 H5 list-item-head-yd，含样式）。完成标准：入口运单显示「当前运单」，其余显示「运单号」（实施说明：仅「当前运单」为紫框 `head-tag`，非当前运单为灰字 `.label` 无边框，对齐 H5；driver 变体运单号文字以 `.no-driver` 覆盖为 24px/500/#03050d，聚合页保持 28px/600 不变）
- [x] 9.3 司机维度页隐藏列表项积分提示行与司机名（消除与司机卡片 scoreTips 重复）。完成标准：列表项不再出现「评价该司机，可获得X积分」
- [x] 9.4 修改评价预填：预选评分、预填原因/留言，倒计时隐藏；select 过期拦截放行 + 降级拦截（「您选择的等级无法修改」）+ 提交升级拦截（「您还没有修改评价等级」）；按钮文案按 scoreStatus 区分「提交评价/修改评价」。完成标准：flag=modify 进入入口运单为预填态且拦截规则与 H5 一致
- [x] 9.5 超时提示行（list-item-smg，文案修正 H5 错别字「有限期」→「有效期」）+ 过期运单隐藏表情评价区。完成标准：超时运单不显示表情区、显示有效期提示
- [x] 9.7 二轮布局与样式对齐（方案见 design 决策 9）：布局参照聚合页重构——规则横幅/评价记录固定顶部、司机卡片移入 `#beforeContent` 随列表滚动（空态不展示）、底部栏移出滚动容器改文档流、外层补 `display: flex` 消除多层滚动；司机卡片工号与姓名同行 + `padding: 24px`。完成标准：仅列表区域滚动，样式与 H5 截图一致
- [x] 9.6 回归确认：聚合页 evaluation-list 列表项视觉与交互无任何变化（不传 props 默认形态）。完成标准：与走查前一致

## 10. H5 重拉对齐与实施期修复（2026-10-19 ~ 10-20，方案见 design 决策 10~14）

- [x] 10.1 TY250981：司机页 `listFetch` 首页读取 `newScoreRuleSwitch` / `pickupRestrictSwitch`（显式 `=== true` 判定）。完成标准：开关状态与接口返回一致
- [x] 10.2 TY250981：`RuleBanner` / `RuleDialog` / 批量 `SuccessDialog` / `EvaluationSuccessDialog` 逐个传参接线。完成标准：开关开启时横幅/规则弹窗/批量弹窗文案切换为 TY250981 新版，关闭时保持旧版
- [x] 10.3 TY250981：`onEvaluatedSuccess` scoreTips 改显式三元（开关 ? 新文案 : 旧文案，常量 `OLD_SCORE_TIPS` / `NEW_SCORE_TIPS` 与 H5 逐字一致）；`evaluation-success-dialog` 补 `newScoreRuleSwitch` prop + `NEW_COPY` / `OLD_COPY` + `fallbackScoreTips` computed。完成标准：批量汇总弹窗文案与 H5 一致，兜底为旧文案
- [x] 10.4 全选框自动点亮：新增 `watch(checks)` 勾满未评价票数点亮全选框（口径 `!item.isUpdate`，与 H5 一致）。完成标准：逐个勾满点亮、取消任一项熄灭；100 票截断时不点亮
- [x] 10.5 修复全选反选失效回归：`allChecked` 由布尔改为 `ky-checkbox-group` 数组语义（点亮 `[true]` / 熄灭重置 `[]`），根因为组件内部 `[...modelValue]` 展开布尔抛 non-iterable（见 design 决策 11 踩坑）。完成标准：全选/反选/联动/重置全链路无报错
- [x] 10.6 修复批量确认弹窗「共N票」行间距：`success-dialog` 的 `dialog-desc` 删除 `display: flex`（聚合页/司机页共用）。完成标准：文案两行居中展示，数字与文字无异常间距
- [x] 10.7 司机维度列表项时间取值对齐 H5：driver 变体改 `formatDay(item.showTime, 'MM-DD HH:mm')`，文案「货时」修正为「货时间」；聚合页原逻辑不变。完成标准：司机页时间展示与 H5 一致
- [x] 10.8 评价记录页 textarea 聚焦禁用下拉刷新：`disabledRefresh` ref + RecordItem `ky-textarea` focus/blur 事件上报（`textareaFocus` / `textareaBlur`）。完成标准：聚焦时下拉不触发、失焦还原
- [x] 10.9 真机验证第 10 组：TY250981 开关双态文案、全选联动与反选、弹窗文案间距、时间展示、记录页下拉互斥（微信 + 支付宝）。完成标准：8.1~8.6 同口径回归通过
- [x] 10.10 挂起项确认（明确不做，见 design Non-Goals）：评价记录入口版本门槛 `showRecords`（≥8.2.38）、空勾选 toast 文案对齐、`$native.refreshSearch()` 查件页刷新通知——如后续要求对齐需单独立 change
