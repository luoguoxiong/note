# waybill-config-page Specification

## Purpose
TBD - created by archiving change waybill-config. Update Purpose after archive.
## Requirements
### Requirement: 配置页入口与模式判定
配置页 SHALL 通过路由参数接收 `waybillStatus`（运单状态）与 `mode`（`add` 新增 / `edit` 编辑）两个参数，由配置列表页（waybill-config-list）在跳转时携带。页面 SHALL 根据模式决定初始配置来源，并在整个会话期间保持当前状态与模式不变。

#### Scenario: 从配置列表页未设置个性版本进入（新增）
- **WHEN** 用户在配置列表页点击尚未设置个性版本的卡片
- **THEN** 跳转至配置页，路由携带 `mode=add` 与对应 `waybillStatus`，页面以新增模式初始化

#### Scenario: 从配置列表页已设置个性版本进入（编辑）
- **WHEN** 用户在配置列表页点击已存在个性版本的卡片编辑入口
- **THEN** 跳转至配置页，路由携带 `mode=edit` 与对应 `waybillStatus`，页面以编辑模式初始化

### Requirement: 新增态默认配置与复用提示
新增态下，页面 SHALL 按状态链路判断上一状态是否已设置定制卡片：待签收(30) 检查待揽件(20)、已签收(40) 检查待签收(30)、待揽件(20) 无需判断。若上一状态存在定制配置，页面 SHALL 弹出温馨提示询问是否复用；否则 SHALL 直接取当前状态常规版本配置作为默认。

#### Scenario: 待揽件新增态无复用判断
- **WHEN** 新增态且运单状态为待揽件(20)
- **THEN** 不进行上一状态判断、不弹复用提示，直接取待揽件常规版本配置作为默认

#### Scenario: 待签收新增态且待揽件已有定制配置
- **WHEN** 新增态且运单状态为待签收(30)，且待揽件(20) 已存在定制配置
- **THEN** 弹出温馨提示「检测到您已设置了"待揽件列表"卡片个性设置，是否直接复用？」，提供「好的」与「不需要」两个选项

#### Scenario: 待签收新增态且待揽件无定制配置
- **WHEN** 新增态且运单状态为待签收(30)，且待揽件(20) 无定制配置
- **THEN** 不弹复用提示，直接取待签收常规版本配置作为默认

#### Scenario: 已签收新增态且待签收已有定制配置
- **WHEN** 新增态且运单状态为已签收(40)，且待签收(30) 已存在定制配置
- **THEN** 弹出温馨提示询问是否复用待签收列表卡片个性设置

### Requirement: 新增态复用算法（点击「好的」）
当用户在复用提示中点击「好的」时，页面 SHALL 以**当前状态常规版本配置的字段集合**为基准，按字段 `code` 复用上一状态定制配置中同 code 字段的 `visible` 状态与排序：
- 上一状态无该 code 字段（如某字段仅存在于待揽件而不存在于待签收）则不复用，保持常规版本默认；
- 复用后 `visible=true` 的字段 SHALL 保持与上一状态一致的相对顺序并整体置于模块顶部，其余字段按当前常规版本默认顺序排在下方；
- 排序复用 SHALL 仅作用于运单信息、功能按钮模块；寄收模块 SHALL 仅复用 `visible` 状态。

#### Scenario: 字段在两状态均存在则复用其开关与排序
- **WHEN** 待揽件定制配置中「路由信息」`visible=true` 且排序靠前，用户在待签收新增态点击「好的」
- **THEN** 待签收配置的「路由信息」`visible=true`，且作为开启项保持相对顺序置于运单信息模块顶部

#### Scenario: 字段仅存在于上一状态则不复用
- **WHEN** 待揽件定制配置中含某字段（如「创建时间」），但待签收常规版本字段集合不含该 code
- **THEN** 该字段不被复用、不出现在待签收配置中

#### Scenario: 字段仅存在于当前状态则保持常规版本默认
- **WHEN** 待签收常规版本含某字段（如「签收人」），但待揽件定制配置中无该 code
- **THEN** 该字段保持待签收常规版本默认的 `visible` 与排序，排在复用的开启项之后

