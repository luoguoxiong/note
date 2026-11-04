## Context

司机维度评价页 `src/modules/kye-miniapp-waybill/src/pages/evaluation-driver-list/index.vue` 已注册（`src/subpackages.ts`，随构建产物 `waybill-build` 分发）但从未接入、从未上线：查件卡片与搜索结果卡片的评价动作仍跳 H5 离线包。页面骨架已有：列表（`ky-list-standard` + `evaluation-list/components/list-item`）、勾选（`checks`）、单票提交（`handleSubmit`）、一键评价（复用 `evaluation-list/components/success-dialog`）。

本次以 H5 为对齐基准逐项补齐，H5 仓库本地路径：`C:\Users\674741\Desktop\git\netc-h5-order\src\views\evaluation-driver-list\`（index.vue 及 components/ 下 successDialog、batchSuccessDialog、driverInfoCard、rule-banner 等），探索阶段已逐项核实需求单引用的 H5 行号与行为属实。

已核实的现状问题（探索结论）：

1. 成功弹窗 `evaluation-success-dialog`：「返回列表」「继续评价」为纯静态 view（L51-52）；`evaluationStr` 用 `v-html` 渲染（小程序端不生效）；无评价记录入口。
2. `source = ref(1)` 硬编码（L102）；参考实现 `getSource()` 在 `evaluation-list/components/success-dialog/index.vue` L244-257。
3. `tools.ts` pageCode 映射仅注册 `evaluation-records`，driver-list 无任何埋点。
4. 全选 `allData?.slice(0, 100)` 未过滤过期单（L251）；计数口径 `rowTotal - 1`（L114）且横幅恒显示；`pageSize: 10`（L127）。
5. `isDisabledTime` 命名与语义相反：`v-show="isDisabledTime"` + `:disabled="!isDisabledTime"` —— 值为 true 表示**可评价**。
6. `waybillAppH5Url` 在 waybill 子包十余处使用，仅 waybill-search/index.vue 文件内 2 处属本次替换范围。
7. H5 在需求单之外还有 4 个差异点：成功弹窗内评价记录入口（`clk_driverevaluate_notes_button_v2`）、横幅仅在剩余 > 0 时显示（`evaluationListTotal - 1 > 0`）、工号 `driverType !== '1'` 才显示、以及规则/记录/批量弹窗提交 3 个补充埋点 code——均列入本次范围。

## Goals / Non-Goals

**Goals:**

- 查件卡片、搜索结果卡片的 8 个评价动作全部进入原生页，不再打开 H5 webview。
- driver-list 页面功能、结构、交互与 H5 `/evaluation-driver-list` 对齐（原生缺的结构一律补上）。
- 埋点 eventCode 与 H5 对齐。
- 未登录场景可用（沿用原生页 `onStorageTokenChange` 刷新 + 入口裸 `Taro.navigateTo` 先例）。

**Non-Goals:**

- 不动生产在用的 `evaluation-list` 聚合页（含其全选过期单问题）。
- 不移植 H5 死代码：离开确认弹窗（未接线）、batchLimit（拉取未使用）、评价引导浮层（调用被注释）。
- 不改 H5 仓库任何代码。
- 每日任务入口（C 节）由服务端/运营改配置，前端不加拦截逻辑。
- 不改批量评价确认流程（复用 `evaluation-list/components/success-dialog` 的轮询提交链路）。
- H5 重拉后确认不做（2026-10-19 拍板）：评价记录入口版本门槛 `showRecords`（App ≥ 8.2.38 才显示，原生无条件展示）、空勾选 toast 文案对齐（H5「请勾选运单」vs 原生「请选择需要评价的运单」）、提交成功后 `$native.refreshSearch()` 主动通知查件页刷新（原生依赖查件页自身 `useDidShow` 刷新）。

## Decisions

### 决策 1：入口统一 `Taro.navigateTo`，登录沿用页面自身 token 监听

- **选择**：A1/A2 的 4 个 handler 直接 `Taro.navigateTo` 到统一路由，保留 `needRefresh.value = true`（A1）；清理 waybill-search/index.vue 文件内的 `waybillAppH5Url` 导入（`externalLink.ts` 定义保留，其他文件仍在用）。
- **理由**：「更多」菜单已用裸 `Taro.navigateTo` 跳原生聚合页且在生产运行，先例成立；页面已有 `onStorageTokenChange` 处理 token 变化刷新。用户已拍板。
- **备选方案**：入口前置登录校验 —— 拒绝，与「更多」菜单先例不一致，且验收标准只要求「未登录先登录后直达目标页」，由小程序全局登录拦截兜底。

### 决策 2：成功弹窗按 H5 结构整体补齐，单票/批量复用同一弹窗组件

- **选择**：扩展 `evaluation-success-dialog`：「返回列表」接 `Taro.navigateBack()`；「继续评价」显隐 `hasMoreFlag === 1 && !isEdit`，点击跳 `/modules/waybill-build/pages/evaluation-list/index`，不满足时「返回列表」通栏（`all-line`）；补弹窗内「评价记录」入口；`v-html`（`evaluationStr` 及 B2/B4 新增富文本）全部改 `rich-text` 组件渲染；单票（H5 L397 `list.length === 1`）与批量汇总（H5 `onEvaluatedSuccess` L493-513，`responses` 累加 score、scoreTips 二选一文案）走同一弹窗。
- **理由**：H5 单票与批量本就复用 successDialog；避免维护两套弹窗。`v-html` 在小程序端不渲染，rich-text 是唯一正确路径（用户已拍板用 rich-text）。
- **注意**：`evaluationStr` 现有 `<text style="color:#FF9300">` 标签写法需转换为 rich-text 的 nodes 结构（或改用文本分段 + 样式 class 实现，见任务拆解）。

### 决策 3：B3 source 沿用现有 `getSource()` 映射

- **选择**：driver-list 单票提交前调用与 `evaluation-list/components/success-dialog` 相同的 `getSource()` 逻辑（devtools=3 / ios=2 / android=1），替换 `source = ref(1)` 硬编码。
- **理由**：用户拍板直接沿用该实现；与生产 evaluation-list 行为一致，后端统计口径已被线上验证。

### 决策 4：`isDisabledTime` 重命名为 `isEnabledTime`

- **选择**：driver-list 页模板与 B8 全选过滤逻辑统一改用 `isEnabledTime`（值为 true = 可评价）。该 prop 来自复用的 `evaluation-list/components/list-item` 作用域插槽——**list-item 组件本身不改**（生产页在用），仅在 driver-list 模板内以新名接收插槽参数并同步修改判断方向。
- **理由**：原命名语义相反，B8 按此条件过滤时极易写反；插槽参数是解构别名，改名零风险。

### 决策 5：B8+B9+B10 作为一组联动改动

- **选择**：`pageSize` 10 → 100；全选改为按 `isEnabledTime`（结合非修改状态）过滤；「还有 N 票」改为 `computed`：`list.filter(scoreStatus === 0).length`，横幅显隐条件 `该值 - 1 > 0`；单票成功弹窗触发条件由 `rowTotal === 0` 改为 `list.length === 1`。
- **理由**：三者耦合——分页 100 后全量数据在一页内，`scoreStatus === 0` 口径可直接从列表数据计算（对齐 H5 `evaluationListTotal` computed）；`rowTotal` 递减维护逻辑随之被口径替代。拆开改会出现中间态不一致。
- **连带**：`rowTotal` 仍被 `isBatch` 使用，保留但不再作为「是否全部评完」的依据。

### 决策 6：B6 客服入口按 evaluation-list 现状，不带运单号

- **选择**：列表尾部（`#finished` 插槽）客服 tip，点击 `Taro.navigateTo({ url: '/modules/webview/pages/online-service/index' })`，展示条件同 evaluation-list（非支付宝环境）。
- **理由**：用户拍板。**本决策偏离需求单 B6 原文**（原文要求 `?paramsNum=waybillNo&type=query` 定位运单），已确认为最终口径，需求单不再回改，以本提案为准。

