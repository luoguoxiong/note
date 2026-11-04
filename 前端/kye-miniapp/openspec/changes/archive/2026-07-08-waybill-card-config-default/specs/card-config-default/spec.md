## ADDED Requirements

### Requirement: 寄收信息字段定义
系统 SHALL 提供寄收信息字段定义常量，基于现有 waybill-card 组件实际显示的字段。

#### Scenario: 字段定义完整性
- **WHEN** 加载寄收信息字段定义
- **THEN** 包含以下字段：deliveryCity、pickupCity、waybillStatusDesc、serviceModeDesc、deliveryPerson、pickupPerson、deliveryCustomerName、pickupCustomerName

#### Scenario: 固定字段标记
- **WHEN** 加载寄收信息字段定义
- **THEN** deliveryCity、pickupCity、waybillStatusDesc、serviceModeDesc 的 fixed=true
- **THEN** 其他字段的 fixed=false

#### Scenario: 默认可见性
- **WHEN** 加载寄收信息字段定义
- **THEN** 所有字段的 visible=true

### Requirement: 运单信息字段定义
系统 SHALL 提供运单信息字段定义常量，基于产品文档定义的6个字段。

#### Scenario: 字段定义完整性
- **WHEN** 加载运单信息字段定义
- **THEN** 包含以下6个字段：receiver（签收人）、newExteriorRouteInfo（路由信息）、goodsTime（货好时间）、deliveryTime（寄件时间）、receiveTime（签收时间）、preArriveTime（预计派送时间）

#### Scenario: 字段可见性
- **WHEN** 加载运单信息字段定义
- **THEN** 所有字段都有 visible 字段，默认为 true

#### Scenario: 字段排序
- **WHEN** 加载运单信息字段定义
- **THEN** 每个字段有唯一的 order 值，从 1 开始递增

#### Scenario: 最大可选数量
- **WHEN** 加载运单信息字段定义
- **THEN** maxSelect=4

### Requirement: 功能按钮定义
系统 SHALL 提供功能按钮定义常量，基于现有 MENU_LIST 实际定义的按钮，使用枚举定义 code。

#### Scenario: 按钮定义完整性
- **WHEN** 加载功能按钮定义
- **THEN** 包含以下按钮：canRealAuth、canNeedPay、canTake、canDelivery、canModify、canResume、canExhibition、canEvaluatePickup、canEvaluateDelivery、canSignConfirm、shareFlag、canCancel、showLabelFlag、canAnotherOrder、canPrint、canDeliveryPhoto

#### Scenario: 固定按钮标记
- **WHEN** 加载功能按钮定义
- **THEN** canRealAuth、canNeedPay 的 fixed=true
- **THEN** 其他按钮的 fixed=false

#### Scenario: 默认可见性
- **WHEN** 加载功能按钮定义
- **THEN** 所有按钮的 visible=true

### Requirement: 默认配置对象
系统 SHALL 提供默认配置对象 DEFAULT_CARD_CONFIG，整合三个模块的字段定义。

#### Scenario: 配置结构
- **WHEN** 加载默认配置
- **THEN** 包含 senderReceiverConfig、waybillInfoConfig、functionConfig 三个模块

#### Scenario: 接口失败降级
- **WHEN** 接口调用失败
- **THEN** 使用 DEFAULT_CARD_CONFIG 作为降级配置

### Requirement: 字段枚举定义
系统 SHALL 提供字段枚举定义，统一管理所有字段的 code。

#### Scenario: 枚举类型
- **WHEN** 使用字段枚举
- **THEN** 包含 SenderReceiverCode、WaybillInfoCode、FunctionCode 三个枚举

#### Scenario: 枚举使用
- **WHEN** 定义默认配置
- **THEN** 使用枚举定义 code 字段

#### Scenario: MENU_LIST 使用枚举
- **WHEN** 定义 MENU_LIST
- **THEN** configCode 使用 FunctionCode 枚举
