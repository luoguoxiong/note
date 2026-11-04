# waybill-card Specification

## Purpose
TBD - created by archiving change waybill-card-config-default. Update Purpose after archive.
## Requirements
### Requirement: 寄收信息配置驱动渲染
运单卡片 SHALL 根据配置显示或隐藏寄收信息字段。

#### Scenario: 字段可见
- **WHEN** senderReceiverConfig 中字段的 visible=true
- **THEN** 显示该字段

#### Scenario: 字段隐藏
- **WHEN** senderReceiverConfig 中字段的 visible=false
- **THEN** 隐藏该字段

#### Scenario: 字段不在配置中
- **WHEN** 字段不在 senderReceiverConfig 中
- **THEN** 默认显示该字段

### Requirement: 运单信息配置驱动渲染
运单卡片 SHALL 根据配置显示或隐藏运单信息字段。

#### Scenario: 字段可见
- **WHEN** waybillInfoConfig 中字段的 visible=true
- **THEN** 显示该字段

#### Scenario: 字段隐藏
- **WHEN** waybillInfoConfig 中字段的 visible=false
- **THEN** 隐藏该字段

#### Scenario: 按配置顺序渲染
- **WHEN** 渲染运单信息字段
- **THEN** 按配置数组的顺序渲染（后端已排序）

### Requirement: 无配置时走原有逻辑
运单卡片 SHALL 在无配置时保持原有渲染逻辑。

#### Scenario: 无 cardConfig prop
- **WHEN** cardConfig prop 未传递
- **THEN** 使用默认配置 DEFAULT_CARD_CONFIG
- **THEN** 所有字段 visible=true，走原有逻辑

