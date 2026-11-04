# 实名认证 EventBus 迁移到 Pinia Store 指南

## 概述

将实名认证相关的 `eventBus` + `sessionStorage` 模式改造为 `Pinia` + `sessionStorage` 模式。

## 文件结构变更

### 旧结构
```
src/modules/user/pages/realname/
├── eventBus/
│   ├── authDataMixin.js      // Vue2 Mixin
│   ├── eventBus.js           // 简单事件总线
│   └── eventBusStorage.js    // Storage 封装
```

### 新结构
```
src/modules/user/pages/realname/
├── store/
│   ├── index.ts              // 导出文件
│   └── realName.ts           // Pinia Store
```

## 迁移步骤

### 1. 导入 Store

```typescript
// 旧方式
import { set_personal, set_enterprise, set_force_verify_obj } from '../eventBus/eventBusStorage'

// 新方式
import { useRealNameStore } from '../store'
const realNameStore = useRealNameStore()
```

### 2. 设置数据

```typescript
// 旧方式
set_personal('1')
set_enterprise('2')
set_force_verify_obj({ forceFlag: '20' })

// 新方式
realNameStore.setPersonal('1')
realNameStore.setEnterprise('2')
realNameStore.setForceVerifyObj({ forceFlag: '20' })
```

### 3. 获取数据

```typescript
// 旧方式
import { get_personal, get_enterprise } from '../eventBus/eventBusStorage'
const personal = get_personal()
const enterprise = get_enterprise()

// 新方式 - 通过 store state 直接访问
const personal = realNameStore.personal
const enterprise = realNameStore.enterprise

// 新方式 - 通过 getters 访问
const personal = realNameStore.getPersonal
const enterprise = realNameStore.getEnterprise
```

### 4. 计算属性 (Vue3)

```typescript
// 旧方式 (Vue2 Mixin)
computed: {
  personal() {
    return this.authData.personal
  },
  enterprise() {
    return this.authData.enterprise
  }
}

// 新方式 (Vue3 Composition API)
import { computed } from 'vue'
import { useRealNameStore } from '../store'

const realNameStore = useRealNameStore()
const personal = computed(() => realNameStore.personal)
const enterprise = computed(() => realNameStore.enterprise)
```

### 5. 监听数据变化

```typescript
// 旧方式 - 通过 eventBus 监听
eventBus.on('set_personal', (data) => {
  this.authData.personal = data
})

// 新方式 - 直接通过 store 响应式特性
import { watch } from 'vue'
import { useRealNameStore } from '../store'

const realNameStore = useRealNameStore()

watch(() => realNameStore.personal, (newVal) => {
  console.log('个人认证状态变更:', newVal)
})
```

## API 对照表

### 认证数据 (AuthData)

| 旧 API | 新 API | 说明 |
|--------|--------|------|
| `set_personal(value)` | `realNameStore.setPersonal(value)` | 设置个人认证状态 |
| `get_personal()` | `realNameStore.personal` 或 `realNameStore.getPersonal` | 获取个人认证状态 |
| `set_enterprise(value)` | `realNameStore.setEnterprise(value)` | 设置企业认证状态 |
| `get_enterprise()` | `realNameStore.enterprise` 或 `realNameStore.getEnterprise` | 获取企业认证状态 |

### 验证数据 (VerifyData)

| 旧 API | 新 API | 说明 |
|--------|--------|------|
| `set_force_verify_obj(value)` | `realNameStore.setForceVerifyObj(value)` | 设置强制认证对象 |
| `get_force_verify_obj()` | `realNameStore.forceVerifyObj` 或 `realNameStore.getForceVerifyObj` | 获取强制认证对象 |
| `set_personalInfo(value)` | `realNameStore.setPersonInfo(value)` | 设置个人信息 |
| `get_personalInfo()` | `realNameStore.personInfo` 或 `realNameStore.getPersonInfo` | 获取个人信息 |
| `set_enterpriseInfo(value)` | `realNameStore.setEnterpriseInfo(value)` | 设置企业信息 |
| `get_enterpriseInfo()` | `realNameStore.enterpriseInfo` 或 `realNameStore.getEnterpriseInfo` | 获取企业信息 |
| `storage_set_origin(value)` | `realNameStore.setOriginFromQuery(value)` | 设置来源标记 |
| `storage_get_origin()` | `realNameStore.originFromQuery` 或 `realNameStore.getOriginFromQuery` | 获取来源标记 |
| `storage_set_authShow(value)` | `realNameStore.setAuthShow(value)` | 设置认证显示标记 |
| `storage_get_authShow()` | `realNameStore.authShow` 或 `realNameStore.getAuthShow` | 获取认证显示标记 |

