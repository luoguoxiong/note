# Agent 项目指南

本文档为 AI 助手提供项目上下文，帮助更好地理解和协助开发。

## 项目概述

**kye-miniui** 是一个基于 Vue3 + Vite 的跨平台小程序 UI 组件库，采用 monorepo 架构，支持微信小程序、支付宝小程序、H5 等多端。

- **包名**: `@kye-netc/kye-miniui`
- **版本**: 0.3.0-beta.12
- **技术栈**: Vue 3 + TypeScript + Vite + Taro + SCSS
- **包管理**: pnpm workspaces

## 目录结构

```
kye-miniui/
├── packages/
│   ├── __components/        # 组件源码目录（46 个组件目录）
│   │   ├── button/          # 按钮组件
│   │   ├── dialog/          # 对话框组件
│   │   ├── form/            # 表单组件
│   │   ├── input/           # 输入框组件（h5.vue / native.vue 多端实现）
│   │   ├── list/            # 列表组件（wx.vue / alipay.vue 多端实现）
│   │   ├── picker/          # 选择器组件
│   │   ├── popup/           # 弹出层组件
│   │   ├── popup-simple/    # 简易弹出层（未在主入口导出，需按需引入）
│   │   └── ...              # 其他组件
│   ├── ky-miniui-lib/       # 组件库入口和打包配置
│   ├── scss/                # 全局样式和 SCSS 工具
│   ├── types/               # 公共类型定义
│   └── utils/               # 工具函数和 Hooks
├── docs/                    # Vitepress 文档
│   ├── components/          # 组件文档
│   └── demos/               # 文档示例代码
├── example/                 # H5 示例项目
├── preview/taro-demo/       # 小程序预览项目
├── cli/                     # CLI 工具（创建组件等）
├── lib/                     # 打包输出目录
├── skills/                  # 组件 Skill 文件（AI 助手使用，每个组件一份 SKILL.md）
└── .trae/                   # Trae IDE 配置
```

## 多端适配差异说明

### 支持平台

| 平台     | Taro ENV          | 说明       |
| ------ | ----------------- | -------- |
| 微信小程序  | `WEAPP`           | 主要支持平台   |
| 支付宝小程序 | `ALIPAY`          | 需要特殊适配   |
| H5     | `WEB`             | Web 端    |
| 微信 App | `WEAPP` (isWxApp) | 多端原生 App |

### 平台判断方式

```typescript
import Taro from '@tarojs/taro'

const ENV = Taro.getEnv()
const ENV_TYPE = Taro.ENV_TYPE

// 判断当前平台
if (ENV === Taro.ENV_TYPE.WEAPP) {
  // 微信小程序
} else if (ENV === Taro.ENV_TYPE.ALIPAY) {
  // 支付宝小程序
} else if (ENV === Taro.ENV_TYPE.WEB) {
  // H5
}

// 判断是否为微信 App（多端原生）
import useEnvConfig from '@packages/utils/hooks/useEnvConfig'
const { isWxApp } = useEnvConfig()
```

### 组件级平台差异

#### 1. Picker 选择器

**差异点**: H5 使用独立的选择器组件，小程序使用原生 picker

```typescript
// 动态加载不同平台组件
let PickerItemView
if (process.env.TARO_ENV === 'h5') {
  PickerItemView = defineAsyncComponent(() => import('./components/picker-h5.vue'))
} else {
  PickerItemView = defineAsyncComponent(() => import('./components/picker.vue'))
}
```

**文件差异**:

- `picker-h5.vue` - H5 专用，支持触摸滑动
- `picker.vue` - 小程序专用

#### 2. FloatingPanel 浮动面板

**差异点**: 小程序使用 `movable-area` + `movable-view`，H5 使用原生触摸事件

| 平台  | 实现方式                      | 文件                       |
| --- | ------------------------- | ------------------------ |
| 通用  | 原生 touch 事件（默认导出）          | `floating-panel.vue`     |
| H5  | 原生 touch 事件（H5 专用变体）       | `floating-panel-h5.vue`  |
| 小程序 | movable-area/movable-view | `floating-panel-wx.vue`  |

