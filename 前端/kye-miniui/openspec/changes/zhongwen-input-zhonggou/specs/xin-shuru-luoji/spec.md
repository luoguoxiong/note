## MODIFIED Requirements

### Requirement: 核心输入逻辑提取
Input 组件的核心逻辑（值管理、输入处理、清空功能）应提取到 composables 中，以便跨平台复用。

#### Scenario: 跨平台共享逻辑
- **WHEN** `input.vue` 和 `input-h5.vue` 都需要处理输入事件
- **THEN** 两个组件都使用相同的 `useInputCore` composable
- **AND** 输入处理逻辑的修改只需在一处进行

### Requirement: 统一状态管理
Input 组件应使用 reactive 状态对象而非多个独立 refs，以提高组织性。

#### Scenario: 状态更新
- **WHEN** 输入值改变
- **THEN** 所有相关状态通过单个 reactive 对象更新
- **AND** 状态变化可预测且可追踪

### Requirement: Debounce 统一管理
Input 组件中的所有 debounce 操作应集中管理，以便更好地控制。

#### Scenario: 清空取消 debounce
- **WHEN** 用户点击清空按钮
- **THEN** 所有待处理的 debounce 操作被取消
- **AND** 输入框立即被清空