### 新增 API

| API | 说明 |
|-----|------|
| `realNameStore.isFromOrder` | 计算属性，判断是否来自订单页 |
| `realNameStore.clearAuthData()` | 清空认证数据 |
| `realNameStore.clearVerifyData()` | 清空验证数据 |
| `realNameStore.clearAll()` | 清空所有数据 |

## 完整示例

### 示例 1: 设置和获取数据

```typescript
import { useRealNameStore } from '@modules/user/pages/realname/store'

const realNameStore = useRealNameStore()

// 设置个人认证状态
realNameStore.setPersonal('1') // 1: 已认证, 空: 未认证

// 设置企业认证状态
realNameStore.setEnterprise('1')

// 设置强制认证对象
realNameStore.setForceVerifyObj({
  orderPageSource: 'single',
  uniqueId: '123456',
  forceFlag: '20',
  otherPhone: 'base64_encode_phone',
  idName: '张三',
  isFromShare: '1',
  isFromBaqiang: '0',
})

// 获取数据
console.log(realNameStore.personal) // '1'
console.log(realNameStore.getEnterprise) // '1'
console.log(realNameStore.isFromOrder) // false
```

### 示例 2: 在 Vue 组件中使用

```vue
<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRealNameStore } from '@modules/user/pages/realname/store'

const realNameStore = useRealNameStore()

// 计算属性
const personalStatus = computed(() => {
  return realNameStore.personal === '1' ? '已认证' : '未认证'
})

const enterpriseStatus = computed(() => {
  return realNameStore.enterprise === '1' ? '已认证' : '未认证'
})

// 监听数据变化
watch(() => realNameStore.personal, (newVal) => {
  console.log('个人认证状态变化:', newVal)
})

// 设置数据
const handleAuth = () => {
  realNameStore.setPersonal('1')
}
</script>

<template>
  <div>
    <p>个人认证状态: {{ personalStatus }}</p>
    <p>企业认证状态: {{ enterpriseStatus }}</p>
    <button @click="handleAuth">设置个人认证</button>
  </div>
</template>
```

### 示例 3: 初始化数据

```typescript
import { useRealNameStore } from '@modules/user/pages/realname/store'

const realNameStore = useRealNameStore()

// 从 sessionStorage 恢复数据
// store 已在初始化时自动从 sessionStorage 读取数据
console.log(realNameStore.personal)
console.log(realNameStore.forceVerifyObj)
```

### 示例 4: 清空数据

```typescript
import { useRealNameStore } from '@modules/user/pages/realname/store'

const realNameStore = useRealNameStore()

// 清空认证数据
realNameStore.clearAuthData()

// 清空验证数据
realNameStore.clearVerifyData()

// 清空所有数据
realNameStore.clearAll()
```

## 数据同步

Store 会在以下情况自动同步数据到 `sessionStorage`:
- 调用任何 `set` 方法时
- 数据变更后立即持久化

Store 初始化时会自动从 `sessionStorage` 恢复数据。

## 类型定义

```typescript
// 强制认证对象
interface ForceVerifyObj {
  orderPageSource?: string      // 下单页的来源，single: 单票，batch: 批量
  uniqueId?: string             // 强制认证唯一标识
  forceFlag?: string            // 是否开启强制开关，'10': 关闭，'20': 开启
  otherPhone?: string           // 他人手机号，采用前端base64加密
  idName?: string               // 姓名
  isFromShare?: string          // 是否下单分享
  isFromBaqiang?: string        // 是否巴枪扫码实名
}

// 个人信息
interface PersonInfo {
  isSupportForeignOCR?: boolean
}

// 认证数据
interface AuthData {
  personal?: string             // 个人认证状态
  enterprise?: string           // 企业认证状态
}

// 验证数据
interface VerifyData {
  originFromQuery?: boolean     // origin: order_submit order_page
  forceVerifyObj?: ForceVerifyObj
  personInfo?: PersonInfo
}
```
