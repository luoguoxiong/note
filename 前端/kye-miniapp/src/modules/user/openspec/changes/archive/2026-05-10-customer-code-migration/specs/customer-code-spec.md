## ADDED Requirements

### Requirement: 用户可以绑定客户编码

系统 SHALL 提供客户编码绑定功能，允许用户输入客户编码、密码、姓名完成绑定操作。系统 SHALL 支持表单校验、图形验证码、异常处理（黑名单限制、重复绑定确认）。

#### Scenario: 成功绑定客户编码

- **WHEN** 用户填写完整的绑定表单（客户编码+密码）并点击"确认"按钮
- **AND** 表单校验通过（必填项非空、格式正确）
- **AND** API调用成功返回 `status=1`
- **THEN** 系统显示"绑码成功"提示
- **AND** 更新当前绑定公司信息到Store
- **AND** 触发 `other_customer_code_bind_sub` 埋点（request_result=成功）
- **AND** 调用 `onConfirm` 回调通知父组件

#### Scenario: 绑定时触发图形验证码

- **WHEN** 用户提交绑定表单
- **AND** API返回错误码 `264587` 且 `type=1`
- **THEN** 系统显示图形验证码弹窗（复用 captcha 组件）
- **AND** 用户完成验证后自动重新提交绑定请求（携带 safeVerifyId）

#### Scenario: 客户编码校验时触发验证码

- **WHEN** 用户在"客户编码"输入框失焦时
- **AND** 校验API返回错误码 `264587` 且 `type=4`
- **THEN** 系统显示腾讯验证码/图形验证码
- **AND** 验证成功后自动重新校验

#### Scenario: 黑名单用户限制绑定

- **WHEN** 用户提交绑定请求
- **AND** API返回错误码 `34000`（手机号被拉黑）
- **THEN** 系统查询黑名单用户角色（商务/主授权号/管理员）
- **AND** 显示温馨提示弹窗："您已被该公司限制绑码，如需绑码请联系[角色]"
- **AND** 弹窗提供"我知道了"和"联系[角色]"两个按钮

#### Scenario: 重复绑定确认

- **WHEN** 用户提交绑定请求
- **AND** 该客户编码已被其他公司申请绑定（`status != 1`）
- **THEN** 系统显示Alert弹窗："您已申请绑定 [公司名称]([客户编码])等公司，继续提交将取消申请"
- **AND** 提供"取消"和"继续"两个选项
- **WHEN** 用户点击"继续"
- **THEN** 系统携带 `cancelApplyFlag=true` 重新提交绑定

#### Scenario: 表单校验失败

- **WHEN** 用户点击"确认"按钮但表单未填写完整
- **THEN** 系统按优先级显示错误提示气泡：客户编码 → 密码 → 姓名
- **AND** 对应输入框高亮显示错误状态（红色边框）
- **AND** 阻止提交操作

#### Scenario: 申请专属商务

- **WHEN** 用户点击"申请专属商务"/"联系商务"按钮
- **THEN** 系统根据 `hasBusiness` Prop 判断显示内容：
  - **IF** `hasBusiness=true`: 显示"联系商务"按钮（ky-button type="default"）
  - **IF** `hasBusiness=false`: 显示"申请专属商务"按钮（ky-button type="primary"，文案支持 configData 配置）
  - **IF** `hasBusiness=null/undefined`: 隐藏整个操作区域
- **AND** 触发对应 emit 事件（apply / contactBusiness）通知父组件
- **AND** 父组件 index.vue 通过 `fetchHasBusiness()` 获取 hasBusiness，通过 `fetchConfigData()` 获取按钮文案

---

### Requirement: 系统支持双模式展示（弹窗/页面）

绑定组件 SHALL 同时支持 Popup（弹窗）模式和 Page（全屏页面）模式，两种模式共用核心逻辑组件，仅布局容器不同。

#### Scenario: 弹窗模式（内部调用）

