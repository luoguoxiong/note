> **前置约束**：所有代码改动只落在 `src/modules/kye-miniapp-waybill/src/`，禁止改动 `src/modules/waybill-build/`（构建期副本，会被覆盖）与 `src/subpackages.ts`（插件自动生成）。
> 函数声明统一用箭头函数 + `const`；样式独立 `.scss` 文件并用 `import` 引入；单位统一 `px`。

## 1. 接口层与常量

- [x] 1.1 在 `apis/waybill-search/index.ts` 新增 `getEvaluationRecords`，服务码 `web.query.evaluation.records`、`appkey: 55262`，入参 `startDate`/`endDate`/`score`/`page`/`pageSize`，封装形式对齐同文件 `searchToBeEvaluated`
- [x] 1.2 为该接口补出参类型定义：`score`、`rowTotal`、`pageTotal`、`page`、`pageSize`、`rows[]`（含 `orderNumber`/`waybillNumber`/`serviceMode`/`deliveryCity`/`pickupCity`/`scoreType`/`canModifyStatus`/`driverName`/`showTime`/`scoreLevel`/`remark`/`msgFlag`/`scoreNumber`/`createTime`）
- [x] 1.3 新建 `pages/evaluation-records/constant.ts`，定义 `RECORD_SCORE_TABS`（好评/一般/差评 → `score` 1/2/4）
- [x] 1.4 在 `constant.ts` 定义 `RECORD_DATE_OPTIONS`（近1个月/近3个月/近6个月/近1年），**不复用** `search-drawer-item` 的 `timeOptions`（其为近7/30/60/180天/1年）
- [x] 1.5 在 `constant.ts` 定义埋点用 `SCORE_REPORT_TEXT`（`2` → `中评`、`4` → `差评`），供 E6 属性 `type` 取值

## 2. 公共资产抽取（从 list-item 复制，不改动源组件）

- [x] 2.1 将表情三档 `list[]`（`4`很糟糕/`2`一般般/`1`太棒啦 + `evaluationAssets` 图 URL）复制至 `constant.ts`
- [x] 2.2 将只读态 `emotesMap`（`{1,2,4}` → `{src, text}`）复制至 `constant.ts`
- [x] 2.3 将 `labelList`（`[scoreType][bad|general|very]`，取/派各 6 个标签）复制至 `constant.ts`
- [x] 2.4 将 `nameTipsSrc(scoreType)`（取/派标识图）复制为工具函数
- [x] 2.5 确认 `components/list-check` 可直接 import 复用（含 `showErr` 校验态），无需修改
- [x] 2.6 确认 `pages/evaluation-list/components/list-item/` 未被本次改动触及（`git diff` 为空）

## 3. 页面骨架与配置

- [x] 3.1 新建 `pages/evaluation-records/index.config.ts`：标题「评价记录」、原生导航、黑色标题，对齐 `evaluation-list/index.config.ts`
- [x] 3.2 新建 `pages/evaluation-records/index.vue` 骨架：`BasePage` + `id="page-evaluation-records-id"`（供 `ky-popover` 的 `listenClickId` 使用）
- [x] 3.3 新建 `pages/evaluation-records/index.scss`，通过 `import './index.scss'` 引入
- [x] 3.4 验证页面已被构建插件自动收录（启动 dev 后可通过 `/modules/waybill-build/pages/evaluation-records/index` 访问），确认未手改 `subpackages.ts`

## 4. 筛选区

- [x] 4.1 实现评价时间展示行（`2026/07/30 - 2026/08/30` 形态），点击唤起日历
- [x] 4.2 接入 `ky-calendar`：`type="range"` + `:popupable="true"` + `:allowSameDay="true"` + `:options="RECORD_DATE_OPTIONS"` + `@confirm`，参照 `components/search-drawer-item` 写法但**不引入 `Teleport`**（本页无抽屉嵌套）
- [x] 4.3 设置默认区间为近 1 个月；`startDate` 限制为 1 年前，超范围日期置灰
- [x] 4.4 实现评价类型三选一按钮组（好评/一般/差评 → `score` 1/2/4），互斥单选
- [x] 4.5 实现日期入参格式化为 `yyyy-MM-dd`（区别于出参 `yyyyMMdd HHmm`）
- [x] 4.6 任一筛选项变更即时触发查询，不设独立「搜索」按钮

