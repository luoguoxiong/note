## Context

### 背景

当前跨越寄件小程序的客户编码功能通过 **H5 WebView** 加载远程组件（`netc-customer-code` 项目），存在以下问题：

1. **性能瓶颈**: WebView 加载 + JS 解析导致响应时间 > 200ms
2. **技术栈陈旧**: 使用 React + MobX + JavaScript，与当前项目 Vue 3 + Pinia + TypeScript 技术栈不一致
3. **维护成本高**: 两套代码库，功能迭代需同步维护 H5 和小程序两端
4. **用户体验差**: 页面跳转白屏、交互延迟、原生能力受限

### 当前状态

**H5 源码结构** (`D:\UserProject\netc-customer-code\src\components\kye-customer-code\`):

- 核心组件: `bindCode`(绑定表单)、`changeCode`(更换信息)、`switchCode`(切换列表)
- 状态管理: MobX Store (`business.js`, `page.js`)
- 服务层: 18个 API 接口 (`service/index.js`)
- 支持双模式: Page(全屏页面) + Popup(弹窗)

**目标项目现状** (`d:\UserProject\kye-miniapp-new\src\modules\user\`):

- 技术栈: Vue 3 + Taro 4 + Pinia + TypeScript
- 已有基础设施:
  - 图形验证码组件: `src/public/components/base/captcha/`
  - 联系商务组件: `src/public/components/business/contact-business/`
  - 埋点工具: `src/public/utils/reportUtil.ts`
  - 实名认证模块参考实现 (Store/Hooks/Report 模式)
- 现有 `scanBindCode` 页面仅作为 WebView 容器，需替换为原生实现

### 约束条件

1. **向后兼容**: 必须保留所有现有功能和异常处理逻辑
2. **API 兼容**: 后端接口不变，仅前端重构
3. **埋点完整**: 所有埋点事件必须完整迁移（参考实名认证模块）
4. **性能要求**: 响应时间 < 200ms
5. **双模式支持**: 弹窗(Popup)用于内部调用，页面(Page)用于外部跳转

## Goals / Non-Goals

### Goals ✅

1. **完整功能迁移**: 绑定/更换/切换三大核心功能100%迁移
2. **性能提升**: 响应时间从 >200ms 降至 <200ms
3. **技术栈统一**: 全面采用 Vue 3 + TypeScript + Pinia
4. **代码规范**: 完善类型定义、枚举使用、Hooks 抽离
5. **可维护性**: 清晰的目录结构、组件复用、逻辑分离
6. **双模式复用**: 弹窗/页面共用核心组件，避免重复代码
7. **埋点完整**: 参考实名认证模块，完整迁移所有埋点事件
8. **保留部门切换**: 快速寄件页的"切换下单部门"功能

### Non-Goals ❌

1. **不修改后端 API**: 接口层保持一致，仅前端重构
2. **不启用联系商务**: 点击提示"暂不支持"，暂不集成商务流程
3. **不改变业务规则**: 所有校验、权限、异常处理逻辑保持原样
4. **不做性能过度优化**: 仅满足 <200ms 要求，不追求极致优化
5. **不涉及其他模块**: 仅影响 user 模块内部，无跨团队依赖

## Decisions

### 决策1: 双模式组件架构（弹窗/页面复用）

**选择方案**: **核心组件 + 容器组件分离模式**

```
┌─────────────────────────────────────────────────────────────┐
│                    组件层次结构                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Layer 1: 纯逻辑核心组件 (无UI模式感知)                      │
│  ├── BindCodeForm.vue        # 绑定表单核心                 │
│  ├── ChangeCodeCard.vue      # 更换信息卡片                 │
│  └── CompanyList.vue         # 公司列表核心                  │
│                                                             │
│  Layer 2: 共享子组件                                   │
│  ├── Banner.vue              # 顶部Banner图                │
│  ├── ApplySection.vue        # 申请商务区域（hasBusiness Props + ky-button）                │
│  └── BindTag.vue             # 当前绑定标签                │
│                                                             │
│  Layer 3: 容器组件 (处理布局差异)                           │
│  ├── components/bind-code/index.vue     # Popup容器        │
│  ├── pages/bind/index.vue               # Page容器         │
│  ├── components/change-code/index.vue   # Popup容器        │
│  ├── pages/change/index.vue             # Page容器         │
│  ├── components/switch-code/index.vue   # Popup容器        │
│  └── pages/switch/index.vue             # Page容器         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**理由**:

- ✅ 核心逻辑只写一次，避免重复代码
- ✅ 容器组件处理布局差异（弹窗有关闭按钮，页面使用 Taro 原生导航栏）
- ✅ 页面容器使用 `index.config.ts` 配置导航栏（参考 `realname/personal`）
- ✅ 符合 Vue 3 组合式设计理念
- ✅ 易于测试和维护

**替代方案对比**:

| 方案             | 优点        | 缺点           | 选择 |
| -------------- | --------- | ------------ | -- |
| A. Props控制模式   | 简单直接      | 条件判断多，代码耦合度高 | ❌  |
| B. **核心+容器分离** | 复用性好、职责清晰 | 文件稍多         | ✅  |
| C. 完全独立实现      | 灵活度高      | 大量重复代码       | ❌  |

***

### 决策2: Pinia Store 设计模式

**选择方案**: **单一Store + 模块化Actions**

```typescript
// store/customerCode.ts 结构设计
export const useCustomerCodeStore = defineStore('customerCode', {
  state: (): CustomerCodeState => ({
    // 表单数据
    bindForm: { customerCode: '', customerPassword: '', memberName: '' },

    // 业务数据
    companyInfoList: [] as CompanyInfo[],
    currentCompany: null as CompanyInfo | null,

    // UI状态
    uiState: {
      loading: false,
      mode: 'popup' as DisplayMode,
      showContactBusiness: false,
      showAlert: false,
    } as UIState,

    // 配置数据
    configData: {} as ConfigData,
  }),

  getters: {
    isBound: (state) => !!state.currentCompany,
    currentCustomerCode: (state) => state.currentCompany?.customerCode || '',
  },

  actions: {
    // 数据操作
    async bindCustomerCode(params) { ... },
    async fetchCompanyList() { ... },
    async unbind(customerCode) { ... },
    async switchBind(company) { ... },

    // UI状态管理
    setLoading(loading) { ... },
    setMode(mode) { ... },

    // 重置
    resetBindForm() { ... },
  }
})
```

**理由**:

- ✅ 参考 `realName.ts` Store 模式（已验证可行）
- ✅ 单一Store便于管理相关状态
- ✅ Actions封装业务逻辑，保持组件简洁
- ✅ Getters提供派生状态，避免重复计算

**替代方案对比**:

| 方案                 | 优点        | 缺点        | 选择 |
| ------------------ | --------- | --------- | -- |
| A. 多个Store拆分       | 职责清晰      | 状态同步复杂    | ❌  |
| B. **单一Store**     | 简单直观、状态集中 | Store可能较大 | ✅  |
| C. Composable-only | 更灵活       | 状态管理分散    | ❌  |

***

### 决策3: Hooks 抽离策略

**选择方案**: **按职责分层提取**

```
hooks/
├── useBindForm.ts          # 表单状态+校验+提交逻辑
│   ├── form state management (reactive)
│   ├── validation rules
│   └── submit handler
│
├── useCompanyList.ts       # 公司列表+解绑+切换逻辑
│   ├── fetch list
│   ├── unbind action
│   └── switch action
│
├── useValidate.ts          # 纯校验函数（无状态）
│   ├── validateCustomerCode()
│   ├── validatePassword()
│   └── validateMemberName()
│
└── useCustomerCode.ts      # API调用封装
    ├── bindCustomerCode()
    ├── checkCustomerCode()
    ├── unbindCustomerCode()
    └── getCompanyList()
```

**抽离原则**:

- ✅ **与Store相关的逻辑** → 放在 Store Actions
- ✅ **纯业务逻辑、无状态** → 提取为 Hooks
- ✅ **工具函数** → 放在 constants/utils
- ❌ **不抽离**：过于简单的逻辑（增加复杂度）

**示例: useBindForm Hook**

```typescript
export function useBindForm() {
  const store = useCustomerCodeStore()

  // 表单状态
  const form = reactive({
    customerCode: '',
    customerPassword: '',
    memberName: '',
  })

  // 校验错误
  const errors = ref<Record<string, string>>({})

  // 校验规则
  const rules = {
    customerCode: async (value: string) => {
      if (!value) return '请输入客户编码'
      // 调用API校验...
    },
    // ...
  }

  // 更新字段
  const updateField = (field: keyof typeof form, value: string) => {
    form[field] = value
    errors.value[field] = ''
  }

  // 校验单个字段
  const validateField = async (field: string): Promise<boolean> => { ... }

  // 校验整个表单
  const validateAll = async (): Promise<boolean> => { ... }

  // 提交表单
  const submit = async () => {
    const isValid = await validateAll()
    if (!isValid) return false
    await store.bindCustomerCode({ ...form })
    return true
  }

  return {
    form,
    errors,
    updateField,
    validateField,
    validateAll,
    submit,
    resetForm: () => { /* 重置逻辑 */ }
  }
}
```

**理由**:

- ✅ 组件代码更简洁（只关注UI渲染）
- ✅ 逻辑可复用（多个组件共用同一Hook）
- ✅ 易于单元测试（纯函数逻辑）
- ✅ 符合 Vue 3 Composition API 最佳实践

***

### 决策4: TypeScript 类型体系设计

**选择方案**: **分层类型定义 + 枚举常量**

```
types/
├── customer-code.ts        # 业务实体类型
│   ├── CompanyInfo          # 公司信息
│   ├── BindForm             # 绑定表单
│   ├── ConfigData           # 配置数据
│   └── DepartmentInfo       # 部门信息
│
└── form.ts                  # 表单相关类型
    ├── ValidationRule       # 校验规则
    ├── FormError            # 表单错误
    └── FormState            # 表单状态

constants/
├── index.ts                 # 枚举定义汇总
│   ├── DisplayMode          # 显示模式 (POPUP/PAGE)
│   ├── BindStatus           # 绑定状态 (BIND/ADD/CHANGE)
│   ├── ContactRole          # 联系角色 (BUSINESS/MAIN_AUTH/ADMIN)
│   ├── AlertType            # 弹窗类型
│   └── ApplyScene           # 申请场景
│
└── regular.ts              # 正则表达式常量
    ├── PHONE_REGEX          # 手机号
    ├── CUSTOMER_CODE_REGEX  # 客户编码
    └── NAME_REGEX           # 姓名
```

**枚举使用示例**:

```typescript
// constants/index.ts
export enum DisplayMode {
  POPUP = 'popup',
  PAGE = 'page',
}

export enum BindStatus {
  BIND = '1', // 绑定
  ADD = '2', // 添加
  CHANGE = '3', // 更换
}

// 在组件中使用
const mode = ref<DisplayMode>(DisplayMode.POPUP)
const status = ref<BindStatus>(BindStatus.BIND)
```

**理由**:

- ✅ 类型安全：编译时检查，减少运行时错误
- ✅ 代码智能提示：IDE自动补全
- ✅ 枚举语义化：代码可读性强（比魔法数字好）
- ✅ 易于重构：修改枚举值只需改一处

***

### 决策5: 埋点系统迁移策略

**选择方案**: **参考实名认证模块，统一使用 reportUtil**

```typescript
// report/index.ts 结构（参考 realname/report/index.ts）
import { report_EXP_event, report_CLK_event, report_other_event } from '@public/utils/reportUtil'

// 页面曝光
export function exp_customer_code_bind_page(params?: Record<string, any>) {
  report_EXP_event('page_customer_code_bind', {
    page_name: '绑定客户编码',
    page_type: '绑定客户编码',
    ...params,
  })
}

// 按钮点击
export function clk_customer_code_button(button_name: string, params?: Record<string, any>) {
  report_CLK_event('clk_customer_code_button', {
    button_name,
    page_name: 'page_customer_code_bind',
    work_id: true,
    ...params,
  })
}

// 自定义事件
export function other_customer_code_bind_sub(params: Record<string, any>) {
  report_other_event('other_customer_code_bind_sub', {
    request_result: params.request_result || '成功',
    customer_no: params.customerNo,
    ...params,
  })
}
```

**H5埋点事件清单** (需完整迁移):

| 事件码                                            | 事件名称   | 类型    | 触发场景              |
| ---------------------------------------------- | ------ | ----- | ----------------- |
| `exp_*`                                        | 页面曝光   | EXP   | 进入绑定/更换/切换页面      |
| `clk_customer_code_button`                     | 按钮点击   | CLK   | 确认/忘记密码/申请/了解/保存等 |
| `clk_customer_code_*_button`                   | 子按钮点击  | CLK   | 解绑/切换/申请绑定等       |
| `other_customer_code_bind_sub`                 | 绑定结果   | OTHER | 绑定成功/失败           |
| `other_customer_code_change_sub`               | 切换结果   | OTHER | 切换成功/失败           |
| `exp_change_departments`                       | 部门弹窗曝光 | EXP   | 显示部门切换弹窗          |
| `clk_change_departments_button`                | 部门切换点击 | CLK   | 确认切换部门            |
| `exp_customer_code_unbind_confirmpopup`        | 解绑弹窗曝光 | EXP   | 显示解绑确认框           |
| `clk_customer_code_unbind_confirmpopup_button` | 解绑确认点击 | CLK   | 确认/取消解绑           |
| `other_change_departments_success`             | 部门切换成功 | OTHER | 切换成功回调            |

**理由**:

- ✅ 复用现有埋点基础设施（reportUtil）
- ✅ 与实名认证模块保持一致
- ✅ 统一管理，便于维护和查询
- ✅ 类型安全（TypeScript参数校验）

***

### 决策6: 图形验证码集成方案

**选择方案**: **复用现有 captcha 组件**

```vue
<!-- 在 BindCodeForm.vue 中使用 -->
<template>
  <captcha :show="showCaptcha" @success="handleCaptchaSuccess" @close="showCaptcha = false" />
</template>

<script setup lang="ts">
import Captcha from '@/public/components/base/captcha/index.vue'

const showCaptcha = ref(false)

const handleCaptchaSuccess = (captchaResult: CaptchaResult) => {
  // 携带验证码重新提交
  submitForm(captchaResult.safeVerifyId)
}
</script>
```

**触发场景** (从H5源码分析):

1. **绑定提交时**: 返回错误码 `264587` 且 `type=1` → 显示图形验证码
2. **校验客户编码时**: 返回错误码 `264587` 且 `type=4` → 显示腾讯验证码(暂用图形验证码替代)

**理由**:

- ✅ 直接复用现有组件，无需开发
- ✅ 已适配微信小程序环境
- ✅ 与登录模块保持一致的用户体验

***

### 决策7: 表单组件选型（ky-form + ky-field）

**选择方案**: **采用 miniUI 的 ky-form + ky-field 组件体系**

**参考实现**: 实名认证模块 `personal-form.vue`

**技术对比**:

| 方案                        | 组件                     | 优点                        | 缺点            | 选择      |
| ------------------------- | ---------------------- | ------------------------- | ------------- | ------- |
| A. 原生 input               | `<input>`              | 简单直接                      | 无验证、无样式、需手动实现 | ❌       |
| B. ky-input               | `ky-input`             | 基础输入框                     | 需手动管理校验状态     | ❌ (旧版本) |
| C. **ky-form + ky-field** | `ky-form` + `ky-field` | **统一验证、自动错误提示、Popover气泡** | 学习成本略高        | ✅       |

**实现架构**:

```vue
<!-- BindCodeForm.vue -->
<template>
  <ky-form ref="formRef" :model-value="form">
    <!-- 客户编码字段 -->
    <ky-field
      v-model="form.customerCode"
      prop="customerCode"
      :rules="customerCodeRules"
      label="客户编码"
      placeholder="请输入客户编码"
      required
      :maxlength="20"
      clearable
    />

    <!-- 密码字段 -->
    <ky-field
      v-model="form.customerPassword"
      prop="customerPassword"
      :rules="passwordRules"
      placeholder="请输入客户编码密码"
      type="password"
      :password="!showPassword"
      :maxlength="50"
      clearable
    >
      <template #right>
        <view class="forget-password">忘记密码</view>
      </template>
      <template #suffix>
        <KyImage :name="showPassword ? 'icon-eye-open' : 'icon-eye-close'" />
      </template>
    </ky-field>

    <!-- 姓名字段（选填） -->
    <ky-field
      v-model="form.memberName"
      prop="memberName"
      :rules="nameRules"
      label="姓名"
      placeholder="请输入真实姓名以便公司核实管理（选填）"
      :maxlength="20"
      clearable
    />
  </ky-form>
</template>
```

**校验规则配置**:

```typescript
// useBindForm.ts
// v1.5.0 更新：对齐 H5 bindCode/index.jsx 的完整校验规则
function getRules(field: string): FormItemRule[] {
  switch (field) {
    case 'customerCode':
      // 必填 + checkCustomerCode API 异步校验（与 H5 一致）
      return [
        { required: true, message: '请输入客户编码' },
        {
          validator: async (_rule: any, value: string) => {
            await checkCustomerCode({ customerCode: value })
          },
        },
      ]
    case 'customerPassword':
      return [{ required: true, message: '请输入客户编码密码' }]
    case 'memberName':
      // 中英文正则校验（与 H5 /[^\u4e00-\u9fa5a-zA-Z]/g 一致）
      const NAME_REGEX = /[^\u4e00-\u9fa5a-zA-Z]/
      return [
        {
          validator: (_rule: any, value: string) => {
            if (NAME_REGEX.test(value)) throw new Error('请输入中英文姓名')
          },
        },
      ]
    default:
      return []
  }
}
```

**表单方法暴露**:

```typescript
defineExpose({
  validate: () => formRef.value?.validate(),
  reset: () => {
    resetForm()
    formRef.value?.reset()
  },
  clearValidate: (props?: string | string[]) => {
    formRef.value?.clearValidate(props)
  },
})
```

**核心优势**:

1. ✅ **统一验证管理**: `ky-form` 自动管理表单状态和错误信息
2. ✅ **声明式规则**: 通过 `rules` 属性内联配置，代码更清晰
3. ✅ **自动错误提示**: Popover 气泡自动展示校验错误，无需手动维护
4. ✅ **方法复用**: `validate()`/`reset()`/`clearValidate()` 开箱即用
5. ✅ **与项目对齐**: 与实名认证模块保持一致，降低维护成本
6. ✅ **类型安全**: 完整的 TypeScript 类型定义

**Hook 简化对比**:

```typescript
// ❌ 旧版本 (ky-input): 需手动维护 errors 和 currentFocusField
const { form, errors, currentFocusField, updateField, handleBlur } = useBindForm()

// ✅ 新版本 (ky-form/ky-field): 校验由组件管理，Hook 只关注业务逻辑
const { form, getRules, handleFieldBlur, submit, resetForm } = useBindForm()
```

**理由**:

- ✅ 参考 `personal-form.vue` 成功案例（已在线上运行）
- ✅ 减少样板代码（移除手动错误管理逻辑）
- ✅ 提升用户体验（统一的错误提示样式）
- ✅ 符合项目组件规范（强制使用 miniUI 组件）

***

### 决策8: 统一入口 + 自动模式判断（方案B）

**选择方案**: **统一入口页面 + API驱动的模式判断**

**背景**:

原H5项目 (`netc-customer-code`) 存在三种独立页面：

- `page/bind.jsx` - 绑定客户编码
- `page/change.jsx` - 更换客户编码
- `page/switch.jsx` - 切换客户编码

外部调用时需要根据用户状态判断跳转到哪个页面，增加了外部模块的复杂度。

**解决方案**: 创建统一入口页面，内部自动判断模式

```
┌─────────────────────────────────────────────────────────────┐
│                    统一入口架构                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  外部调用（无需判断模式）                                     │
│  └── Taro.navigateTo({ url: '/modules/user/pages/customer-code/pages/index/index' })
│                                                             │
│  统一入口页 (pages/index/index.vue)                         │
│  ├── 1. 显示 Loading 状态                                   │
│  ├── 2. 调用 getAppUserRelationAuth() API                   │
│  ├── 3. 根据返回数据自动判断模式                              │
│  └── 4. 渲染对应的核心组件                                   │
│                                                             │
│  模式判断逻辑 (useCustomerCodeMode.ts Hook)                 │
│  ├── hasCurBind=false → bind（未绑定）                      │
│  ├── hasCurBind=false + bindAuth + existedRelationBind      │
│  │   └── switch（可切换到已关联公司）                        │
│  ├── hasCurBind=true + bindAuth → switch（有权限切换）       │
│  ├── hasCurBind=true + existedRelationBind                  │
│  │   └── switch（有关联记录可切换）                          │
│  └── hasCurBind=true + !bindAuth + !existedRelationBind     │
│      └── change（只能更换当前绑定）                          │
│                                                             │
│  渲染组件                                                    │
│  ├── mode='bind'   → BindCodeForm.vue                      │
│  ├── mode='change' → ChangeCodeCard.vue                    │
│  └── mode='switch' → CompanyList.vue                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**核心代码实现**:

```typescript
// hooks/useCustomerCodeMode.ts
export type CustomerCodeMode = 'bind' | 'switch' | 'change'

const DEFAULT_MODE: CustomerCodeMode = 'bind' // 默认绑定模式

function determineMode(customerInfo: CommonData | null): CustomerCodeMode {
  if (!customerInfo) return DEFAULT_MODE

  const { hasCurBind, bindAuth, existedRelationBind } = customerInfo

  if (!hasCurBind) {
    if (bindAuth && existedRelationBind) return 'switch'
    return 'bind'
  }

  if (bindAuth) return 'switch'
  if (existedRelationBind) return 'switch'

  return 'change'
}

export function useCustomerCodeMode() {
  const mode = ref<CustomerCodeMode>(DEFAULT_MODE)
  const loading = ref(false)

  async function initMode(): Promise<void> {
    loading.value = true
    try {
      const res = await getAppUserRelationAuth()
      const data = res?.data || res || null
      mode.value = determineMode(data)
    } catch (error) {
      console.error('获取用户权限信息失败:', error)
      mode.value = DEFAULT_MODE // 失败时使用默认模式
    } finally {
      loading.value = false
    }
  }

  return { mode, loading, initMode, setMode, resetMode }
}
```

```vue
<!-- pages/index/index.vue -->
<template>
  <view class="customer-code-index">
    <!-- Loading 状态 -->
    <view v-if="loading" class="loading-container">
      <ky-loading type="spinner" size="40px" color="#8365f3" />
      <text class="loading-text">正在加载...</text>
    </view>

    <!-- 根据模式渲染不同组件 -->
    <BindCodeForm v-if="!loading && mode === 'bind'" @confirm="handleBindConfirm" />
    <ChangeCodeCard v-if="!loading && mode === 'change'" @switch-department="handleSwitchDept" />
    <CompanyList v-if="!loading && mode === 'switch'" @switch="handleSwitch" @unbind="handleUnbind" />
  </view>
</template>

<script setup lang="ts">
import { useCustomerCodeMode } from '../../hooks/useCustomerCodeMode'

const { mode, loading, initMode } = useCustomerCodeMode()

onMounted(async () => {
  await initMode()
  Taro.setNavigationBarTitle({ title: pageUrlTitle.value })
})
</script>
```

**路由配置**:

```typescript
// wx.config.ts / alipay.config.ts
{
  root: 'modules/user',
  pages: [
    // 统一入口（唯一页面）
    'pages/customer-code/index',
  ],
}
```

**理由**:

- ✅ **简化外部调用**: 外部模块无需判断用户状态，直接跳转统一入口
- ✅ **目录扁平化**: 页面入口直接在 customer-code/ 根目录，减少层级
- ✅ **默认安全模式**: 默认显示 'bind' 模式，API失败时有合理降级
- ✅ **用户体验优化**: 先显示Loading，避免白屏或闪烁
- ✅ **动态标题**: 根据模式自动设置导航栏标题（绑定/切换/更换）
- ✅ **内部闭环**: 模式判断逻辑完全封装在 customer-code 模块内部

**替代方案对比**:

| 方案                 | 优点            | 缺点                    | 选择 |
| ------------------ | ------------- | --------------------- | -- |
| A. 外部判断+跳转不同页面     | 实现简单          | 外部模块复杂度高、需维护状态        | ❌  |
| B. **统一入口+内部模式判断** | **调用简单、内聚性高** | **需额外Hook、Loading状态** | ✅  |
| C. 仅保留独立页面         | 与H5完全一致       | 外部需自行判断模式             | ❌  |

**使用示例**:

```typescript
// 外部调用（无需任何判断）
import Taro from '@tarojs/taro'

function navigateToCustomerCode() {
  // 直接跳转统一入口，内部自动判断模式
  Taro.navigateTo({
    url: '/modules/user/pages/customer-code/pages/index/index',
  })
}

// 特殊场景：直接跳转到统一入口（可选，一般不需要）
function navigateToCustomerCode() {
  Taro.navigateTo({
    url: '/modules/user/pages/customer-code/index',
  })
}
```

### 弹窗模式统一入口

**与页面模式保持一致的设计理念**: 创建统一弹窗组件，内部自动判断并显示对应模式

```
┌─────────────────────────────────────────────────────────────┐
│                    统一弹窗架构                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  外部调用（无需判断模式）                                     │
│  └── <CustomerCodePopup v-model:visible="showPopup" />      │
│                                                             │
│  统一弹窗组件 (customer-code-popup/index.vue)                     │
│  ├── 使用 ky-popup 作为容器                                  │
│  ├── 监听 visible 变化，自动调用 initMode()                   │
│  ├── 显示 Loading 状态                                      │
│  └── 根据模式渲染不同内容                                    │

│  模式渲染（与页面模式一致）                                   │
│  ├── mode='bind'   → BindCodeForm + "绑定客户编码"标题       │
│  ├── mode='change' → ChangeCodeCard + 底部按钮组             │
│  └── mode='switch' → CompanyList + "切换客户编码"标题        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**核心代码实现**:

```vue
<!-- customer-code-popup/index.vue -->
<template>
  <ky-popup :show="visible" mode="bottom" @close="handleClose">
    <view class="customer-code-popup">
      <!-- Loading 状态 -->
      <view v-if="loading" class="loading-container">
        <ky-loading type="spinner" size="40px" color="#8365f3" />
        <text class="loading-text">正在加载...</text>
      </view>

      <!-- 绑定模式 -->
      <template v-if="!loading && mode === 'bind'">
        <view class="popup-header">
          <text class="popup-title">绑定客户编码</text>
          <KyImage name="icon-close" @tap="handleClose" />
        </view>
        <BindCodeForm @confirm="handleBindConfirm" @cancel="handleCancel" />
      </template>

      <!-- 更换模式 -->
      <template v-if="!loading && mode === 'change'">
        <view class="popup-header">
          <text class="popup-title">更换客户编码</text>
          <KyImage name="icon-close" @tap="handleClose" />
        </view>
        <ChangeCodeCard @switch-department="handleSwitchDept" />
        <view class="action-bar">
          <ky-button @click="handleUnbind">解绑</ky-button>
          <ky-button type="primary" @click="handleChangeCode">更换</ky-button>
        </view>
      </template>

      <!-- 切换模式 -->
      <template v-if="!loading && mode === 'switch'">
        <view class="popup-header">
          <text class="popup-title">切换客户编码</text>
          <KyImage name="icon-close" @tap="handleClose" />
        </view>
        <CompanyList @switch="handleSwitch" @unbind="handleUnbind" />
      </template>
    </view>
  </ky-popup>
</template>

<script setup lang="ts">
import { useCustomerCodeMode } from '../../hooks/useCustomerCodeMode'

const props = defineProps<{
  visible: boolean
  closeOnClickOverlay?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'confirm', data?: any): void
  (e: 'cancel'): void
}>()

const { mode, loading, initMode } = useCustomerCodeMode()

// 监听弹窗打开，自动初始化模式
watch(() => props.visible, async (newVal) => {
  if (newVal) {
    await initMode()
  }
}, { immediate: true })
</script>
```

**Props 接口**:

| 属性名                   | 类型        | 默认值     | 说明                 |
| --------------------- | --------- | ------- | ------------------ |
| `visible`             | `boolean` | `false` | 是否显示弹窗（支持 v-model） |
| `closeOnClickOverlay` | `boolean` | `true`  | 是否可点击遮罩关闭          |

**Events 事件**:

| 事件名              | 参数              | 说明                   |
| ---------------- | --------------- | -------------------- |
| `update:visible` | `boolean`       | 弹窗显示状态变更（用于 v-model） |
| `confirm`        | `data?: any`    | 绑定/切换成功回调            |
| `cancel`         | -               | 用户取消操作               |
| `switch`         | `company?: any` | 切换公司成功回调             |
| `unbind`         | `company?: any` | 解绑操作回调               |
| `change`         | -               | 更换操作回调               |

**暴露方法 (defineExpose)**:

| 方法名           | 参数 | 返回值                | 说明              |
| ------------- | -- | ------------------ | --------------- |
| `refreshMode` | -  | `Promise<void>`    | 手动刷新模式（重新调用API） |
| `getMode`     | -  | `CustomerCodeMode` | 获取当前模式          |

**使用示例**:

```vue
<!-- 在父组件中使用 -->
<template>
  <view>
    <ky-button @click="showPopup = true">打开客户编码</ky-button>

    <!-- 统一弹窗入口（无需判断模式） -->
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

// 手动刷新模式（如果需要）
async function refreshMode() {
  await popupRef.value?.refreshMode()
}
</script>
```

**与页面对比**:

| 特性            | 页面模式                    | 弹窗模式                            |
| ------------- | ----------------------- | ------------------------------- |
| **组件位置**      | `pages/index/index.vue` | `customer-code-popup/index.vue` |
| **容器组件**      | `<view>` 全屏             | `<ky-popup>` 底部弹出               |
| **导航栏**       | Taro 原生导航栏              | 自定义头部（标题+关闭按钮）                  |
| **触发方式**      | `Taro.navigateTo()`     | `v-model:visible`               |
| **模式初始化**     | `onMounted` 调用          | `watch(visible)` 监听             |
| **Loading样式** | 全屏居中                    | 弹窗内居中                           |
| **底部安全区**     | 固定底部按钮                  | action-bar 内 padding-bottom     |

**设计优势**:

- ✅ **统一体验**: 页面和弹窗使用相同的模式判断逻辑（复用 `useCustomerCodeMode`）
- ✅ **简化调用**: 外部只需控制 `visible` 状态，无需关心内部模式
- ✅ **自动初始化**: 弹窗打开时自动调用 API 判断模式
- ✅ **事件完整**: 提供完整的 Events 接口，满足各种业务场景
- ✅ **方法暴露**: 支持 `refreshMode()` 手动刷新，适应动态场景

***

## Risks / Trade-offs

### 风险1: MobX → Pinia 状态管理模式差异

**风险描述**:

- MobX 使用 `observable/action` 自动追踪依赖
- Pinia 需要显式定义 `state/getters/actions`
- 响应式机制不同可能导致边界情况

**缓解措施**:

- ✅ 参考 `realName.ts` Store 成功案例
- ✅ 保持简单的扁平化状态结构
- ✅ 避免深度嵌套对象（Pinia对深层嵌套支持不如MobX）
- ✅ 充分测试关键业务流程（绑定/解绑/切换）

**权衡**: 牺牲部分灵活性换取更好的类型安全和Vue生态集成

***

### 风险2: React JSX → Vue Template 语法转换

**风险描述**:

- 事件命名: `onClick` → `@tap`, `onChange` → `@input`
- 条件渲染: `{condition && <Comp />}` → `<Comp v-if="condition" />`
- 列表渲染: `.map()` → `v-for`
- Refs使用: `useRef()` → `ref()` + template ref

**缓解措施**:

- ✅ 建立语法对照表，逐文件转换
- ✅ 利用VS Code插件辅助转换
- ✅ 重点测试交互逻辑（输入、点击、滚动）

**权衡**: 初期转换成本较高，但长期维护成本显著降低

***

### 风险3: 双模式组件复用复杂度

**风险描述**:

- 弹窗模式和页面模式的布局差异（导航栏、关闭按钮、底部安全区）
- 样式适配（弹窗有max-height，页面全屏）
- 事件处理差异（弹窗关闭 vs 页面返回）

**缓解措施**:

- ✅ 核心组件只关注业务逻辑，不涉及布局
- ✅ 页面容器使用 `index.config.ts` 配置原生导航栏（`navigationStyle: 'default'`）
- ✅ 弹窗容器使用 `ky-popup` 组件（无需自定义导航栏）
- ✅ 样式通过CSS变量或props动态调整
- ✅ 分别测试两种模式的所有场景

**权衡**: 增加少量抽象层，但大幅减少重复代码（预估减少60%+）

***

### 风险4: 埋点完整性保障

**风险描述**:

- H5埋点代码分散在各组件中，可能遗漏
- 参数格式可能与新系统不完全兼容
- 埋点触发时机可能有细微差异

**缓解措施**:

- ✅ 建立埋点迁移清单（事件码→触发场景→参数映射）
- ✅ 逐一对照H5源码的每个 `report.sendClickEvent/ExpEvent` 调用
- ✅ 使用TypeScript类型约束埋点参数
- ✅ QA阶段重点回归埋点上报

**权衡**: 投入额外时间确保完整性，避免上线后数据缺失

***

### 风险5: 图形验证码兼容性

**风险描述**:

- H5使用腾讯TCaptcha（type=4），小程序端可能表现不同
- 验证码业务流程可能有差异
- 网络环境可能影响验证码加载

**缓解措施**:

- ✅ 先使用现有captcha组件（已验证可用）
- ✅ 如果业务需要，后续再集成腾讯验证码SDK
- ✅ 添加loading状态和错误重试机制
- ✅ 降级处理：验证码加载失败时允许用户重试

**权衡**: 功能优先级较低（仅在特定风控场景触发），可接受简化实现

***

## Migration Plan

### 阶段划分

#### Phase 1: 基础设施搭建 (预计2天)

**目标**: 搭建项目骨架，建立类型体系和Store基础

**任务清单**:

1. 创建目录结构 `src/modules/user/customer-code/`
2. 定义TypeScript类型 (`types/customer-code.ts`, `types/form.ts`)
3. 定义枚举常量 (`constants/index.ts`, `constants/regular.ts`)
4. 创建Pinia Store骨架 (`store/customerCode.ts`)
5. 封装API接口层 (`api/index.ts`)
6. 创建埋点基础 (`report/index.ts`)

**交付物**:

- ✅ 完整的类型定义
- ✅ Store基础框架（含初始状态）
- ✅ API封装（18个接口）
- ✅ 埋点工具函数

***

#### Phase 2: 核心功能实现 (预计3天)

**目标**: 实现3大核心功能的组件和逻辑

**任务清单**:

**Day 1: 绑定功能**

1. 实现 `hooks/useValidate.ts` (校验逻辑)
2. 实现 `hooks/useBindForm.ts` (表单Hook)
3. 实现 `hooks/useCustomerCode.ts` (API封装)
4. 实现 `components/bind-code/BindCodeForm.vue` (核心表单组件)
5. 实现 `components/shared/Banner.vue`, `ApplySection.vue`, `BindTag.vue`
6. 集成图形验证码组件
7. 实现异常处理（黑名单、重复绑定确认）

**Day 2: 更换/切换功能** 8. 实现 `hooks/useCompanyList.ts` (公司列表Hook) 9. 实现 `components/change-code/ChangeCodeCard.vue` (更换卡片) 10. 实现 `components/switch-code/CompanyList.vue` (公司列表) 11. 实现部门切换功能 (`SwitchDepartmentPopup`) 12. 实现解绑逻辑（单个/一键解绑）13. 实现冻结解绑异常处理

**Day 3: 双模式容器** 14. 实现 `pages/bind/index.vue` (绑定页面) 15. 实现 `components/bind-code/index.vue` (绑定弹窗) 16. 实现 `pages/change/index.vue` (更换页面) 17. 实现 `components/change-code/index.vue` (更换弹窗) 18. 实现 `pages/switch/index.vue` (切换页面) 19. 实现 `components/switch-code/index.vue` (切换弹窗)

**交付物**:

- ✅ 3大核心功能完整实现
- ✅ 6个容器组件（3页面+3弹窗）
- ✅ 所有共享子组件
- ✅ 完整的Hooks集合

***

#### Phase 3: 埋点与联调 (预计2天)

**目标**: 完成埋点迁移和端到端测试

**任务清单**:

**Day 4: 埋点迁移**

1. 对照H5源码，梳理全部埋点事件（约20+个）
2. 实现 `report/index.ts` 所有埋点函数
3. 在各组件中集成埋点调用
4. 验证埋点参数完整性

**Day 5: 测试与修复** 5. 单元测试：Hooks逻辑、Store Actions 6. 集成测试：

- 绑定流程（正常/异常/验证码）
- 更换流程（查看/部门切换）
- 切换流程（列表/解绑/切换/冻结）
- 双模式切换（弹窗↔页面）

1. 性能测试：确保响应时间 < 200ms
2. Bug修复和优化

**交付物**:

- ✅ 完整埋点上报（与H5一致）
- ✅ 测试报告（覆盖主要场景）
- ✅ 性能达标证明

***

#### Phase 4: 上线准备 (预计1天)

**目标**: 代码审查、文档整理、灰度发布

**任务清单**:

1. Code Review（重点关注类型安全、异常处理、埋点完整性）
2. 编写组件使用文档（Props、Events、Slots说明）
3. 配置路由和页面注册
4. 准备灰度发布计划（与周迭代节奏一致）
5. 监控告警配置（错误率、响应时间）

**交付物**:

- ✅ 通过Code Review
- ✅ 组件使用文档
- ✅ 上线Checklist

***

### 回滚策略

如果上线后发现严重问题：

1. **快速回滚**: 移除原生组件入口，恢复WebView加载H5
2. **配置开关**: 通过特性开关（Feature Flag）控制新旧版本
3. **灰度控制**: 先放开1%流量，逐步提升至100%
4. **监控指标**: 错误率 > 1% 或 响应时间 > 500ms 自动告警

***

## Open Questions

### 已解决问题 ✅

1. ~~迁移范围~~ → **确认**: 完整迁移3大核心功能
2. ~~联系商务~~ → **确认**: 点击提示"暂不支持"
3. ~~部门切换~~ → **确认**: 保留该功能
4. ~~埋点方案~~ → **确认**: 参考实名认证模块完整迁移
5. ~~图形验证码~~ → **确认**: 复用现有captcha组件
6. ~~页面导航栏~~ → **确认**: 使用 Taro 原生导航栏（`index.config.ts` 配置）

### 待确认问题 ⏳

_(暂无，所有关键决策已明确)_

***

## 附录: 关键文件清单

### 新增文件（预估40+个）

```
src/modules/user/pages/customer-code/
├── pages/
│   ├── index/                          # 【新增】统一入口页
│   │   ├── index.vue                   # 统一入口（自动判断模式）
│   │   └── index.config.ts             # 页面配置
│   ├── bind/
│   │   ├── index.vue                   # 绑定页面（使用原生导航栏）
│   │   └── index.config.ts             # 页面配置（navigationStyle: 'default'）
│   ├── change/
│   │   ├── index.vue                   # 更换页面（使用原生导航栏）
│   │   └── index.config.ts             # 页面配置（navigationStyle: 'default'）
│   └── switch/
│       ├── index.vue                   # 切换页面（使用原生导航栏）
│       └── index.config.ts             # 页面配置（navigationStyle: 'default'）
├── customer-code-popup/                # 【新增】统一弹窗入口
│   ├── index.vue                       # 统一弹窗（自动判断模式）
│   └── index.scss                      # 弹窗样式
├── components/                       # 核心业务组件（无UI模式感知）
│   ├── bind-code/
│   │   ├── BindCodeForm.vue          # 核心绑定表单
│   │   └── index.scss                # 表单样式
│   ├── change-code/
│   │   ├── ChangeCodeCard.vue        # 更换信息卡片
│   │   ├── SwitchDepartmentPopup.vue  # 部门切换弹窗
│   │   ├── index.scss                # 卡片样式
│   │   └── switch-department.scss     # 部门弹窗样式
│   ├── switch-code/
│   │   ├── CompanyList.vue           # 公司列表
│   │   └── index.scss                # 列表样式
│   └── shared/
│       ├── Banner.vue                # Banner图
│       ├── ApplySection.vue          # 申请区域
│       ├── BindTag.vue               # 绑定标签
│       ├── Alert.vue                 # 确认弹窗
│       └── *.scss                    # 共享样式
├── hooks/
│   ├── useCustomerCodeMode.ts          # 【新增】模式判断Hook
│   ├── useBindForm.ts                  # 绑定表单Hook
│   ├── useCompanyList.ts               # 公司列表Hook
│   ├── useValidate.ts                  # 校验Hook
│   └── useCustomerCode.ts              # API Hook
├── store/
│   ├── customerCode.ts                 # 主Store
│   └── types.ts                        # Store类型
├── apis/                               # 【重构】API统一管理
│   └── customerCode/
│       ├── index.ts                    # API接口封装
│       └── types.ts                    # API类型定义
├── constants/
│   ├── index.ts                        # 枚举定义
│   └── regular.ts                      # 正则常量
├── types/
│   ├── customer-code.ts                # 业务类型
│   └── form.ts                         # 表单类型
└── report/
    └── index.ts                        # 埋点函数
```

### 核心新增文件说明

#### 1. 统一入口页面 (`pages/index/index.vue`)

**作用**: 客户编码模块的唯一入口，自动判断并显示对应模式

**特性**:

- Loading状态优化用户体验
- 动态设置导航栏标题
- 内部闭环，无需外部传入参数

**调用方式**:

```typescript
Taro.navigateTo({
  url: '/modules/user/pages/customer-code/pages/index/index',
})
```

#### 2. 模式判断Hook (`hooks/useCustomerCodeMode.ts`)

**作用**: 封装模式判断逻辑，提供响应式状态

**核心功能**:

- `initMode()`: 调用API获取用户权限信息
- `determineMode()`: 根据三个字段判断模式
- `mode`: 响应式当前模式（bind/switch/change）
- `loading`: 加载状态
- `setMode()`: 手动设置模式（特殊场景）
- `resetMode()`: 重置为默认模式

**默认模式**: `'bind'` （最安全的兜底方案）

#### 3. 统一弹窗组件 (`customer-code-popup/index.vue`)

**作用**: 客户编码模块的统一弹窗入口，自动判断并显示对应模式

**特性**:

- 使用 `ky-popup` 作为容器（底部弹出）
- 监听 `visible` 变化，自动调用 `initMode()` 初始化模式
- Loading 状态优化用户体验
- 统一的 Props/Events 接口，简化外部调用
- 暴露 `refreshMode()` 和 `getMode()` 方法供父组件调用

**Props 接口**:

| 属性名                   | 类型        | 默认值     | 说明                 |
| --------------------- | --------- | ------- | ------------------ |
| `visible`             | `boolean` | `false` | 是否显示弹窗（支持 v-model） |
| `closeOnClickOverlay` | `boolean` | `true`  | 是否可点击遮罩关闭          |

**Events 事件**:

| 事件名              | 参数              | 说明                   |
| ---------------- | --------------- | -------------------- |
| `update:visible` | `boolean`       | 弹窗显示状态变更（用于 v-model） |
| `confirm`        | `data?: any`    | 绑定/切换成功回调            |
| `cancel`         | -               | 用户取消操作               |
| `switch`         | `company?: any` | 切换公司成功回调             |
| `unbind`         | `company?: any` | 解绑操作回调               |
| `change`         | -               | 更换操作回调               |

**暴露方法**:

| 方法名             | 返回值                | 说明              |
| --------------- | ------------------ | --------------- |
| `refreshMode()` | `Promise<void>`    | 手动刷新模式（重新调用API） |
| `getMode()`     | `CustomerCodeMode` | 获取当前模式          |

**调用方式**:

```vue
<template>
  <CustomerCodePopup
    v-model:visible="showPopup"
    @confirm="handleConfirm"
    @cancel="handleCancel"
    ref="popupRef"
  />
</template>

<script setup lang="ts">
import CustomerCodePopup from '@/modules/user/pages/customer-code/customer-code-popup/index.vue'

const showPopup = ref(false)
const popupRef = ref()

// 手动刷新模式
async function refresh() {
  await popupRef.value?.refreshMode()
}
</script>
```

### 复用现有组件

- `src/public/components/base/captcha/` - 图形验证码
- `src/public/components/business/contact-business/` - 联系商务（暂不用）
- `src/public/utils/reportUtil.ts` - 埋点工具
- `@kye-netc/kye-miniui` - UI组件库

