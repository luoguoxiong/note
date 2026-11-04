## ADDED Requirements

### Requirement: 查件卡片评价入口原生化

查件列表卡片（`components/waybill-search`）的「取货评价 / 派货评价 / 修改取货评价 / 修改派货评价」动作 SHALL 通过 `Taro.navigateTo` 进入原生司机维度评价页 `/modules/waybill-build/pages/evaluation-driver-list/index`，SHALL NOT 再打开 H5 webview。路由参数 SHALL 为 `flag=add|modify`（add 对应 operateType=20，modify 对应 operateType=10）、`waybillNo`（运单号）、`orderNo`（订单号透传）、`scoreType=0|1`（0=取货司机、1=派货司机）。

#### Scenario: 查件列表卡片点击取货评价

- **WHEN** 用户在查件列表卡片点击「取货评价」（或「修改取货评价」）
- **THEN** 系统 SHALL 以 `Taro.navigateTo` 打开原生司机维度评价页
- **AND** 路由参数 SHALL 携带 `flag=add`（修改时为 `modify`）、该运单的 `waybillNo` 与 `orderNo`、`scoreType=0`
- **AND** 系统 SHALL NOT 调用 `openURL` 打开 H5 离线包页面

#### Scenario: 查件列表卡片点击派货评价

- **WHEN** 用户在查件列表卡片点击「派货评价」（或「修改派货评价」）
- **THEN** 行为同取货评价，且 `scoreType=1`

#### Scenario: 评价完成返回查件列表自动刷新

- **WHEN** 用户在原生评价页完成评价后返回查件列表
- **THEN** 查件列表 SHALL 在页面重新展示时自动刷新（保留 `needRefresh` + `useDidShow` 机制）
- **AND** 卡片按钮状态（待评价/已评价/修改评价）SHALL 正确更新

### Requirement: 搜索结果卡片评价入口原生化

搜索结果卡片（主仓 `src/modules/search/components/search-result/waybill-list.vue`）的「取货评价 / 派货评价 / 修改取货评价 / 修改派货评价」动作 SHALL 与查件列表卡片行为完全一致：`Taro.navigateTo` 进入原生司机维度评价页，参数拼装规则一致。

#### Scenario: 搜索结果卡片点击评价动作

- **WHEN** 用户在搜索结果卡片点击取货/派货评价或修改评价
- **THEN** 系统 SHALL 以 `Taro.navigateTo` 打开原生司机维度评价页
- **AND** 路由参数规则与查件列表卡片一致
- **AND** 系统 SHALL NOT 再拼接 `/h5-offline/netc-h5-order-offline/#/evaluation-driver-list` 路径

### Requirement: 单票评价与成功弹窗

司机维度评价页对单票评价（列表仅 1 票待评价）提交成功后，系统 SHALL 立即弹出评价成功弹窗（触发时机对齐 H5 `list.length === 1` 判断，SHALL NOT 以「全部评完（rowTotal 减到 0）」为触发条件）。弹窗 SHALL 展示评价成功文案、获得积分、scoreTips 提示、司机信息与提交时间；弹窗内富文本 SHALL 使用 rich-text 安全渲染。

#### Scenario: 仅 1 票待评价时提交成功

- **WHEN** 列表仅 1 票待评价运单且用户提交评价成功
- **THEN** 系统 SHALL 立即弹出评价成功弹窗
- **AND** 弹窗 SHALL 展示获得积分与提示文案

#### Scenario: 弹窗「返回列表」按钮

- **WHEN** 用户点击成功弹窗的「返回列表」
- **THEN** 系统 SHALL 执行 `Taro.navigateBack()` 返回上一页

#### Scenario: 弹窗「继续评价」按钮显隐与跳转

- **WHEN** 成功弹窗展示
- **THEN** 「继续评价」按钮 SHALL 仅在 `hasMoreFlag === 1 且非修改评价场景（operateType !== 10）` 时展示
- **AND** 展示时点击 SHALL 跳转原生聚合页 `/modules/waybill-build/pages/evaluation-list/index`
- **AND** 不满足条件时「返回列表」按钮 SHALL 通栏展示

#### Scenario: 弹窗内评价记录入口

- **WHEN** 成功弹窗展示（对齐 H5 successDialog 结构）
- **THEN** 弹窗内 SHALL 提供「评价记录」入口
- **AND** 点击 SHALL 跳转原生评价记录页并上报点击埋点 `clk_driverevaluate_notes_button_v2`

