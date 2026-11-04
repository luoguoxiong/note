## Context

"给取货司机捎句话"能力已存在于填单首页：

- 组件 `order-public/components/business/message-to-driver/index.vue`（KyCell 卡片 + 弹窗），弹窗复用 `waybill-remark/components/modalContent.vue`（KyTextarea 150 字 + SlideTagList 历史标签 + `#extra` 高频词插槽 HighFrequencyWordWrapper）。
- 状态完全耦合 pinia store：`hooks/index.ts` 的 `useState()` 在弹窗"确定"时直接 `order.updateOrderByType(MessageToDriver, {orderRemark, driverHighFrequencyWords})` 并 `remoteCheck('messageToDriver')`；`useData()` 从 store 读留言（order store）与高频词/历史标签（schema store dimension data）。
- 首页由 schema 渲染器按铸剑配置 `module.MessageToDriver.v/visible` 控制显隐。

取货资料页 `order-public/components/business/pickup-information/page/index.vue` 是独立路由页（`/pickup-information`），区块为硬编码 CardBlock（取货联系人/委托书/货物照片），显隐受 `PickupInformation.config.fieldsConfig` 控制；【提交】按钮执行 validate → 上传文件 → `updateFormData()` 写 `PickupInformation` 模块 → `router.back()`。离开页脏检查 `isFormSame()` 仅对比联系人四字段 + 文件列表差异。

约束：

- 真实源码在 `src/modules/kye-miniapp-order/src/order-public/`，`order-build-sub-pages/order-public/` 是构建副本，禁止改副本。
- PRD 要求：取货资料页内留言**必须点【提交】才生效**；左上角返回不保存留言，且留言变更**不**触发"是否保存当前数据"二次确认。
- 留言字段 `messageToDriver: { orderRemark: string; driverHighFrequencyWords: string[] }`、高频词/历史标签维度数据、150 字限制等均已存在，本次不新增接口、不新增配置项。

## Goals / Non-Goals

**Goals:**

- 取货资料页（下单/修改运单场景）新增捎句话入口区块，弹窗交互与首页完全一致（高频词、历史标签追加/删除、手动输入、字数计数）。
- 页内留言为临时态：弹窗"确定"只更新页内状态；点【提交】才写入 store；返回丢弃且不触发保存确认弹窗。
- 填单首页与取货资料页留言双向同步；寄件模板默认留言两处自动填充。
- 区块显隐跟随铸剑 MessageToDriver 模块开关。
- 首页"取货信息"卡片与寄件人信息页入口外显文案按 PRD 优先级调整。
- 取货资料页内捎句话埋点事件码/属性不变，页面编码为 `page_express_pickup_v1`。

**Non-Goals:**

- 查件场景取货资料页（page-waybill）不加入口。
- 批量寄场景不覆盖。
- 高频词/历史标签取值规则、清空历史标签等既有能力不改。
- 不新增后端接口、不新增铸剑配置项。

## Decisions

### D1：抽离 DriverMessageModal 共用弹窗组件，message-to-driver 与取货资料页共用

弹窗内的高频词多选、历史标签追加（有内容前置"，"）、截断 toast、字数统计、删除标签、弹窗内埋点等逻辑全部沉淀在原 message-to-driver + modalContent 中。为避免"一个组件两套数据流"，**新建** `message-to-driver/components/DriverMessageModal.vue`：

- 把弹窗本体（ModalContent + #extra 高频词插槽 + 150 字限制 + onQuickFill/onInput/onBlur + 确定/关闭/曝光等弹窗内埋点）整体迁入，1:1 保持原有交互与埋点事件码。
- props：`visible`（v-model）、`remark`（打开时初始化输入框）、`highWords`（已选高频词 code，打开时初始化多选态）、`reportPageCode?`（埋点 page\_code 覆盖，不传走路由映射）；emits：`update:visible`、`confirm({ orderRemark, driverHighFrequencyWords })`。
- 组件**不读写 store 的留言内容**：历史标签/高频词维度数据仍实时读 schema store（跨场景共享）；留言内容与选中态由调用方通过 props 传入、confirm 回调抛出。历史标签删除/清空仍走 modalContent 既有接口与 schema 更新（属标签库管理，非留言内容）。

两个调用方：

