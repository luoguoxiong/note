## ADDED Requirements

### Requirement: Input 组件支持内置验证
Input 组件应支持 `rules` 属性用于定义验证规则。

#### Scenario: 必填验证
- **WHEN** `rules` 包含 `{ type: 'required', message: '请输入内容' }`
- **AND** 输入框为空且失去焦点
- **THEN** 触发错误状态
- **AND** 显示错误消息

#### Scenario: 正则验证
- **WHEN** `rules` 包含 `{ type: 'pattern', pattern: /^[a-z]+$/, message: '只能输入小写字母' }`
- **AND** 用户输入 "ABC"
- **THEN** 触发错误状态

### Requirement: 内置验证器
Input 组件应提供以下内置验证器：required, minLength, maxLength, pattern, email, phone。

#### Scenario: 邮箱验证
- **WHEN** `rules` 包含 `{ type: 'email', message: '邮箱格式不正确' }`
- **AND** 用户输入 "invalid-email"
- **THEN** 触发错误状态

### Requirement: 自定义验证器支持
Input 组件应支持自定义验证函数。

#### Scenario: 自定义验证
- **WHEN** `rules` 包含 `{ validator: (value) => value.length > 5, message: '内容太短' }`
- **AND** 用户输入 "abc"
- **THEN** 触发错误状态