### 决策 7：埋点在需求单清单之上补 3 个 H5 实际存在的 code

- **选择**：`tools.ts` 注册 `page_order_search_driverevaluate_v1`；使用 `reportExp` / `reportClick`（`../../report`）补齐页面/底部栏曝光与各点击位，并补充：规则详情 `clk_order_search_driverevaluate_ruler_button_v1`、评价记录 `clk_driverevaluate_notes_button_v1`（横幅出口）/ `clk_driverevaluate_notes_button_v2`（弹窗内）、成功弹窗返回/继续按钮 `..._success_return_button_v1` / `..._success_continue_button_v1`。
- **理由**：需求单 B7 表格不全，H5 源码核实存在；已与用户确认「其他几点逻辑以 H5 为准」。
- **注意**：一键评价点击是 `clk_order_search_multi_drive_batch_evaluation_v2`（`multi_drive_batch`），批量确认弹窗内提交是 `clk_order_search_multi_drivere_batch_evaluation_v2`（`multi_drivere`），两个 code 高度相似，照抄时勿混淆。
- **注意（pageCode 机制）**：`report/index.ts` 封装会给所有事件自动附加 `page_code: getPageCode()`，未命中 codeMap 时回退为原始路由路径——不注册则司机页所有埋点 page_code 退化为路径字符串。聚合页未注册属存量现状（其页面编码在事件参数里单独传），本次不动。