- **message-to-driver/index.vue（首页，行为不变）**：KyCell 卡片 + KyReport 曝光 + `DriverMessageModal`；confirm 回调里执行原首页逻辑——`updateOrderByType(MessageToDriver, ...)` + `remoteCheck('messageToDriver')`（由 `hooks/useState` 提供）；`remark/highWords` 从 store 读取（`useData`）。首页入口点击埋点 `clk_express_driver_v1`、曝光 `exp_express_driver_v1` 保留在 message-to-driver 内。
- **取货资料页**：见 D2，confirm 回调只更新本地 draft。

被否决方案：① 给 message-to-driver 加 `defer` 模式——一个组件承担"直写 store"和"暂存"两套数据流，分支污染首页稳定组件；② 在取货资料页内基于 ModalContent 另写一套弹窗——高频词/标签/字数/埋点逻辑重复，后续规则改动需双处维护。

### D2：取货资料页持有留言临时态，提交时统一写 store

- 页面 setup 时从 `order.moduleFormData(MessageToDriver)` 读取 `{ orderRemark, driverHighFrequencyWords }` 初始化本地 draft（页面每次路由进入重新 setup，天然拿到最新 store 值，含寄件模板重置后的默认值）。
- 模板中在货物照片 CardBlock 之后渲染捎句话入口区块（CardBlock 卡片：紫竖条标题 + 右侧"请填写 >"/已填内容 + 点击打开弹窗），弹窗用 `<DriverMessageModal v-model:visible reportPageCode="page_express_pickup_v1" :remark="draft.remark" :highWords="draft.words" @confirm="onDriverMessageConfirm" />`；confirm 回调只更新本地 draft，不写 store。
- 显隐：新增 computed 从 schema store 读取 MessageToDriver 模块 visible（与渲染器 `getModuleVisible` 同规则：visible ?? v），并与"取货资料"配置开启状态同时满足才展示。
- 提交链路（已确认）：`updateFormData()` 在现有 `updateOrderByType(取货资料, ...)` 之后，追加 `updateOrderByType(给司机捎句话, draft)`；随后在 `router.back()` 之前补调一次 `remoteCheck('messageToDriver')`（复用提交按钮既有 loading 态）——首页 useDidShow 无补 check 逻辑，且 messageToDriver 属于 `preloadWaybill` 的 `triggerWaybillKeys` 白名单，补调可对齐首页"确定"后的校验结果分发、维度联动与运单预加载（preloadOrderData）。
- 高频词/历史标签维度数据仍实时读 schema store（跨场景共享）；**历史标签删除/清空仍立即生效**（属标签库管理，走既有接口与 schema 更新，不属于"留言内容"临时态范畴）。

### D3：返回拦截与脏检查不纳入留言

- `isFormSame()` 与文件 diff 逻辑**不改**：留言 draft 不进入对比，故左上角返回/useUnload 时留言变更不会触发"您是否要保存当前数据？"弹窗；未点【提交】的留言随页面销毁自然丢弃。符合 PRD 5.1.5①。

### D4：填单首页"取货信息"卡片外显文案（入口 A）

PRD 5.1.2(二)③ 涉及两个入口，经与产品确认范围如下：

- **入口 A（本次实施）**：填单首页"取货信息"卡片（`business/pickup-information/index.vue`，KyCell 的 `dispatchName`）。
- **入口 B（判断逻辑补充，文案不变）**：填写寄件人信息页 sender-page 内的"取货信息"入口行（`ui/address-unfold/components/delegate-pick/index.vue`，由 `address-unfold/index.vue` 的 `<DelegatePick v-if="showPickup" />` 渲染）。更新后 PRD 5.1.2(二)③ 明确：外显两态保持现状（未填写右侧"去添加"、已填写右侧固定"已添加"，不拼接摘要、左侧说明文案"取货联系人信息、取货照片/资料"不动），但\*\*"已添加"判断需纳入捎句话\*\*：取货联系人（person/mobile/telephone）、上传资料（uploadNum/cargoImgUploadNum）、给司机捎句话（`formatDriverMessageText` 非空）三者任意一个已填写即返回"已添加"。现状 `cellName`（delegate-pick/index.vue:30-41）只判断前两项，需补第三项。

**捎句话段拼接逻辑抽取为纯函数复用**：message-to-driver 组件内 `cellValue` 的规则抽取为独立纯函数（如 `formatDriverMessageText(orderRemark, highWordCodes, highWordList)`），供入口 A 摘要、捎句话区块/卡片自身外显共用，避免规则分叉。

