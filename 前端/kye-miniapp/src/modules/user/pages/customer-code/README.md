# 客户编码模块 - 组件使用指南

## 概述

本模块提供**客户编码绑定/更换/切换**功能的原生组件实现，从 H5 项目（netc-customer-code）完整迁移至小程序原生项目。

- **技术栈**: Vue 3 + TypeScript + Pinia + miniUI (ky-form/ky-field)
- **表单方案**: 采用 ky-form + ky-field 实现表单验证（参考实名认证 personal-form.vue）
- **位置**: `src/modules/user/pages/customer-code/`
- **路由路径**:
  - 统一入口: `/modules/user/pages/customer-code/index` ⭐ (自动判断模式)
  - 弹窗组件: `customer-code-popup/index.vue` (统一弹窗入口)

---

## 快速开始

### 1️⃣ 弹窗模式（内部调用）- 统一入口 ✅

```vue
<template>
  <view>
    <ky-button @click="showPopup = true">打开客户编码</ky-button>

    <!-- 统一弹窗入口（自动判断模式） -->
    <CustomerCodePopup
      v-model:visible="showPopup"
      @confirm="handleConfirm"
      @cancel="handleCancel"
      @switch="handleSwitch"
      ref="popupRef"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CustomerCodePopup from '@/modules/user/pages/customer-code/customer-code-popup/index.vue'

const showPopup = ref(false)
const popupRef = ref()

function handleConfirm(data?: any) {
  console.log('操作成功:', data)
}

function handleCancel() {
  console.log('用户取消')
}

function handleSwitch(company?: any) {
  console.log('切换到:', company?.memberName)
}

// 手动刷新模式
async function refresh() {
  await popupRef.value?.refreshMode()
}
</script>
```

**优势**: 无需判断用户状态，弹窗会自动显示对应的模式（绑定/切换/更换）

---

### 2️⃣ 页面模式（外部跳转）- 统一入口 ✅

```typescript
import Taro from '@tarojs/taro'

// 跳转到统一入口页面（自动判断模式）
Taro.navigateTo({
  url: '/modules/user/pages/customer-code/index',
})
```

**优势**: 无需判断跳转到哪个页面，统一入口会根据 API 返回自动渲染对应组件

---

## 架构设计

### 公共UI结构

```
┌─────────────────────────────────────┐
│  Banner (客户编码图片)              │ ← 公共组件
│  DecorateTitle (模式标题)            │ ← 公共组件（根据mode动态显示）
├─────────────────────────────────────┤
│                                     │
│  模式特定内容（根据 mode 渲染）       │
│  ┌─────────────────────────────┐   │
│  │ mode='bind'                 │   │
│  │ └─ BindCodeForm.vue        │   │
│  ├─────────────────────────────┤   │
│  │ mode='change'               │   │
│  │ └─ ChangeCodeCard.vue       │   │
│  ├─────────────────────────────┤   │
│  │ mode='switch'               │   │
│  │ └─ CompanyList.vue          │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**核心组件职责**:

| 组件 | 职责 | 包含内容 |
|------|------|---------|
| **统一入口** (page/popup) | UI容器 + 模式判断 | Banner + DecorateTitle + 模式组件 |
| **BindCodeForm** | 绑定表单逻辑 | ApplySection + 表单 + 提交按钮 |
| **ChangeCodeCard** | 更换信息展示 | 公司信息 + SwitchDepartmentSection |
| **CompanyList** | 切换列表 | 公司列表 + 解绑/切换操作 |
| **SwitchDepartmentSection** | 部门切换 | 部门信息 + 切换弹窗 |

---

### BindCodeForm (绑定表单核心组件)

**位置**: `components/bind-code/BindCodeForm.vue`

**技术实现**: 采用 `ky-form` + `ky-field` 组件（参考实名认证 `personal-form.vue`）

**表单验证体系**:
- ✅ 使用 `ky-form` 统一管理表单状态和验证
- ✅ 使用 `ky-field` 的 `rules` 属性配置校验规则
- ✅ 支持 `formRef.validate()` 进行整表单校验
- ✅ 支持 `formRef.reset()` 重置表单
- ✅ 错误提示通过 Popover 气泡自动展示

#### 表单字段

| 字段名             | 类型     | 必填 | 说明                         |
| ------------------ | -------- | ---- | ---------------------------- |
| `customerCode`     | `string` | ✅   | 客户编码（最大20字符）       |
| `customerPassword` | `string` | ✅   | 客户编码密码（最大50字符）   |
| `memberName`       | `string` | ❌   | 姓名（选填，最大20字符）    |

#### 校验规则

```typescript
// 客户编码：必填
{ required: true, message: '请输入客户编码' }