## 5. 列表与默认定位

- [x] 5.1 接入 `ky-list-standard`（`:fetch="listFetch"`）
      - 空态无需分端处理：`ky-list-standard` 内部自维护 `isEmpty`（`items.length === 0`），其 props 不接收外部 `isEmpty`；聚合页 `:isEmpty="!isALIPAY ? false : isEmpty"` 为早期版本遗留的无效传参，本页不沿用
- [x] 5.2 实现 `listFetch(page)`：首次进入不传 `score`，消费 `data.score` / `data.pageTotal` / `data.rows`
- [x] 5.3 实现默认定位：用 `data.score` 反写选中类型，并确保反写**不触发第二次请求**（赋值而非模拟点击）
- [x] 5.4 实现 `isScoreTouched` 标记控制是否携带 `score`：首次进入不传；**变更时间区间一律不传**（复位 `isScoreTouched=false`、`activeScore=null`，交后端在新区间重新定位）；用户主动点选类型时携带；修改评价后刷新时携带（见 8.3）
- [x] 5.5 实现类型切换：重置 `page=1`、清空列表、按新 `score` 重新加载
- [x] 5.6 实现 `adaptRecordRow(row, offset, index)` 适配层：`msgFlag`/`remark` 兜底为字符串、构造 `recordKey = ${waybillNumber}-${scoreType}-${offset + index}`（`offset = (page-1)*pageSize`）
- [x] 5.7 实现 `formatRecordTime()`：`yyyyMMdd HHmm` → `MM/DD HH:mm`（去年份），非预期格式原样返回
- [x] 5.8 在适配层加断言：`scoreLevel` 未匹配到表情 `list[]` 时 `console.warn`
- [x] 5.9 实现分页加载（`page < pageTotal` 时追加），按返回顺序渲染不做前端排序
- [x] 5.10 实现空状态缺省图（复用 `evaluation-list` 的空态图 URL）与网络异常缺省图 + 重新拉取

## 6. 记录卡片组件 record-item

- [x] 6.1 新建 `pages/evaluation-records/components/record-item/{index.vue, index.scss}`
- [x] 6.2 实现卡片头：运单号 + 复制按钮（`copyText`）+ 右上 `+N积分`（`scoreNumber`）
- [x] 6.3 实现城市行：`deliveryCity` → `serviceMode` → `pickupCity`，结构与 class 照搬 `list-item`
- [x] 6.4 实现司机信息行：`driverName` + 取/派标识图 + 取货/派货时间（`showTime`）+ 评价时间（`createTime`）
- [x] 6.5 确认**不渲染**倒计时、「已过期」、「评价成功，获得N积分」与 `scoreTips` 提示行
- [x] 6.6 实现可编辑态（`canModifyStatus === 1`）：表情三选一 + `list-check` 标签多选 + `ky-textarea`（`maxlength=100`）+「修改评价」按钮
- [x] 6.7 实现可编辑态回填：表情选中 `scoreLevel`、标签选中 `msgFlag` 切分项、备注填 `remark`
- [x] 6.8 实现只读态（`canModifyStatus === 0`）：平铺「我的评价：<表情图><文案>」+ 标签文本 + 「给司机的留言：<remark>」，无表单无按钮无「查看评价」
- [x] 6.9 全文检索确认 `record-item` 内**零** `document.` 调用；校验提示消除改用 `ky-popover` 的 `listenClickId="page-evaluation-records-id"`

