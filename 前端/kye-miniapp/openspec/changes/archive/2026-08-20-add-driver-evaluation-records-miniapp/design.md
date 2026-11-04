## Context

### 现状

小程序端司机评价能力分布在 `src/modules/kye-miniapp-waybill/src/`（真实源码目录，`waybill-build` 为构建期副本，只读）：

| 页面/组件 | 路径 | 可达性 |
|---|---|---|
| 聚合评价页 | `pages/evaluation-list/index.vue` | ✅ 查件列表「更多」菜单 → `WAYBILL_SEARCH_MENUS` type:6 |
| 待评价卡片 | `pages/evaluation-list/components/list-item/index.vue` | ✅ 聚合页内使用 |
| 单票评价页 | `pages/evaluation-driver-list/` | ❌ 全仓库无跳转引用（卡片「取货/派货评价」实走 H5 `waybillAppH5Url('evaluation-driver-list')` → `openURL`） |
| 提交成功弹窗 | `pages/evaluation-driver-list/components/evaluation-success-dialog/` | ❌ 仅被上述死页面引用，且底部两按钮无 `@click` |
| **评价结果弹窗（单）** | `components/waybill-search/components/evaluation-popup/` | ✅ 查件「更多」→「查看取货评价」/「查看派货评价」→ `viewEvaluation(v, '0'\|'1')` |
| **评价结果弹窗（取+派）** | `components/waybill-search/components/evaluation-popup-all/` | ✅ 查件「更多」→「查看评价」（取派都有时合并）→ `viewEvaluationAll(v)`，`ky-swiper` 两页轮播 |

**「评价记录」页在小程序端完全不存在**，为全新页面。

> **盘点更正（本次补充）**：初版 Context 只检索到 `evaluation-success-dialog` 这一处死代码弹窗，据此判定「小程序端无评价结果弹窗」并将测试用例中「评价结果弹窗-评价记录入口」相关用例列为 out of scope。复核后确认 `components/waybill-search/components/` 下另有 `evaluation-popup` / `evaluation-popup-all` 两个**线上可达**的评价结果弹窗（入口见 `waybill-search/index.vue` 的 `viewEvaluation` / `viewEvaluationAll`），UI 结构与 `evaluation-success-dialog` 同源（同一套背景图 + 司机卡布局），当时漏盘。故结果弹窗入口 **纳入本次范围**，落点为这两个可达弹窗，`evaluation-success-dialog` 仍不激活。

### 与 PC 端的关键差异（决定本设计不能照搬 PC）

PC 的 `add-driver-evaluation-records` 通过给 `driverForm.vue` 加一个 `hideHeader` props 即完成复用，因为 PC 的 `driverForm` **本身已支持 edit 模式**：

```
PC driverForm.vue
  ├─ props: flag('add'|'edit') / scoreStatus / hideHeader
  ├─ onEditData()                       回填 scoreLevel / msgFlag / remark
  ├─ handleCheckOption L218-225         旧 <  新 → 「您选择的等级无法修改」
  └─ onGetParams       L283-290         旧 <= 新 → 「您还没有修改评价等级」
```

小程序端 `list-item/index.vue`（已逐行核实）**不具备任何上述能力**：

```
list-item/index.vue
  ├─ props: 仅 item                     ✗ 无 flag / scoreStatus / hideHeader
  ├─ score = ref(null)                  ✗ 无回填能力
  ├─ select(id)                         ✗ 仅校验「过期不可评价」，无向上修改校验
  ├─ submit()                           ✗ 仅校验 checked 非空
  ├─ 头部强绑 countdownTime / leftTime / 已过期  ← 记录页语义不需要
  ├─ 只读态由 item.isUpdate 驱动         ← 「本次刚评完」而非「历史记录」
  └─ onMounted: document.getElementById  ⚠️ 小程序端无 document
```

全仓库检索「无法修改」「还没有修改评价」零命中 —— 向上修改校验在小程序端从未实现。