// 密码：必填
{ required: true, message: '请输入客户编码密码' }

// 姓名：无强制校验（选填）
[]
```

#### Expose 方法

| 方法名         | 参数 | 返回值      | 说明               |
| -------------- | ---- | ----------- | ------------------ |
| `validate()`   | 无   | `Promise`   | 触发表单整体验证   |
| `reset()`      | 无   | `void`      | 重置表单数据和状态 |
| `clearValidate(props?)` | `string \| string[]` | `void` | 清除指定字段校验状态 |

#### Props

无 Props（纯逻辑组件，状态通过 Store 管理）

#### Events

| 事件名    | 参数           | 说明         |
| --------- | -------------- | ------------ |
| `confirm` | `(data?: any)` | 绑定成功回调 |
| `cancel`  | 无             | 用户取消     |

#### 使用示例

```vue
<template>
  <BindCodeForm ref="bindFormRef" @confirm="onConfirm" @cancel="onCancel" />
</template>

<script setup lang="ts">
import BindCodeForm from './BindCodeForm.vue'
import { ref } from 'vue'

const bindFormRef = ref()

function onConfirm(data?: any) {
  console.log('绑定成功:', data)
}

function onCancel() {
  console.log('用户取消')
}

// 外部调用重置方法
function reset() {
  bindFormRef.value?.reset?.()
}
</script>
```

---

### ChangeCodeCard (更换信息卡片)

**位置**: `components/change-code/ChangeCodeCard.vue`

#### Props

| 属性             | 类型      | 默认值  | 说明                               |
| ---------------- | --------- | ------- | ---------------------------------- |
| `showDepartment` | `boolean` | `false` | 是否显示部门切换（快速寄件页场景） |

#### Events

| 事件名             | 参数                     | 说明                   |
| ------------------ | ------------------------ | ---------------------- |
| `switchDepartment` | `(dept: DepartmentInfo)` | 部门切换成功           |
| `applyOther`       | 无                       | 点击"申请绑定其他公司" |

#### 使用示例

```vue
<template>
  <ChangeCodeCard :show-department="isExpressPage" @switch-department="onSwitchDept" @apply-other="onApplyOther" />
</template>

<script setup lang="ts">
import ChangeCodeCard from './ChangeCodeCard.vue'
import { computed } from 'vue'

// 是否快速寄件页
const isExpressPage = computed(() => {
  return true // 从路由参数或全局状态获取
})

function onSwitchDept(dept: any) {
  console.log('切换到部门:', dept.departmentName)
}

function onApplyOther() {
  // 跳转到统一入口页面（自动判断模式）
  Taro.navigateTo({
    url: '/modules/user/pages/customer-code/index',
  })
}
</script>
```

---

### CompanyList (公司列表组件)

**位置**: `components/switch-code/CompanyList.vue`

#### Props

| 属性             | 类型      | 默认值     | 说明                         |
| ---------------- | --------- | ---------- | ---------------------------- |
| `showManageMode` | `boolean` | `true`     | 是否显示管理模式（解绑按钮） |
| `showHelp`       | `boolean` | `false`    | 是否显示帮助图标             |
| `maxHeight`      | `string`  | `'800rpx'` | 列表最大高度                 |

#### Events

| 事件名    | 参数                     | 说明               |
| --------- | ------------------------ | ------------------ |
| `switch`  | `(company: CompanyInfo)` | 切换绑定成功       |
| `unbind`  | `(company: CompanyInfo)` | 解绑成功           |
| `addCode` | 无                       | 点击"添加客户编码" |

#### 使用示例

```vue
<template>
  <CompanyList
    :show-manage-mode="true"
    max-height="600rpx"
    @switch="onSwitch"
    @unbind="onUnbind"
    @add-code="onAddCode"
  />
</template>

<script setup lang="ts">
import CompanyList from './CompanyList.vue'
import type { CompanyInfo } from './types/customer-code'

