---
name: "kye-miniui"
description: "kye-miniui 是一个基于 Vue3 + Taro 的跨端 UI 组件库，支持微信小程序、支付宝小程序、H5 等多平台。"
---

# kye-miniui 使用指南

kye-miniui 是一个基于 Vue3 + Taro 的跨端 UI 组件库，支持微信小程序、支付宝小程序、H5 等多平台。

## 快速开始

### 安装

```bash
# 添加私有仓库配置（推荐）
# 在 .yarnrc 中添加
"@kye-netc:registry" "http://nexus.ky-tech.com.cn:8081/repository/npmjs-group/"

# 安装
yarn add @kye-netc/kye-miniui -D
```

### 全局引入

```ts
import KyeMiniUi from '@kye-netc/kye-miniui'
import '@kye-netc/kye-miniui/style.css'

const App = createApp({})
App.use(KyeMiniUi)
```

### 组件前置依赖

使用小程序时需要配置 `@tarojs/plugin-html` 插件：

```ts
// config/index.ts
plugins: ['@tarojs/plugin-html']
```

## 使用规范

### 1. 组件命名规范

所有组件以 `ky-` 为前缀，使用时直接调用：

```vue
<ky-button />
<ky-input />
<ky-form />
```

### 2. v-model 双向绑定

组件支持 v-model 双向绑定：

```vue
<ky-input v-model="value" />
<ky-switch v-model="checked" />
<ky-checkbox v-model="checked" />
```

### 3. 组件类型定义

组件 props 和类型定义在各个组件的 SKILL.md 文件中查阅。

## 场景化组件选择

### 表单场景

**必须使用 Form + Field 组合**，不能直接使用 Input！

```vue
<!-- ✅ 正确：使用 Form + Field -->
<ky-form ref="formRef" :model="formData" :rules="rules">
  <ky-field label="用户名" prop="username" v-model="formData.username" />
  <ky-field label="密码" prop="password" v-model="formData.password" type="password" />
  <ky-button @click="submit">提交</ky-button>
</ky-form>

<!-- ❌ 错误：直接使用 Input -->
<ky-input v-model="username" label="用户名" />
```

| 场景 | 推荐组件 | 说明 |
| ---- | -------- | ---- |
| 登录/注册表单 | Form + Field | 支持验证、错误提示、必填校验 |
| 个人信息编辑 | Form + Field | 支持表单字段管理 |
| 搜索表单 | Field | 独立字段可单独使用 |
| 简单输入 | Input | 非表单场景的纯输入 |

### 列表展示场景

**必须配合 CellGroup 使用**，独立 Cell 需要包装在 CellGroup 中！

```vue
<!-- ✅ 正确：使用 CellGroup 包裹 -->
<ky-cell-group title="设置">
  <ky-cell title="消息通知" value="已开启" is-link />
  <ky-cell title="隐私设置" value="已开启" is-link />
</ky-cell-group>

<!-- ❌ 错误：直接使用多个 Cell -->
<ky-cell title="消息通知" value="已开启" is-link />
<ky-cell title="隐私设置" value="已开启" is-link />
```

| 场景 | 推荐组件 | 说明 |
| ---- | -------- | ---- |
| 简单列表 | Cell + CellGroup | 基础列表项 |
| 联系人/设置列表 | Cell + CellGroup | 带图标、箭头、点击操作 |
| 无限滚动列表 | List + Cell | 支持上拉加载更多 |
| 虚拟列表 | ListVirtual | 大数据量列表优化 |
| 标准化列表 | ListStandard | 标准化列表样式 |

**List 必须配合 Loading/Empty 使用**：
- 加载中显示 `<ky-loading>`
- 空状态显示 `<ky-empty>`
- 加载失败显示错误提示

```vue
<ky-list :loading="loading" :finished="finished" @load="onLoad">
  <ky-cell v-for="item in list" :key="item.id" :title="item.title" />
  <template #loading>
    <ky-loading>加载中...</ky-loading>
  </template>
  <template #finished>
    <ky-empty v-if="list.length === 0" description="暂无数据" />
  </template>
</ky-list>
```

### 选择类组件

**必须配合 Group 使用**，独立 Radio/Checkbox 无法获得正确的状态管理！