## 7. 向上修改校验（移植 PC 逻辑）

- [x] 7.1 实现选择时拦截：`Number(原 scoreLevel) < Number(新 id)` → `showToast('您选择的等级无法修改')`，不改变选中态
- [x] 7.2 实现提交时拦截：`Number(原 scoreLevel) <= Number(新 id)` → `showToast('您还没有修改评价等级')`，不发请求
- [x] 7.3 实现原因标签必选校验：未选时 `showPopover` + `isCheckErr` 高亮，不提交
- [ ] 7.4 验证四种场景：差评→好评 允许；差评→差评 拒绝；一般→一般 拒绝；一般→差评 拒绝

## 8. 修改评价提交

- [x] 8.1 实现提交：调 `Addscore`，参数 `code`（`scoreType === 1 ? waybillNumber : orderNumber`）/ `remark` / `score` / `type` / `waybillNumber` / `flag`（标签 `join(',')`）/ `source: 1`
- [x] 8.2 实现 `submitLoading` 防重（入口 `if (loading) return` + 按钮 `:loading`）
- [x] 8.3 成功后 `showToast('修改成功')`，**调用 `listRef.init()` 重新拉取当前类型列表**（后端存在同 XD 号多运单评价联动，前端 splice 移除会残留脏数据；刷新前置 `isScoreTouched = true` 以携带当前 score）
- [x] 8.4 实现返回聚合页时状态同步（返回前标记需刷新，或复用聚合页 `useDidShow` 重新拉取）
- [x] 8.5 确认未提交返回不保留内容、不弹二次确认

## 9. 入口接入

- [x] 9.1 新建 `pages/evaluation-list/components/records-entry/{index.vue, index.scss}`：入口行「查询更多历史评价内容，请点击 评价记录 >」，样式对齐 `RuleBanner` 第一行
- [x] 9.2 在 `pages/evaluation-list/index.vue` 的 `<RuleBanner />` 之后并列插入 `<RecordsEntry />`，不修改 `RuleBanner` 组件本身
- [x] 9.3 实现入口跳转 `navigateTo` 至记录页，并加防重（避免连点打开多个页面）
- [x] 9.4 验证返回后聚合评价页保持原状态（不被关闭或重置）

## 9A. 评价结果弹窗入口接入（补充范围，见 design D14）

> 落点为**可达**的两个弹窗：`components/waybill-search/components/evaluation-popup`（查看取货/派货评价，单条）与 `evaluation-popup-all`（查看评价，取+派轮播）。不激活死代码 `evaluation-success-dialog`。

- [x] 9A.1 在 `evaluation-popup/index.vue` 的评价卡片下方新增入口行（图标 + 灰字「如需查询历史评价内容，请点击」+ 紫字「评价记录」+ 紫色箭头），样式写入 `evaluation-popup/index.scss`；已按设计稿 `.agents/knowledge/需求/司机评价记录/查看评价.png` 对齐（白底 + `2px #E6E8ED` 描边 + `12px` 圆角）
- [x] 9A.2 在 `evaluation-popup-all/index.vue` 新增同款入口行，置于 `ky-swiper` **外层**（与 `__close` 同级），确保轮播两页只显示一次；样式写入 `evaluation-popup-all/index.scss`，显式 `width: 622px` 与卡片同宽
- [x] 9A.3 实现点击处理：先 `show.value = false` 关闭弹窗，再 `Taro.navigateTo` 至 `/modules/waybill-build/pages/evaluation-records/index`
- [x] 9A.4 加防重：`navigating` ref 标志位 + `complete` 回调延时重置（模式对齐 `records-entry`，但不复用该组件）
- [x] 9A.5 确认未改动两个弹窗的原有数据获取（`queryDriverContainOut` / `scoreGet`）与展示逻辑
- [ ] 9A.6 确认 `evaluation-popup-all` 的 `ky-swiper` `:height="406"` 未因新增入口被撑破或裁切
      - 入口置于 `ky-swiper` 外层（`kye-overlay-body` 的 flex 列方向子节点），未侵入轮播内部；入口行 `margin-top: 24px`，`__close` 的 `margin-top` 由 `48px` 调整为 `32px` 为入口行让出间距，仍需实机复核