function onSwitch(company: CompanyInfo) {
  console.log('切换到:', company.customerName)
}

function onUnbind(company: CompanyInfo) {
  console.log('解绑:', company.customerName)
}

function onAddCode() {
  // 跳转到统一入口页面（自动切换到绑定模式）
  Taro.navigateTo({
    url: '/modules/user/pages/customer-code/index',
  })
}
</script>
```

---

## 共享子组件

### Banner (顶部Banner)

**位置**: `components/shared/Banner.vue`

```vue
<Banner type="bind" />
<!-- 绑定模式 -->
<Banner type="change" />
<!-- 更换模式 -->
<Banner type="switch" />
<!-- 切换模式 -->
```

| Props      | 类型                             | 默认值   | 说明         |
| ---------- | -------------------------------- | -------- | ------------ |
| `type`     | `'bind' \| 'change' \| 'switch'` | `'bind'` | Banner类型   |
| `title`    | `string`                         | `''`     | 自定义标题   |
| `subtitle` | `string`                         | `''`     | 自定义副标题 |

---

### ApplySection (申请商务区域)

**位置**: `components/shared/ApplySection.vue`

```vue
<ApplySection :show-learn-more="true" @apply="onApply" @learn-more="onLearnMore" />
```

| Props           | 类型      | 默认值 | 说明                   |
| --------------- | --------- | ------ | ---------------------- |
| `showLearnMore` | `boolean` | `true` | 是否显示"了解更多"链接 |

**注意**: 当前版本点击申请会提示"暂不支持"

---

### BindTag (当前绑定标签)

**位置**: `components/shared/BindTag.vue`

```vue
<BindTag type="primary" text="当前绑定" />
```

| Props  | 类型                                  | 默认值       | 说明     |
| ------ | ------------------------------------- | ------------ | -------- |
| `type` | `'default' \| 'primary' \| 'warning'` | `'primary'`  | 标签样式 |
| `text` | `string`                              | `'当前绑定'` | 标签文本 |

---

### Alert (确认弹窗)

**位置**: `components/shared/Alert.vue`

```vue
<Alert
  :visible="showAlert"
  title="提示"
  content="确定要执行此操作吗？"
  confirm-text="确定"
  cancel-text="取消"
  :show-cancel="true"
  @confirm="onConfirm"
  @cancel="onCancel"
/>
```

| Props         | 类型      | 默认值   | 说明                 |
| ------------- | --------- | -------- | -------------------- |
| `visible`     | `boolean` | **必填** | 是否显示             |
| `title`       | `string`  | `''`     | 弹窗标题             |
| `content`     | `string`  | **必填** | 弹窗内容（支持HTML） |
| `confirmText` | `string`  | `'确定'` | 确认按钮文本         |
| `cancelText`  | `string`  | `'取消'` | 取消按钮文本         |
| `showCancel`  | `boolean` | `true`   | 是否显示取消按钮     |
| `closable`    | `boolean` | `true`   | 是否可点击遮罩关闭   |

---

## Pinia Store 使用

### 导入 Store

```typescript
import { useCustomerCodeStore } from '@/modules/user/pages/customer-code/store/customerCode'

const store = useCustomerCodeStore()
```

### 常用 Getters

```typescript
// 是否已绑定
if (store.isBound) {
  console.log('当前客户编码:', store.currentCustomerCode)
  console.log('当前公司名称:', store.currentCompanyName)
}
```

### 常用 Actions

```typescript
// 设置加载状态
store.setLoading(true)

// 重置表单
store.resetBindForm()

// 更新字段
store.updateBindForm('customerCode', '075512345607')

// 重置所有状态
store.reset()
```

---

## Hooks 使用

### useBindForm (绑定表单Hook)

**适配 ky-form + ky-field 验证体系**

```typescript
import { useBindForm } from '@/hooks/useBindForm'

const {
  form, // 表单数据 (reactive)
  getRules, // 获取字段校验规则方法
  handleFieldBlur, // 字段失焦处理（可选额外逻辑）
  validate, // 手动校验（备用，建议使用 formRef.validate()）
  submit, // 提交方法
  resetForm, // 重置表单数据
} = useBindForm()

// 获取客户编码校验规则
const rules = getRules('customerCode')
// 返回: [{ required: true, message: '请输入客户编码' }]

