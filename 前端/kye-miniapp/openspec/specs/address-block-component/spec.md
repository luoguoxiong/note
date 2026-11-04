# AddressBlock Component

## Purpose

提供寄/收件人信息块展示组件（AddressBlock），支持寄件人/收件人信息展示、地址簿入口、地址切换、表单校验提示等功能。组件从 `@order-public/components/ui/address-block` 迁移至 `order-global-package/components/ui/address-block`，供运费失效等场景使用，解除对下单业务包的直接依赖。

---

## Requirements

### Requirement: 组件独立性
系统 SHALL 将 AddressBlock 组件放置于 `order-global-package/components/ui/address-block/` 目录下，`@order-global-package-order` 别名引用全部改为相对路径。

#### Scenario: 无 @order-global-package-order 别名引用
- **WHEN** 组件编译运行
- **THEN** 所有原 `@order-global-package-order/*` 的 import 均替换为相对路径（`../svg-icon`、`../../base/ky-button`、`../../../styles/index.scss` 等）

#### Scenario: SvgIcon 使用相对路径
- **WHEN** `address-block/index.vue` 引入 SvgIcon
- **THEN** import 路径为 `../svg-icon/index.vue`

#### Scenario: KyButton 使用相对路径
- **WHEN** `address-block/index.vue` 引入 KyButton
- **THEN** import 路径为 `../../base/ky-button/index.vue`

#### Scenario: 样式引入使用相对路径
- **WHEN** 组件的 `<style>` 块引入全局样式
- **THEN** `@order-global-package-order/styles/index.scss` 替换为 `../../../styles/index.scss`（按实际层级调整）

---

### Requirement: 随迁组件
`switch-sender-receive` 和 `ky-report` 两个紧密依赖的组件 SHALL 一并迁移至 `order-global-package`。

#### Scenario: SwitchSenderReceive 随迁
- **WHEN** AddressBlock 使用 SwitchSenderReceive 组件
- **THEN** 组件从 `order-global-package/components/ui/switch-sender-receive/` 引入，其内部 SvgIcon 和样式均使用相对路径

#### Scenario: KyReport 随迁
- **WHEN** AddressBlock 使用 KyReport 组件
- **THEN** 组件从 `order-global-package/components/base/ky-report/` 引入，其内部 `umpOtherReport` 改为引用 `order-global-package/report` 模块

---

### Requirement: 保留 @order-public 引用
部分深度耦合 `@order-public` 的依赖 SHALL 保留原路径引用，不做迁移。

#### Scenario: 常量引用保留
- **WHEN** 组件使用 `AddressVisibleType`、`OrderPageType`、`Channel` 等枚举
- **THEN** 仍从 `@order-public/constants` 引入

#### Scenario: Store 引用保留
- **WHEN** 组件使用 `useStore`
- **THEN** 仍从 `@order-public/store` 引入

#### Scenario: useValidate Hook 引用保留
- **WHEN** 组件使用 `useValidate` 进行表单校验
- **THEN** 仍从 `@order-public/hooks/useValidate` 引入

#### Scenario: useSchemaContext 引用保留
- **WHEN** 组件使用 `useSchemaContext` 获取 schema 上下文
- **THEN** 仍从 `@pages/order-single/hooks/useContext` 引入

#### Scenario: 地址簿埋点引用保留
- **WHEN** 组件调用 `clk_express_single_choise_v1` 埋点函数
- **THEN** 仍从 `@order-public/components/business/address-book/page/report/index` 引入

#### Scenario: detail-address-tips 枚举内联
- **WHEN** `detail-address-tips` 子组件和 `report/index.ts` 使用展会模块枚举值
- **THEN** `ModulePageType.寄方`(`'sender'`)、`ModuleTypeObj.sender`(`'寄方信息'`)、`ModuleTypeObj.receiver`(`'收方信息'`) 均内联为常量，不再引用 `@order-public/components/business/exhibition/hooks/data-config`