```vue
<!-- ✅ 正确：配合 Group 使用 -->
<ky-radio-group v-model="selected">
  <ky-radio name="option1">选项1</ky-radio>
  <ky-radio name="option2">选项2</ky-radio>
</ky-radio-group>

<ky-checkbox-group v-model="checkedList">
  <ky-checkbox name="option1">选项1</ky-checkbox>
  <ky-checkbox name="option2">选项2</ky-checkbox>
</ky-checkbox-group>

<!-- ❌ 错误：独立使用 -->
<ky-radio name="option1" v-model="selected">选项1</ky-radio>
```

| 场景 | 推荐组件 | 说明 |
| ---- | -------- | ---- |
| 单选 | RadioGroup + Radio | 支持多种样式（round/check/button） |
| 多选 | CheckboxGroup + Checkbox | 支持多种样式 |
| 开关 | Switch | 状态切换 |
| 日期选择 | Calendar | 日历选择 |
| 时间选择 | Timepicker | 时间选择 |
| 联动选择 | Picker | 多列选择 |

### 轮播场景

**Swiper 必须配合 SwiperItem 使用**：

```vue
<ky-swiper>
  <ky-swiper-item>
    <image src="..." />
  </ky-swiper-item>
  <ky-swiper-item>
    <image src="..." />
  </ky-swiper-item>
</ky-swiper>
```

| 场景 | 推荐组件 | 说明 |
| ---- | -------- | ---- |
| 图片轮播 | Swiper + SwiperItem | 轮播图 |
| 走马灯 | Swiper | 自动轮播 |
| 滑动切换 | SwipeGroup + SwipeCell | 滑动操作 |

### 交互反馈场景

| 场景 | 推荐组件 | 说明 |
| ---- | -------- | ---- |
| 确认对话框 | Dialog | 确认/取消操作 |
| 提示消息 | Dialog (函数式调用 showDialog) | 轻量提示 |
| 底部操作选择 | ActionSheet | 底部操作菜单 |
| 加载状态 | Loading | 加载指示器 |
| 空状态 | Empty | 无数据展示 |

**Dialog 函数式调用**：
```ts
import { showDialog } from '@kye-netc/kye-miniui'

showDialog({
  title: '提示',
  message: '确定要删除吗？',
  showCancelButton: true
}).then(() => {
  // 确认
}).catch(() => {
  // 取消
})
```

### 弹层类组件

| 场景 | 推荐组件 | 说明 |
| ---- | -------- | ---- |
| 底部弹出 | Popup (position="bottom") | 底部面板 |
| 侧边弹出 | Popup (position="left/right") | 侧边栏 |
| 居中弹窗 | Popup (position="center") | 对话框 |
| 气泡提示 | Popover | 气泡卡片 |
| 气泡菜单 | PopoverMenu | 带菜单的气泡 |
| 遮罩层 | Overlay | 遮罩覆盖 |

**Popup 和 Overlay 配合使用**：
- 简单遮罩：直接使用 Popup（内置 Overlay）
- 复杂弹层：Overlay + 自定义弹层内容

### 导航类组件

| 场景 | 推荐组件 | 说明 |
| ---- | -------- | ---- |
| 顶部导航 | Navbar | 页面导航栏 |
| 标签切换 | Tab | 标签页切换 |

**Tab 组件本身即标签头部**，通过 `tabs` 配置 + `v-model` 控制激活项，内容切换由业务自行实现：
```vue
<ky-tab v-model="active" :tabs="[{ label: '标签1' }, { label: '标签2' }]" />
<!-- 根据 active 自行渲染对应内容 -->
```

### 页面结构场景

| 场景 | 推荐组件 | 说明 |
| ---- | -------- | ---- |
| 页面容器 | Container | 页面布局、网络状态、滚动追踪 |
| 分享功能 | Container (useContainerShare) | 页面分享 |
| 滚动位置 | Container (useContainerScroll) | 滚动位置监听 |

### 其他常用组件