// 手动提交（携带验证码等额外参数）
await submit({ safeVerifyId: 'xxx' })
```

#### 与旧版本对比

| 功能 | 旧版本 (ky-input) | 新版本 (ky-form/ky-field) |
|------|-------------------|--------------------------|
| 校验管理 | 手动维护 `errors` 对象 | `ky-form` 统一管理 |
| 错误展示 | 自定义错误气泡 | `Popover` 自动展示 |
| 规则配置 | `useValidate.ts` 独立函数 | `rules` 属性内联配置 |
| 表单引用 | 无 | `formRef.validate()/reset()` |

### useCompanyList (公司列表Hook)

```typescript
import { useCompanyList } from '@/hooks/useCompanyList'

const {
  companyList, // 公司列表 (ref)
  loading, // 加载状态 (computed)
  fetchList, // 获取列表
  unbind, // 解绑
  switchBind, // 切换绑定
  fetchDepartments, // 获取部门列表
  switchDept, // 切换部门
} = useCompanyList()

// 加载列表
await fetchList()
```

---

## 埋点集成

所有埋点函数已封装在 `report/index.ts` 中，自动在以下时机触发：

### 自动触发的埋点

- ✅ **页面曝光**: 进入绑定/更换/切换页面时自动上报
- ✅ **按钮点击**: 确认/忘记密码/申请/解绑/切换等操作自动上报
- ✅ **业务结果**: 绑定/切换/解绑的成功/失败结果自动上报
- ✅ **弹窗曝光**: 解绑确认弹窗、部门切换弹窗打开时自动上报

### 手动调用（如需）

```typescript
import { exp_customer_code_bind_page, clk_customer_code_button } from '@/report/index'

// 手动触发页面曝光
exp_customer_code_bind_page()