---

### Requirement: 本地 report 模块
组件内部的埋点 report 模块 SHALL 迁移至 `address-block/report/` 并改为本地引用。

#### Scenario: detailTipsReport 使用本地 umpOtherReport
- **WHEN** `report/index.ts` 调用 `umpOtherReport`
- **THEN** 从 `order-global-package/report` 引入（相对路径 `../../../../report`），不再引用 `@order-public/reportUmp`

---

### Requirement: 原组件保持不变
`kye-miniapp-order/src/order-public/components/ui/address-block` 下的原始组件 SHALL 保持不动，不影响现有下单页面的引用。

#### Scenario: 原引用路径不受影响
- **WHEN** 现有下单页面通过 `@order-public/components/ui/address-block` 引入组件
- **THEN** 原组件代码、路径、引用关系均不变

---

### Requirement: 组件功能完整性
迁移后的 AddressBlock 组件 SHALL 保持与原组件功能一致。

#### Scenario: Props 兼容
- **WHEN** 外部传入 props（`iconText`、`iconColor`、`headerText`、`info`、`addressVisible` 等）
- **THEN** Props 类型定义与原版完全一致（`types.ts`）

#### Scenario: Emits 兼容
- **WHEN** 外部监听组件事件
- **THEN** `onClick`、`onClickAddressBook`、`onSwitchAddress` 事件签名不变

#### Scenario: Slots 兼容
- **WHEN** 外部使用插槽
- **THEN** `restrictData`、`exhibition`、`projectLocation`、`aiAddress` 具名插槽保持不变

#### Scenario: 校验提示功能
- **WHEN** 表单校验不通过时
- **THEN** 通过 `useValidate` 获取 `validateObj` 展示错误提示，点击时调用 `removeValidateKey` 清除校验

---

## File Structure

```
order-global-package/components/
├── base/
│   └── ky-report/          # 随迁：埋点上报组件
│       └── index.vue
├── ui/
│   ├── switch-sender-receive/  # 随迁：寄收件切换图标
│   │   ├── index.scss
│   │   └── index.vue
│   └── address-block/         # 迁移目标
│       ├── components/
│       │   └── detail-address-tips/
│       │       ├── index.scss
│       │       └── index.vue
│       ├── report/
│       │   └── index.ts
│       ├── index.scss
│       ├── index.vue
│       └── types.ts
```

## Import Mapping

| 原路径 | 新路径 | 说明 |
|--------|--------|------|
| `@order-global-package-order/components/ui/svg-icon/index.vue` | `../svg-icon/index.vue` | 相对路径 |
| `@order-public/components/ui/switch-sender-receive/index.vue` | `../switch-sender-receive/index.vue` | 随迁 |
| `@order-global-package-order/components/base/ky-button/index.vue` | `../../base/ky-button/index.vue` | 相对路径 |
| `@order-public/components/base/ky-report/index.vue` | `../../base/ky-report/index.vue` | 随迁 |
| `@order-public/components/ui/address-block/types` | `./types` | 本地引用 |
| `@order-global-package-order/styles/index.scss` | `../../../styles/index.scss` | 相对路径 |
| `@order-public/reportUmp/sceneReport/umpotherReport` | `../../../../report` | 使用 order-global-package 的 report |
| `@order-public/constants` | `@order-public/constants` | 保留 |
| `@order-public/store` | `@order-public/store` | 保留 |
| `@order-public/hooks/useValidate` | `@order-public/hooks/useValidate` | 保留 |
| `@pages/order-single/hooks/useContext` | `@pages/order-single/hooks/useContext` | 保留 |
| `@order-public/components/business/address-book/page/report/index` | `@order-public/components/business/address-book/page/report/index` | 保留 |
| ~~`@order-public/components/business/exhibition/hooks/data-config`~~ | 内联常量 | 已消除 |
