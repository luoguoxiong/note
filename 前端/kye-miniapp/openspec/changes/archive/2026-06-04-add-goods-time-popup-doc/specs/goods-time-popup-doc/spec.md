## ADDED Requirements

### Requirement: 创建组件使用文档
系统 SHALL 在 `src/modules/order-global-package/components/ui/goods-time-popup/` 目录下创建 `index.md` 文档文件。

#### Scenario: 文档文件创建
- **WHEN** 执行文档生成任务
- **THEN** 在指定目录创建 `index.md` 文件

### Requirement: 文档包含组件介绍
文档 SHALL 包含组件的功能介绍和两种模式（线上模式、自定义模式）的说明。

#### Scenario: 组件介绍存在
- **WHEN** 查看文档
- **THEN** 可以看到组件介绍章节，包含功能描述和模式说明

### Requirement: 文档包含Props属性说明
文档 SHALL 列出组件的所有 Props 属性，包括属性名、类型、必填性、默认值和说明。

#### Scenario: Props 说明存在
- **WHEN** 查看文档的 Props 章节
- **THEN** 可以看到完整的属性列表和说明

### Requirement: 文档包含Events事件说明
文档 SHALL 列出组件触发的所有事件，包括事件名、参数和说明。

#### Scenario: Events 说明存在
- **WHEN** 查看文档的 Events 章节
- **THEN** 可以看到完整的事件列表和说明

### Requirement: 文档包含类型定义
文档 SHALL 包含组件使用的所有 TypeScript 类型定义，包括枚举和接口。

#### Scenario: 类型定义存在
- **WHEN** 查看文档的类型定义章节
- **THEN** 可以看到所有相关类型的定义和说明

### Requirement: 文档包含使用示例
文档 SHALL 包含组件的使用示例代码，包括基础用法和自定义模式示例。

#### Scenario: 使用示例存在
- **WHEN** 查看文档的使用示例章节
- **THEN** 可以看到完整的使用代码示例

### Requirement: 文档包含核心逻辑说明
文档 SHALL 说明组件的核心逻辑，包括模式切换机制、时间过滤规则和急件特殊处理。

#### Scenario: 核心逻辑说明存在
- **WHEN** 查看文档的核心逻辑说明章节
- **THEN** 可以看到组件的工作机制说明

### Requirement: 文档包含注意事项
文档 SHALL 列出使用组件时需要注意的事项，包括数据格式要求和空状态处理。

#### Scenario: 注意事项存在
- **WHEN** 查看文档的注意事项章节
- **THEN** 可以看到使用时需要注意的事项