**小程序特殊处理**:

- 使用 `movable-area` 和 `movable-view` 实现拖拽
- 支付宝需要使用 `CoverViewAlipay` 组件
- 微信 App 需要设置 `catch-move` 属性

#### 3. Navbar 导航栏

**差异点**: 各平台胶囊按钮位置、状态栏高度计算方式不同

**平台适配文件**:

- `useNavbar.ts` - 通用计算逻辑
- `useNavbarWeapp.ts` - 微信小程序适配
- `useNavbarALipay.ts` - 支付宝小程序适配

**微信小程序**:

```typescript
// 胶囊按钮位置
const { height, top, right, width } = getMenuButtonBoundingClientRect()
// paddingTop = top + height / 2
```

**支付宝小程序**:

```typescript
// 使用 getLeftButtonsBoundingClientRect 获取左侧按钮位置
if (Taro.canIUse('getLeftButtonsBoundingClientRect')) {
  const { backButtonIcon, homeButtonIcon } = Taro.getLeftButtonsBoundingClientRect()
}
// 平板适配：windowWidth > 768 时调整标题字体
```

**支付宝特殊处理**:

- 不支持自定义返回箭头（始终显示系统箭头）
- 需要使用 `getLeftButtonsBoundingClientRect` 获取按钮位置

#### 4. Input 输入框

**差异点**: 各平台键盘、原生输入框行为不同

**关键差异**:

| 属性                  | 微信小程序   | 支付宝小程序                | H5                 |
| ------------------- | ------- | --------------------- | ------------------ |
| `enableNative`      | 默认 true | 安卓+clearable 需设 false | -                  |
| `enableWxNative`    | 支持原生组件  | 不支持                   | 不支持                |
| `alwaysSystem`      | -       | -                     | 鸿蒙 number 类型需 true |
| `customPlaceholder` | 安卓需要    | 安卓需要                  | -                  |

**微信原生输入框**:

```vue
<template v-if="enableWxNative">
  <custom-input
    :type="type"
    :value="currentValue"
    @input="onInputNative"
  />
</template>
```

**鸿蒙适配**:

```typescript
// 鸿蒙 number 类型需要开启 always-system
if (props.type === 'number' && platform?.includes('Harmony')) {
  return true
}
```

#### 5. Upload 上传

**差异点**: 文件选择 API 不同

**微信小程序**:

```typescript
Taro.chooseMedia({
  count: maxCount,
  mediaType: ['image'],
  sourceType: ['album', 'camera'],
  success: onChangeMedia
})
```

**其他平台**:

```typescript
Taro.chooseImage({
  count: maxCount,
  sourceType: ['album', 'camera'],
  success: onChangeImage
})
```

#### 6. ImagePreview 图片预览

**差异点**: 图片下载方式不同

**H5**:

```typescript
// 使用 fetch + blob 下载
const response = await fetch(imgUrl)
const blob = await response.blob()
// 创建 a 标签下载
```

**小程序**:

```typescript
// 使用 Taro API
await Taro.downloadFile({ url })
await Taro.saveImageToPhotosAlbum({ filePath })
```

### 样式差异

#### 1. CSS 类名平台区分

```scss
.ky-component {
  // 通用样式
  
  &--WEAPP {
    // 微信小程序特定样式
  }
  
  &--ALIPAY {
    // 支付宝小程序特定样式
  }
  
  &--WEB {
    // H5 特定样式
  }
}
```

#### 2. 样式文件分离

部分组件有平台特定样式文件：

- `index.h5.scss` - H5 专用样式
- `index.native.scss` - 小程序专用样式
- `index.weapp.scss` - 微信小程序专用样式

### API 差异

#### 1. 菜单按钮信息获取

