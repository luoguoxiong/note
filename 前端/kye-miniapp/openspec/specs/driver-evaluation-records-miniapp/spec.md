# driver-evaluation-records-miniapp 规范

## Purpose
小程序端司机评价记录查询与修改 —— 按评价时间区间与评价类型（好评/一般/差评）检索历史评价记录，并对 `canModifyStatus === 1` 的记录发起向上修改。

## Requirements
### Requirement: 评价记录页入口

系统 SHALL 在聚合司机评价页提供「评价记录」入口，点击后进入评价记录页。

#### Scenario: 聚合评价页显示入口
- **WHEN** 用户打开聚合司机评价页（`pages/evaluation-list`），无论是否为绑码用户
- **THEN** 在积分规则横幅（`RuleBanner`）下方展示一行入口「查询更多历史评价内容，请点击 评价记录 >」
- **AND** 入口行样式与横幅第一行保持一致（图标 + 文字 + 箭头）

#### Scenario: 点击入口跳转
- **WHEN** 用户点击「评价记录」入口
- **THEN** 跳转进入评价记录页
- **AND** 上报埋点 `clk_multidriverevaluate_notes_button_v1`

#### Scenario: 入口操作防重
- **WHEN** 用户快速连续点击「评价记录」入口
- **THEN** 系统 SHALL 仅打开一个评价记录页

#### Scenario: 返回后原页面保持
- **WHEN** 用户从评价记录页点击左上角返回
- **THEN** 返回聚合评价页
- **AND** 聚合评价页 SHALL NOT 被同步关闭或重置

#### Scenario: 单票与修改评价页入口不在本次范围
- **WHEN** 用户从查件列表卡片的「取货评价」或「派货评价」按钮进入评价页
- **THEN** 该链路由 H5 承接（`waybillAppH5Url('evaluation-driver-list')`），入口实现不在本仓库范围内

#### Scenario: 评价结果弹窗显示入口
- **WHEN** 用户在查件列表通过「更多」菜单点击「查看取货评价」、「查看派货评价」或「查看评价」，弹出评价结果弹窗
- **THEN** 弹窗底部 SHALL 展示「评价记录 >」入口
- **AND** 取+派合并的轮播弹窗（`evaluation-popup-all`）中该入口 SHALL 只出现一次（位于轮播容器外层），SHALL NOT 每页各出现一次

#### Scenario: 评价结果弹窗入口点击跳转
- **WHEN** 用户点击评价结果弹窗底部的「评价记录」入口
- **THEN** 系统 SHALL 先关闭弹窗，再跳转进入评价记录页
- **AND** 上报埋点 `clk_driverevaluate_notes_button_v2`

#### Scenario: 从结果弹窗进入记录页后返回
- **WHEN** 用户从评价结果弹窗进入评价记录页后点击左上角返回
- **THEN** 返回查件列表
- **AND** 原弹窗 SHALL NOT 残留在查件列表上方

#### Scenario: 结果弹窗入口操作防重
- **WHEN** 用户快速连续点击弹窗底部「评价记录」入口
- **THEN** 系统 SHALL 仅打开一个评价记录页

#### Scenario: 不激活死代码弹窗
- **WHEN** 实现结果弹窗入口
- **THEN** 入口 SHALL 落在可达的 `components/waybill-search/components/evaluation-popup` 与 `evaluation-popup-all`
- **AND** SHALL NOT 恢复 `pages/evaluation-driver-list/components/evaluation-success-dialog` 的可达性
- **AND** 两个弹窗的原有数据获取（`queryDriverContainOut` / `scoreGet`）与展示逻辑 SHALL 保持不变

### Requirement: 评价记录页面结构

系统 SHALL 新增独立的评价记录页面，位于运单子包内。

#### Scenario: 页面位置与注册
- **WHEN** 创建评价记录页
- **THEN** 页面 SHALL 位于 `src/modules/kye-miniapp-waybill/src/pages/evaluation-records/`
- **AND** 系统 SHALL NOT 手动修改 `src/subpackages.ts`（该文件由构建插件自动生成）
- **AND** 所有代码改动 SHALL 落在 `src/modules/kye-miniapp-waybill/src/` 而非 `waybill-build` 构建副本目录

#### Scenario: 页面配置
- **WHEN** 用户进入评价记录页
- **THEN** 导航栏标题为「评价记录」，使用原生导航样式（与 `evaluation-list` 一致）
- **AND** 页面容器使用 `BasePage`

