# waybill-card-fields Specification

## Purpose
TBD - created by archiving change waybill-card-config-default. Update Purpose after archive.
## Requirements
### Requirement: 字段组件注册
系统 SHALL 提供字段组件映射，通过 code 获取对应的 Vue 组件。

#### Scenario: 已知字段 code
- **WHEN** 调用 getFieldComponent('goodsTime')
- **THEN** 返回 TimeField 组件

#### Scenario: 未知字段 code
- **WHEN** 调用 getFieldComponent('unknownField')
- **THEN** 返回 DefaultField 组件

### Requirement: 时间字段组件
TimeField 组件 SHALL 渲染时间字段，支持连带标签显示。

#### Scenario: 货好时间字段
- **WHEN** code='goodsTime'
- **THEN** 显示"货好时间"标签
- **THEN** 显示 waybill.baseInfo.goodsTime 值

#### Scenario: 已打印标签
- **WHEN** waybill.baseInfo.printStatus=10
- **THEN** 显示"已打印"标签

#### Scenario: 代收标签
- **WHEN** functionInfo.showProxyPickupLabel.showStatus=true
- **THEN** 显示"代收"标签

#### Scenario: 已改货好时间标签
- **WHEN** code='goodsTime' 且 functionInfo.goodsTimeChangeFlag.showStatus=true
- **THEN** 显示"已改货好时间"标签

### Requirement: 费用字段组件
TotalAmount 组件 SHALL 渲染费用字段，支持权限判断。

#### Scenario: 有权限显示
- **WHEN** functionInfo.canNeedPay.showStatus=true
- **THEN** 显示费用金额

#### Scenario: 无权限隐藏
- **WHEN** functionInfo.canNeedPay.showStatus=false
- **THEN** 显示"***"

#### Scenario: 无权限不渲染
- **WHEN** functionInfo.canNeedPay.showStatus=false
- **THEN** 不渲染整行

### Requirement: 最新路由字段组件
LatestRoute 组件 SHALL 渲染最新路由信息，支持特殊样式。

#### Scenario: 待揽件/待签收状态
- **WHEN** waybillStatus !== 40 且有路由信息
- **THEN** 显示路由状态描述和路由描述

#### Scenario: 已签收状态
- **WHEN** waybillStatus === 40
- **THEN** 不显示最新路由

### Requirement: 签收人字段组件
Receiver 组件 SHALL 渲染签收人信息。

#### Scenario: 已签收状态
- **WHEN** waybillStatus === 40
- **THEN** 显示"签收人"标签和 baseInfo.receiver 值

#### Scenario: 非已签收状态
- **WHEN** waybillStatus !== 40
- **THEN** 不渲染

### Requirement: 通用字段组件
DefaultField 组件 SHALL 渲染通用字段，显示字段名称和值。

#### Scenario: 有字段值
- **WHEN** 字段有值
- **THEN** 显示字段名称和值

#### Scenario: 无字段值
- **WHEN** 字段无值
- **THEN** 显示字段名称和"--"