- **逗号对齐 PRD（含一处既有行为修正）**：PRD 规定多个高频词之间、高频词与手动录入之间用\*\*中文逗号"，"\*\*隔开；弹窗内历史标签追加（onQuickFill）现状已是中文"，"。但捎句话区块/卡片外显 `cellValue` 现状误用半角逗号（`map(value).join(',')`、`${word},${value}`）。抽取纯函数时统一为中文"，"，首页捎句话卡片外显随之由 `提前联系,货物防潮` 变为 `提前联系，货物防潮`——该变化为对齐 PRD 的修正，回归时关注。
- **入口 A 摘要格式（现有逻辑不动，仅末尾追加捎句话段）**：
  ```
  摘要 = [现有摘要, 捎句话段].filter(非空).join('/')   // 段间分隔符为半角斜杠 "/"
  ```
  - **现有摘要（完全保持现状，不改顺序、不改内容）** = `[资料段?, 姓名?, 手机号?, 固话段?].filter(非空).join('/')`
    - 资料段 = 委托书文件数 + 货物照片数合计 `num > 0` 时为 `已上传${num}份文件`，否则不出现（沿用现有 uploadNum + cargoImgUploadNum 口径）
    - 固话段 = 有分机号时 `${固话}-${分机号}`，无分机号时为 `${固话}`
    - 即现状：`已上传3份文件/张三/13800001111/0755-1234`
  - **捎句话段** = `formatDriverMessageText(...)`：
    - 选中的高频词按 `sort` 升序取其 `value`，用中文逗号"，"拼接；
    - 手动录入 `orderRemark`（trim 后）非空时以中文逗号"，"连接在高频词之后；无高频词则直接为手动录入内容；
    - 两者皆空返回空串
  - 现有摘要与捎句话段全部为空 → 返回空串，KyCell 继续显示既有 placeholder"添加取货联系人信息、取货资料"（不动）
  - 示例：
    - 全填：`已上传3份文件/张三/13800001111/0755-1234/提前联系，货物在仓库东门`
    - 仅资料+联系人（无留言）：`已上传3份文件/张三/13800001111/0755-1234`（与改前完全一致）
    - 仅联系人+留言：`张三/13800001111/提前联系，货物防潮`
    - 仅资料：`已上传2份文件`（与改前完全一致）
    - 仅留言（高频词+手动）：`提前联系，货物防潮`
- 与改前对比（入口 A 现有逻辑）：改前为 `已上传N份文件/姓名/手机/固话-分机` 且不含捎句话；改后**该部分原样保留**，仅在留言非空时于末尾追加"/捎句话段"；仅留言场景改前显示占位文案、改后显示留言。
- 捎句话段仅在 MessageToDriver 模块配置开启（visible）且留言非空时参与拼接；配置隐藏或留言为空时该段为空串，摘要自然不含捎句话。
- 超长截断沿用 KyCell 既有 maxLen 行为，不新增样式。
- message-to-driver 组件的 defer 改造对首页现有捎句话卡片零影响（不传 defer 时行为完全不变）；入口 A 摘要读取的是 store 已提交数据，与取货资料页 draft 无关。

### D5：取货资料页捎句话区块样式规范（依据设计稿 + 现有 CardBlock 实现）

新增区块在取货资料页内**复用现有** **`CardBlock`** **组件**（与"取货联系人/委托书/货物照片"同容器样式），不引入新卡片形态。样式特征逐条如下（单位均为设计稿 px，打包自动转换）：

**页面容器（现状沿用，page/index.module.scss）**

- 页面背景 `#f1f2f7`（`$bg-page`）；内容区左右 padding `20px`；底部为固定【提交】按钮栏（白底、安全区适配），区块随内容区滚动。

**卡片容器（按设计稿，本区块在页面 scss 覆盖）**

- 背景白色 `#fff`；圆角 `24px`；卡片间垂直间距 `margin: 20px 0`（首张 margin-top 20px）；
- 内边距按设计稿 **`padding: 28px 24px`**（注意 CardBlock 组件现状为 `32px 24px 0`、且默认无下内边距靠内容撑开；本区块无内容区，需在 `page/index.module.scss` 通过类名覆盖为 `padding: 28px 24px`，使标题行垂直居中）；
- 整卡可点击（点击打开捎句话弹窗），无边框、无阴影。

**标题行（CardBlock 现状）**

- 标题文案"给取货司机捎句话"，字号 `32px`（`$fs-level2`）、行高 `44px`、字重 `600`（`$font-bold`）、颜色 `#03050d`（`$text-color-level1`）；
- 标题左侧紫色竖条：`::before` 绝对定位于 `left: 0`、宽 `8px`、高 `32px`、背景 `#8365f6`、右侧圆角 `border-radius: 0 4px 4px 0`，垂直居中于标题行；
- 标题文字 `margin-left: 24px`——因竖条 absolute 宽 8px，视觉上文字距竖条为 `24 - 8 = 16px`，符合设计稿，**无需改动**。