### 已确认口径（沿用 PC RQ 表，不再确认）

| 项 | 结论 |
|---|---|
| `scoreLevel` 枚举 | 等同 `score`：`1` 好评 / `2` 一般 / `4` 差评（接口文档示例值 `5` 为笔误） |
| Tab 排序 | 后端控制，前端不二次排序 |
| 积分展示 | 仅卡片头右上 `+N积分`（`scoreNumber`）；「评价成功获得N积分」与 `scoreTips` 不实现 |
| 备注上限 | 100（与存量一致，设计稿 150 不采纳） |
| 「查看评价」 | 不实现具名按钮，`canModifyStatus=0` 即平铺只读态本身 |
| 30天/2次/角色权限/150h过期/XD拆分/100票上限 | 全部后端收敛，前端只认 `canModifyStatus` 0/1 |

## Goals / Non-Goals

**Goals:**
- 新建评价记录页：时间区间筛选 + 三类型筛选 + 卡片列表 + 分页 + 空态/异常缺省
- 新建 `record-item` 组件，承载可编辑/只读双态，并实现向上修改两段拦截（对齐 PC 文案与时机）
- 聚合评价页 `RuleBanner` 下方接入入口
- 评价结果弹窗（`evaluation-popup` / `evaluation-popup-all`）底部接入「评价记录」入口 + 埋点 E3
- 复用 `Addscore` 提交，参数结构与聚合页 `handleSubmit` 一致
- 微信/支付宝/H5 三端可用

**Non-Goals:**
- 不改动 `list-item` 及聚合页评价主链路（零回归）
- 不恢复 `pages/evaluation-driver-list` 与 `evaluation-success-dialog` 的可达性（结果弹窗入口落在 `evaluation-popup` / `evaluation-popup-all`）
- 不实现单票/修改评价页入口（H5 侧）
- 不做 PC 的 `context.pageType` 动态 pageCode 推导（移动端入口恒定）
- 不新增排序/权限相关前端逻辑

## Decisions

### D1：新建 `record-item`，只抽取公共资产，不改造 `list-item`

**选择**：新建 `pages/evaluation-records/components/record-item/`，自行渲染卡片头 + 表情区 + 校验；从 `list-item` 仅复制以下**约束清楚、无状态**的资产：

| 资产 | 来源 | 复用方式 |
|---|---|---|
| 表情三档 `list[]` | `list-item` L169-173 | `4`很糟糕 / `2`一般般 / `1`太棒啦，`evaluationAssets` 图 URL |
| 只读态表情 `emotesMap` | L188-201 | `{1,2,4}` → `{src, text}` |
| 原因标签 `labelList` | L204-215 | `[scoreType][bad|general|very]`，取/派各 6 个 |
| 标签多选组件 | `components/list-check` | 直接 import，含 `showErr` |
| 城市行结构 | L22-33 | 结构与 class 照搬 |
| 取/派标识图 `nameTipsSrc` | L261-265 | 直接复制 |
| 复制运单号 | `@public/utils/copy` `copyText` | 直接用 |

**理由**：`list-item` 是「待评价」语义（倒计时/过期/首次评价/`isUpdate`），记录页是「已评价历史」语义（评价时间/积分/向上修改）。两者头部结构、状态来源、校验规则均不同，改造为双模式会让该组件同时承载两套互斥逻辑，且必须回归聚合页整条评价主链路。新建组件零回归。

**代价**：表情选择与标签联动逻辑出现第二份实现（约 30 行 `select()`）。接受 —— 换取存量零风险。

**备选**：仿 PC 加 `mode='record'` / `hideHeader` → 需回归聚合页主链路，且该组件头部与倒计时强耦合，改造面大于 PC。

**备选**：抽公共表单层供两边共用 → 最干净但同样要动存量聚合页，工量最大，本次不取。

### D2：向上修改两段拦截 —— 移植 PC 逻辑

