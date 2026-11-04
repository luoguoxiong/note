---
name: api-integration
description: 指导在小程序项目中进行 HTTP 接口集成，包括请求封装、类型定义、错误处理与 API 文件组织。当需要调用后端接口时使用本技能。
---

# 接口集成

## 使用场景

当你需要：
- **新增 API 接口** 调用
- 为接口 **定义类型** （请求参数和响应数据）
- 理解项目的 **接口调用规范**
- 处理接口 **错误和异常**

请使用本技能，并遵守项目的接口集成规范。

---

## 使用步骤

### 步骤 1：确定 API 归属模块

根据业务功能确定 API 所属的模块或页面：

```
modules/order/pages/order-detail/
└── apis/
    ├── index.ts      # API 函数定义
    └── types.ts      # 请求/响应类型定义
```

**组织原则：**
- 页面级 API 放在页面的 `apis/` 目录下
- 跨页面复用的 API 可以提取到模块级或全局 `@public/apis/`

### 步骤 2：定义类型

在 `types.ts` 中定义请求参数和响应数据的类型：

```typescript
// apis/types.ts

export interface ReqParams {
  id: string
  page?: number
  pageSize?: number
}

export interface ResData {
  list: Item[]
  total: number
}

export interface Item {
  id: string
  orderNo: string
  status: number
  createTime: string
}
```

**类型定义原则：**
- 请求参数类型命名：`XxxParams` 或 `ReqXxx`
- 响应数据类型命名：`XxxResponse` 或 `ResXxx`
- 必填字段不加 `?`，可选字段加 `?`
- 类型定义应与后端接口文档保持一致

### 步骤 3：封装 API 函数

在 `index.ts` 中使用 `http()` 函数封装接口调用：

```typescript
// apis/index.ts
import { http } from '@public/utils/request'
import type { ReqParams, ResData } from './types'

export const getOrderDetail = (params: ReqParams) => {
  return http<ResData>({
    url: '/api/order/detail',
    data: params,
    method: 'GET',
  })
}

export const createOrder = (params: CreateOrderParams) => {
  return http<CreateOrderResponse>({
    url: '/api/order/create',
    data: params,
    method: 'POST',
  })
}

export const updateOrder = (params: UpdateOrderParams) => {
  return http<void>({
    url: '/api/order/update',
    data: params,
    method: 'PUT',
  })
}

export const deleteOrder = (id: string) => {
  return http<void>({
    url: `/api/order/delete/${id}`,
    method: 'DELETE',
  })
}
```

**http() 函数参数：**
- `url`：接口路径（相对路径）
- `data`：请求参数（GET 请求会转为 query 参数）
- `method`：请求方法（GET/POST/PUT/DELETE）
- 泛型 `<ResData>`：指定响应数据的类型

### 步骤 4：在页面中使用

在页面组件中导入并调用 API：

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getOrderDetail } from './apis'
import type { ResData } from './apis/types'

const loading = ref(false)
const orderData = ref<ResData | null>(null)

onMounted(() => {
  fetchData()
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getOrderDetail({ id: '123' })
    orderData.value = res
  } catch (error) {
    console.error('获取订单详情失败', error)
  } finally {
    loading.value = false
  }
}
</script>
```

---

## 注意事项

1. **统一使用 http() 函数**
   - ❌ 禁止直接使用 axios 或其他 HTTP 库
   - ✅ 必须通过 `@public/utils/request` 的 `http()` 函数调用
   - http() 已封装了统一的错误处理、token 注入等逻辑

2. **接口 URL 规范**
   - 使用相对路径，不硬编码环境地址
   - ❌ 错误：`https://api.example.com/order/detail`
   - ✅ 正确：`/api/order/detail`

3. **错误处理**
   - http() 封装层已统一处理接口错误（如 token 失效、网络错误）
   - 页面层只需关注业务逻辑，使用 try-catch 捕获异常即可
   - 避免在页面中重复显示错误提示（http() 已处理）

4. **类型安全**
   - 所有 API 函数必须定义完整的类型
   - 利用 TypeScript 的类型推导，避免运行时错误
   - 响应数据类型应与后端接口文档保持一致

5. **命名规范**
   - 获取列表：`getXxxList`
   - 获取详情：`getXxxDetail`
   - 创建：`createXxx`
   - 更新：`updateXxx`
   - 删除：`deleteXxx`

6. **文件组织**
   - 单个页面的 API 放在页面的 `apis/` 目录
   - 多个页面共用的 API 提取到模块级或全局
   - 保持 `index.ts` 和 `types.ts` 的分离

---

## 快速检查清单

- [ ] 是否在 `types.ts` 中定义了清晰的请求/响应类型？
- [ ] 是否使用 `http()` 函数而非直接使用 axios？
- [ ] 接口 URL 是否使用相对路径？
- [ ] API 函数命名是否符合规范（get/create/update/delete）？
- [ ] 是否在页面中使用 try-catch 处理异常？
- [ ] 是否为 API 函数添加了泛型类型参数？
- [ ] 是否避免在页面中重复处理接口错误提示？