### Requirement: 批量评价积分汇总展示

批量（一键）评价全部提交成功且刷新后列表已无待评价运单时，系统 SHALL 弹窗展示积分汇总：累计获得积分（按响应 `responses` 中 score 累加）、scoreTips 提示文案（累计积分 > 0 时按新积分规则开关切换文案，见「新积分规则文案切换」Requirement；否则为「当天已对该司机做过评价，本次评价不计积分」）、提交时间（取 responses 首条 submitTime）。展示结构 SHALL 复用单票评价成功弹窗（对齐 H5 行为）。

#### Scenario: 批量评价全部完成

- **WHEN** 用户一键评价提交成功且重新拉取列表后无待评价运单
- **THEN** 系统 SHALL 弹窗展示累计积分、对应 scoreTips 文案与提交时间

#### Scenario: 批量评价后仍有剩余

- **WHEN** 批量评价提交成功且刷新后仍有待评价运单
- **THEN** 系统 SHALL 仅刷新列表与勾选状态，SHALL NOT 弹出积分汇总弹窗

### Requirement: 评价来源 source 按端动态上报

评价提交的 `source` 字段 SHALL 动态获取（沿用 `evaluation-list/components/success-dialog` 的 `getSource()`：devtools=3 / ios=2 / android=1），SHALL NOT 硬编码。

#### Scenario: 单票提交携带动态 source

- **WHEN** 用户提交单票评价
- **THEN** 请求参数 `source` SHALL 按当前运行端取值（小程序开发者工具=3 / iOS=2 / Android=1）

### Requirement: 司机信息卡片展示

司机维度评价页头部司机信息卡片 SHALL 展示头像、姓名；工号 SHALL 仅在 `driverInfo.driverType !== '1'` 时展示，且 SHALL 与姓名同行展示（对齐 H5 driverInfoCard 布局）；`driverInfo.scoreTips` 存在时 SHALL 在姓名/工号下方以 rich-text 安全方式渲染积分提示（SHALL NOT 使用 v-html 直译）。司机卡片 SHALL 随运单列表滚动（位于列表滚动区内），SHALL NOT 在列表为空（空态）时展示。

#### Scenario: 司机卡片携带 scoreTips

- **WHEN** 接口返回的 `driverInfo.scoreTips` 非空
- **THEN** 司机卡片 SHALL 在姓名/工号下方展示该积分提示（rich-text 渲染）

#### Scenario: 内部员工司机

- **WHEN** `driverInfo.driverType === '1'`
- **THEN** 司机卡片 SHALL NOT 展示工号

#### Scenario: 列表为空时

- **WHEN** 列表拉取结果为空（展示空态与「去寄件」出口）
- **THEN** SHALL NOT 展示司机信息卡片

### Requirement: 规则横幅、规则弹窗与评价记录入口

司机维度评价页 SHALL 复用 `evaluation-list` 的 `rule-banner`（规则横幅，含规则弹窗出口与评价记录出口）、`rule-dialog`（评价规则说明弹窗）、`records-entry`（评价记录入口）。从评价记录页返回且发生过修改（`Taro.getApp().evaluationRecordsChanged`）时，页面 SHALL 自动刷新列表并重置标记。

#### Scenario: 查看评价规则

- **WHEN** 用户点击规则横幅的规则详情出口
- **THEN** 系统 SHALL 打开评价规则说明弹窗并上报点击埋点 `clk_order_search_driverevaluate_ruler_button_v1`

#### Scenario: 进入评价记录并返回

- **WHEN** 用户经评价记录入口进入记录页、修改评价后返回
- **THEN** 司机维度评价页 SHALL 自动刷新列表
- **AND** 入口点击 SHALL 上报埋点 `clk_driverevaluate_notes_button_v1`

### Requirement: 在线客服入口

司机维度评价页在列表尾部 SHALL 提供在线客服入口（展示条件对齐 evaluation-list：非支付宝环境等），点击 `Taro.navigateTo` 跳转 `/modules/webview/pages/online-service/index`，不携带运单号参数（按 evaluation-list 现状对齐，偏离 H5 原参数行为，已经评审确认）。

#### Scenario: 点击在线客服

- **WHEN** 用户点击列表尾部「在线客服」
- **THEN** 系统 SHALL `Taro.navigateTo` 打开 `/modules/webview/pages/online-service/index`
- **AND** SHALL 上报点击埋点 `clk_order_search_driverevaluate_online_v1`

