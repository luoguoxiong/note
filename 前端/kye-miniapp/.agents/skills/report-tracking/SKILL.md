---
name: report-tracking
description: 指导在小程序项目中实现埋点追踪，包括埋点类型、命名规范、文件组织与上报方式。当需要添加数据埋点时使用本技能。
---

# 埋点追踪

## 使用场景

当你需要：
- 为页面或功能添加 **数据埋点**
- 追踪用户的 **行为数据**（PV、点击、曝光等）
- 理解项目的 **埋点规范** 和上报方式
- 组织和管理 **埋点代码**

请使用本技能，并遵守项目的埋点追踪规范。

---

## 使用步骤

### 步骤 1：确定埋点类型

根据业务需求选择合适的埋点类型：

| 类型 | 命名规范 | 说明 | 使用场景 |
|------|----------|------|----------|
| PV | reportXxxUv | 页面访问量 | 页面加载时上报 |
| 点击 | reportXxxClick | 元素点击事件 | 按钮、链接点击时上报 |
| 曝光 | reportXxxExposure | 元素曝光事件 | 元素进入可视区域时上报 |
| 事件 | reportXxxEvent | 自定义事件 | 特定业务事件发生时上报 |

### 步骤 2：创建埋点文件

在页面或模块的 `report/` 目录下创建埋点函数：

```
modules/order/pages/order-detail/
└── report/
    └── index.ts     # 埋点函数定义
```

### 步骤 3：定义埋点函数

在 `report/index.ts` 中定义埋点上报函数：

```typescript
// report/index.ts
import { report } from '@public/utils/aplusConfig'

export const reportOrderDetailUv = () => {
  report('order_detail_page_view', {
    page: 'order_detail',
    timestamp: Date.now(),
  })
}

export const reportOrderDetailClick = (btnName: string) => {
  report('order_detail_click', {
    btn_name: btnName,
    page: 'order_detail',
  })
}

export const reportOrderDetailExposure = (moduleId: string) => {
  report('order_detail_exposure', {
    module_id: moduleId,
    page: 'order_detail',
  })
}

export const reportOrderDetailEvent = (eventName: string, params?: Record<string, any>) => {
  report('order_detail_event', {
    event_name: eventName,
    page: 'order_detail',
    ...params,
  })
}
```

**埋点参数说明：**
- 第一个参数：埋点事件名称（使用下划线命名）
- 第二个参数：埋点数据对象（包含业务相关的字段）

### 步骤 4：在页面中使用

在页面组件中导入并调用埋点函数：

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  reportOrderDetailUv, 
  reportOrderDetailClick,
  reportOrderDetailEvent 
} from './report'

onMounted(() => {
  reportOrderDetailUv()
})

const handleSubmit = () => {
  reportOrderDetailClick('submit_button')
  
  console.log('提交订单')
}

const handleCancel = () => {
  reportOrderDetailClick('cancel_button')
  
  console.log('取消订单')
}

const handlePaySuccess = () => {
  reportOrderDetailEvent('pay_success', {
    order_id: '123',
    amount: 100,
  })
}
</script>

<template>
  <view class="order-detail">
    <ky-button @click="handleSubmit">提交订单</ky-button>
    <ky-button @click="handleCancel">取消</ky-button>
  </view>
</template>
```

### 步骤 5：曝光埋点实现

对于需要追踪曝光的元素，可以使用 Intersection Observer 或滚动监听：

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { reportOrderDetailExposure } from './report'

const moduleRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
  if (moduleRef.value) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          reportOrderDetailExposure('module_1')
          observer?.disconnect()
        }
      })
    })
    observer.observe(moduleRef.value)
  }
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<template>
  <view ref="moduleRef" class="module">
    模块内容
  </view>
</template>
```

---

## 注意事项

1. **命名规范**
   - 埋点函数命名：`reportXxxYyy`（驼峰命名）
   - 埋点事件名称：`xxx_yyy_zzz`（下划线命名）
   - 保持命名的一致性和可读性

2. **埋点时机**
   - PV 埋点：在 `onMounted` 或 `onShow` 中上报
   - 点击埋点：在事件处理函数中上报
   - 曝光埋点：在元素进入可视区域时上报
   - 避免重复上报同一事件

3. **埋点参数**
   - 必须包含 `page` 字段标识页面
   - 参数名使用下划线命名（snake_case）
   - 参数值类型应与后端约定保持一致
   - 避免上报敏感信息（如密码、token）

4. **文件组织**
   - 页面级埋点放在页面的 `report/` 目录
   - 公共埋点工具放在 `@public/report/`
   - 保持埋点代码的独立性和可维护性

5. **性能优化**
   - 避免在高频事件（如滚动、输入）中直接上报
   - 使用防抖或节流优化高频埋点
   - 曝光埋点应在首次曝光后停止监听

6. **测试验证**
   - 开发时在控制台查看埋点上报日志
   - 使用抓包工具验证埋点数据是否正确
   - 与数据团队确认埋点字段和格式

---

## 快速检查清单

- [ ] 埋点函数命名是否符合 `reportXxxYyy` 规范？
- [ ] 埋点事件名称是否使用下划线命名？
- [ ] 是否在正确的时机上报埋点（PV/点击/曝光）？
- [ ] 埋点参数是否包含必要的字段（如 page）？
- [ ] 是否避免上报敏感信息？
- [ ] 曝光埋点是否在首次曝光后停止监听？
- [ ] 是否在开发环境中验证了埋点数据？