在 `record-item` 内实现，文案与时机完全对齐 PC：

```
select(id)  ： Number(原 scoreLevel) <  Number(新 id)  → showToast('您选择的等级无法修改')，不改变选中态
submit()    ： Number(原 scoreLevel) <= Number(新 id)  → showToast('您还没有修改评价等级')，不提交

score 值域：1 好评(最优) < 2 一般 < 4 差评(最劣)   ← 数值越小越优，故「向上修改」= 新值必须更小
```

**不置灰选项**（已确认）：设计稿未提供置灰态，且与 PC 交互保持一致。

**四种场景**：差评→好评 允许（跨级）；差评→差评 拒绝（同级）；一般→一般 拒绝（同级）；一般→差评 拒绝（向下）。

### D3：字段适配层 `adaptRecordRow(row, offset, index)`

接口 rows 为扁平结构，需在页面层做一次显式适配，产出 `record-item` 所需数据：

```
records rows[]                  →  record-item
──────────────────────────────────────────────────────────────
canModifyStatus === 1           →  可编辑态：渲染表情区 + 标签 + textarea + 「修改评价」
canModifyStatus === 0           →  只读态：平铺「我的评价」+ 标签文本 + 「给司机的留言」
scoreLevel                      →  原评价等级（回填选中表情 + 向上修改校验基准）
msgFlag                         →  已选标签，逗号切分；【必须兜底为字符串】
remark                          →  备注；【必须兜底为字符串】
scoreType (0取/1派)             →  决定 labelList 词库与取/派标识图
showTime / createTime           →  formatRecordTime() 去年份 → 'MM/DD HH:mm'
scoreNumber                     →  卡片头右上 '+N积分'
orderNumber / waybillNumber     →  提交时 code = scoreType === 1 ? waybillNumber : orderNumber
recordKey                       →  `${waybillNumber}-${scoreType}-${offset + index}`
```

**`msgFlag`/`remark` 兜底为必需**：PC D4 记录了 `undefined.includes` 抛错（老数据兼容场景，测试用例有覆盖）。适配层强制 `?? ''`。

### D4：列表 key 用 `waybillNumber-scoreType-(offset+index)`

取派拆分后同一运单出现两行（`scoreType` 0/1），仅用运单号会导致 DOM 复用错误。

**`offset + index` 而非 `index`**：直接采纳 PC 实测问题 9.1 —— `index` 每页从 0 重算会与前页产生重复 key。`offset = (page - 1) * pageSize`。

存量聚合页用 `data.waybillNumber + data.scoreType + index`（`evaluation-list/index.vue` L25），本页在其基础上修正 index 起点。

### D5：校验红框消除用 `ky-popover` 的 `listenClickId`，禁用 `document`

`list-item` 同时存在两套机制：`ky-popover` 的 `listenClickId="page-evaluation-id"`（L69）与 `onMounted` 里 `document.getElementById(...).addEventListener('touchstart')`（L321-322）。后者在小程序端无 `document`，实际仅 H5 生效。

**选择**：`record-item` 只用 `listenClickId`，指向记录页 `BasePage` 的 id（`page-evaluation-records-id`），不引入 `document`。

### D6：筛选区 —— `ky-calendar` + 重配快捷项

沿用 `components/search-drawer-item` 的 `ky-calendar` 写法：`type="range"` + `:popupable="true"` + `:allowSameDay="true"` + `:options="timeOptions"` + `@confirm`。

**快捷项必须新配**：现有 `timeOptions` 是 近7天/30天/60天/180天/1年，与需求「近1个月/近3个月/近6个月/近1年」不同。在本页 `constant.ts` 定义 `RECORD_DATE_OPTIONS`。

**H5 端注意**：`search-drawer-item` 用 `isView` 分支 + `Teleport` 处理日历挂载（抽屉场景）。记录页是独立页面无抽屉嵌套，直接内联渲染即可，不引入 `Teleport`。