- **WHEN** 当前项目内部模块调用客户编码绑定功能
- **THEN** 系统以 `ky-popup` 弹窗形式展示绑定组件
- **AND** 弹窗包含关闭按钮（右上角X图标）
- **AND** 弹窗从底部滑出，支持点击遮罩层关闭
- **AND** Store中 `uiState.mode = 'popup'`

#### Scenario: 页面模式（外部跳转）

- **WHEN** 外部应用/链接跳转进入客户编码绑定页面
- **THEN** 系统以全屏页面形式展示绑定组件
- **AND** 页面包含导航栏（标题"绑定客户编码"+ 返回按钮）
- **AND** Store中 `uiState.mode = 'page'`

#### Scenario: 核心组件复用

- **WHEN** 弹窗模式和页面模式渲染
- **THEN** 两者共用同一个 `BindCodeForm.vue` 核心组件
- **AND** 仅容器组件处理布局差异（导航栏、关闭按钮、底部安全区）

---

### Requirement: 用户可以查看当前绑定信息

系统 SHALL 在"更换客户编码"页面/弹窗中展示当前绑定的公司信息卡片。

#### Scenario: 展示当前绑定公司信息

- **WHEN** 用户进入"更换客户编码"页面/弹窗
- **THEN** 系统显示当前绑定公司卡片，包含：
  - 公司名称（如"深圳三川科技有限公司深圳三川科技有限公司"）
  - 客户编码（如"075512345607"）
  - 当前绑定标签（BindTag组件，显示"当前绑定"）
  - （可选）下单部门信息 + 切换按钮（快速寄件页场景）

#### Scenario: 快速寄件页显示部门切换

- **WHEN** 当前环境为快速寄件页（`express_type === '快速寄件页'`）
- **AND** 当前用户已加入多个部门（部门列表 length > 0）
- **THEN** 公司卡片额外显示：
  - "下单部门：[当前部门名称]"
  - "切换"按钮（点击打开部门选择弹窗）

#### Scenario: 非快速寄件页隐藏部门切换

- **WHEN** 当前环境不是快速寄件页
- **OR** 用户未加入多部门
- **THEN** 公司卡片不显示部门信息和切换按钮

---

### Requirement: 用户可以切换已绑定的公司

系统 SHALL 提供客户编码切换功能，允许用户在已绑定公司列表中选择并切换当前绑定公司。

#### Scenario: 展示已绑定公司列表

- **WHEN** 用户进入"切换客户编码"页面/弹窗
- **THEN** 系统加载并展示所有已绑定公司列表（可滚动ScrollView）
- **AND** 每个公司项包含：
  - 公司名称
  - 客户编码
  - 当前绑定标记（仅当前公司显示 BindTag）
  - 解绑按钮（管理模式下显示）

#### Scenario: 切换当前绑定公司

- **WHEN** 用户点击某个非当前绑定的公司项
- **THEN** 系统检查用户是否有权限关联绑定（调用 `getAppUserRelationAuth`）
- **IF** 有权限（`bindAuth=true`）
  - **THEN** 调用 `userBindCustomerCode(type=1)` 执行切换
  - **AND** 显示loading状态（"切换中"/"绑定中"）
  - **AND** 成功后更新公司列表的 `isCurrBond` 标记
  - **AND** 显示Toast："换绑成功" 或 "绑码成功"
  - **AND** 触发 `onChangeBind` 回调通知父组件
  - **AND** 触发 `other_customer_code_change_sub` 埋点
- **IF** 无权限（`bindAuth=false`）
  - **THEN** 显示提示弹窗："您暂不可切换，如需绑定多家公司可申请"
  - **AND** 提供"一键解绑"和"去申请"两个选项

#### Scenario: 切换后自动刷新部门列表

- **WHEN** 用户成功切换绑定公司
- **AND** 当前环境为快速寄件页
- **THEN** 系统重新获取该公司下的部门列表
- **AND** 如果部门数 > 1，自动弹出"确认下单部门"对话框