### Requirement: 批量选择行为

列表批量选择 SHALL 满足：单次勾选上限 100 票（超出 toast 拦截）；全选 SHALL 过滤不可评价项（超时效且非修改状态的运单不可被勾选，SHALL NOT 将全部数据无差别 `slice(0, 100)` 加入勾选）；底部批量栏 SHALL 仅在 `rowTotal >= 2` 时展示；「该司机{时间}还有 N 票运单，可一键评价」横幅 SHALL 按 `scoreStatus === 0`（未评价）的运单数统计且仅在剩余数 > 0 时展示。

#### Scenario: 全选过滤过期单

- **WHEN** 用户点击全选且列表中存在超时效（不可评价）运单
- **THEN** 系统 SHALL 仅勾选可评价的运单
- **AND** 超时效运单 SHALL 保持未勾选且不可提交

#### Scenario: 勾选超 100 票拦截

- **WHEN** 用户勾选已达 100 票后继续勾选
- **THEN** 系统 SHALL toast 提示「单次司机评价最多支持100票，请重新选择」且不新增勾选

#### Scenario: 剩余票数横幅

- **WHEN** 列表首条数据渲染且按 `scoreStatus === 0` 统计的未评价数减 1 大于 0
- **THEN** SHALL 展示「该司机{时间}还有 N 票运单，可一键评价」横幅（N 按未评价口径统计）

#### Scenario: 无未评价运单时不展示横幅

- **WHEN** 按 `scoreStatus === 0` 统计的未评价数减 1 不大于 0
- **THEN** SHALL NOT 展示剩余票数横幅

### Requirement: 列表分页大小

司机维度评价页列表拉取 SHALL 使用 `pageSize: 100`（对齐 H5，一次拉取后全量支持勾选/全选/一键评价），SHALL NOT 使用 10 条/页。

#### Scenario: 拉取待评价列表

- **WHEN** 页面调用 `searchToBeDriverEvaluated` 拉取列表
- **THEN** 请求参数 `pageSize` SHALL 为 100

### Requirement: 列表项司机维度差异化展示

司机维度评价页的列表项 SHALL 以 `variant="driver"` 复用共用 list-item 组件，并满足以下差异（对齐 H5 driver-list list-item；聚合页默认形态行为不变）：

- 运单号行 SHALL 展示前置标签：运单号等于入口参数 `waybillNo` 时展示「当前运单」tag，否则展示「运单号」label。
- SHALL NOT 展示列表项积分提示行（scoreTips）与司机名（司机信息已在页面头部卡片展示）。
- 修改评价场景（flag=modify）的入口运单 SHALL：隐藏倒计时、预填历史评分/原因/留言、允许过期后修改（select 过期拦截放行）、拦截低于原评分的选择（toast「您选择的等级无法修改」）、未升级评分时拦截提交（toast「您还没有修改评价等级」）、底部按钮文案展示「修改评价」。
- 超出评价有效期的运单（无倒计时且 scoreStatus=0，或 scoreStatus=1）SHALL 隐藏表情评价区并展示提示「该运单已超出评价有效期(请于寄件五个自然日内评价)」。

#### Scenario: 入口运单展示当前运单标签

- **WHEN** 列表项运单号等于路由参数 waybillNo
- **THEN** 运单号前 SHALL 展示「当前运单」标签，其他列表项展示「运单号」标签

#### Scenario: 修改评价预填

- **WHEN** 以 flag=modify 进入且列表项为入口运单
- **THEN** 系统 SHALL 预填历史评分、评价原因与留言，且倒计时不展示、按钮文案为「修改评价」
- **AND** 未升级评分时点击提交 SHALL toast 拦截

### Requirement: 评价埋点

司机维度评价页 SHALL 注册页面 pageCode（`page_order_search_driverevaluate_v1`）并补齐埋点，eventCode 与 H5 对齐：