| 场景 | 推荐组件 | 说明 |
| ---- | -------- | ---- |
| 图片预览 | ImagePreview | 图片预览、放大 |
| 图片上传 | Upload | 图片/文件上传 |
| 文字展示 | Text | 文本格式化 |
| 标签 | Tag | 标签标记 |
| 圆环进度 | Circle | 环形进度条 |
| 滑动单元格 | SwipeCell | 侧滑操作 |
| 动画过渡 | Transition | CSS 动画过渡 |
| 裁剪图片 | CropperImage | 图片裁剪 |

**ImagePreview 函数式调用**：
```ts
import { showImagePreview } from '@kye-netc/kye-miniui'

showImagePreview({
  images: ['url1', 'url2'],
  startPosition: 0
})
```

### 日期时间选择场景

| 场景 | 推荐组件 | 说明 |
| ---- | -------- | ---- |
| 单日选择 | Calendar (type="single") | 单日期选择 |
| 日期范围 | Calendar (type="range") | 开始日期到结束日期 |
| 多日选择 | Calendar (type="multiple") | 多个日期选择 |
| 周选择 | Calendar (type="week") | 按周选择 |
| 时间选择 | Timepicker | 时间选择器 |
| 日期时间 | Picker + 自定义 | 联动日期时间选择 |

**Calendar 配合 Popup 使用**：
```vue
<ky-cell title="选择日期" :value="date" is-link @click="show = true" />
<ky-calendar v-model:show="show" type="range" @confirm="onConfirm" />
```

**常用快捷选项配置**：
```ts
const options = [
  { text: '今天', startDate: 'today', endDate: 'today' },
  { text: '近一周', startDate: 'today-7', endDate: 'today' },
  { text: '近一个月', startDate: 'today-30', endDate: 'today' }
]
```

### 文件上传场景

**Upload 配合 FileItem 状态管理**：

```vue
<ky-upload
  v-model="fileList"
  :max-count="9"
  :max-size="5 * 1024 * 1024"
  accept="image/*"
  :before-read="beforeRead"
  :after-read="afterRead"
  @oversize="onOversize"
  @delete="onDelete"
/>
```

| 场景 | 推荐组件 | 说明 |
| ---- | -------- | ---- |
| 图片上传 | Upload (accept="image/*") | 图片选择上传 |
| 多图上传 | Upload (multiple) | 一次选择多张图片 |
| 视频上传 | Upload (mediaType="video") | 视频上传 |
| 头像上传 | Upload + CropperImage | 裁剪后上传 |
| 文件上传 | Upload (accept="*") | 任意文件 |

**beforeRead 拦截示例**：
```ts
const beforeRead = (file) => {
  if (file.size > 5 * 1024 * 1024) {
    uni.showToast({ title: '文件不能超过5MB', icon: 'none' })
    return false
  }
  return true
}
```

### 表单输入场景

**Textarea 配合 Form 使用**：

```vue
<ky-form ref="formRef" :model="formData" :rules="rules">
  <ky-field label="简介" prop="bio" type="textarea" :maxlength="200" show-word-limit>
    <ky-textarea v-model="formData.bio" :maxlength="200" show-word-limit />
  </ky-field>
</ky-form>
```

| 场景 | 推荐组件 | 说明 |
| ---- | -------- | ---- |
| 单行输入 | Field (type="text") | 文本输入 |
| 密码输入 | Field (type="password") | 密码输入 |
| 数字输入 | Field (type="number/digit") | 数字键盘 |
| 手机号 | Field (type="idcard") | 身份证输入 |
| 昵称输入 | Field (type="nickname") | 微信昵称 |
| 多行文本 | Field + Textarea | 文本域输入 |

**Input type 差异**：
| type | 说明 | 适用平台 |
| ---- | ---- | -------- |
| text | 文本 | 全平台 |
| number | 数字 | 全平台 |
| digit | 整数 | 全平台 |
| idcard | 身份证 | 微信/支付宝 |
| password | 密码 | 全平台 |
| nickname | 昵称 | 微信 |

### 表单验证场景

**Form Rules 配置规范**：

```ts
const rules = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 3, max: 20, message: '用户名3-20个字符' }
  ],
  phone: [
    { required: true, message: '请输入手机号' },
    { pattern: /^1\d{10}$/, message: '手机号格式错误' }
  ],
  email: [
    { validator: (value) => {
      if (!value) return true
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    }, message: '邮箱格式错误' }
  ]
}
```