---

### Requirement: 用户可以解绑客户编码

系统 SHALL 提供解绑功能，支持单个解绑和一键解绑两种方式。

#### Scenario: 单个解绑客户编码

- **WHEN** 用户进入管理模式并点击某公司的"解绑"按钮
- **THEN** 系统先查询用户在该公司的角色（`getUserRoleByCustomerCode`）
- **AND** 显示解绑确认弹窗：
  - 标题："解除绑定提示"
  - 内容："[角色提示] 您确定与 [公司名称]([客户编码])解除绑定吗?"
  - 按钮："我再想想" / "解除绑定"
- **WHEN** 用户确认解绑
- **THEN** 调用 `unBindCustomerCode` API
- **AND** 成功后从列表移除该公司
- **AND** 显示Toast："解绑成功"
- **AND** 如果解除的是当前绑定公司，触发 `onChangeBind({customerCode:'', customerName:''})`

#### Scenario: 一键解绑所有非当前公司

- **WHEN** 用户在特定场景下触发一键解绑（如"去申请"流程中的备选方案）
- **THEN** 系统收集所有非当前绑定的公司编码列表
- **AND** 调用 `unbindRelationCustomerCode({unbindList})` API
- **AND** 成功后清空列表并刷新数据
- **AND** 触发 `onRefresh` 回调

#### Scenario: 冻结解绑（未付运费冻结）

- **WHEN** 用户尝试解绑但API返回错误码 `111227`
- **THEN** 系统显示冻结解绑弹窗：
  - 内容："未付运费已被冻结"
  - 按钮："取消" / "立即解绑"
- **WHEN** 用户确认立即解绑
- **THEN** 强制执行解绑操作
- **AND** 关闭冻结弹窗

#### Scenario: 解绑后判断是否需要刷新

- **WHEN** 用户解绑某个公司后
- **AND** 剩余公司数为1且该公司是当前绑定
- **OR** 公司列表为空
- **THEN** 系统检查用户是否还有关联绑定权限
- **IF** 无权限
  - **THEN** 触发 `onRefresh` 回调刷新整个页面

---

### Requirement: 系统提供完整的Pinia状态管理

系统 SHALL 使用 Pinia Store 管理客户编码相关的所有状态，包括表单数据、公司列表、UI状态、配置数据。

#### Scenario: Store初始化与重置

- **WHEN** 组件首次加载
- **THEN** Store初始化默认状态：
  - `bindForm`: { customerCode: '', customerPassword: '', memberName: '' }
  - `companyInfoList`: []
  - `currentCompany`: null
  - `uiState`: { loading: false, mode: 'popup', showAlert: false }
- **WHEN** 用户关闭弹窗/离开页面
- **THEN** 可选调用 `reset()` 重置所有状态到初始值

#### Scenario: 响应式状态更新

- **WHEN** 绑定操作成功
- **THEN** Store自动更新：
  - `currentCompany` 设置为新绑定的公司信息
  - `companyInfoList` 刷新（如果需要）
  - `bindForm` 重置为空
- **WHEN** UI状态变化（loading/showAlert等）
- **THEN** 所有使用该状态的组件自动响应更新

#### Scenario: Getters派生状态

- **WHEN** 组件需要判断是否已绑定
- **THEN** 使用 `store.isBound` getter（基于 `currentCompany` 计算）
- **WHEN** 组件需要获取当前客户编码
- **THEN** 使用 `store.currentCustomerCode` getter

---

### Requirement: 系统提取公共Hooks避免重复代码

系统 SHALL 将与Store无关的公共业务逻辑提取为独立的 Hooks 函数，供多个组件复用。

#### Scenario: useBindForm Hook封装表单逻辑