#### Scenario: 多端可用
- **WHEN** 页面运行在微信小程序、支付宝小程序或 H5 环境
- **THEN** 筛选、列表加载与修改提交流程 SHALL 均可正常工作
- **AND** 页面代码 SHALL NOT 使用 `document` API（小程序运行环境不存在该对象）

### Requirement: 评价类型筛选与默认定位

系统 SHALL 在评价记录页提供「好评」「一般」「差评」三个评价类型筛选项，并由后端决定默认定位。

#### Scenario: 类型筛选项展示
- **WHEN** 用户进入评价记录页
- **THEN** 展示「好评」「一般」「差评」三个筛选项，分别对应 `score` 值 `1`、`2`、`4`
- **AND** 三者互斥单选

#### Scenario: 默认定位由接口决定
- **WHEN** 首次进入评价记录页
- **THEN** 系统 SHALL NOT 传 `score` 参数请求 `web.query.evaluation.records`
- **AND** 使用返回的 `data.score` 作为当前选中的评价类型
- **AND** 反写选中态 SHALL NOT 触发第二次列表请求

#### Scenario: 存在差评记录时定位差评
- **WHEN** 当前账号在筛选时间范围内同时存在好评、中评、差评记录
- **THEN** 页面默认定位在「差评」（差评优先级最高）

#### Scenario: 存在中评无差评时定位一般
- **WHEN** 当前账号存在好评和中评记录，无差评记录
- **THEN** 页面默认定位在「一般」（中评优先级高于好评）

#### Scenario: 仅有好评记录时定位好评
- **WHEN** 当前账号仅有好评记录，无中评与差评记录
- **THEN** 页面默认定位在「好评」

#### Scenario: 所有类型均无记录
- **WHEN** 当前账号在筛选时间范围内没有任何评价记录
- **THEN** 默认定位在「好评」
- **AND** 展示空状态缺省图

#### Scenario: 切换类型独立加载
- **WHEN** 用户切换评价类型
- **THEN** 系统 SHALL 重置分页至第 1 页、清空当前列表
- **AND** 携带该类型对应的 `score` 值重新请求，各类型独立加载对应数据

### Requirement: 评价时间筛选

系统 SHALL 支持按评价时间区间筛选评价记录。

#### Scenario: 默认展示近 1 个月
- **WHEN** 用户首次进入评价记录页
- **THEN** 时间区间默认为近 1 个月
- **AND** 以该区间作为 `startDate` / `endDate`（格式 `yyyy-MM-dd`）请求列表

#### Scenario: 快捷时间选择
- **WHEN** 用户选择「近1个月」「近3个月」「近6个月」「近1年」快捷选项
- **THEN** 时间区间更新为对应范围
- **AND** 立即按新区间重新查询，无需点击额外的搜索按钮

#### Scenario: 自定义时间范围
- **WHEN** 用户自定义选择时间区间
- **THEN** 可选范围最短为 1 天、最长为近 1 年
- **AND** 超出 1 年范围的日期 SHALL 置为不可选
- **AND** 列表仅展示该区间内按评价时间命中的记录

#### Scenario: 变更时间后的类型归属
- **WHEN** 用户变更评价时间区间
- **THEN** 系统 SHALL NOT 传 `score`，交由后端在新区间下重新定位默认评价类型
- **AND** 此前已主动选择过的评价类型 SHALL 被重置，以后端返回的 `data.score` 反写选中态
- **AND** 该行为与用户此前是否主动点选过类型无关（新区间下原类型可能无数据）

### Requirement: 评价记录列表展示

系统 SHALL 以卡片列表形式展示评价记录并支持分页加载。

#### Scenario: 记录卡片展示内容
- **WHEN** 评价记录列表中存在记录
- **THEN** 每条记录卡片展示：运单号（含复制按钮）、寄件城市 → 服务方式 → 收件城市、司机名称、取/派标识、取货或派货时间（`showTime`）、评价时间（`createTime`）、卡片头右上的获得积分 `+N积分`（取 `scoreNumber`）
- **AND** SHALL NOT 展示「评价成功，获得N积分」文案
- **AND** SHALL NOT 展示「同一取/派货日…仅获得一次积分」提示行（`scoreTips`）

#### Scenario: 时间格式化
- **WHEN** 渲染 `showTime` 与 `createTime`
- **THEN** 接口返回格式为 `yyyyMMdd HHmm`，展示时 SHALL 去除年份，呈现为 `MM/DD HH:mm`
- **AND** 非预期格式的值 SHALL 原样返回，不抛错

