# DetailAddress Component

## Purpose

提供详细地址选择弹窗组件（DetailAddress），支持搜索联想列表、AI 智能解析地址、下拉刷新/上拉加载等功能。组件位于 `order-global-package/components/business/detail-address`，从 `@order-public` 迁移而来，解除对下单业务包的耦合。包含附属子组件 ListRefreshLoad 和 List。

---

## Requirements

### Requirement: 组件独立性
系统 SHALL 将 DetailAddress 组件放置于 `@order-global-package/components/business/detail-address/` 目录下，不依赖任何 `@order-public/store` 模块。

#### Scenario: 无 Pinia Store 依赖
- **WHEN** 组件挂载运行
- **THEN** 不调用 `useStore()` 或 `piniaStore`，`waybillNumber` 通过 props 注入

#### Scenario: 常量内联
- **WHEN** 组件内部需要判断寄件/收件类型
- **THEN** 使用内联对象 `{ SENDER: 'SENDER', RECEIVE: 'RECEIVE' }` 替代原 `Address` 常量导入

#### Scenario: 场景类型映射内联
- **WHEN** 组件需要获取 AI 场景类型
- **THEN** 使用内联箭头函数 `{ 10: 'sender', 20: 'receive' }` 替代 `getDetailAddressSceneType`

---

### Requirement: 详细地址搜索与联想列表
系统 SHALL 提供详细地址输入后的联想搜索列表能力。

#### Scenario: 输入触发搜索
- **WHEN** 用户在 KyTextarea 输入 ≥2 个字符
- **THEN** 调用 `findSuggest API` 返回联想地址列表

#### Scenario: 列表展示与高亮
- **WHEN** 搜索结果返回时
- **THEN** List 子组件展示地址卡片（含省市区+详细地址），匹配关键词通过 `highlightText` 高亮

#### Scenario: 点击选中地址
- **WHEN** 用户点击列表中某条地址
- **THEN** 触发 `onSelect` 事件，返回完整地址信息，并回填到输入框

#### Scenario: 下拉刷新/上拉加载
- **WHEN** 用户下拉刷新或上拉加载更多
- **THEN** ListRefreshLoad 组件触发分页请求，追加或替换列表数据

---

### Requirement: AI 智能解析地址
系统 SHALL 在用户确认详细地址时进行 AI 解析，自动拆分结构化信息。

#### Scenario: 确定 AI 解析
- **WHEN** 用户点击"确定"按钮
- **THEN** 调用 `aiAddrAnalysis API` 对输入文本进行智能解析

#### Scenario: 解析成功回填
- **WHEN** AI 解析成功返回结构化数据
- **THEN** 触发 `onConfirmDetailAddress` 事件，返回解析后的省市区+详细地址+公司名等信息

#### Scenario: 解析失败提示
- **WHEN** AI 解析失败
- **THEN** 展示错误 toast 提示

---

### Requirement: 附属组件迁移
系统 SHALL 一并迁移 DetailAddress 所需的附属组件。

#### Scenario: List 子组件
- **WHEN** DetailAddress 渲染地址列表
- **THEN** 使用 `components/list/index.vue` 子组件，支持高亮地址卡片展示和点击交互

#### Scenario: ListRefreshLoad 下拉刷新组件
- **WHEN** 列表需要分页加载
- **THEN** 使用已迁移到 `global-package/components/ui/list-refresh-load/` 的 ListRefreshLoad 组件

#### Scenario: KyTextarea 多行文本输入
- **WHEN** 用户输入详细地址
- **THEN** 使用已存在于 `global-package/components/base/ky-textarea/` 的 KyTextarea 组件

---

### Requirement: 滚动控制
系统 SHALL 正确处理弹窗打开和关闭时的页面滚动行为。

#### Scenario: 关闭时重置滚动
- **WHEN** 弹窗关闭（handleClose）
- **THEN** 内联调用 `wx.pageScrollTo({ scrollTop: 0, duration: 0 })` 重置页面滚动位置

#### Scenario: 原始地址回传
- **WHEN** 内部 originalAddress ref 变化
- **THEN** 通过 emit 将原始地址信息回传给父组件

---

### Requirement: 上报处理
系统 SHALL 注释掉深度依赖的上报代码，保留接口签名。

#### Scenario: umpOtherReport 注释
- **WHEN** 组件执行曝光上报逻辑
- **THEN** `umpOtherReport` 的 open() 曝光、setPromise 收件曝光、pasteReport 调用点均已注释

#### Scenario: report 函数体注释
- **WHEN** report/index.ts 被引入
- **THEN** `detailPopupClosedReport` 和 `pasteReport` 函数体注释，接口签名保留

---

### Requirement: 使用方路径适配
所有引用 `@order-public/components/business/detail-address` 或 `@order-public-sub-public/components/business/detail-address` 的使用方 SHALL 更新为目标路径。

#### Scenario: kye-miniapp-order 使用方更新（7 处）
- **WHEN** sender/receive 的 unfold、address-page、address-book 引入 DetailAddress
- **THEN** import 路径更新为 `@order-global-package-order/components/business/detail-address/index.vue`

#### Scenario: order-build-sub-pages 使用方更新（9 处）
- **WHEN** 对应页面引入 DetailAddress
- **THEN** import 路径更新为 `@order-global-package-order-sub/components/business/detail-address/index.vue`

---

### Requirement: freight-time 接入
`freight-time/pages/adress/index.vue` SHALL 接入 DetailAddress 组件实现详细地址填写。

#### Scenario: freight-time 渲染 DetailAddress
- **WHEN** freight-time 地址页加载
- **THEN** 渲染 DetailAddress 组件，配置 area prop（省市区数组）和 addressType prop（SENDER/RECEIVE）

#### Scenario: freight-time 选中回调
- **WHEN** 用户在 DetailAddress 中选中或确认地址
- **THEN** 触发 @onSelect / @onConfirmDetailAddress 事件，freight-time 处理数据回填

---

### Requirement: 样式一致性保证
组件的 `<template>` 和 `index.scss` SHALL 与源文件保持功能一致。

#### Scenario: 主组件样式
- **WHEN** 迁移主组件
- **THEN** index.scss（156 行）完整搬运，样式引入方式改为 script import

#### Scenario: List 子组件样式
- **WHEN** 迁移 List 子组件
- **THEN** index.scss 完整搬运，卡片样式（border-radius/border/box-shadow）正确应用

---

### Requirement: 向后兼容性
迁移后的组件 SHALL 保持对外接口兼容。

#### Scenario: Props 兼容
- **WHEN** 外部传入 props
- **THEN** area、addressType、waybillNumber 等 props 接口完全兼容，新增字段均为 optional

#### Scenario: Emits 兼容
- **WHEN** 外部监听组件事件
- **THEN** onSelect、onConfirmDetailAddress 等事件签名不变

#### Scenario: Expose 兼容
- **WHEN** 外部通过 ref 调用方法
- **THEN** onPasteAndRecognize、startAudio 等暴露方法兼容
