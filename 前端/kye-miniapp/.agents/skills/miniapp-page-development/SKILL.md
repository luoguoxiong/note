---
name: miniapp-page-development
description: 指导在 Taro + Vue3 小程序项目中创建和开发页面，包括目录结构、路由注册、组件编写与 API 集成。当需要新增或修改小程序页面时使用本技能。
---

# 小程序页面开发

## 使用场景

当你需要：
- **新增小程序页面** 或模块
- **修改现有页面** 的结构或功能
- 理解页面的 **标准目录结构** 和开发规范
- 进行页面的 **路由配置** 和注册

请使用本技能，并遵守项目的页面开发规范。

---

## 使用步骤

### 步骤 1：创建页面目录

按模块在对应目录下创建页面目录，使用 kebab-case 命名：

```
modules/
└── order/              # 订单模块
    └── pages/
        └── order-detail/   # 订单详情页面
            ├── index.vue
            ├── index.scss
            ├── index.config.ts
            ├── apis/
            │   ├── index.ts
            │   └── types.ts
            ├── hooks/
            ├── components/
            └── report/
```

**目录说明：**
- `index.vue`：页面主组件
- `index.scss`：页面样式
- `index.config.ts`：Taro 页面配置（标题、背景色等）
- `apis/`：页面相关的 API 接口
- `hooks/`：页面相关的组合式函数
- `components/`：页面级子组件
- `report/`：页面埋点上报函数

### 步骤 2：编写页面配置

创建 `index.config.ts` 配置页面属性：

```typescript
export default definePageConfig({
  navigationBarTitleText: '订单详情',
  navigationBarBackgroundColor: '#ffffff',
  navigationBarTextStyle: 'black',
  enablePullDownRefresh: false,
})
```

**常用配置项：**
- `navigationBarTitleText`：页面标题
- `navigationBarBackgroundColor`：导航栏背景色
- `navigationBarTextStyle`：导航栏文字颜色（black/white）
- `enablePullDownRefresh`：是否开启下拉刷新
- `backgroundTextStyle`：下拉刷新样式（dark/light）

### 步骤 3：编写页面组件

创建 `index.vue` 页面主组件：

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserGlobalStore } from '@/store/user'
import { getOrderDetail } from './apis'
import type { OrderDetail } from './apis/types'

const store = useUserGlobalStore()
const loading = ref(false)
const orderDetail = ref<OrderDetail | null>(null)

onMounted(() => {
  fetchData()
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getOrderDetail({ id: '123' })
    orderDetail.value = res
  } catch (error) {
    console.error('获取订单详情失败', error)
  } finally {
    loading.value = false
  }
}

const handleRefresh = () => {
  fetchData()
}
</script>

<template>
  <view class="order-detail-page">
    <view v-if="loading" class="loading">加载中...</view>
    <view v-else-if="orderDetail" class="content">
      <view class="order-no">订单号：{{ orderDetail.orderNo }}</view>
      <view class="status">状态：{{ orderDetail.status }}</view>
    </view>
    <view v-else class="empty">暂无数据</view>
  </view>
</template>

<style lang="scss" scoped>
.order-detail-page {
  min-height: 100vh;
  padding: 32rpx;
  background-color: #f5f5f5;

  .loading {
    text-align: center;
    padding: 100rpx 0;
  }

  .content {
    background: #fff;
    border-radius: 16rpx;
    padding: 32rpx;
  }

  .order-no {
    font-size: 28rpx;
    color: #333;
    margin-bottom: 16rpx;
  }

  .status {
    font-size: 24rpx;
    color: #666;
  }

  .empty {
    text-align: center;
    padding: 100rpx 0;
    color: #999;
  }
}
</style>
```

### 步骤 4：注册路由

**重要：新增页面必须同时在微信和支付宝配置文件中注册**

在 `wx.config.ts` 中注册：
```typescript
export default defineAppConfig({
  pages: [
    'layout/pages/home/index',
    'modules/order/pages/order-detail/index',  // 新增页面
  ],
  // ...
})
```

在 `alipay.config.ts` 中注册：
```typescript
export default defineAppConfig({
  pages: [
    'layout/pages/home/index',
    'modules/order/pages/order-detail/index',  // 新增页面
  ],
  // ...
})
```

### 步骤 5：添加 API 接口

在页面的 `apis/` 目录下定义接口：

```typescript
// apis/types.ts
export interface OrderDetailParams {
  id: string
}

export interface OrderDetail {
  id: string
  orderNo: string
  status: number
  createTime: string
}
```

```typescript
// apis/index.ts
import { http } from '@public/utils/request'
import type { OrderDetailParams, OrderDetail } from './types'

export const getOrderDetail = (params: OrderDetailParams) => {
  return http<OrderDetail>({
    url: '/api/order/detail',
    data: params,
    method: 'GET',
  })
}
```

---

## 注意事项

1. **路由注册**
   - 新增页面必须同时在 `wx.config.ts` 和 `alipay.config.ts` 中注册
   - 路径使用相对路径，不要以 `/` 开头
   - 首页路径必须放在 pages 数组的第一位

2. **样式单位**
   - 小程序使用 rpx 单位（750 设计稿基准）
   - 1rpx = 屏幕宽度 / 750
   - 避免使用 px，除非是固定尺寸（如 1px 边框）

3. **生命周期**
   - 使用 Vue3 Composition API 的生命周期钩子
   - `onMounted`：页面加载完成
   - `onShow`：页面显示时触发（从其他页面返回也会触发）
   - `onHide`：页面隐藏时触发

4. **状态管理**
   - 全局状态使用 Pinia store（如 `useUserGlobalStore`）
   - 页面级状态使用 `ref` 或 `reactive`
   - 跨页面传递数据优先使用路由参数或全局状态

5. **组件拆分**
   - 页面代码超过 200 行时考虑拆分子组件
   - 页面级组件放在 `components/` 目录下
   - 可复用组件提取到 `@public/components/`

6. **错误处理**
   - API 调用必须使用 try-catch 包裹
   - 错误信息通过 Taro.showToast 提示用户
   - 避免页面因接口错误而白屏

---

## 快速检查清单

- [ ] 是否创建了完整的页面目录结构（index.vue + index.scss + index.config.ts）？
- [ ] 是否在 wx.config.ts 和 alipay.config.ts 中都注册了页面路由？
- [ ] 页面配置是否设置了正确的 navigationBarTitleText？
- [ ] 是否使用了 rpx 单位而非 px？
- [ ] API 接口是否定义了完整的类型（请求参数和响应数据）？
- [ ] 是否使用了 KYE MiniUI 组件库而非原生元素？
- [ ] 是否添加了 loading 状态和错误处理？
- [ ] 页面是否过长，需要拆分子组件？
