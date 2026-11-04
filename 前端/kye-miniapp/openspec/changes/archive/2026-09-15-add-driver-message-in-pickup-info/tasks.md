## 1. 抽离 DriverMessageModal 共用弹窗组件

- [x] 1.1 新建 `message-to-driver/components/DriverMessageModal.vue`：把弹窗本体（ModalContent + #extra 高频词插槽 HighFrequencyWordWrapper + 150 字限制 + onQuickFill/onInput/onBlur + 确定/关闭/曝光等弹窗内埋点）整体迁入，1:1 保持交互与埋点事件码；props 为 `visible`(v-model)、`remark`、`highWords`(string[] 已选 code)、`reportPageCode?`，emits 为 `update:visible`、`confirm({orderRemark,driverHighFrequencyWords})`；留言内容/选中态不读写 store（由调用方传入/接收），历史标签与高频词维度数据仍实时读 schema store
- [x] 1.2 重构 `message-to-driver/index.vue`：移除自管弹窗逻辑，改为 KyCell 卡片 + KyReport 曝光 + `DriverMessageModal`；confirm 回调执行原首页逻辑（`hooks/useState` 的 `onConfirm`：updateOrderByType + remoteCheck）；`remark/highWords` 从 `useData`(store) 读取；首页入口点击/曝光埋点、cellValue 外显保持不变
- [x] 1.3 简化 `message-to-driver/hooks/index.ts`：`useState` 仅保留 modalShow 与首页 onConfirm(写 store+remoteCheck)，`useData` 从 store 读取；历史标签删除/清空仍走 modalContent 既有接口与 schema store 更新（立即生效）

## 1b. 取货资料页捎句话区块样式（design D5，1:1 对齐设计稿）

- [x] 1.4 捎句话区块复用 CardBlock：标题"给取货司机捎句话"，紫竖条/32px 字号/24px 圆角/20px 间距继承 CardBlock 现状；本区块无内容区，在现有 `pickup-information/page/index.module.scss` 新增类名把容器 padding 覆盖为设计稿 `28px 24px`（组件现状为 `32px 24px 0`），使标题行垂直居中（不新增 scss 文件、竖条 absolute + 标题 margin-left:24px 现状不动，视觉距竖条 16px）
- [x] 1.5 CardBlock `#right-slot` 实现右侧内容：`[文案] + SvgIcon(name="right-arrow-gray", 约24px)` 水平排列、间距 8px；未填写灰色"请填写"（取色与设计稿/placeholder 核对），已填写深色（#03050d）捎句话段单行省略号截断（`flex:1; min-width:0; text-overflow:ellipsis; white-space:nowrap; text-align:right`）；箭头两态均展示；整卡点击打开 defer 弹窗；无 tip、清空或右上操作

## 2. 取货资料页接入捎句话区块

- [x] 2.1 在 `pickup-information/page/index.vue` 货物照片 CardBlock 后新增捎句话入口区块（CardBlock），弹窗用 `DriverMessageModal`（`reportPageCode="page_express_pickup_v1"`，remark/highWords 绑定本地 draft）
- [x] 2.2 页面初始化时从 `order.moduleFormData(MessageToDriver)` 读取留言创建本地 draft（orderRemark、driverHighFrequencyWords）
- [x] 2.3 新增区块显隐 computed：同时满足取货资料配置开启与 schema 中 MessageToDriver 模块 visible（按 getModuleVisible 同规则 visible ?? v）
- [x] 2.4 处理弹窗 `confirm` 事件：更新 draft 与入口外显，不写 store
- [x] 2.5 `updateFormData()` 提交链路追加 `updateOrderByType(给司机捎句话, draft)`；提交成功后、`router.back()` 之前补调 `remoteCheck('messageToDriver')`（复用提交按钮 loading，失败不阻塞提交结果，仅打印日志）
- [x] 2.6 确认 `isFormSame()` 与离开页脏检查不包含留言字段（仅联系人 + 文件），留言变更不触发"是否保存当前数据"弹窗
- [x] 2.7 提交失败（校验/上传失败）场景下 draft 内容保留在页面中
- [x] 2.8 确认查件版 `page-waybill/index.vue` 不引入该区块

