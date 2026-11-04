# Popover

<code-preview path="demos/popover/popover-1.vue" title="基本使用" description="气泡弹出框的各种用法示例"></code-preview>

## 基本使用

Popover 气泡弹出框用于展示提示信息或操作菜单，支持多种位置、主题和动画效果。

```html
<Popover :show="show" location="bottom">
  <template #reference>
    <view @click="show = !show">点击触发</view>
  </template>
  <template #content>
    <view>这是气泡内容区域</view>
  </template>
</Popover>
```

```javascript
import { ref } from 'vue'
const show = ref(false)
```

## 位置选择

支持 12 种位置选项，满足各种布局需求。

```html
<!-- 四个基本方向 -->
<Popover :show="show" location="top" />
<Popover :show="show" location="bottom" />
<Popover :show="show" location="left" />
<Popover :show="show" location="right" />

<!-- 带对齐的方向 -->
<Popover :show="show" location="top-start" />
<Popover :show="show" location="top-end" />
<Popover :show="show" location="bottom-start" />
<Popover :show="show" location="bottom-end" />
<Popover :show="show" location="left-start" />
<Popover :show="show" location="left-end" />
<Popover :show="show" location="right-start" />
<Popover :show="show" location="right-end" />
```

## 主题样式

支持四种主题样式，适应不同场景需求。

```html
<!-- 浅色主题（默认） -->
<Popover :show="show" theme="light">
  <template #reference><view>light</view></template>
  <template #content><view>浅色主题内容</view></template>
</Popover>

<!-- 深色主题 -->
<Popover :show="show" theme="dark">
  <template #reference><view>dark</view></template>
  <template #content><view>深色主题内容</view></template>
</Popover>

<!-- 警告主题 -->
<Popover :show="show" theme="warning">
  <template #reference><view>warning</view></template>
  <template #content><view>警告提示内容</view></template>
</Popover>

<!-- 错误主题 -->
<Popover :show="show" theme="error">
  <template #reference><view>error</view></template>
  <template #content><view>错误提示内容</view></template>
</Popover>
```

## 动画效果

支持两种动画效果：淡入和弹跳。

```html
<!-- 淡入动画（默认） -->
<Popover :show="show" animation="fade">
  <template #reference><view>fade</view></template>
  <template #content><view>淡入效果</view></template>
</Popover>

<!-- 弹跳动画 -->
<Popover :show="show" animation="bounce">
  <template #reference><view>bounce</view></template>
  <template #content><view>弹跳效果</view></template>
</Popover>
```

## 偏移设置

通过 `offset` 属性调整气泡相对于触发元素的位置偏移。

```html
<!-- 默认偏移 [平行偏移, 交叉偏移] -->
<Popover :show="show" :offset="[0, 10]" />

<!-- 自定义偏移 -->
<Popover :show="show" :offset="[20, 30]" />
```

## 箭头控制

通过 `showArrow` 属性控制是否显示箭头。

```html
<!-- 显示箭头（默认） -->
<Popover :show="show" :showArrow="true" />

<!-- 隐藏箭头 -->
<Popover :show="show" :showArrow="false" />
```

## 自定义内容

支持在气泡中展示复杂的自定义内容。

```html
<Popover :show="show" location="right">
  <template #reference>
    <view @click="show = !show">点击查看</view>
  </template>
  <template #content>
    <view class="custom-content">
      <view class="custom-title">操作提示</view>
      <view class="custom-desc">因运单信息变更，请重新核对声明价值</view>
      <view class="custom-actions">
        <view class="custom-btn confirm">确认</view>
        <view class="custom-btn cancel">取消</view>
      </view>
    </view>
  </template>
</Popover>
```

## 方法调用

通过 ref 调用组件方法。

```html
<Popover ref="popoverRef" :show="show" />
```

```javascript
const popoverRef = ref()

// 显示气泡
popoverRef.value?.showPopover(targetId, options)

// 关闭气泡
popoverRef.value?.closePopover()
```

## 组件 API

### Attributes

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| ---- | ---- | ---- | ---- | ---- |
| show | 是否显示气泡 | boolean | - | false |
| theme | 主题 | 'light' \| 'dark' \| 'warning' \| 'error' | - | 'light' |
| location | 气泡位置 | 'top' \| 'bottom' \| 'left' \| 'right' \| 'top-start' \| 'top-end' \| 'bottom-start' \| 'bottom-end' \| 'left-start' \| 'left-end' \| 'right-start' \| 'right-end' | - | 'bottom' |
| offset | 偏移量 [平行偏移, 交叉偏移]（px） | number[] | - | [0, 10] |
| arrowOffset | 箭头相对边缘的偏移（rpx） | number | - | 30 |
| showArrow | 是否显示箭头 | boolean | - | true |
| targetId | 目标元素 id（不传则使用内部自动生成的 targetId） | string | - | - |
| listenClickId | 监听点击关闭的容器 id | string | - | 'ky-container' |
| custClass | 自定义类名（容器/内容） | string | - | '' |
| animation | 动画类型 | 'fade' \| 'bounce' | - | 'fade' |

### Methods

| 方法名 | 说明 | 参数 | 返回值 |
| ---- | ---- | ---- | ---- |
| showPopover | 显示弹出框 | (targetId: string, options: PopoverProps) | - |
| closePopover | 关闭弹出框 | - | - |

### Events

| 事件名 | 说明 | 参数 | 返回值 |
| ---- | ---- | ---- | ---- |
| update:show | 显示状态变更 | (value: boolean) | - |

### Slots

| 插槽名 | 说明 | 参数 |
| ---- | ---- | ---- |
| reference | 触发/锚点内容 | - |
| content | 气泡内容 | - |

#### 常见问题

#### Q1: 气泡显示位置不正确？

**检查项：**

- 确保设置了正确的 `location` 属性
- 检查 `listenClickId` 是否指向正确的容器
- 确保触发元素已正确渲染

```html
<!-- 确保容器存在 -->
<view id="ky-container">
  <Popover :show="show" listenClickId="ky-container">
    <template #reference>
      <view>触发按钮</view>
    </template>
    <template #content>
      <view>气泡内容</view>
    </template>
  </Popover>
</view>
```

#### Q2: 点击外部无法关闭气泡？

**解决方案：**

确保 `listenClickId` 属性指向的容器存在，并且该容器能够捕获点击事件。

```html
<!-- 在页面根容器上设置 id -->
<view id="ky-container" style="min-height: 100vh;">
  <!-- 页面内容 -->
</view>
```

#### Q3: 气泡内容被遮挡？

**解决方案：**

- 调整 `offset` 属性增加间距
- 尝试不同的 `location` 值
- 检查 z-index 层级设置

```html
<!-- 增大偏移量避免遮挡 -->
<Popover :show="show" :offset="[0, 20]" />
```

#### Q4: 如何手动控制气泡显示？

**通过 ref 调用方法：**

```javascript
const popoverRef = ref()

// 显示气泡
popoverRef.value?.showPopover('target-id', {
  show: true,
  location: 'bottom',
  theme: 'light'
})

// 关闭气泡
popoverRef.value?.closePopover()
```