- 默认近 1 个月；`startDate` 限制为 1 年前（超范围置灰）
- 入参 `startDate`/`endDate` 格式 `yyyy-MM-dd`（与出参 `yyyyMMdd HHmm` 是两套格式）
- 评价类型为三选一按钮组（非 `ky-tab`），对应 `score` 1/2/4
- 任一筛选项变更即时查询，无独立「搜索」按钮

### D7：默认 tab 由接口定位，且反写不可触发二次请求

首次进入**不传 `score`**，用出参 `data.score` 反写选中态。

**关键约束**：反写选中态时必须避免因 watch 选中值而再次发起请求（死循环）。用一个 `isScoreTouched` 标记控制是否携带 `score`：

- **首次进入** → 不传 `score`，由后端定位
- **变更时间区间** → **不传 `score`**，由后端在新区间重新定位（须将 `isScoreTouched` 复位为 `false`、`activeScore` 复位为 `null`）
- **用户主动点选类型** → 携带该 `score`
- **修改评价成功后刷新** → 携带当前 `score`（见 D8），避免刷新后跳到别的类型

> 注：与最初设想「用户已点过类型后变更时间仍携带 score」不同。经沟通确认，**只要变更了时间区间就一律交由后端重新定位**，因为新区间下原选中类型可能无数据，携带 score 会直接落到空态。

### D8：修改成功后重新拉取当前 tab 列表（原「就地 splice 移除」已废弃）

- toast「修改成功」→ 调用 `listRef.init()` 重新拉取当前评价类型的第 1 页
- **决策变更原因**：后端存在联动逻辑 —— **同一 XD 号生成的多个运单，修改其中任一运单的评价后，该 XD 号下其它运单的评价会被同步为相同结果**。因此前端仅移除「用户操作的那一条」会导致同批联动记录仍以旧等级留在当前 tab，数据与后端不一致。
- 原方案（按 `recordKey` splice 移除 + 不重查以保留滚动位置）在此联动场景下必然产生脏数据，故整体废弃；不再需要「按 `recordKey` 查下标而非闭包 index」这一防错位处理。
- 代价：`ky-list-standard.init()` 会重置到第 1 页并滚动到顶部，**滚动位置无法保留**。考虑到修改评价是低频操作且数据一致性优先，接受该体验代价。
- 刷新时需将 `isScoreTouched` 置为 `true`，确保重新请求携带当前 `score`，避免退化为「由后端定位默认 tab」而跳到别的类型。

### D9：列表容器用 `ky-list-standard`

与聚合页一致（`:fetch="listFetch"` + `ref.init()`），非查件列表的 `ky-list-virtual`。记录页卡片高度可变且量级不大（分页），无需虚拟列表；`ky-list-standard` 的 `fetch` 契约更简单。

支付宝端注意：聚合页 `:isEmpty="!isALIPAY ? false : isEmpty"`（L19）为早期 `ky-list` 版本的遗留写法，现版 `ky-list-standard` 的 props 已不接收 `isEmpty`，空态由组件内部按 `items.length === 0` 自行判定（`list-standard.vue` L83/L101）。本页**不传 `isEmpty`**，三端表现一致，无需分端处理。

### D10：提交参数与聚合页保持一致

复用 `Addscore`（`web.query.score.add`），参数照 `evaluation-list/index.vue` L170-178：

```
code:   scoreType === 1 ? waybillNumber : orderNumber   ← 派货用运单号，取货用订单号
remark: 备注文本
score:  Number(新选中的 scoreLevel)
type:   scoreType
waybillNumber
flag:   已选标签 join(',')
source: 1
```

`source` 聚合页取 `source.value`（默认 1）。记录页固定传 `1`（RQ-2 已确认，不为记录页分配新值）。

### D11：接口封装位置

在 `apis/waybill-search/index.ts` 新增 `getEvaluationRecords`，与同文件既有 `searchToBeEvaluated`（`web.query.evaluation.searchToBeEvaluated`）、`Addscore` 并列，统一 `appkey: 55262`，返回类型沿用 `IListCommon` 风格但需扩展 `score` 字段。