| 验证类型 | 配置方式 | 说明 |
| ---- | -------- | ---- |
| 必填 | `required: true` | 必填字段 |
| 最小长度 | `min: number` | 最小字符数 |
| 最大长度 | `max: number` | 最大字符数 |
| 正则验证 | `regex: RegExp` | 正则表达式 |
| 自定义验证 | `validator: Function` | 自定义函数 |
| 异步验证 | `validator: Promise` | 异步校验 |

**Form 验证方法**：
```ts
const formRef = ref()

// 验证全部
const validateAll = async () => {
  const { valid, errors } = await formRef.value.validate()
  if (!valid) {
    console.log('错误:', errors)
  }
}

// 验证单个字段
const validateField = async (prop) => {
  const { valid } = await formRef.value.validate(prop)
}

// 重置表单
const resetForm = () => {
  formRef.value.reset()
}
```

### 表单布局场景

**Field label 位置配置**：

```vue
<!-- 标签在上方 -->
<ky-field label="用户名" label-position="top" />

<!-- 标签在左侧 -->
<ky-field label="用户名" label-position="left" label-align="center" />
```

| 布局类型 | 配置 | 适用场景 |
| ---- | ---- | -------- |
| 标签上方 | label-position="top" | 移动端表单 |
| 标签左侧 | label-position="left" | PC端表单 |
| 标签对齐 | label-align="left/center/right" | 标签内容对齐 |

### 弹窗自定义场景

**Popup 配合自定义内容**：

```vue
<!-- 底部抽屉 -->
<ky-popup v-model:show="show" position="bottom" round>
  <view class="drawer-content">
    <ky-cell>选项1</ky-cell>
    <ky-cell>选项2</ky-cell>
  </view>
</ky-popup>

<!-- 全屏弹窗 -->
<ky-popup v-model:show="show" position="center" :round="false">
  <view class="full-screen">全屏内容</view>
</ky-popup>
```

| 弹窗类型 | 配置 | 场景 |
| ---- | ---- | ---- |
| 底部面板 | position="bottom" | 选择器、抽屉 |
| 居中弹窗 | position="center" | 对话框、提示 |
| 左侧滑出 | position="left" | 侧边菜单 |
| 右侧滑出 | position="right" | 侧边栏 |
| 顶部弹出 | position="top" | 通知提示 |

### 列表组合场景

**Cell 配合其他组件使用**：

```vue
<ky-cell-group title="设置">
  <ky-cell title="头像">
    <template #right>
      <image src="avatar.png" class="avatar" />
    </template>
  </ky-cell>
  <ky-cell title="昵称" value="用户名" is-link />
  <ky-cell title="开关">
    <template #right>
      <ky-switch v-model="enabled" />
    </template>
  </ky-cell>
</ky-cell-group>
```

**Cell 常用插槽**：
| 插槽名 | 说明 |
| ---- | ---- |
| default | 右侧内容 |
| title | 自定义标题 |
| label | 自定义描述 |
| icon | 自定义图标 |
| right-icon | 自定义右侧图标 |

### 图文混排场景

| 场景 | 推荐组件 | 说明 |
| ---- | -------- | ---- |
| 标题文本 | Text (type="title") | 标题样式 |
| 正文文本 | Text | 正文内容 |
| 辅助文本 | Text (color="#999") | 灰色辅助文字 |
| 强调文本 | Text (color, weight) | 重点强调 |
| 溢出省略 | Text (overflow="ellipsis") | 单行省略 |
| 多行省略 | Text (overflow="clamp") | 多行省略 |

## 平台差异

### 支持的平台

- **微信小程序** (weapp)
- **支付宝小程序** (alipay)
- **H5** (h5)
- **App** (native)

### 平台特定差异

#### Input 输入框

| 特性 | 微信小程序 | 支付宝小程序 | H5 |
| ---- | ---------- | ------------ | --- |
| 原生支持 | enableWxNative | 部分支持 | 使用系统 input |
| 格式化 | enableWxNativeFormatter | 部分支持 | enableNative |
| 清除按钮 | 平台适配 | 平台适配 | 失焦隐藏 |

#### Checkbox 复选框