#### Scenario: 评价等级枚举
- **WHEN** 渲染记录的评价等级或回填评价表单
- **THEN** `scoreLevel` 的值域 SHALL 等同 `score`：`1` = 好评（太棒啦）、`2` = 一般（一般般）、`4` = 差评（很糟糕）
- **AND** 可直接与表情选项的 id 比对，无需额外转换

#### Scenario: 列表排序由后端决定
- **WHEN** 渲染评价记录列表
- **THEN** 系统 SHALL 按接口返回的 `data.rows` 顺序渲染
- **AND** SHALL NOT 在前端做二次排序（接口无排序入参，排序规则由后端控制）

#### Scenario: 取货派货评价拆分展示
- **WHEN** 同一个运单同时存在取货司机评价和派货司机评价
- **THEN** 拆分为两条独立记录展示，各按自身评价时间参与排序
- **AND** 列表项唯一标识 SHALL 由 `waybillNumber`、`scoreType` 与跨页唯一的序号共同构成

#### Scenario: 跨页列表键唯一
- **WHEN** 加载第 2 页及后续页
- **THEN** 列表项唯一标识中的序号 SHALL 按全局偏移量计算（`(page - 1) * pageSize + index`）
- **AND** SHALL NOT 每页从 0 重新计数，避免与前页产生重复键导致 DOM 复用错误

#### Scenario: XD 订单号下多运单展开
- **WHEN** 取货评价对应的 XD 订单号下存在多个运单号
- **THEN** 该订单号下所有运单号均展示为独立记录，各按对应评价时间展示，最多 100 个运单

#### Scenario: 过期未评价运单不展示
- **WHEN** 存在超过评价有效期（150 小时，后台配置）未评价的运单
- **THEN** 该运单 SHALL NOT 出现在评价记录列表中（由后端过滤）

#### Scenario: 分页加载
- **WHEN** 列表滚动至底部且当前页小于 `pageTotal`
- **THEN** 请求下一页并追加到列表尾部

### Requirement: 记录卡片双形态

系统 SHALL 依据接口返回的 `canModifyStatus` 决定记录卡片是可编辑态还是只读态。

#### Scenario: 可修改时展示评价表单
- **WHEN** 记录的 `canModifyStatus === 1`
- **THEN** 卡片内渲染可编辑评价表单：表情三选一、原因标签多选、备注输入框
- **AND** 表情选中态回填为当前 `scoreLevel` 对应项
- **AND** 原因标签回填为 `msgFlag` 已选项，备注回填为 `remark`
- **AND** 备注字数上限 SHALL 为 100，与存量评价表单保持一致
- **AND** 展示「修改评价」提交按钮

#### Scenario: 不可修改时平铺只读内容
- **WHEN** 记录的 `canModifyStatus === 0`
- **THEN** 卡片内平铺展示只读内容：「我的评价：<表情图><文案>」、已选原因标签文本、「给司机的留言：<remark>」
- **AND** SHALL NOT 渲染评价表单与提交按钮
- **AND** SHALL NOT 渲染「查看评价」按钮 —— 只读内容默认已展开，无需点击即可见

#### Scenario: 好评记录不可修改
- **WHEN** 记录为好评（`scoreLevel = 1`）
- **THEN** 接口返回 `canModifyStatus = 0`，卡片为只读态

#### Scenario: 超期或超次数不可修改
- **WHEN** 中评/差评记录已超过评价时间 +30 天，或已在 30 天内修改满 2 次
- **THEN** 接口返回 `canModifyStatus = 0`，卡片为只读态
- **AND** 30 天期限、修改次数上限、角色权限判定 SHALL 全部由后端收敛进 `canModifyStatus`，前端不重复实现

#### Scenario: 只读原因不作区分
- **WHEN** 记录处于只读态
- **THEN** 前端 SHALL NOT 区分「好评不可改」「超 30 天」「已改满 2 次」三种原因
- **AND** 三者统一呈现为同一平铺只读形态

#### Scenario: 老数据字段缺失兜底
- **WHEN** 记录的 `msgFlag` 或 `remark` 为 `undefined` / `null`
- **THEN** 系统 SHALL 在数据适配层将其兜底为空字符串
- **AND** 卡片正常渲染，SHALL NOT 抛出异常

### Requirement: 修改评价提交

系统 SHALL 复用既有评价提交链路完成记录页的修改评价，且仅允许向上修改评价等级。