### 决策 8：list-item 继续共用，以 `variant` prop 做司机维度差异化（2026-09-29 视觉走查补充）

- **背景**：首版视觉走查发现 driver-list 列表项与 H5 差异：缺「当前运单」标签、积分提示行与司机卡片重复、多了司机名、修改评价无预填、按钮文案固定「提交评价」、无超时提示。核对 H5 仓库发现 **H5 本就是两套 list-item**（evaluation-list 与 evaluation-driver-list 各一份），差异项共 7 处。
- **选择**：继续共用原生 list-item，新增 3 个可选 prop：`variant: 'aggregate' | 'driver'`（默认 aggregate）、`entryWaybillNo`、`isEdit`。差异项全部在组件内按 `isDriverVariant` / `itemIsEdit` 门控：标签行（当前运单/运单号）、隐藏 scoreTips 行与司机名、修改评价预填（评分/原因/留言）、过期拦截放行 + 降级/升级守卫、按钮文案（scoreStatus!==0 → 修改评价）、超时提示行（list-item-smg）、过期时隐藏表情区。
- **理由**：fork 需重复 ~700 行；差异点均可用 prop 干净表达；聚合页不传 props 行为零变化。若后续两页差异继续扩大，再拆分不迟（props 设计留了退路）。
- **注意**：H5 超时提示文案原文为「有限期」（错别字），原生按「有效期」修正。

### 决策 9：页面布局与二轮样式对齐（2026-09-29 视觉走查第二轮补充）

- **布局重构（滚动行为）**：对照 H5 截图反馈「外层出现多个滚动区域」——根因是 driver-list 的 `.page-evaluation-list` 缺 `display: flex`，`#evaluation-list-id` 的 `flex: 1; min-height: 0` 失效，内容撑满 100vh 导致「页面整体 + 内部 ScrollView」多层滚动。参照聚合页（evaluation-list）布局方案改造：外层 flex 列布局下，规则横幅 + 评价记录入口固定顶部；司机卡片移入 `ky-list-standard` 的 `#beforeContent` 插槽（该插槽仅在列表有数据时渲染，天然满足「运单卡片存在才展示」，空态不展示司机卡片——有意偏离 H5 空态仍展示，用户拍板）；底部「全选 + 一键评价」栏移出滚动容器改文档流（去掉 `position: fixed`，`padding-bottom: env(safe-area-inset-bottom)`）；补 `scrollViewProps`（`enhanced: true, showScrollbar: false`）。
- **司机卡片样式**：工号从独立一行改为与姓名**同行**（`.name` flex 行内 `<text class="no">`，margin-left 16px、24px、#686b75），卡片补 `padding: 24px`，冒号用半角——对齐 H5 driverInfoCard.vue。
- **运单号文字样式**：H5 driver 版 list-item 对 `.no` 有覆盖（24px / 500 / #03050d），与聚合版（28px / 600 / #24262b）不同。原生在共用 list-item 中以 `.no-driver` 类（`isDriverVariant` 时挂载）实现同等覆盖；标签拆分——仅「当前运单」展示紫框 `head-tag`，非当前运单展示灰字 `.label`（对齐 H5 非当前运单无紫框）。
- **零影响确认**：以上共用组件改动均经 git diff 对照核实——聚合页下 `isDriverVariant` / `itemIsEdit` 恒为 false，所有新条件短路回原逻辑（如 bottom 区 v-if 退化为 `!item.isUpdate`），生产页行为不变。

### 决策 10：TY250981 新积分规则开关接线（2026-10-19 H5 重拉对齐补充）

- **背景**：H5 仓库重拉后带入新需求 TY250981——服务端新增 `newScoreRuleSwitch`（新积分规则文案）与 `pickupRestrictSwitch`（限制收方评价附加条款）两个开关。共用组件（rule-banner / rule-dialog / success-dialog）与聚合页已随新代码就位，司机页（evaluation-driver-list）与司机页专属弹窗（evaluation-success-dialog）无任何接线。
- **选择**：司机页 `listFetch` 首页读取两个开关（显式 `=== true` 才开，对齐 H5 口径）→ `RuleBanner` / `RuleDialog` / 批量 `SuccessDialog` 逐个传参 → `onEvaluatedSuccess` 的 scoreTips 由「空串靠模板 fallback」改为与 H5 相同的显式三元（`totalScore > 0 ? (开关 ? 新文案 : 旧文案) : 不计积分`，新文案「同一取/派日对同一司机评价仅获得一次取/派评积分，同个司机单月上限3次」）；`evaluation-success-dialog` 组件补 `newScoreRuleSwitch` prop + `NEW_COPY` / `OLD_COPY` 常量 + `fallbackScoreTips` computed（兜底仍为旧文案，消除对模板 fallback 的隐式依赖）。
- **理由**：开关关闭时行为与上线版完全一致；开关开启时原生文案与 H5 同步，避免线上文案不一致。组件升级落在司机页专属弹窗内，聚合页零改动。
- **注意**：旧文案作为 fallback 保留（开关字段缺省视为关闭）。