// 手动触发点击
clk_customer_code_button('自定义按钮')
```

---

## 样式规范

### 独立 SCSS 文件

每个 `.vue` 组件都有对应的 `.scss` 文件：

```
components/
├── bind-code/
│   ├── BindCodeForm.vue     # 组件文件
│   └── index.scss          # 样式文件
├── shared/
│   ├── Alert.vue
│   └── alert.scss
...
```

### 引入方式

```vue
<style lang="scss" scoped src="./index.scss"></style>
```

### 样式特点

- ✅ 使用 **rpx** 单位（小程序适配）
- ✅ **scoped** 样式隔离
- ✅ **BEM/kebab-case** 命名
- ✅ **safe-area-inset-bottom** 底部安全区
- ✅ 最多 **3层嵌套**

---

## 注意事项

### ⚠️ 当前限制

1. **联系商务功能暂不可用**
   - 点击"申请专属服务方案" → 提示"该功能暂不支持"
   - 后续可集成 `@/public/components/business/contact-business`

2. **图形验证码**
   - 已集成现有 captcha 组件
   - 触发条件：API 返回错误码 `264587`

3. **忘记密码功能**
   - 当前提示"暂不支持"
   - 后续需对接 `userBindIsWebHide` 接口

### 🔧 性能优化建议

1. **懒加载**: 大量公司列表时使用虚拟滚动
2. **缓存策略**: 缓存公司列表，避免重复请求
3. **防抖处理**: 输入框校验使用防抖减少请求

### 📱 兼容性

- ✅ 微信小程序
- ✅ 支付宝小程序
- ✅ H5 浏览器
- ✅ 微信电脑桌面端

---

## 目录结构总览

```
src/modules/user/pages/customer-code/
│
├── index.vue                    # 【统一页面入口】⭐ 根目录
├── index.config.ts              # 页面配置
│
├── customer-code-popup/         # 【统一弹窗入口】
│   ├── index.vue                # 自动判断模式的弹窗（含Banner+标题）
│   └── index.scss               # 弹窗样式
│
├── components/                  # 核心业务组件（纯功能，无UI模式感知）
│   ├── bind-code/
│   │   ├── BindCodeForm.vue     # 绑定表单（仅表单逻辑）
│   │   └── index.scss           # 表单样式
│   ├── change-code/
│   │   ├── ChangeCodeCard.vue        # 更换信息卡片（公司信息展示）
│   │   ├── SwitchDepartmentSection.vue ⭐ 新增：部门切换独立组件
│   │   ├── SwitchDepartmentPopup.vue  # 部门切换弹窗
│   │   └── *.scss                   # 样式文件
│   ├── switch-code/
│   │   ├── CompanyList.vue      # 公司列表（无标题，由统一入口提供）
│   │   └── index.scss           # 列表样式
│   └── shared/                  # 公共子组件
│       ├── Banner.vue           ⭐ 公共Banner（三种模式共用）
│       ├── DecorateTitle.vue    ⭐ 公共标题（根据mode动态显示）
│       ├── ApplySection.vue
│       ├── BindTag.vue
│       ├── Alert.vue
│       └── *.scss
│
├── hooks/                    # 公共Hooks
│   ├── useCustomerCodeMode.ts  # 模式判断Hook
│   ├── useBindForm.ts
│   ├── useCompanyList.ts
│   ├── useValidate.ts
│   └── useCustomerCode.ts
│
├── store/                    # Pinia Store
├── apis/                     # API接口
├── types/                    # TypeScript类型
├── constants/                # 枚举常量
└── report/                   # 埋点上报
```

**✨ v1.4.0 架构优化亮点**:

- ✅ **公共UI提取**: Banner + DecorateTitle 提取到统一入口，三种模式复用
- ✅ **组件职责清晰**: 核心组件只关注业务逻辑，不包含公共UI
- ✅ **部门切换独立**: SwitchDepartmentSection 独立组件，可灵活组合
- ✅ **唯一入口**: 删除独立页面，统一使用 pages/index 入口
- ✅ **代码精简**: 减少重复代码，提升维护性

**✨ 架构亮点**:

- **统一入口**: 弹窗和页面都有统一的入口，自动判断模式
- **核心组件纯净**: `components/` 下的组件只关注业务逻辑，不感知 UI 模式
- **逻辑复用**: `useCustomerCodeMode` Hook 同时服务于页面和弹窗
- **清晰分层**: pages(容器) → components(核心) → hooks(逻辑) → store(状态)

---

## 更新日志

### v1.4.0 (2026-01-10) - 公共UI提取与架构优化 ✨

- ✅ **公共Banner+标题提取**: 将 Banner 和 DecorateTitle 移到统一入口（page/popup），三种模式复用
- ✅ **核心组件精简**: BindCodeForm/ChangeCodeCard/CompanyList 移除公共UI，只保留业务逻辑
- ✅ **部门切换独立组件**: 新增 `SwitchDepartmentSection.vue`，从 ChangeCodeCard 中抽离
- ✅ **删除独立页面**: 移除 pages/bind、pages/change、pages/switch 目录
- ✅ **路由简化**: 路由配置只保留 `customer-code/index` 唯一入口
- ✅ **组件职责清晰**: 统一入口负责UI容器，核心组件专注业务逻辑
- ✅ **目录扁平化**: 页面入口直接放在 customer-code/ 根目录，减少层级

**架构优化前后对比**:

```
❌ 旧架构 (v1.3.0):
├── BindCodeForm.vue (包含 Banner + 标题 + 表单)
├── ChangeCodeCard.vue (无 Banner，不统一)
├── CompanyList.vue (包含自己的标题)
└── pages/bind, change, switch (独立页面)

✅ 新架构 (v1.4.0):
├── index.vue / customer-code-popup (统一入口: Banner + 标题 + 模式组件) ⭐
├── BindCodeForm.vue (纯表单逻辑)
├── ChangeCodeCard.vue (公司信息 + SwitchDepartmentSection)
├── CompanyList.vue (纯列表逻辑)
└── SwitchDepartmentSection.vue (独立部门切换组件)
```

**新增文件**:
- ✅ `components/change-code/SwitchDepartmentSection.vue` - 部门切换独立组件

**删除的目录**:
- ❌ `pages/bind/` (绑定独立页面)
- ❌ `pages/change/` (更换独立页面)
- ❌ `pages/switch/` (切换独立页面)
- ❌ `pages/index/` (多余的层级目录)

**修改的文件**:
- 🔧 `index.vue` - 统一页面入口（从 pages/index 移到根目录）
- 🔧 `index.config.ts` - 页面配置（从 pages/index 移到根目录）
- 🔧 `customer-code-popup/index.vue` - 添加 Banner + DecorateTitle
- 🔧 `BindCodeForm.vue` - 移除 Banner 和 DecorateTitle
- 🔧 `CompanyList.vue` - 移除独立标题
- 🔧 `ChangeCodeCard.vue` - 使用 SwitchDepartmentSection 替代内联代码

---

### v1.3.0 (2026-01-10) - 统一入口架构 ✨

- ✅ **统一页面入口**: 新增 `index.vue`（统一页面入口），自动判断并渲染对应模式
- ✅ **统一弹窗入口**: 新增 `customer-code-popup/index.vue`，自动判断并显示对应模式
- ✅ **模式判断Hook**: 提取 `useCustomerCodeMode.ts`，复用模式判断逻辑
- ✅ **简化外部调用**: 无需判断用户状态，直接使用统一入口
- ✅ **清理冗余代码**: 删除独立的弹窗容器组件（已被统一入口替代）
- ✅ **默认安全模式**: API失败时默认显示 'bind' 模式
- ✅ **Loading优化**: 统一入口显示加载状态，提升用户体验
- ✅ **文档同步**: 更新 README 和 OpenSpec 设计文档

**核心特性**:

```typescript
// 页面模式 - 自动判断
Taro.navigateTo({ url: '/modules/user/pages/customer-code/pages/index/index' })