#### Scenario: 复用既有提交接口
- **WHEN** 用户在记录页点击「修改评价」提交
- **THEN** 系统 SHALL 调用既有 `Addscore`（`web.query.score.add`）接口
- **AND** 请求参数结构 SHALL 与聚合评价页提交保持一致：`code`（`scoreType === 1` 传 `waybillNumber`，否则传 `orderNumber`）、`remark`、`score`、`type`、`waybillNumber`、`flag`（标签逗号拼接）、`source`

#### Scenario: 仅支持向上修改 - 选择时拦截
- **WHEN** 用户点击的目标等级数值大于当前 `scoreLevel`（即评价更差）
- **THEN** 提示「您选择的等级无法修改」
- **AND** SHALL NOT 改变当前选中态

#### Scenario: 仅支持向上修改 - 提交时拦截
- **WHEN** 用户提交时目标等级数值大于或等于当前 `scoreLevel`
- **THEN** 提示「您还没有修改评价等级」
- **AND** SHALL NOT 发起提交请求

#### Scenario: 仅支持向上修改 - 跨级允许
- **WHEN** 用户在差评记录中选择「太棒啦」（好评）
- **THEN** 允许选择并可提交（差评可直接跨级修改为好评）

#### Scenario: 仅支持向上修改 - 同级拒绝
- **WHEN** 用户在差评记录中选择差评，或在一般记录中选择一般
- **THEN** 按上述拦截规则提示，SHALL NOT 提交

#### Scenario: 仅支持向上修改 - 向下拒绝
- **WHEN** 用户在一般记录中选择差评
- **THEN** 提示「您选择的等级无法修改」，SHALL NOT 提交

#### Scenario: 原因标签必选
- **WHEN** 用户已选择评价等级但未选择任何原因标签即提交
- **THEN** 展示「请选择原因」提示并高亮原因区域
- **AND** SHALL NOT 提交

#### Scenario: 点击空白处消除校验提示
- **WHEN** 原因区域处于校验错误态，用户点击页面其他区域
- **THEN** 校验提示与高亮态消除
- **AND** 该行为 SHALL 通过 `ky-popover` 的 `listenClickId` 实现，SHALL NOT 依赖 `document` 事件监听

#### Scenario: 提交成功后列表处理
- **WHEN** 修改评价提交成功
- **THEN** toast 提示「修改成功」
- **AND** SHALL 重新拉取当前评价类型的列表（回到第 1 页），SHALL NOT 仅在前端移除该条记录
- **AND** 重新拉取时 SHALL 携带当前选中的评价类型，SHALL NOT 退化为由后端定位默认类型
- **AND** 用户切换到目标评价类型时，该记录以新评价等级展示

#### Scenario: 同一订单号下多运单评价联动
- **WHEN** 同一 XD 订单号生成了多个运单且均有评价，用户修改其中任一运单的评价成功
- **THEN** 后端 SHALL 将该订单号下其它运单的评价同步为本次修改结果
- **AND** 前端刷新后的列表 SHALL 反映全部被联动记录的最新评价等级，SHALL NOT 残留旧等级记录

#### Scenario: 修改后同步原评价页
- **WHEN** 用户在评价记录页修改评价成功后返回聚合评价页
- **THEN** 聚合评价页的评价内容与状态 SHALL 已同步更新

#### Scenario: 未提交直接返回不保留
- **WHEN** 用户修改了表单内容但未点击「修改评价」，直接返回
- **THEN** 修改内容 SHALL NOT 保留
- **AND** SHALL NOT 弹出二次确认提示

#### Scenario: 提交操作防重
- **WHEN** 用户快速连续点击「修改评价」提交按钮
- **THEN** 系统 SHALL 仅触发一次提交请求

#### Scenario: 修改不再获得积分
- **WHEN** 用户修改已评价记录
- **THEN** 本次修改 SHALL NOT 产生新积分（同一天对同一司机评价仅获取一次积分，修改不再获取）

### Requirement: 评价记录列表接口

系统 SHALL 新增 `web.query.evaluation.records` 接口封装用于查询评价记录。

#### Scenario: 接口封装位置与形式
- **WHEN** 需要请求评价记录列表
- **THEN** 系统 SHALL 在 `src/modules/kye-miniapp-waybill/src/apis/waybill-search/index.ts` 中新增导出函数
- **AND** 服务码为 `web.query.evaluation.records`，`appkey` 为 `55262`，封装形式与同文件既有 `searchToBeEvaluated`、`Addscore` 保持一致

#### Scenario: 请求参数
- **WHEN** 调用评价记录列表接口
- **THEN** 入参包含 `startDate`、`endDate`（必填，`yyyy-MM-dd`）、`score`（选填，`1`/`2`/`4`）、`page`、`pageSize`