- **WHEN** 绑定表单组件需要管理表单状态
- **THEN** 使用 `useBindForm()` Hook获取：
  - `form`: reactive表单对象（customerCode, customerPassword, memberName）
  - `getRules(field)`: 获取字段校验规则方法（支持 async validator）
  - `handleFieldBlur(field)`: 字段失焦处理
  - `validate()`: 手动校验表单
  - `submit(extraParams?)`: 提交方法（内部调用 userBindCustomerCode API）
  - `resetForm()`: 重置表单
- **AND** 校验规则包含：
  - **customerCode**: 必填 + `checkCustomerCode()` API 异步校验（与 H5 一致）
  - **customerPassword**: 必填
  - **memberName**: 中英文正则 `/[^\u4e00-\u9fa5a-zA-Z]/` 格式校验

#### Scenario: useCompanyList Hook封装列表逻辑

- **WHEN** 更换/切换组件需要管理公司列表
- **THEN** 使用 `useCompanyList()` Hook获取：
  - `companyList`: ref公司列表
  - `loading`: ref加载状态
  - `fetchList()`: 获取列表方法
  - `unbind(company)`: 解绑方法
  - `switchBind(company)`: 切换绑定方法

#### Scenario: useValidate Hook封装校验规则

- **WHEN** 需要校验表单字段
- **THEN** 使用 `useValidate()` Hook提供的纯函数：
  - `validateCustomerCode(value)`: 校验客户编码（非空 + API校验）
  - `validatePassword(value)`: 校验密码（非空）
  - `validateMemberName(value)`: 校验姓名（中英文 + 可选填）

---

### Requirement: 系统完整迁移埋点上报

系统 SHALL 参考实名认证模块实现，完整迁移H5项目的所有埋点事件，确保数据分析连续性。

#### Scenario: 页面曝光埋点

- **WHEN** 用户进入绑定/更换/切换页面或弹窗
- **THEN** 立即触发对应页面的曝光事件：
  - 绑定页: `exp_customer_code_bind_page` (page_name="绑定客户编码")
  - 更换页: `exp_customer_code_change_page` (page_name="更换客户编码")
  - 切换页: `exp_customer_code_switch_page` (page_name="切换客户编码")

#### Scenario: 按钮点击埋点

- **WHEN** 用户点击任何交互按钮
- **THEN** 触发对应的点击事件（包含button_name参数）:
  - "确认": `clk_customer_code_button`
  - "忘记密码": `clk_customer_code_button`
  - "申请专属商务": `clk_customer_code_button`
  - "了解更多": `clk_customer_code_button`
  - "保存": `clk_customer_code_button`
  - "解绑": `clk_customer_code_relation_bindpopup_button`
  - "切换客户编码": `clk_customer_code_button`
  - "申请绑定其他公司": `clk_customer_code_button`
  - "切换"（部门）: `clk_change_departments_button`
  - "确定"（部门）: `clk_change_departments_button`
  - "解除绑定": `clk_customer_code_unbind_confirmpopup_button`
  - "我再想想": `clk_customer_code_unbind_confirmpopup_button`

#### Scenario: 业务结果埋点

- **WHEN** 绑定/切换操作完成（成功或失败）
- **THEN** 触发结果上报事件：
  - 绑定结果: `other_customer_code_bind_sub` (request_result, customer_no)
  - 切换结果: `other_customer_code_change_sub` (request_result, customer_no, failure_reason)
  - 部门切换成功: `other_change_departments_success` (request_result="成功")

#### Scenario: 弹窗曝光埋点

- **WHEN** 显示以下弹窗时
- **THEN** 触发对应曝光事件：
  - 解绑确认弹窗: `exp_customer_code_unbind_confirmpopup`
  - 部门切换弹窗: `exp_change_departments`

#### Scenario: 埋点参数规范

- **WHEN** 上报任何埋点事件
- **THEN** 必须包含基础参数：
  - `page_name`: 当前页面名称
  - `work_id`: true (标识工作流)
  - 其他业务参数按H5源码保持一致
