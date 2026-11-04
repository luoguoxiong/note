## Context

下单（order-public）和运费时效（freight-time）两个模块各自实现了"申请查看运费"弹窗的内容区域，核心模板结构、样式、交互几乎完全一致。现以下单侧为标准，将内容区域抽取为共享组件 `apply-popup-content` 放入 `order-global-package`，两边通过适配层接入。

参考先例：`detail-popup` 已按相同模式迁移到 `order-global-package/components/business/estimated-cost/components/detail-popup/`。

## Goals / Non-Goals

**Goals:**
- 抽取 `apply-popup-content` 共享组件到 `order-global-package`，包含状态展示区 + 输入框 + 商务二维码
- 下单侧 `apply-popup/index.vue` 改为轻量适配层，引用共享组件
- 运费时效侧 `estimated-shipping-popup/index.vue` 替换内联内容区为共享组件
- 运费时效侧获得商务二维码展示能力（原缺失）
- 修复下单侧提交未完成就关闭弹窗的 bug
- 统一 `FeeAuthApplyStatus` 到共享包

**Non-Goals:**
- 不迁移外层 `BottomPopup`（标题、底部按钮、加载态、footer 逻辑）
- 不迁移埋点（各模块在适配层自行处理）
- 不迁移数据获取逻辑（Pinia store / API 调用）
- 不迁移提交逻辑（两边 API 参数不同）
- 不迁移联系人拨打方式（order-public 用 `contactPopup()` 函数，freight-time 用 `ContactBusiness` 组件）

## Decisions

### 1. 组件边界：只抽内容区，不抽整个弹窗

**决策**：共享组件 `<ApplyPopupContent>` 只包含 `BottomPopup` 的 default slot 内容，不含弹窗外层。

**理由**：
- 两边的 `BottomPopup` 差异大：footer 文案逻辑不同（下单："确定"/"我知道了"，运费时效："提交申请"/"我知道了"）、下单有 loading 态、运费时效有 `showTips`
- 提交确认逻辑耦合了各自的数据源和埋点，强行统一反而增加复杂度
- `detail-popup` 迁移先例已验证此模式可行

**替代方案**：抽取完整弹窗组件，通过 props 和 slots 配置差异。**拒绝原因**：props 爆炸式增长，不如保留 `BottomPopup` 在各模块自由控制。

### 2. Props 接口设计

```ts
defineProps<{
  /** 权限申请状态 (FeeAuthApplyStatus) */
  status: number
  /** 状态区标题文本 */
  title: string
  /** 申请时间 */
  applyTime?: string
  /** 申请原因 */
  applyReason?: string
  /** 联系人角色描述 */
  contactTypeDesc?: string
  /** 联系人按钮文案 */
  contactButtonName?: string
  /** 是否显示商务二维码图片 */
  showBusinessQr?: boolean
  /** 是否控制二维码图片的显示（用于 lazy loading，对应下单侧 modalShow） */
  modalShow?: boolean
  /** 输入框是否禁用 */
  textDisable?: boolean
  /** 埋点：曝光元素 id，不传则不渲染 id 属性 */
  trackingId?: string
  /** 埋点：exposure-report directive 参数，不传则不绑定 directive */
  exposureReport?: { eventCode: string; regionCode: string }
}>()

const emit = defineEmits<{
  contact: []
}>()

/** 输入框 v-model（defineModel 自动生成 modelValue prop + update:modelValue emit） */
const modelValue = defineModel<string>()
```

**关键设计点**：

- **`status`**：决定显示状态展示区还是输入框（`status !== FeeAuthApplyStatus.申请查看` → 展示区，否则 → 输入框）
- **`defineModel<string>()`**：输入框用 `defineModel` 管理双绑，自动生成 `modelValue` prop + `update:modelValue` emit
- **`modalShow`**：下单侧用于 `<img v-if="modalShow">` 懒加载控制，运费时效侧始终传 `true`
- **`showBusinessQr`**：下单侧传 `true`，运费时效侧传 `true`（对齐后也需要展示）

### 3. Events 接口设计

```ts
defineEmits<{
  /** 点击"联系xxx"按钮 */
  contact: []
}>()
```

**关键设计点**：

- **`defineModel<string>()`**：自动处理 v-model，无需手动声明 prop 和 emit，两边都直接用 `v-model` 绑定
- **`contact`**：共享组件只通知"用户点了联系按钮"，具体拨打方式由适配层决定
- **`modelValue`**：不再出现在 props 中，由 `defineModel` 管理

### 4. 适配层模式

**order-public 适配层**（`apply-popup/index.vue`）：

