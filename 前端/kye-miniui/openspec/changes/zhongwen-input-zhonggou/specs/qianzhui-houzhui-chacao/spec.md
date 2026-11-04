## ADDED Requirements

### Requirement: Input 组件支持前缀插槽
Input 组件应提供 `prefix` 插槽，用于在输入区域前显示内容。

#### Scenario: 渲染前缀内容
- **WHEN** 用户在 `prefix` 插槽中提供内容
- **THEN** 内容显示在输入框左侧
- **AND** 内容不影响输入功能

### Requirement: Input 组件支持后缀插槽
Input 组件应提供 `suffix` 插槽，用于在输入区域后、清空按钮前显示内容。

#### Scenario: 渲染后缀内容
- **WHEN** 用户在 `suffix` 插槽中提供内容
- **THEN** 内容显示在输入框右侧、清空按钮之前
- **AND** 内容不影响输入功能或清空按钮