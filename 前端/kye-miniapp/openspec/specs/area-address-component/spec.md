# AreaAddress Component

## Purpose

提供省市区三级联动选择弹窗组件（AreaAddress），支持热门城市快捷选择、关键词搜索定位、picker 联动滚动。组件位于 `order-global-package/components/business/area-address`，从 `@order-public` 迁移而来，解除对下单业务包的耦合。

---

## Requirements

### Requirement: 组件独立性
系统 SHALL 将 AreaAddress 组件放置于 `@order-global-package/components/business/area-address/` 目录下，不依赖任何 `@order-public/store` 模块。

#### Scenario: 无 Pinia Store 依赖
- **WHEN** 组件挂载运行
- **THEN** 不 import 任何 `piniaStore` 或 `useStore()`，所有原通过 Store 获取的数据改为 Props 注入或 Callback 回调

#### Scenario: 无 effectDialog 依赖
- **WHEN** 组件渲染
- **THEN** 不 import `@order-public/validate/effect/effectDialog`

---

### Requirement: 省市区三级联动选择
系统 SHALL 提供省/市/区三级联动 picker 选择能力。

#### Scenario: 打开弹窗并回填
- **WHEN** 外部调用 `open([province, city, county])`
- **THEN** 弹窗打开，picker 回填到当前选中的省市区的位置

#### Scenario: 滚动联动选择
- **WHEN** 用户在 picker 中滚动选择省份
- **THEN** 市和区列表联动更新为对应下级选项

#### Scenario: 确认选择
- **WHEN** 用户点击"确定"按钮
- **THEN** 触发 `onConfirm` 事件，返回 `{ province, city, county }`

#### Scenario: 取消关闭
- **WHEN** 用户点击"取消"按钮或遮罩区域
- **THEN** 弹窗关闭，页面滚动位置重置到顶部（微信端调用 `wx.pageScrollTo({ scrollTop: 0 })`）

---

### Requirement: 热门城市快捷选择
系统 SHALL 支持热门城市列表，用户点击后快速选中并联动区县。

#### Scenario: 点击热门城市
- **WHEN** 用户点击热门城市列表中的某一项
- **THEN** picker 自动定位到该城市的省份和市，区县列表联动展示该市的区县

---

### Requirement: 搜索定位
系统 SHALL 支持关键词搜索地址。

#### Scenario: 输入关键词搜索
- **WHEN** 用户在搜索框输入 ≥2 个字符的关键词
- **THEN** 调用 `mapAddressSearch API` 返回匹配结果列表

#### Scenario: 点击搜索结果
- **WHEN** 用户点击搜索结果项
- **THEN** 触发 `onSelectSearchItem` 事件，返回 `{ province, city, county }` 并关闭弹窗

#### Scenario: 搜索结果高亮
- **WHEN** 搜索结果展示时
- **THEN** 关键词部分使用 `highlightText` 工具函数高亮显示

---

### Requirement: API 层适配
系统 SHALL 在 `order-global-package/apis/address/` 提供 AreaAddress 所需的 3 个 API 函数及类型定义。

#### Scenario: multilevelLinkage
- **WHEN** 需要获取省市区三级联动数据
- **THEN** 调用 `multilevelLinkage(commonId, levelType)` 返回 `{ MultilevelLinkageResponse }`

#### Scenario: hotCityNameList
- **WHEN** 需要获取热门城市列表
- **THEN** 调用 `hotCityNameList()` 返回 `{ HotCityNameListResponse }`

#### Scenario: mapAddressSearch
- **WHEN** 需要搜索地址关键词
- **THEN** 调用 `mapAddressSearch(keyword)` 返回 `{ MapAddressSearchResponse }`

---

### Requirement: 使用方路径适配
所有引用 `@order-public/components/business/area-address` 或 `@order-public-sub-public/components/business/area-address` 的使用方 SHALL 更新为目标路径。

#### Scenario: kye-miniapp-order 使用方更新（10 处）
- **WHEN** sender/receive 的 unfold、address-page、address-book、useFields 引入 AreaAddress
- **THEN** import 路径更新为 `@order-global-package-order/components/business/area-address/index.vue`

#### Scenario: order-build-sub-pages 使用方更新（8 处）
- **WHEN** 对应页面引入 AreaAddress
- **THEN** import 路径更新为 `@order-global-package-order-sub/components/business/area-address/index.vue`

---

### Requirement: freight-time 接入
`freight-time/pages/adress/index.vue` SHALL 接入 AreaAddress 组件实现省市区选择。

#### Scenario: freight-time 打开省市区选择
- **WHEN** freight-time 地址页用户点击城市/区域字段
- **THEN** 调用 AreaAddress 的 `open(tertiaryAddress.split('/'))` 弹出省市区选择弹窗

#### Scenario: freight-time 选择回填
- **WHEN** 用户在 AreaAddress 中确认选择
- **THEN** 选中的省市区字符串回填到 tertiaryAddress 字段

---

### Requirement: 样式一致性保证
组件的 `<template>` 和 `index.scss` SHALL 与源文件保持功能一致。

#### Scenario: 模板结构保留
- **WHEN** 迁移组件
- **THEN** template 的 DOM 结构、class 命名（BottomPopup + ky-picker + 搜索框 + 热门城市）保持不变

#### Scenario: 样式内容保留
- **WHEN** 迁移组件
- **THEN** index.scss 所有选择器和属性值完整搬运，样式引入方式改为 script import

---

### Requirement: 向后兼容性
迁移后的组件 SHALL 保持对外接口完全兼容。

#### Scenario: Emits 兼容
- **WHEN** 外部监听组件事件
- **THEN** `onSelectSearchItem`、`onConfirm`、`getCurRef` 事件签名不变

#### Scenario: Expose 兼容
- **WHEN** 外部通过 ref 调用方法
- **THEN** `open(data: string[])` 方法签名不变

#### Scenario: Props 兼容
- **WHEN** 外部传入 props
- **THEN** 通过 `$attrs` 透传给 BottomPopup 的行为不变