| 平台     | API                                                   |
| ------ | ----------------------------------------------------- |
| 微信小程序  | `Taro.getMenuButtonBoundingClientRect()`              |
| 支付宝小程序 | `Taro.getLeftButtonsBoundingClientRect()` (需 canIUse) |
| H5     | 无                                                     |

#### 2. 系统信息获取

```typescript
import { getWindowInfo, getSystemInfo } from '@ky-miniui-lib/utils'

// 推荐使用封装方法
const { statusBarHeight, windowWidth, windowHeight } = getWindowInfo()
const systemInfo = getSystemInfo()
```

#### 3. 平台特性检测

```typescript
// 检测 API 是否可用
if (Taro.canIUse('getLeftButtonsBoundingClientRect')) {
  // 支付宝特有 API
}

// 检测平台
const { isWxApp } = useEnvConfig()
```

### 开发调试命令

| 平台        | 命令                    | 输出目录                            |
| --------- | --------------------- | ------------------------------- |
| 微信小程序     | `pnpm run dev:wx`     | `preview/taro-demo/dist/weapp`  |
| 支付宝小程序    | `pnpm run dev:alipay` | `preview/taro-demo/dist/alipay` |
| H5        | `pnpm run dev:h5`     | -                               |
| H5 (Vite) | `pnpm run dev:dev`    | `http://localhost:3000`         |

### 平台适配最佳实践

1. **条件编译**: 使用 `process.env.TARO_ENV` 判断平台
2. **动态组件**: 使用 `defineAsyncComponent` 按平台加载组件
3. **平台 Hooks**: 将平台逻辑封装到独立文件（如 `useNavbarWeapp.ts`）
4. **样式隔离**: 使用平台特定 CSS 类名或样式文件
5. **API 检测**: 使用 `Taro.canIUse()` 检测 API 可用性
6. **工具封装**: 使用 `@ky-miniui-lib/utils` 中封装的跨平台方法

## 组件开发规范

### 组件目录结构

每个组件位于 `packages/__components/<component-name>/` 目录下：

```
component-name/
├── src/
│   ├── component-name.vue   # 组件主文件
│   ├── types.ts             # 类型定义
│   └── index.scss           # 组件样式
├── index.ts                 # 组件导出
└── package.json             # 组件配置
```

### 组件命名规范

- **组件名**: kebab-case（如 `action-sheet`）
- **Vue 组件 name**: ky- 前缀 + kebab-case（如 `ky-action-sheet`）
- **CSS 类名前缀**: `ky-`（如 `.ky-button`）

### 类型定义规范

```typescript
// types.ts
export type ComponentProps = Partial<{
  // 属性定义，带注释
  propA: string
  propB: number
}>

export interface ComponentEmits {
  // 事件定义
}
```

### 样式规范

- 使用 SCSS 预处理器
- BEM 命名规范
- 类名前缀: `ky-`
- 变量定义在 `packages/scss/base/` 目录

## 常用命令

### 开发命令

```bash
# H5 开发
pnpm run dev:dev           # 开发环境 http://localhost:3000/
pnpm run dev:uat           # UAT 环境
pnpm run dev:prod          # 生产环境

# 小程序开发
pnpm run dev:wx            # 微信小程序
pnpm run dev:alipay        # 支付宝小程序
pnpm run dev:h5            # H5 (Taro)

# 文档开发
pnpm run docs:dev          # 文档开发 http://localhost:3100/
```

### 构建命令

```bash
pnpm run build:lib         # 构建组件库 → lib/
pnpm run build:dev         # 构建 H5 示例 → dist/
pnpm run build:wx          # 构建微信小程序
pnpm run build:alipay      # 构建支付宝小程序
pnpm run docs:build        # 构建文档
```

### 其他命令

```bash
pnpm run gen:cli           # 创建新组件（交互式）
pnpm run lint              # ESLint 检查
pnpm run pub:local         # 发布到本地私服
```

## 组件列表

### 基础组件

