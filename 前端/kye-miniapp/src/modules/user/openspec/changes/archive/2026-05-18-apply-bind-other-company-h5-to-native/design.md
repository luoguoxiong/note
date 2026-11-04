## Context

### 当前状态
- H5 项目（netc-h5-modules）已实现"申请绑定其他公司"完整功能
- 小程序项目（kye-miniapp）客户编码模块已有绑定/更换/切换功能，但缺少申请绑定其他公司功能
- 现有 customerCode API 模块已包含部分相关接口，需补充 4 个新接口

### 技术背景
- H5 使用 Vant UI（van-field、van-button）+ Vue Router + Vuex
- 目标使用 kye-miniUI（ky-field、ky-button）+ Taro 路由 + Pinia
- H5 原生 DOM 操作较多（window.resize、focusin/focusout），小程序需适配

## Goals / Non-Goals

**Goals:**
1. 完整迁移"申请绑定其他公司"页面功能到 Taro 多端小程序
2. 实现 TypeScript 类型安全，所有接口、Props、状态都有明确类型定义
3. 遵循项目规范：kye-miniui 组件库、px 单位、BEM 命名、Composition API
4. 支持动态表单（1-9 个客户编码输入框）、联想推荐、实时校验、批量检查
5. 集成风控验证（图形验证码）
6. 页面离开守卫（未提交确认提示）

**Non-Goals:**
1. 不实现企业微信二维码展示（H5 联系商务组件功能，可后续扩展）
2. 不修改现有客户编码模块的其他功能
3. 不涉及后端接口改动，仅前端迁移

## Decisions

### 1. 组件架构设计

```
apply/
├── index.vue              # 主页面组件
├── index.scss             # 页面样式（独立文件）
├── index.config.ts        # Taro 页面配置
├── components/
│   ├── CompanyInput.vue   # 客户编码输入框组件（含联想列表）
│   └── RecommendList.vue  # 推荐公司列表组件
├── hooks/
│   └── useApplyBind.ts    # 申请绑定逻辑 hook
├── types/
│   └── index.ts           # TypeScript 类型定义
└── assets/
    └── required_icon.png  # 必填图标
```

**理由：**
- 将复杂表单拆分为子组件，提升可维护性
- 使用 hooks 封装业务逻辑，便于复用和测试
- 独立类型文件，确保 TS 类型清晰

### 2. 状态管理方案

采用 **组件内部状态 + Hooks** 模式，不使用全局 Store：

```typescript
// types/index.ts
interface CompanyItem {
  customerCode: string
  errorMsg: string
  warningMsg: string
  show: boolean
  inputing: boolean
}

interface ApplyBindState {
  companyList: CompanyItem[]
  currentCode: string
  reason: string
  errorReason: boolean
  loading: boolean
  recommendList: RecommendItem[]
  realList: RecommendItem[]
}
```

**理由：**
- 表单状态仅在页面内使用，无需全局共享
- 参考 password-apply 页面实现模式
- 降低复杂度，避免过度设计

### 3. 表单校验策略

**方案：ky-form + 自定义校验规则**

```vue
<ky-form ref="formRef" :model-value="formData">
  <view v-for="(item, index) in companyList" :key="index">
    <ky-field
      v-model="item.customerCode"
      :prop="`companyList.${index}.customerCode`"
      :rules="customerCodeRules"
      @blur="handleBlur(item, index)"
    />
  </view>
  <ky-field
    v-model="reason"
    prop="reason"
    :rules="reasonRules"
    type="textarea"
  />
</ky-form>
```

**校验时机：**
1. **实时校验**：输入时过滤非法字符（表情符号）
2. **失焦校验**：
   - 非空校验
   - 客户编码有效性校验（调用 checkCustomerCode API）
   - 重复性校验（同一表单内不可重复）
3. **提交前校验**：
   - 全量非空校验
   - 批量黑名单校验（batchCheckBlackCustomerCode）

### 4. 联想推荐实现

**方案：本地过滤 + 推荐列表**

```typescript
// 获取推荐数据（页面加载时）
const fetchRecommendList = async () => {
  const { data } = await getFrontRecommendCustomer()
  recommendList.value = data || []
}

// 输入时过滤
const handleFilter = (value: string) => {
  const selectedCodes = companyList.value.map(item => item.customerCode)
  const filtered = recommendList.value.filter(obj =>
    obj.customerCode.includes(value)
  )
  realList.value = filtered.map(item => ({
    ...item,
    selected: selectedCodes.includes(item.customerCode)
  }))
}
```

