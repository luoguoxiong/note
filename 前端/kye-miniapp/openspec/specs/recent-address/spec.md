# RecentAddress Component

## Purpose

提供最近寄件/收件地址列表组件，支持历史地址加载、选中回填、滑动删除、清空等交互能力。组件位于 `order-global-package/components/business/recent-address`。

---

## Requirements

### Requirement: 最近地址列表展示与交互
系统 SHALL 在 `order-global-package/components/business/recent-address` 提供最近寄件/收件地址列表组件，支持以下能力：

#### Scenario: 加载历史地址列表
- **WHEN** 组件挂载（onMounted）
- **THEN** 调用 `historyAddress API` 获取历史地址列表并展示

#### Scenario: 选中地址回填
- **WHEN** 用户点击某条地址项
- **THEN** 触发 `onSelect` 事件，返回完整地址信息对象（person/mobile/telephone/province/city/county/detailAddress/companyName）

#### Scenario: 滑动删除单条
- **WHEN** 用户左滑地址项露出删除按钮并点击"删除"
- **THEN** 调用 `deleteHistoryAddress API` 删除该条，刷新列表，显示 toast 提示

#### Scenario: 进入编辑态
- **WHEN** 用户点击标题栏删除图标
- **THEN** 切换为编辑模式，显示"清空"/"完成"按钮

#### Scenario: 清空全部地址
- **WHEN** 用户在编辑态点击"清空"
- **THEN** 调用 `deleteHistoryAddress(clean=true)` 清空全部，显示 toast，触发 `clearAll` 事件

#### Scenario: 退出编辑态
- **WHEN** 用户在编辑态点击"完成"
- **THEN** 退出编辑模式恢复 normal 态

### Requirement: 样式一致性保证
组件的 `<template>` 和 `index.scss` SHALL 与源文件完全一致。

#### Scenario: 模板结构保留
- **WHEN** 迁移组件
- **THEN** template 的 DOM 结构、class 命名、v-for/v-if/v-show 逻辑保持不变

#### Scenario: 样式内容保留
- **WHEN** 迁移组件
- **THEN** index.scss 所有选择器、属性值（含 BEM 命名、hairline mixin）完整搬运，仅修改引入方式为 script import

### Requirement: 使用方路径适配
所有引用 `@order-public/components/business/recent-address` 或 `@order-public-sub-public/components/business/recent-address` 的使用方 SHALL 更新为目标路径。

#### Scenario: kye-miniapp-order 使用方更新
- **WHEN** sender/address-page 或 receive/address-page 引入 RecentAddress
- **THEN** import 路径更新为 `@order-global-package-order/components/business/recent-address/index.vue`

#### Scenario: order-build-sub-pages 使用方更新
- **WHEN** 对应页面引入 RecentAddress
- **THEN** import 路径更新为 `@order-global-package-order-sub/components/business/recent-address/index.vue`

### Requirement: freight-time 接入
`freight-time/pages/adress/index.vue` 的静态占位区域 SHALL 替换为真实 RecentAddress 组件实例。

#### Scenario: freight-time 展示最近寄件地址
- **WHEN** freight-time 地址页加载且有最近寄件记录
- **THEN** 渲染 RecentAddress 组件，展示历史地址列表，支持选中/删除/清空操作