| 组件           | 说明            |
| ------------ | ------------- |
| button       | 按钮           |
| cell         | 单元格          |
| cell-group   | 单元格组         |
| popup        | 弹出层          |
| popup-simple | 简易弹出层（需按需引入） |
| overlay      | 遮罩层          |
| transition   | 过渡动画         |
| loading      | 加载           |
| tag          | 标签           |
| text         | 文本           |

> 注：本库未提供独立 `icon` / `image` 组件，图标请使用图片资源或第三方图标库，图片请使用原生 `image` 标签。

### 表单组件

| 组件            | 说明    |
| ------------- | ----- |
| form          | 表单    |
| field         | 表单字段  |
| input         | 输入框   |
| textarea      | 多行文本框 |
| checkbox      | 复选框   |
| checkboxgroup | 复选框组  |
| radio         | 单选框   |
| radiogroup    | 单选框组  |
| switch        | 开关    |
| picker        | 选择器   |
| calendar      | 日历    |
| timepicker    | 时间选择器 |
| upload        | 上传    |
| auto-complete | 自动完成  |

### 展示组件

| 组件            | 说明   |
| ------------- | ---- |
| empty         | 空状态  |
| circle        | 圆形进度 |
| swiper        | 轮播图  |
| swiper-item   | 轮播项  |
| image-preview | 图片预览 |

### 导航组件

| 组件               | 说明   |
| ---------------- | ---- |
| navbar           | 导航栏  |
| tab              | 标签页  |
| float-pagination | 浮动分页 |

### 反馈组件

| 组件           | 说明    |
| ------------ | ----- |
| dialog       | 对话框   |
| action-sheet | 动作面板  |
| popover      | 气泡弹出框 |
| popover-menu | 气泡菜单  |

### 业务组件

| 组件              | 说明     |
| --------------- | ------ |
| container       | 页面容器   |
| list            | 列表     |
| list-standard   | 标准列表   |
| list-virtual    | 虚拟列表   |
| swipe-cell      | 滑动单元格  |
| swipe-group     | 滑动单元格组 |
| floating-bubble | 浮动气泡   |
| floating-panel  | 浮动面板   |
| cropper-image   | 图片裁剪   |

## 代码风格

### Vue 组件

```vue
<template>
  <view :class="classes">
    <slot></slot>
  </view>
</template>

<script setup lang="ts" name="ky-component">
import { computed } from 'vue'
import { ComponentProps } from './types'
import './index.scss'

const props = withDefaults(defineProps<ComponentProps>(), {
  // 默认值
})

const emit = defineEmits(['update:modelValue', 'change'])

const classes = computed(() => ({
  'ky-component': true,
  'ky-component--disabled': props.disabled
}))
</script>
```

### TypeScript

- 使用 TypeScript 4.9
- 组件 Props 使用 `Partial<>` 包装
- 导出类型定义供外部使用

### SCSS

```scss
$prefix: 'ky';

.#{$prefix}-button {
  // 样式定义
  
  &--primary {
    // 修饰符
  }
  
  &__icon {
    // 元素
  }
}
```

## 发布流程

1. 更新版本号（package.json）
2. 构建组件库：`pnpm run build:lib`
3. 发布到私服：`pnpm run publish:kye-miniui`

## 注意事项

1. **组件前缀**: 所有组件名和 CSS 类名使用 `ky-` 前缀
2. **双向绑定**: 使用 `v-model` 和 `update:modelValue` 模式
3. **事件命名**: 使用 kebab-case（如 `@click-left`）
4. **类型导出**: 每个组件的 types.ts 需要导出 Props 和其他类型
5. **文档同步**: 修改组件后需更新 docs/components/ 下的文档
6. **平台适配**: 新增组件需考虑多端兼容性

## 相关资源

- [Taro 文档](https://taro-docs.jd.com/)
- [Vue 3 文档](https://cn.vuejs.org/)
- [Vite 文档](https://cn.vitejs.dev/)
- [Vitepress 文档](https://vitepress.dev/)
- [微信小程序文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [支付宝小程序文档](https://opendocs.alipay.com/mini)