// 弹窗模式 - 自动判断
<CustomerCodePopup v-model:visible="showPopup" @confirm="handleConfirm" />
```

**删除的文件**:
- ❌ `components/bind-code/index.vue` (绑定弹窗容器)
- ❌ `components/bind-code/popup.scss`
- ❌ `components/change-code/index.vue` (更换弹窗容器)
- ❌ `components/change-code/change-popup.scss`
- ❌ `components/switch-code/index.vue` (切换弹窗容器)
- ❌ `components/switch-code/switch-popup.scss`

**新增的文件**:
- ✅ `pages/index/index.vue` + `index.config.ts` (统一页面入口)
- ✅ `customer-code-popup/index.vue` + `index.scss` (统一弹窗入口)
- ✅ `hooks/useCustomerCodeMode.ts` (模式判断Hook)

---

### v1.2.0 (2026-01-09) - 导航栏配置优化

- ✅ **使用 Taro 原生导航栏**: 移除自定义导航栏，改为 `index.config.ts` 配置
- ✅ **参考实名认证模块**: 对齐 `realname/personal/index.config.ts` 的配置模式
- ✅ **简化页面代码**: 移除 `nav-bar`、`.back-icon`、`.nav-title` 等自定义组件
- ✅ **优化样式文件**: 删除不需要的导航栏样式，保持样式文件简洁
- ✅ **配置项统一**: 使用 `definePageConfig` + `navigationStyle: 'default'` + 透明标题

**页面配置示例:**

```typescript
// index.config.ts
// @ts-ignore
export default definePageConfig({
  navigationBarTitleText: '绑定客户编码',
  transparentTitle: '绑定客户编码',
  navigationStyle: 'default',
  navigationBarFrontColor: 'black',
  navigationBarTextStyle: 'black',
  renderer: 'webview',
})
```

---

### v1.1.0 (2026-01-09) - 表单组件升级

- ✅ **重构表单组件**: 采用 `ky-form` + `ky-field` 替换 `ky-input`
- ✅ **参考实名认证**: 对齐 `personal-form.vue` 的实现模式
- ✅ **统一验证体系**: 使用 ky-form 的 `rules` 属性配置校验规则
- ✅ **自动错误提示**: 通过 Popover 气泡展示校验错误
- ✅ **优化 Hook**: 简化 useBindForm，移除冗余的错误管理逻辑
- ✅ **更新文档**: 完善组件 API 说明和使用示例

---

### v1.0.0 (2026-01-09)

- ✅ 完整迁移 H5 项目客户编码功能
- ✅ 实现 3大核心功能：绑定/更换/切换
- ✅ 支持 Page/Popup 双模式
- ✅ 使用 miniUI 组件库
- ✅ TypeScript + Pinia + Hooks 架构
- ✅ 完整埋点集成
- ✅ 路由注册完成

---

## 联系与支持

如有问题或建议，请联系开发团队或查看 OpenSpec 文档：

- 📄 Proposal: [proposal.md](../openspec/changes/customer-code-migration/proposal.md)
- 📐 Design: [design.md](../openspec/changes/customer-code-migration/design.md)
- ✅ Tasks: [tasks.md](../openspec/changes/customer-code-migration/tasks.md)