| 特性 | 小程序 | H5 |
| ---- | ------ | --- |
| 样式文件 | index.native.scss | index.h5.scss |
| 事件处理 | 平台适配 | 标准事件 |

#### Button 按钮

| 特性 | 微信小程序 | H5 |
| ---- | ---------- | --- |
| 表单类型 | formType 支持 | 使用 button type |
| 样式文件 | index.weapp.scss | index.scss |

#### Navbar 导航栏

- 微信小程序：使用 useNavbarWeapp
- 支付宝小程序：使用 useNavbarALipay
- H5：使用 useNavbar

#### Floating Panel 浮动面板

- H5：floating-panel-h5.vue
- 微信小程序：floating-panel-wx.vue
- 通用：floating-panel.vue

### 平台条件编译

组件内使用条件编译处理平台差异：

```vue
<!-- #ifdef weapp -->
<view>微信小程序专属</view>
<!-- #endif -->

<!-- #ifdef h5 -->
<view>H5 专属</view>
<!-- #endif -->
```

## 组件目录结构

```
packages/__components/
├── form/                 # 表单容器
├── field/                # 表单字段
├── input/                # 输入框（h5.vue / native.vue 多端实现）
├── textarea/             # 文本域
├── button/               # 按钮
├── checkbox/             # 复选框
├── checkboxgroup/        # 复选框组
├── radio/                # 单选框
├── radiogroup/           # 单选框组
├── switch/               # 开关
├── picker/               # 选择器
├── calendar/             # 日历
├── timepicker/           # 时间选择
├── cell/                 # 单元格
├── cell-group/           # 单元格组
├── list/                 # 列表（wx.vue / alipay.vue 多端实现）
├── list-standard/        # 标准列表
├── list-virtual/         # 虚拟列表
├── dialog/               # 对话框
├── popup/                # 弹出层
├── popup-simple/         # 简单弹出层（未在主入口导出，需按需引入）
├── overlay/              # 遮罩层
├── action-sheet/         # 操作面板
├── navbar/               # 导航栏
├── tab/                  # 标签页
├── swiper/               # 轮播
├── swiper-item/          # 轮播项
├── tag/                  # 标签
├── loading/              # 加载
├── empty/                # 空状态
├── upload/               # 上传
├── image-preview/        # 图片预览
├── container/            # 页面容器
├── text/                 # 文本
├── popover/              # 气泡
├── popover-menu/         # 气泡菜单
├── floating-bubble/      # 浮动气泡
├── floating-panel/       # 浮动面板（floating-panel.vue / -h5.vue / -wx.vue 多端实现）
├── circle/               # 圆环
├── swipe-cell/           # 滑动单元格
├── swipe-group/          # 滑动组
├── transition/           # 过渡动画
├── auto-complete/        # 自动完成
├── cropper-image/        # 图片裁剪
└── float-pagination/     # 浮动分页
```

### 组件目录结构规范

每个组件目录包含：

```
组件名/
├── src/
│   ├── 组件名.vue         # 主组件
│   ├── types.ts          # 类型定义
│   ├── index.scss        # 样式文件
│   ├── components/       # 子组件
│   └── hooks/            # 钩子函数
├── index.ts              # 入口文件
└── package.json          # 包配置
```

## 注意事项

1. **表单场景必须使用 Form + Field**：直接使用 Input 无法享受表单验证功能
2. **选择类组件配合 Group 使用**：Radio、Checkbox 配合 Group 使用可获得更好的状态管理
3. **列表场景必须配合 CellGroup**：多个 Cell 需要包装在 CellGroup 中
4. **List 配合 Loading/Empty 使用**：加载中显示 Loading，空数据显示 Empty
5. **轮播配合 SwiperItem**：Swiper 必须配合 SwiperItem 使用
6. **Tab 通过 tabs 配置使用**：Tab 组件本身即标签头部，通过 `tabs` 配置 + `v-model` 控制激活项
7. **函数式调用优先**：Dialog、ImagePreview 推荐使用函数式调用
8. **小程序环境需配置插件**：使用 `@tarojs/plugin-html` 插件
9. **平台差异注意**：部分组件有平台特定实现，使用时注意平台兼容性