### D12：埋点 —— 5 条，pageCode 走 route-based codeMap

范围收敛后为 5 条（PC 为 12 条）：

| # | 事件 | 编码 | 位置 |
|---|---|---|---|
| E2 | 聚合页点击「评价记录」 | `clk_multidriverevaluate_notes_button_v1` | `records-entry` |
| E3 | 评价结果弹窗点击「评价记录」 | `clk_driverevaluate_notes_button_v2` | `evaluation-popup` / `evaluation-popup-all` |
| E4 | 记录页页面浏览 | `page_driverevaluate_notes_v1` | 记录页 `reportPv` |
| E5 | 记录页曝光 | `exp_driverevaluate_notes_v1` | 记录页 `reportExp` |
| E6 | 记录页点击「修改评价」 | `clk_driverevaluate_notes_button_v1` + 属性 `type`（**修改后**的等级：`好评`/`中评`/`差评`） | `record-item` 提交 |

**pageCode 不做 PC 的动态推导**：移动端 `getPageCode()`（`utils/tools.ts` L72-88）按当前路由查 `codeMap`，且本次入口恒为聚合页一处（无详情页入口）。仅需登记：

```
'modules/waybill-build/pages/evaluation-records/index': 'page_driverevaluate_notes_v1'
```

**仅登记新页面，不登记 `evaluation-list`**（RQ-1）：E2 的 `page_code` 保持为原始路径。为聚合页登记 `page_order_search_v1` 会改变该页存量埋点 `clk_order_search_multidriverevaluate_ruler_button_v1` 的 `page_code`，影响既有数据口径，故不做。

**PC 的 E1/E6 编码冲突在移动端不存在**：E1（单票页入口）走 H5 不在本仓库，`clk_driverevaluate_notes_button_v1` 本次唯一使用者是 E6，数据侧无歧义。

### D13：子包页面注册方式

`src/subpackages.ts` 由 `@kye-netc/miniapp-plugins` 自动生成（文件头有「请勿手动修改删除」），插件扫描子应用 `src/pages/*/index` 自动收录。

**只需在 `src/modules/kye-miniapp-waybill/src/pages/` 下建目录**，不改 `subpackages.ts`、不改 `subpackagesConfig.ts`。

`index.config.ts` 对齐 `evaluation-list`：原生导航 + 标题「评价记录」。

### D14：结果弹窗入口落在 `evaluation-popup` / `evaluation-popup-all`

**决策**：在两个弹窗的关闭按钮上方新增一行「评价记录 >」入口，点击后关闭弹窗并 `navigateTo` 记录页，同时上报 E3 `clk_driverevaluate_notes_button_v2`。

**为何不落在 `evaluation-success-dialog`**：该组件仅被死页面 `evaluation-driver-list` 引用，底部两按钮连 `@click` 都没有；激活它需要先恢复整条单票页链路（而单票评价实际走 H5），改造面远超本 change 范围。而 `evaluation-popup` / `evaluation-popup-all` 是用户查看历史评价的**实际可达路径**，语义与「评价记录」天然衔接。

**两个弹窗都要加**：`viewEvaluation`（取或派单条）与 `viewEvaluationAll`（取+派轮播）由后端 `viewDeliveryScoreFlag` / `viewPickupScoreFlag` 的 showStatus 组合决定走哪个，用户视角是同一个「查看评价」动作，入口必须一致。`evaluation-popup-all` 的入口置于 `ky-swiper` 外层（与 `__close` 同级），避免两页各出现一次。

**跳转前先关弹窗**：`show.value = false` 再 `navigateTo`，否则从记录页返回查件列表时弹窗仍浮在页面上（`ky-overlay` 不随路由销毁）。

