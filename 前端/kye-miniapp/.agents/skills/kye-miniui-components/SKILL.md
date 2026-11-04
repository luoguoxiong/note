---
name: kye-miniui-components
description: 指导在小程序项目中正确使用 KYE MiniUI 组件库，包括组件选择、使用规范与常见场景。当需要使用 UI 组件或表单开发时使用本技能。
---

# KYE MiniUI 组件库使用指南

## 使用场景

当你需要：
- 开发小程序页面的 **UI 界面**
- 实现 **表单输入、按钮、弹窗** 等交互组件
- 使用 **图片、上传、选择器** 等功能组件
- 替换原生 HTML 元素为小程序组件

请使用本技能，并严格遵守组件库使用规范。

---

## 核心原则

`@kye-netc/kye-miniui` 是项目的自研小程序 UI 组件库，覆盖表单、反馈、展示等场景。

**强制规范：**
- **编码前必须先查看** 相关组件的文档或示例
- **禁止使用原生表单元素**（input/textarea/button），必须使用 UI 组件库组件
- 图片必须使用 `@public/components/base/kye-image` 组件
- 所有交互组件优先使用 KYE MiniUI 提供的组件

---

## 使用步骤

### 步骤 1：确定需要的组件类型

根据业务需求选择对应的组件：

| 组件名 | 用途 | 替代原生元素 |
|--------|------|-------------|
| ky-field | 表单字段容器 | div |
| ky-input | 文本输入 | input, textarea |
| ky-button | 按钮 | button |
| ky-upload | 文件上传 | input[type=file] |
| ky-dialog | 弹窗 | - |
| ky-radio | 单选 | input[type=radio] |
| ky-checkbox | 多选 | input[type=checkbox] |
| kye-image | 图片展示 | img |

### 步骤 2：导入并使用组件

```vue
<script setup lang="ts">
import { ref } from 'vue'

const username = ref('')
const password = ref('')

const handleSubmit = () => {
  console.log('提交表单', { username: username.value, password: password.value })
}
</script>

<template>
  <view class="form-container">
    <ky-field label="用户名" required>
      <ky-input v-model="username" placeholder="请输入用户名" />
    </ky-field>
    
    <ky-field label="密码" required>
      <ky-input v-model="password" type="password" placeholder="请输入密码" />
    </ky-field>
    
    <ky-button type="primary" @click="handleSubmit">提交</ky-button>
  </view>
</template>
```

### 步骤 3：图片组件使用

```vue
<template>
  <kye-image 
    :src="imageUrl" 
    mode="aspectFill"
    :lazy-load="true"
    @error="handleImageError"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const imageUrl = ref('https://example.com/image.jpg')

const handleImageError = () => {
  console.error('图片加载失败')
}
</script>
```

### 步骤 4：弹窗组件使用

```vue
<template>
  <ky-button @click="showDialog = true">打开弹窗</ky-button>
  
  <ky-dialog 
    v-model:show="showDialog"
    title="提示"
    :show-cancel-button="true"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <view>这是弹窗内容</view>
  </ky-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showDialog = ref(false)

const handleConfirm = () => {
  console.log('确认')
  showDialog.value = false
}

const handleCancel = () => {
  console.log('取消')
  showDialog.value = false
}
</script>
```

---

## 注意事项

1. **禁止混用原生元素**
   - ❌ 错误：`<input type="text" />`
   - ✅ 正确：`<ky-input v-model="value" />`

2. **表单字段必须使用 ky-field 包裹**
   - ky-field 提供统一的标签、必填标识、错误提示等功能
   - 保持表单样式的一致性

3. **图片加载优化**
   - 使用 kye-image 组件的 lazy-load 属性实现懒加载
   - 为图片添加 error 事件处理，提升用户体验

4. **组件属性查阅**
   - 使用组件前先查看组件文档或已有代码示例
   - 不确定的属性不要随意添加，避免运行时错误

5. **样式定制**
   - 组件库提供的样式已经过设计，尽量使用默认样式
   - 如需定制，通过 class 或 style 属性进行覆盖

---

## 快速检查清单

- [ ] 是否所有表单输入都使用了 ky-input 而非原生 input？
- [ ] 是否所有按钮都使用了 ky-button 而非原生 button？
- [ ] 是否所有图片都使用了 kye-image 而非原生 img？
- [ ] 表单字段是否都用 ky-field 包裹并设置了 label？
- [ ] 是否为必填字段添加了 required 属性？
- [ ] 弹窗、选择器等交互组件是否正确绑定了事件处理函数？
- [ ] 是否查阅了组件文档，确认使用的属性和事件是正确的？