## 10. 埋点

- [x] 10.1 在 `utils/tools.ts` 的 `getPageCode()` `codeMap` 中登记 `'modules/waybill-build/pages/evaluation-records/index': 'page_driverevaluate_notes_v1'`
- [x] 10.2 入口点击 E2：`records-entry` 内 `reportClick('clk_multidriverevaluate_notes_button_v1')`
- [x] 10.2A 结果弹窗入口点击 E3：`evaluation-popup` 与 `evaluation-popup-all` 内 `reportClick('clk_driverevaluate_notes_button_v2')`，两处同编码不拆分
- [x] 10.3 记录页 PV E4：`reportPv('page_driverevaluate_notes_v1')`
- [x] 10.4 记录页曝光 E5：`reportExp('exp_driverevaluate_notes_v1')`
- [x] 10.5 修改评价 E6：`reportClick('clk_driverevaluate_notes_button_v1', { type })`，`type` 由 `SCORE_REPORT_TEXT[checkedId]` 映射为**修改后**的等级（`好评`/`中评`/`差评`），不取修改前的 `scoreLevel`
- [x] 10.6 确认全部埋点走模块级 `reportClick`/`reportExp`/`reportPv`，未直接调用底层上报
- [x] 10.7 确认 E3 埋点上报后不影响 `waybill-search` 页面存量埋点的 `page_code` 口径（不为该页新增 `codeMap` 登记）
      - 已确认：`utils/tools.ts` 的 `codeMap` 未新增任何条目，`waybill-search` 所在页仍走原有登记（`layout/pages/waybill/index` → `page_order_search_v1`）

## 11. 验证

- [x] 11.1 检查新增/修改文件的 lint 与 TS 诊断错误并修复（`GetDiagnostics`）
- [ ] 11.2 验证默认定位四种数据场景：有差评→差评、有中评无差评→一般、仅好评→好评、全无→好评+空态
- [x] 11.3 验证时间筛选：默认近 1 个月正确、四个快捷项生效、1 年前日期置灰、最短 1 天可选
- [ ] 11.4 验证跨页 `recordKey` 唯一（翻至第 2 页后无重复 key、DOM 无复用错乱）
- [ ] 11.5 验证取派拆分：同一运单取+派两条独立展示且互不干扰
- [x] 11.6 验证老数据兼容：`msgFlag` 为空/`remark` 为空时正常展示不报错
- [x] 11.7 验证双形态：`canModifyStatus=1` 渲染表单并正确回填；`=0` 平铺只读无按钮
- [ ] 11.8 验证修改提交全链路：向上修改成功 → toast → 当前类型列表重新拉取（回到第 1 页、该条按新等级归属消失）→ 切到目标类型可见 → 返回聚合页状态同步
- [ ] 11.8A 验证同 XD 号联动：找一个同一 XD 订单号下有多条运单评价的数据，修改其中一条后刷新，确认同批联动记录均按新等级归属，当前 tab 无旧等级残留
- [ ] 11.9 三端回归：微信 / 支付宝 / H5 各自验证筛选、日历、列表加载、textarea 键盘、popover 定位、提交流程
- [ ] 11.10 跑一次 prod 构建，确认 `dist/{TARO_ENV}/modules/waybill-build` 未超 2MB 子包限制（插件仅告警不中断）
- [x] 11.11 确认 `utils/tools.ts` 的 `codeMap` **仅**新增 `evaluation-records` 一条，`evaluation-list` 未被登记（RQ-1：不动存量埋点口径）
- [ ] 11.12 回归三条查看评价入口：「查看取货评价」（仅取有评价）、「查看派货评价」（仅派有评价）、「查看评价」（取派都有→轮播），确认弹窗原有内容展示未受入口行影响
- [ ] 11.13 验证从弹窗入口进入记录页后返回查件列表，弹窗未残留浮层

