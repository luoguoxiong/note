## ADDED Requirements

### Requirement: 动态客户编码表单管理
用户可以添加 1-9 个客户编码输入框，每个输入框支持独立校验和删除操作。

#### Scenario: 添加客户编码输入框
- **WHEN** 用户点击"新增申请绑定公司"按钮且当前数量 < 9
- **THEN** 新增一个空的客户编码输入框，总数 +1

#### Scenario: 删除客户编码输入框
- **WHEN** 用户点击输入框右侧的删除按钮且当前数量 > 1
- **THEN** 删除该输入框，总数 -1

#### Scenario: 达到上限提示
- **WHEN** 用户点击"新增"按钮但当前数量已 = 9
- **THEN** 显示 Toast 提示"新增客户编码已达上限"

#### Scenario: 达到下限提示
- **WHEN** 用户尝试删除但当前数量已 = 1
- **THEN** 显示 Toast 提示"至少要有1个申请绑定公司"

---

### Requirement: 客户编码联想推荐
用户输入客户编码时，展示匹配的推荐公司列表供选择。

#### Scenario: 展示推荐列表
- **WHEN** 用户在输入框中输入内容且推荐列表有匹配数据
- **THEN** 在输入框下方展示最多 10 条匹配的公司列表

#### Scenario: 高亮匹配文本
- **WHEN** 推荐列表中的客户编码包含用户输入的内容
- **THEN** 匹配部分高亮显示（加粗或变色）

#### Scenario: 已选标识
- **WHEN** 推荐列表中的公司已被其他输入框选中
- **THEN** 该条目显示"已选"标签并置灰，不可再次选择

#### Scenario: 选择推荐项
- **WHEN** 用户点击推荐列表中的某一项
- **THEN** 将该公司的客户编码填入当前输入框，关闭推荐列表

#### Scenario: 清空隐藏列表
- **WHEN** 输入框失焦或清空内容
- **THEN** 隐藏推荐列表

---

### Requirement: 客户编码实时校验
每个客户编码输入框失焦时进行有效性校验。

#### Scenario: 非空校验
- **WHEN** 某个输入框失焦且值为空
- **THEN** 显示错误提示"请输入客户编码"，输入框边框变红

#### Scenario: 有效性校验
- **WHEN** 某个输入框失焦且有值
- **THEN** 调用 checkCustomerCode API 校验有效性，失败则显示错误信息

#### Scenario: 重复性校验
- **WHEN** 某个输入框失焦且值与其他输入框重复
- **THEN** 显示警告"不可输入相同公司"

#### Scenario: 风控校验触发
- **WHEN** checkCustomerCode 返回 VERIFY_CODE 错误码
- **THEN** 弹出图形验证码弹窗，验证成功后重试

#### Scenario: 聚焦清除错误
- **WHEN** 用户聚焦到某个有错误的输入框
- **THEN** 清除该字段的错误提示和红色边框

---

### Requirement: 申请原因填写
用户必须填写申请原因才能提交。

#### Scenario: 非空校验
- **WHEN** 申请原因输入框失焦且值为空
- **THEN** 显示错误提示"请输入申请原因"

#### Scenario: 字符过滤
- **WHEN** 用户输入包含表情符号或特殊字符
- **THEN** 自动过滤非法字符

#### Scenario: 字数限制
- **WHEN** 用户输入超过 100 字符
- **THEN** 阻止输入并显示剩余字数

---

### Requirement: 表单提交与批量校验
用户点击确认按钮后，进行完整校验流程。

#### Scenario: 提交前全量校验
- **WHEN** 用户点击"确认"按钮
- **THEN** 校验所有必填字段非空，任一不通过则停止提交并显示错误

#### Scenario: 批量黑名单校验
- **WHEN** 所有字段通过基础校验
- **THEN** 调用 batchCheckBlackCustomerCode API 批量检查黑名单，失败则标记对应字段错误

#### Scenario: 提交成功跳转
- **WHEN** 所有校验通过且 API 调用成功
- **THEN** 跳转到结果页（apply-bind-result），携带 title、applyStatus 参数

#### Scenario: 提交失败处理
- **WHEN** API 调用失败
- **THEN** 显示错误信息 Toast，不上报埋点结果为"失败"

#### Scenario: 加载状态
- **WHEN** 正在提交中
- **THEN** 按钮显示 loading 状态，防止重复提交

---

### Requirement: 页面离开守卫
用户未提交表单就尝试离开页面时，需要确认提示。

#### Scenario: 未提交离开确认
- **WHEN** 用户有未保存的修改（已填写客户编码或原因）且未点击提交
- **THEN** 弹出确认对话框"信息未提交，确定要退出吗?"

#### Scenario: 已提交正常离开
- **WHEN** 用户已完成提交操作
- **THEN** 允许正常离开，无确认提示

#### Scenario: 无修改直接离开
- **WHEN** 用户未做任何修改
- **THEN** 允许正常离开，无确认提示

---

### Requirement: 当前绑定公司展示
如果用户已有绑定的客户编码，展示当前绑定信息。

#### Scenario: 展示当前编码
- **WHEN** 页面加载且 store 中有 customerCode
- **THEN** 在表单顶部展示"当前绑定公司"区域，显示只读的客户编码

#### Scenario: 无绑定不展示
- **WHEN** 用户没有绑定任何客户编码
- **THEN** 不展示"当前绑定公司"区域

---

### Requirement: TypeScript 类型安全
所有接口、组件 Props、状态变量必须有明确的类型定义。

#### Scenario: API 响应类型
- **WHEN** 定义 API 接口函数
- **THEN** 使用泛型指定返回类型，定义完整的 Response 接口

#### Scenario: 组件 Props 类型
- **WHEN** 定义组件接收参数
- **THEN** 使用 interface 定义 Props，所有字段标注类型和默认值

#### Scenario: 状态变量类型
- **WHEN** 定义响应式状态
- **THEN** 使用 ref<T> / reactive<T> 泛型明确类型，禁止使用 any

#### Scenario: 事件回调类型
- **WHEN** 定义 emit 事件
- **THEN** 使用 defineEmits 明确事件名和参数类型