### 决策 11：全选框自动点亮联动 + kye-checkbox-group v-model 数组语义（2026-10-19 补充，含踩坑）

- **背景**：H5 存在「逐个勾满后全选框自动点亮」行为（watch checks），原生缺失。
- **选择**：新增 `watch(checks)`，勾满未评价票数（口径 `!item.isUpdate`，与 H5 逐字一致；含 100 票截断时永不点亮、全部已评价时不干预两个边界均与 H5 相同）时点亮/熄灭全选框。
- **踩坑（必须遵守）**：`ky-checkbox-group` 的 v-model 是**数组语义**（`:name="true"` → 选中态为 `[true]`），子组件点击时内部执行 `[...modelValue]`——`allChecked` 一旦赋布尔值即抛 `Invalid attempt to spread non-iterable instance` 且后续点击无响应。H5 的 `van-checkbox` 是单向 `:value` 布尔受控模型，布尔写法不能照搬。因此 `allChecked = ref<boolean[]>([])`，点亮 `[true]` / 熄灭 `[]`，重置一律 `[]`。
- **理由**：H5 靠 Vant 受控布尔模型天然无展开操作；原生对齐的是「勾满点亮」这一行为而非实现写法。程序化赋值不触发组件 change 事件，无联动循环。

### 决策 12：批量确认弹窗「共N票」行布局修复（2026-10-19 视觉反馈）

- **背景**：`evaluation-list/components/success-dialog` 的 `dialog-desc` 行（「共N票，评价后将获得…」）误用 `display: flex`，数字与前后文字之间出现异常间距，与 H5 两行居中文本不符。
- **选择**：删除该行 `display: flex`，恢复普通块级文本流（该弹窗为聚合页/司机页共用，两页同时生效）。

### 决策 13：司机维度列表项时间取值对齐 H5 showTime（2026-10-19 补充）

- **背景**：司机维度列表项「取/派货时间」原逻辑为前端按 `scoreType` 取 `receiveTime` / `deliveryTime` 再 `formatDay` 格式化，与 H5 司机页取后端拼好的 `showTime` 字段不一致。
- **选择**：`variant="driver"` 时展示 `formatDay(item.showTime, 'MM-DD HH:mm')`（字段对齐 H5、格式统一走 formatDay）；聚合页（非 driver 变体）保持原逻辑不变。同时修正文案「货时」→「货时间」。

### 决策 14：评价记录页文本域聚焦禁用下拉刷新（2026-10-20 补充）

- **背景**：评价记录页 RecordItem 修改评价的 textarea 聚焦（键盘弹起）时，与 `ky-list-standard` 下拉刷新手势冲突。
- **选择**：页面新增 `disabledRefresh` ref 传给 `ky-list-standard` 的 `:disabledRefresh`；RecordItem 的 `ky-textarea`（已内建 focus/blur 事件）聚焦时抛 `textareaFocus` → 置 `true` 禁用下拉，失焦抛 `textareaBlur` → 还原 `false`。
- **注意**：聚焦期间列表重渲染导致 textarea 卸载时 blur 可能不触发（操作路径上概率极低），真机回归时顺带确认；必要时可在提交成功回调补还原。

## Risks / Trade-offs

- [风险] driver-list 页首次启用，B 节全部改动叠加在未验证骨架上 → 缓解：测试范围按整页全量回归准备；对照 H5 逐项走查。
- [风险] `waybill-build` 为构建产物，源码改动需重新构建子包才生效 → 缓解：联调/提测前重新构建并确认版本。
- [风险] 搜索结果卡片入口在主仓 `modules/search`，与子包（waybill-build）发版节奏不同 → 缓解：两端入口参数与目标页路由完全一致，可独立发版；排期时对齐上线窗口。
- [风险] 分页 100 后列表渲染量增大 → 缓解：`ky-list-standard` 单页渲染，H5 同规格已在生产验证；如真机低端机出现性能问题再评估虚拟列表（本次不做）。
- [风险] 每日任务入口依赖服务端配置变更排期 → 缓解：与后端/运营对齐生效时间，联调时验证 `gotoType=2` 跳转原生聚合页。