#### Scenario: 响应消费
- **WHEN** 接口返回成功
- **THEN** 系统消费 `data.score`（默认类型定位）、`data.pageTotal`（分页控制）、`data.rows[]`（列表渲染）

### Requirement: 异常与空状态

系统 SHALL 对网络异常、接口失败与空数据提供明确反馈。

#### Scenario: 网络异常
- **WHEN** 评价记录页加载时网络断开
- **THEN** 按规范展示网络异常提示与缺省图
- **AND** 提供重新拉取入口

#### Scenario: 接口调用失败
- **WHEN** 评价记录列表接口或修改评价接口调用失败
- **THEN** 展示失败提示，并支持重新拉取数据

#### Scenario: 空数据
- **WHEN** 当前评价类型与时间区间下无任何评价记录
- **THEN** 展示空状态缺省图

#### Scenario: 空态判定由列表组件收敛
- **WHEN** 页面运行在微信小程序、支付宝小程序或 H5 环境
- **THEN** 空态 SHALL 由 `ky-list-standard` 内部按返回数据长度自行判定
- **AND** 页面 SHALL NOT 传入外部 `isEmpty`，SHALL NOT 为空态做分端特殊处理

### Requirement: 评价记录页埋点

系统 SHALL 上报入口点击、页面浏览、曝光与修改操作五类埋点。

#### Scenario: 入口点击埋点
- **WHEN** 用户在聚合评价页点击「评价记录」入口
- **THEN** 上报 `clk_multidriverevaluate_notes_button_v1`（查件_查件页_司机评价聚合页_评价记录_点击），`event_type_id` 为 `2101`

#### Scenario: 结果弹窗入口点击埋点
- **WHEN** 用户在评价结果弹窗（`evaluation-popup` / `evaluation-popup-all`）点击「评价记录」入口
- **THEN** 上报 `clk_driverevaluate_notes_button_v2`（查件_查件页_司机评价结果_评价记录_点击），`event_type_id` 为 `2101`
- **AND** 两个弹窗 SHALL 使用同一编码，SHALL NOT 按取/派或单/合并拆分为不同编码

#### Scenario: 页面浏览与曝光
- **WHEN** 用户进入评价记录页
- **THEN** 上报页面浏览埋点 `page_driverevaluate_notes_v1`（查件_司机评价_评价记录），`event_type_id` 为 `2001`
- **AND** 上报曝光埋点 `exp_driverevaluate_notes_v1`（查件_司机评价_评价记录_曝光），`event_type_id` 为 `2201`

#### Scenario: 修改评价点击埋点
- **WHEN** 用户在评价记录页点击「修改评价」提交
- **THEN** 上报 `clk_driverevaluate_notes_button_v1`（查件_司机评价_评价记录_修改），`event_type_id` 为 `2101`
- **AND** 携带属性 `type`（STRING），取值为**修改后**的评价类型（用户本次选中的等级）：`好评`、`中评` 或 `差评`
- **AND** SHALL NOT 取修改前的原评价等级

#### Scenario: 页面编码登记
- **WHEN** 记录页内部上报页面浏览、曝光或修改评价埋点
- **THEN** 系统 SHALL 在 `src/modules/kye-miniapp-waybill/src/utils/tools.ts` 的 `getPageCode()` 映射表中登记记录页路由 → `page_driverevaluate_notes_v1`
- **AND** SHALL NOT 引入来源上下文动态推导机制（本次入口恒为聚合评价页一处）

#### Scenario: 不改动存量页面编码
- **WHEN** 在 `getPageCode()` 映射表中新增登记项
- **THEN** 系统 SHALL 仅新增记录页一条
- **AND** SHALL NOT 为聚合评价页 `evaluation-list` 登记 `page_order_search_v1` 或其他编码
- **AND** 聚合评价页已有埋点 `clk_order_search_multidriverevaluate_ruler_button_v1` 的 `page_code` SHALL 保持不变

#### Scenario: 修改评价的 source 取值
- **WHEN** 记录页调用 `Addscore` 提交修改评价
- **THEN** `source` 参数 SHALL 固定传 `1`，与聚合评价页默认值一致
- **AND** SHALL NOT 为记录页分配独立的 `source` 值

#### Scenario: 埋点统一走模块封装
- **WHEN** 上报任意埋点
- **THEN** SHALL 通过模块级 `reportClick` / `reportExp` / `reportPv` 上报
- **AND** SHALL NOT 直接调用底层上报方法