```
BottomPopup (title="申请查看运费", :show, footerText, @onClose, @onConfirm)
└── ApplyPopupContent
    ├── :status="data?.status"
    ├── :title="applyDesc"              ← "权限申请中" / "申请失败"
    ├── :applyTime / :applyReason       ← 来自 Pinia store
    ├── :showBusinessQr="true"
    ├── :modalShow="modalShow"
    ├── v-model="inputValue"
    ├── @contact="handleContactPhone"   ← 调用 contactPopup()
    ├── trackingId="exp_express_cost_commerce_already_v1"   ← 埋点 id
    ├── :exposureReport="{ eventCode: '...' }"              ← 埋点 directive 参数
    └── v-bind="$attrs"                 ← 透传 KyTextarea 相关 attrs
```

> `useOrderExposureReport(['exp_express_cost_commerce_already_v1'])` 仍由适配层调用，注册埋点事件码。

**freight-time 适配层**（`estimated-shipping-popup/index.vue`）：

```
BottomPopup (title="申请查看运费", v-model:show, footerText, @onClose, @onConfirm)
└── ApplyPopupContent
    ├── :status="feeAuthStatus"
    ├── :title="applyDataTitle"         ← "权限申请中" / "申请失败"
    ├── :applyTime / :applyReason       ← 来自 useApplyEstimate
    ├── :showBusinessQr="true"          ← 新增
    ├── :modalShow="true"               ← 运费时效无懒加载需求，始终 true
    ├── v-model="applyReason"
    └── @contact="showContact = true"   ← 打开 ContactBusiness 组件
```

> 运费时效侧不传 `trackingId` / `exposureReport`，共享组件不渲染埋点相关属性。

### 5. CSS 方案

**决策**：共享组件使用 SCSS module（`index.module.scss`）。

**理由**：
- `order-global-package` 中已有组件均使用 SCSS module，保持一致性
- 样式作用域隔离，无全局污染

**类名映射**（下单侧 BEM → 共享组件 module）：

| 下单侧 (global SCSS) | 共享组件 (module) |
|----------------------|-------------------|
| `.estimation-cost-apply` | `styles['apply-content']` |
| `.estimation-cost-apply-status` | `styles['apply-status']` |
| `.estimation-cost-apply-status-svg` | `styles['status-icon']` |
| `.estimation-cost-apply-status-title` | `styles['status-title']` |
| `.estimation-cost-apply-status-desc` | `styles['status-time']` |
| `.estimation-cost-apply-content` | `styles['apply-reason']` |
| `.estimation-cost-apply-commerce` | `styles['apply-commerce']` |
| `.estimation-cost-apply-commerce-desc` | `styles['commerce-desc']` |
| `.estimation-cost-apply-commerce-business-relation` | `styles['commerce-qr']` |
| `.estimation-cost-apply-commerce-relation` | `styles['commerce-btn']` |

**注意**：运费时效侧现用的 SCSS module 类名与共享组件一致，替换后直接删除原 `index.module.scss`。

### 6. FeeAuthApplyStatus 统一

两端定义相同但形式不同（enum vs const object）。统一为 `const` 对象放入 `order-global-package/constants/`：

```ts
export const FeeAuthApplyStatus = {
  申请查看: 0,
  申请中: 1,
  申请失败: 2,
} as const
```

两端适配层从共享包引入，删除各自定义。

### 7. Bug 修复：下单侧提交时弹窗关闭时机

**现状**（`useApplyPopup.ts` 第 185 行）：
```ts
const onConfirm = () => {
  if (data.value?.status === FeeAuthApplyStatus.申请查看) {
    getEstimatedCostPermission(...).then(...).catch(...)
  }
  modalShow.value = false  // ← BUG: 提交未完成就关闭
}
```

**修复**：`modalShow.value = false` 移到 `.then()` 成功分支内，失败时不关闭。对齐运费时效侧的 async/await 模式。

### 8. Bug 修复：运费时效侧联系人电话硬编码

**现状**（`estimated-shipping-popup/index.vue` 第 125 行）：
```ts
const contactPhone = ref('95324')  // ← BUG: 硬编码
```

同页面（freight-time index）已有正确用法（第 97 行）：
```html
<ContactBusiness :phone="userInfo?.phone || '95324'" />
```

下单侧 `contactPopup()` 也通过 `piniaStore.root.getUserInfo?.phone` 动态获取。

**修复**：引入 `useUserInfo()` hook，替换为：
```ts
import { useUserInfo } from '@public/hooks/useUserInfo'
const { userInfo } = useUserInfo()
const contactPhone = computed(() => userInfo.value?.phone || '95324')
```

## Risks / Trade-offs

- **[风险] 运费时效侧新增商务二维码可能无对应数据** → 二维码 URL 为硬编码常量图片，无需后端数据
- **[风险] 联系人拨打行为两边实现不同** → 通过 `@contact` 事件解耦，不影响共享组件
- **[权衡] 不统一提交逻辑** → 两边 API 参数差异（下单有 `operationSource: '20'`）和错误处理不同，强行统一收益低