#### Scenario: 开启项保持相对顺序并置顶
- **WHEN** 上一状态定制配置中开启项顺序为「路由信息 → 重量」，当前常规版本字段含「签收人、路由信息、重量、预计派送时间」
- **THEN** 复用后排序为「路由信息、重量、签收人、预计派送时间」（开启项按上一状态相对顺序置顶，其余按常规版本默认顺序跟随）

### Requirement: 新增态不复用（点击「不需要」）
当用户在复用提示中点击「不需要」时，页面 SHALL 直接取当前状态常规版本配置作为默认，不做任何字段状态或排序复用。

#### Scenario: 点击不需要取常规版本
- **WHEN** 用户在复用提示中点击「不需要」
- **THEN** 页面以当前状态常规版本配置初始化，所有字段 `visible` 与排序均为常规版本默认值

### Requirement: 编辑态初始配置
编辑态下，页面 SHALL 直接取该运单状态已有的定制版本配置作为初始值，不触发复用判断与提示。

#### Scenario: 编辑态加载已有定制配置
- **WHEN** 编辑态进入页面
- **THEN** 页面以该状态已存在的定制版本配置初始化各模块字段与排序

### Requirement: 配置数据加载（不兜底）
配置页 SHALL 在初始化时调用 `store.loadAllConfigs()` 获取真实配置。配置页 SHALL NOT 使用 `DEFAULT_CARD_CONFIG` 兜底——若加载失败或当前 `waybillStatus` 在 store 中无真实配置，页面 SHALL 提示「配置加载失败」并返回上一页。查件列表页仍保留 DEFAULT 兜底（不在本能力范围）。

#### Scenario: 加载失败报错返回
- **WHEN** 配置页初始化时 `loadAllConfigs` 失败或当前状态无真实配置
- **THEN** 页面提示「配置加载失败，请稍后重试」并返回上一页，不进入编辑态

#### Scenario: 加载成功进入编辑态
- **WHEN** 配置页初始化时 `loadAllConfigs` 成功且当前状态有真实配置
- **THEN** 页面以真实配置初始化，进入编辑态

### Requirement: 卡片预览
页面底部 SHALL 提供「卡片预览」按钮（ky-button 蓝边白底蓝字、size=large）。点击后 SHALL 从底部弹出预览弹窗，弹窗顶部显示「卡片预览样式」标题与关闭按钮，弹窗内 SHALL 使用 `ConfigModulesView`（只读）按当前配置与当前运单状态渲染卡片预览（`ConfigCardHead`/`ConfigCardAddress` 按 `waybillStatus` 取样例数据）。

#### Scenario: 打开卡片预览
- **WHEN** 用户点击底部「卡片预览」按钮
- **THEN** 底部弹出预览弹窗，标题为「卡片预览样式」，弹窗内 ConfigModulesView 按当前配置渲染对应状态的卡片

#### Scenario: 关闭卡片预览
- **WHEN** 用户点击预览弹窗的关闭按钮或遮罩
- **THEN** 预览弹窗关闭，返回配置页

### Requirement: 保存设置
页面底部 SHALL 提供「保存设置」按钮（ky-button 蓝底白字、size=large）。点击后页面 SHALL 按后端 `web.query.cardConfig.save` 文档格式提交：`senderReceiverConfig` 为 `code→visible`、`waybillInfoConfig` 与 `functionConfig` 为 `code→{visible,order}`，且 `functionConfig` SHALL 过滤掉固定按钮（canRealAuth/canNeedPay）。保存成功后 SHALL 刷新 store 配置数据再返回上一页（配置列表页）。

#### Scenario: 保存成功刷新并返回
- **WHEN** 用户点击「保存设置」且 `saveCardConfig` 调用成功
- **THEN** 配置按文档格式提交至后端，刷新 store 数据后返回配置列表页

#### Scenario: 保存失败保留页面
- **WHEN** 用户点击「保存设置」但 `saveCardConfig` 调用失败
- **THEN** 页面保留当前配置不跳转，提示保存失败