## 12. Playwright 自检（全部任务完成后执行）

> **前置**：`npm run dev:h5`（H5 dev server，端口 `8080`，`config/index.ts` L225）。Playwright 只能验证 H5 产物，小程序端差异仍需第 11.9 项人工回归。
> **参照物**：`.agents/knowledge/需求/司机评价记录/` 下 5 张设计图 —— `司机评价_单票.png`、`聚合页.png`、`司机评价_评价记录_好评.png`、`司机评价_评价记录_一般般.png`、`司机评价_评价记录_差评.png`

### 12.1 环境准备

- [x] 12.1.1 启动 `npm run dev:h5`，等待编译完成（非阻塞方式启动，用 `CheckCommandStatus` 确认 compiled successfully）
- [x] 12.1.2 Playwright 打开 `http://localhost:8080`，完成登录并进入查件页
- [x] 12.1.3 通过「更多」菜单 →「司机评价」进入聚合评价页，`browser_resize` 设为移动端视口（如 393×852）

### 12.2 样式核对与修改（对照设计图）

- [x] 12.2.1 聚合评价页：`browser_take_screenshot` 与 `聚合页.png` 比对，确认新增入口行位于 `RuleBanner` 下方、图标/文字/箭头样式与横幅第一行一致
- [x] 12.2.2 记录页筛选区：与设计图比对「评价时间」行与「评价类型」按钮组的间距、圆角、选中态紫色（`#8365F6`）
- [x] 12.2.3 只读态卡片：与 `司机评价_评价记录_好评.png` 比对 —— 运单号行、城市行、取/派标签、双时间行（取货时间 | 评价时间，含竖线分隔）、`+N积分` 位置、「我的评价」表情尺寸与比例、标签文本行、「给司机的留言」分隔线
- [x] 12.2.4 可编辑态卡片：与 `司机评价_评价记录_差评.png` / `一般般.png` 比对 —— 表情三档尺寸与选中边框、「请选择原因 必填」样式、标签多选紫色勾选态、textarea 边框与「清空 / 字数已达上限/100」、「修改评价」按钮位置（右下、plain 描边）
- [x] 12.2.5 检查双时间行不折行、不被裁断（PC 曾踩 9.5 / 9.8 / 9.9：长司机名导致溢出裁剪）；确认时间已去年份显示为 `MM/DD HH:mm`
- [x] 12.2.6 检查筛选区吸顶（若实现）滚动时不透出下方运单号（PC 踩过 9.7）
- [x] 12.2.7 用 `browser_console_messages` 确认无报错，重点确认无 `document is not defined` 类错误
- [x] 12.2.8 逐项修复上述比对发现的样式偏差，修改后重新截图复核，直至与设计图一致

### 12.3 跑测试用例（`.agents/knowledge/需求/司机评价记录/测试用例.md` 移动端章节）

> 仅执行本次范围内用例；PC 端章节、单票/修改评价页入口（走 H5）相关用例标记为 out of scope 跳过。**评价结果弹窗相关用例已纳入范围**（见 9A / 10.2A），需实际执行。