**优化点：**
- 已选中的排到后面
- 支持高亮匹配文本
- 最多展示 10 条（避免性能问题）

### 5. 错误提示机制

**方案：Tooltip 样式 + 字段级错误**

```scss
.error-tooltip {
  position: absolute;
  top: -64px;
  left: 0;
  font-size: 24px;
  color: #fff;
  background: rgba(36, 38, 43, 0.9);
  border-radius: 8px;
  padding: 12px 20px;
  z-index: 10;
}
```

**触发条件：**
- 失焦后显示错误（curBlurIndex 记录当前焦点索引）
- 提交时显示所有错误
- 聚焦时清除当前字段错误

### 6. 风控集成

**方案：复用 Captcha 组件**

```vue
<Captcha
  :show="showCaptcha"
  @success="handleCaptchaSuccess"
  @close="showCaptcha = false"
/>
```

**触发场景：**
- 单个客户编码校验返回 VERIFY_CODE 错误码
- 调用 showVerifyCodeDialog 弹出图形验证码
- 验证成功后携带 safeVerifyId 重试

### 7. 页面离开守卫

**方案：Taro beforeRouteLeave 适配**

```typescript
import { useDidShow, useBeforeUnmount } from '@tarojs/taro'

let isSubmitted = false

const handleSubmit = async () => {
  // ... 提交逻辑
  isSubmitted = true
  Taro.navigateTo({ url: '/result' })
}

useBeforeUnmount(() => {
  if (!isSubmitted && hasUnsavedData()) {
    // 显示确认弹窗
    showAlert({
      title: '温馨提示',
      content: '信息未提交，确定要退出吗?',
    })
  }
})
```

**注意：** 小程序不支持原生路由守卫，需使用生命周期钩子模拟

## Risks / Trade-offs

### 风险 1：键盘适配问题
- **问题描述：** H5 使用 window.resize / focusin-focusout 监听键盘高度变化
- **影响范围：** 底部按钮可能被键盘遮挡
- **缓解措施：**
  - 使用 Taro 的 `adjust-position` 属性自动调整
  - 或使用 `ky-popup` 固定底部按钮

### 风险 2：联想列表性能
- **问题描述：** 推荐数据量大时可能导致卡顿
- **缓解措施：**
  - 限制展示数量（最多 10 条）
  - 使用虚拟滚动（如需要）

### 风险 3：多端兼容性
- **问题描述：** 微信/支付宝/H5 表现可能不一致
- **缓解措施：**
  - 使用 Taro 组件而非原生组件
  - 条件编译处理平台差异（`process.env.TARO_ENV`）

### 权衡决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 全局 vs 组件状态 | 组件状态 | 表单状态无需跨页面共享 |
| 表单库 | ky-form | 项目规范要求 |
| 联想实现 | 本地过滤 | 数据量小，无需远程搜索 |
| 错误提示 | Tooltip | 与 H5 保持一致体验 |
| 页面守卫 | 生命周期钩子 | 小程序不支持路由守卫 |

## Implementation Notes

### 关键转换映射

| H5 (Vue + Vant) | Taro (Vue3 + kye-miniui) |
|-----------------|---------------------------|
| `div` | `view` |
| `van-field` | `ky-field` |
| `van-button` | `ky-button` |
| `Dialog.confirm` | `Alert` 组件 |
| `Toast` | `Taro.showToast` |
| `vue-router` | `Taro.navigateTo` |
| `Vuex store` | Pinia / 组件状态 |
| `window.location.href` | `Taro.makePhoneCall` |
| `onBeforeRouteLeave` | `useBeforeUnmount` |
| `ref(homeBodyRef)` | Taro 事件监听 |
| `::v-deep` | 不需要（scoped） |

### API 接口清单

| 接口名 | 方法 | 用途 | 状态 |
|--------|------|------|------|
| `getFrontRecommendCustomer` | GET | 获取推荐公司列表 | ✅ 已有 |
| `applyBindOtherCustomerCheck` | POST | 校验是否可申请绑定 | ❌ 需新增 |
| `bindOtherCustomerList` | POST | 提交绑定申请 | ❌ 需新增 |
| `batchCheckBlackCustomerCode` | POST | 批量黑名单校验 | ❌ 需新增 |
| `checkCustomerCode` | POST | 校验客户编码有效性 | ✅ 已有 |