**入口交互复用 `records-entry` 的防重模式**：`navigating` ref 标志位 + `complete` 回调延时重置，避免连点开多页。但**不复用 `records-entry` 组件本身** —— 该组件文案为「查询更多历史评价内容，请点击 评价记录 >」并绑定 E2 埋点，与弹窗内的纯入口 + E3 埋点语义不同。


## Risks / Trade-offs

| 风险 | 缓解措施 |
|---|---|
| `scoreLevel` 实际枚举与 `score` 不一致 → 表情回填与向上修改校验双双静默失效 | 已由 PC RQ-1 确认等同；适配层加断言，未匹配到 `list[]` 时 `console.warn` |
| 老数据 `msgFlag`/`remark` 为空 → `.includes`/切分抛错 | D3 适配层强制兜底字符串（测试用例「新老数据兼容」有覆盖） |
| 表情/标签联动逻辑出现第二份实现，未来与 `list-item` 产生行为漂移 | 接受（D1 权衡）；`labelList` / `emotesMap` / `list[]` 从 `list-item` 复制时保持结构一致，便于后续抽取 |
| 向上修改为新写逻辑，与 PC 行为可能出现细微差异 | 严格按 D2 的两个比较运算符（`<` 与 `<=`）与文案实现，提测时与 PC 逐条对齐四种场景 |
| `record-item` 若误用 `document` → 小程序端白屏/报错 | D5 明确禁用；实施时全文检索 `document.` 确认为零 |
| 默认 tab 反写触发二次请求 → 死循环 | D7 用 `isTabTouched` 标记；反写走赋值而非模拟点击 |
| 翻页 `recordKey` 重复 → DOM 复用错乱 | D4 用 `offset + index`（PC 9.1 已踩） |
| 异步 splice 索引错位 | D8 按 `recordKey` 查下标（PC 9.2 已踩） |
| 支付宝端空态表现异常 | D9 照抄聚合页 `!isALIPAY ? false : isEmpty` 分端处理 |
| 新增页面推高 `waybill-build` 子包体积（2MB 上限，插件仅告警不中断） | 提测前跑一次 prod 构建确认 `dist/{TARO_ENV}/modules/waybill-build` 未超限 |
| 在 `waybill-build` 副本目录改代码 → 下次构建被覆盖 | 所有改动只落在 `src/modules/kye-miniapp-waybill/src/` |
| 三端表现差异（日历、textarea 键盘、popover 定位） | 微信/支付宝/H5 三端各自回归筛选与提交流程 |
| 结果弹窗为存量组件，加入口可能影响原有布局（`evaluation-popup-all` 内含 `ky-swiper` 固定 `:height="406"`） | 入口置于 `ky-swiper` 外层不侵入轮播内部；改动后回归「查看取货评价」「查看派货评价」「查看评价」三条入口的原有展示 |
| 弹窗内 `navigateTo` 后返回，`ky-overlay` 未随路由销毁导致弹窗残留 | D14 明确跳转前先 `show.value = false` |

## Resolved Questions

以下事项已确认，作为实施依据：

| # | 问题 | 结论 |
|---|---|---|
| **RQ-1** | E2 上报时 `page_code` 落在哪个编码下？ | **不动存量**。`evaluation-list` 保持不登记在 `codeMap`，E2 的 `page_code` 即为原始路径 `modules/waybill-build/pages/evaluation-list/index`。SHALL NOT 为其登记 `page_order_search_v1` —— 那会改变该页已有埋点 `clk_order_search_multidriverevaluate_ruler_button_v1` 的 `page_code`，影响存量数据口径。本次仅登记新页面 `evaluation-records`。 |
| **RQ-2** | `source` 字段是否需要为记录页单独取值？ | **暂固定传 `1`**（与聚合页默认值一致，见 D10）。不为记录页分配新值；若后续数据侧需区分「记录页修改」与「聚合页首评」，另行提需求由后端分配。 |

## Open Questions

（无。所有开放性问题均已确认，见上表。）