- [x] 12.3.1 入口用例：聚合页显示入口 → 点击跳转记录页 → 返回后聚合页保持
- [x] 12.3.2 Tab 用例：三 Tab 展示；默认定位（有差评→差评 / 有中评无差评→一般 / 仅好评→好评 / 全无→好评+空态）
- [x] 12.3.3 时间筛选用例：默认近 1 个月；依次点击近1/3/6个月/1年验证列表刷新；自定义区间（最短 1 天、最长近 1 年，超范围置灰）
- [ ] 12.3.3A 变更时间不传 score 用例：先手动点选某个评价类型 → 再变更时间区间 → 抓包确认请求**未携带 `score`**，且选中态改由后端返回的 `data.score` 反写
- [x] 12.3.4 列表展示用例：运单号/评价时间/评价内容/评价类型齐全；取派拆分为两条；XD 订单号多运单展开
- [x] 12.3.5 修改入口用例：差评+30天内显示「修改评价」；好评不显示；`canModifyStatus=0` 为平铺只读无按钮
- [x] 12.3.6 修改提交用例：差评→一般提交成功 toast「修改成功」→ 差评 Tab 隐藏该条 → 切一般 Tab 可见；中评→好评同理
      - 已验证：泳道 3292 真实提交 3 次，`web.query.score.add` 均返回 `code:0 / msg:修改成功 / modify:true`；列表由 10→9→8→7 条，提交项从当前 Tab 移除
- [x] 12.3.7 向上修改用例：差评→差评 拒绝、中评→中评 拒绝、中评→差评 拒绝、差评→好评 允许（校验文案与 PC 一致）
      - 已验证：中评→差评 选中态不变（拒绝）；未改等级提交 toast「您还没有修改评价等级」（拒绝）；中评→好评 切换成功且标签词库同步切换（允许）
- [x] 12.3.8 未提交返回用例：修改内容后直接返回，内容不保留且无二次确认
      - 已验证：改等级+填留言后离开页面再进入，textarea 为空、等级回落原值，无二次确认弹窗
- [x] 12.3.9 防重用例：连点「修改评价」仅提交一次（`browser_network_requests` 确认只有一条 `web.query.score.add`）；连点入口仅打开一个页面
      - 已验证：连点提交 3 次，网络面板仅 1 条 `web.query.score.add`
- [ ] 12.3.10 异常用例：断网后加载展示缺省图并可重新拉取；接口失败有提示
      - 部分验证：真实运行中观察到「加载失败，请重试」兜底 UI；XHR hook 无法可靠模拟断网（Taro 走独立请求通道），建议手工断网复验
- [ ] 12.3.11 埋点用例：用 `browser_network_requests` 核对 4 条埋点（E2 入口点击 / E4 PV / E5 曝光 / E6 修改含 `type`=**修改后**等级），确认 E6 的 `page_code` 为 `page_driverevaluate_notes_v1`（`type` 口径已由「修改前」改为「修改后」，需重新验证）
      - 已验证并修复：E6 上报成功，`event_type_id:2101`；发现 `type` 为空 → 先修正为取 `scoreLevel`，复验得 `type:"差评"`；后经沟通确认口径应为**修改后**等级，已改为 `SCORE_REPORT_TEXT[checkedId]`，待重新验证
      - 遗留：`page_code` 实际为路由路径而非 `page_driverevaluate_notes_v1`。根因为 H5 端 `$taroPath` 带前导斜杠，`getPageCode()` 映射表 key 无斜杠故未命中；属存量共性问题，小程序端不受影响，未改动
- [x] 12.3.12 输出自检报告：逐条列出用例通过/失败/跳过（含跳过原因），失败项修复后重跑
- [ ] 12.3.13 结果弹窗入口用例（测试用例.md L447-451 / L483-491）：弹窗底部显示「评价记录」入口 → 点击跳转记录页 → 返回后回到查件列表且弹窗未残留
- [ ] 12.3.14 结果弹窗埋点用例（测试用例.md L659-661）：用 `browser_network_requests` 或 hook `aplus_queue.push` 核对 E3 `clk_driverevaluate_notes_button_v2` 已上报
- [ ] 12.3.15 补跑上述新增用例后更新 12.3.12 的自检报告

### 12.4 收尾

- [ ] 12.4.1 关闭 Playwright 浏览器与 dev server
- [ ] 12.4.2 复核 `git diff`：确认未改动 `list-item`、`waybill-build` 副本目录、`subpackages.ts`