**右侧内容区（right-slot，本次新增）**

- 布局：标题行右侧，垂直居中；结构为 `[文案] + [右箭头图标]`，两者水平排列、间距 `8px`；
- 未填写：文案"请填写"，灰色（对齐页内静默文案，用 `$text-color-level3: #ADB0B8` 或与输入框 placeholder 一致，实现时与设计稿取色核对）；
- 已填写：文案为捎句话段内容（高频词+手动录入），颜色同正文深色 `#03050d`；超长单行省略号截断（`flex: 1; min-width: 0; text-overflow: ellipsis; white-space: nowrap; text-align: right`）；
- 右箭头：灰色右箭头图标，复用现有 SvgIcon `right-arrow-gray`（coupon/cell 已使用），尺寸约 `24px`；**无论是否已填写箭头均展示**（设计稿"请填写 >"与已填写态都有箭头，表示可进入）；
- 本区块**无 tip 副标题、无"清空"、无"委托书说明"式右上角操作**。

**与其他卡片的一致性**

- 区块位置：货物照片 CardBlock 之后、提交按钮栏之前，随 `v-if`（取货资料模块开启 && MessageToDriver 模块 visible）渲染；
- 不新增 scss 文件：卡片样式全部复用 CardBlock；仅在 `page/index.module.scss` 新增该区块的底部 padding 与右侧文案/箭头/截断的少量类名（遵循样式独立 scss 规范，写在现有 module.scss 内）。

### D6：埋点页面编码覆盖机制

- 现状：`reportUmp/util/index.ts` 的 `getEventParams()` 末尾强制 `eventParams.page_name = getPageCode(); eventParams.page_code = eventParams.page_name`，路由为取货资料页时映射为 `page_express_single_entrusted_pickup_v1`，显式传参也会被覆盖。
- 改造：`getEventParams()` 调整为 `eventParams.page_code = params.page_code || getPageCode()`（显式 page\_code 优先）；message-to-driver 及其弹窗链路（modalContent 内的埋点、hooks/report、report/messageTodriver.ts 的调用）在 defer 模式下将 `reportPageCode` 透传进各上报参数。
- 取货资料页自身 PV 与既有取货资料埋点仍上报 `page_express_single_entrusted_pickup_v1`，不受影响；仅捎句话组件在该页触发的事件携带 `page_express_pickup_v1`。
- 事件编码与属性（clk/other/exp 各事件、remark\_msg 等）完全不变。

## Risks / Trade-offs

- \[共用 ModalContent 透传 reportPageCode 可能影响运单备注场景] → reportPageCode 默认 undefined，非 defer 场景不传该参数，getEventParams 回退路由映射，行为与现状完全一致；回归运单备注弹窗埋点。
- \[defer 模式下用户删了历史标签后返回，标签删除已生效但留言未保存，语义可能困惑] → 历史标签删除是标签库管理能力（PRD 引用既有"清空历史标签"需求），两处入口均应立即生效，属预期；测试用例覆盖该组合操作。
- \[提交时补 remoteCheck 增加一次 check/process 请求] → 已确认需要：与首页"确定"行为对齐，且承载运单预加载（preloadOrderData）；请求复用提交按钮 loading，失败不阻塞提交结果（留言已写 store），仅打印日志。
- \[留言 draft 初始化为一次性快照，若用户在取货资料页停留期间首页数据被其他途径更新不会同步] → 该页为模态式填写页（提交即返回），无并发编辑入口，风险可接受。
- \[铸剑未开启 MessageToDriver 时取货资料页不展示区块] → 显隐完全跟随配置，灰度通过铸剑开关控制，无需发版回滚。

## Migration Plan

- 无数据迁移、无接口变更。
- 上线后由铸剑下单配置控制 MessageToDriver 模块显隐完成灰度；关闭配置即回滚到无入口状态。
- 埋点页面编码 `page_express_pickup_v1` 已在埋点平台注册，无需额外申请。

## Open Questions

无（已全部收敛）：

1. ~~提交后是否补 remoteCheck~~ → 已确认补调，见 D2。
2. ~~批量寄是否覆盖~~ → 不覆盖。
3. ~~寄件人信息页入口/首页取货信息卡片文案~~ → 本次不改，范围仅限取货资料页，见 D4。
4. ~~page\_express\_pickup\_v1 埋点注册~~ → 已注册。