| 埋点位 | eventCode | 类型 |
|---|---|---|
| 页面曝光 | `exp_order_search_driverevaluate_v1` | 曝光 |
| 批量底部栏曝光 | `exp_order_search_multi_driverevaluate_v1` | 曝光 |
| 一键评价点击 | `clk_order_search_multi_drive_batch_evaluation_v2` | 点击 |
| 单票提交按钮点击 | 对照 H5 list-item 提交按钮埋点 | 点击 |
| 在线客服点击 | `clk_order_search_driverevaluate_online_v1` | 点击 |
| 成功弹窗曝光 | `exp_order_search_driverevaluate_success_V1` | 曝光 |
| 弹窗返回/继续评价点击 | `clk_order_search_driverevaluate_success_return_button_v1` / `clk_order_search_driverevaluate_success_continue_button_v1` | 点击 |
| 规则详情点击 | `clk_order_search_driverevaluate_ruler_button_v1` | 点击 |
| 评价记录点击（横幅出口/弹窗内） | `clk_driverevaluate_notes_button_v1` / `clk_driverevaluate_notes_button_v2` | 点击 |

#### Scenario: 页面曝光上报

- **WHEN** 用户进入司机维度评价页
- **THEN** SHALL 上报页面曝光埋点 `exp_order_search_driverevaluate_v1`，page_code 为 `page_order_search_driverevaluate_v1`

### Requirement: 新积分规则文案切换（TY250981，2026-10-19 追加）

司机维度评价页 SHALL 在列表首页拉取时读取服务端开关 `newScoreRuleSwitch` 与 `pickupRestrictSwitch`（均以显式 `=== true` 判定开启，字段缺省视为关闭），并传递给规则横幅、规则弹窗、批量确认弹窗与司机页专属成功弹窗：

- 规则横幅文案 SHALL 按开关切换：关闭时「同一取货/派货日对相同司机评价分别获得一次积分」；开启时「同一取/派日对同一司机评价仅获得一次取/派评积分，同个司机单月上限3次」。
- 规则弹窗条款 SHALL 按开关切换新旧条款列表；`pickupRestrictSwitch === true` 时 SHALL 附加展示「限制收方评价」条款。
- 批量确认弹窗与成功弹窗的积分规则文案（scoreTips 兜底文案）SHALL 按开关同步切换。

#### Scenario: 开关开启时的文案

- **WHEN** 接口返回 `newScoreRuleSwitch === true` 且用户查看规则横幅/规则弹窗/评价弹窗
- **THEN** 相关文案 SHALL 展示新积分规则版本，与 H5 一致

#### Scenario: 开关关闭或缺省时的文案

- **WHEN** `newScoreRuleSwitch` 不为 `true`
- **THEN** 全部文案 SHALL 保持旧积分规则版本（兜底行为与上线版一致）

#### Scenario: 限制收方评价附加条款

- **WHEN** 接口返回 `pickupRestrictSwitch === true` 且用户打开规则弹窗
- **THEN** 弹窗条款 SHALL 追加展示限制收方评价条款

### Requirement: 全选框与勾选联动（2026-10-19 追加）

司机维度评价页的全选框状态 SHALL 与逐项勾选联动：逐项勾满未评价票数（口径 `!item.isUpdate`）时全选框自动点亮，取消任一项自动熄灭。全选框模型 SHALL 遵循 `ky-checkbox-group` 数组语义（点亮为 `[true]`、熄灭/重置为 `[]`），SHALL NOT 赋布尔值（组件内部对 modelValue 做展开，布尔值将抛 non-iterable 异常并使勾选失效）。

#### Scenario: 逐个勾满自动点亮

- **WHEN** 用户逐项勾选直至勾满全部未评价票数
- **THEN** 底部批量栏全选框 SHALL 自动点亮；取消任一项后 SHALL 自动熄灭

#### Scenario: 勾选数受 100 票上限截断

- **WHEN** 未评价票数超过 100（勾选数被上限截断）
- **THEN** 逐项勾满上限后全选框 SHALL NOT 点亮（与 H5 行为一致）

### Requirement: 评价记录页文本域与下拉刷新互斥（2026-10-20 追加）

评价记录页（evaluation-records）的修改评价文本域（RecordItem 内 `ky-textarea`）聚焦期间，页面 SHALL 禁用 `ky-list-standard` 下拉刷新（`:disabledRefresh`），失焦后 SHALL 还原可用。

#### Scenario: 文本域聚焦禁用下拉

- **WHEN** 用户聚焦修改评价的备注文本域（键盘弹起）
- **THEN** 列表 SHALL NOT 响应下拉刷新手势

#### Scenario: 失焦还原

- **WHEN** 文本域失焦（键盘收起或点击其他区域）
- **THEN** 下拉刷新 SHALL 恢复可用
