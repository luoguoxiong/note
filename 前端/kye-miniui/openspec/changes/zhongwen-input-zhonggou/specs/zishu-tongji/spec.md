## ADDED Requirements

### Requirement: Input 组件支持字数统计显示
当 `showWordLimit` 为 true 且设置了 `maxlength` 时，Input 组件应显示当前字符数和最大长度。

#### Scenario: 显示字数统计
- **WHEN** `showWordLimit` 为 true 且 `maxlength` 设置为 100
- **THEN** 组件在空状态下显示 "0/100"
- **AND** 字数随用户输入实时更新

#### Scenario: 隐藏字数统计
- **WHEN** `showWordLimit` 为 false
- **THEN** 不显示字数统计

### Requirement: 字数统计显示样式
字数统计应显示在输入框右下角，并具有适当的样式。

#### Scenario: 字数统计位置
- **WHEN** 输入框有多行内容
- **THEN** 字数统计保持可见且不与输入内容重叠