## 3. 首页"取货信息"卡片外显文案（入口 A；入口 B 产品确认不改）

- [x] 3.1 抽取捎句话段拼接纯函数 `formatDriverMessageText`（高频词按 sort 升序取 value、中文逗号"，"拼接；手动录入 trim 后以"，"接在其后；无高频词直接取手动录入；皆空返回空串）；message-to-driver 组件 `cellValue` 改为复用——**注意：现状 cellValue 用半角逗号，本次统一为中文逗号"，"（对齐 PRD，首页捎句话卡片外显随之变化，回归关注）**
- [x] 3.2 调整 `business/pickup-information/index.vue` 的 `dispatchName`：**现有拼接逻辑与顺序保持不变**（`已上传N份文件/姓名/手机/固话-分机`），仅在结果末尾按 `[现有摘要, 捎句话段].filter(非空).join('/')` 追加捎句话段；全空返回空串沿用既有 placeholder；KyCell 截断不变
- [x] 3.3 捎句话段仅在 MessageToDriver 配置开启（visible）且留言非空时参与拼接；配置隐藏时摘要不含捎句话
- [x] 3.4 修改 `ui/address-unfold/components/delegate-pick/index.vue` 的 `cellName`（现状 delegate-pick/index.vue:30-41 只判断 uploadNum/cargoImgUploadNum 与 person/mobile/telephone）：**文案两态与模板样式不动**，"已添加"判断增加捎句话条件——`formatDriverMessageText` 结果非空（且 MessageToDriver 模块开启）也返回"已添加"；三者任一已填写即"已添加"
- [x] 3.5 按 spec 各场景示例（全填/无留言与现状一致/仅联系人+留言/仅资料/仅手动留言/模块隐藏）逐一对账入口 A 输出文案；验证入口 B：仅留言时"已添加"、全无"去添加"、已填写时仍固定"已添加"无摘要

## 4. 埋点页面编码

- [x] 4.1 改造 `reportUmp/util/index.ts` 的 `getEventParams()`：显式传入的 `page_code` 优先于 `getPageCode()` 路由映射（默认行为不变）
- [x] 4.2 message-to-driver 组件及其弹窗链路（modalContent 内事件、hooks/report.ts、report/messageTodriver.ts 调用）在 defer 模式下将 `reportPageCode`（`page_express_pickup_v1`，已在埋点平台注册）透传至所有捎句话事件参数
- [x] 4.3 验证取货资料页自身 PV 与取货资料既有埋点 page_code 仍为 `page_express_single_entrusted_pickup_v1`，首页捎句话埋点 page_code 不变

## 5. 同步与回归验证

- [ ] 5.1 验证双向同步：首页留言→进入取货资料页展示一致；取货资料页提交→首页捎句话卡片与"取货信息"卡片摘要展示一致；有→无/无→有场景
- [ ] 5.2 验证寄件模板默认留言：选择带默认捎句话的模板进入下单页，两处入口均自动填充
- [ ] 5.3 验证首页"取货信息"卡片外显：未填写占位；无留言时与现状完全一致（`已上传N份文件/姓名/手机/固话-分机`）；有留言时末尾追加"/捎句话段"（中文逗号）；捎句话模块隐藏时不含留言
- [ ] 5.4 验证寄件人信息页入口行：文案两态不变（"去添加"/固定"已添加"、无摘要）；仅填写捎句话留言时右侧显示"已添加"（新增判断）；联系人/资料/留言全无仍为"去添加"
- [ ] 5.5 回归首页捎句话弹窗全部交互（高频词多选、历史标签追加"，"规则、150 字截断与 toast、删标签/清空、关闭恢复）
- [ ] 5.6 回归运单备注弹窗（共用 ModalContent）埋点与交互不受影响
- [ ] 5.7 微信小程序与支付宝小程序双端验证区块样式（卡片间距/圆角/竖条/右侧"请填写 >"占位/已填截断）、弹窗、提交与返回拦截，并对照设计稿走查
- [ ] 5.8 修改运单（预约取货）场景验证入口与数据提交
