## MODIFIED Requirements

### Requirement: 平台适配层
Input 组件应在 `index.vue` 中具有统一的平台适配层，处理环境检测和组件选择。

#### Scenario: 平台检测 - 微信小程序
- **WHEN** 组件在微信小程序环境中初始化
- **THEN** 渲染 `input.vue`
- **AND** 应用平台特定逻辑

#### Scenario: 平台检测 - H5
- **WHEN** 组件在 H5 环境中初始化
- **THEN** 渲染 `input-h5.vue`
- **AND** 应用 H5 特定逻辑

### Requirement: 平台特定 props 处理
Input 组件应根据检测到的环境自动应用平台特定的 props。

#### Scenario: 微信原生组件
- **WHEN** 在微信小程序中 `enableWxNative` 为 true
- **THEN** 使用 `custom-input` 组件而非标准 input
- **AND** 正确传递原生平台 props