# PopoverMenu

<code-preview path="demos/popover-menu/popover-menu-1.vue" title="基本使用" description="气泡菜单组件，用于展示操作菜单列表"></code-preview>

## 基本使用

PopoverMenu 组件用于展示一组操作菜单，点击触发元素后弹出气泡菜单。

```html
<ky-popover-menu :menus="menus" @chooseMenu="chooseMenu"></ky-popover-menu>
```

```javascript
const menus = [
  { label: '取消运单', type: 1 },
  { label: '修改地址', type: 2 },
  { label: '联系客服', type: 3 },
]

const chooseMenu = (type, menu) => {
  console.log('选择了:', type, menu)
}
```

## 弹出位置

支持多种弹出位置，满足不同布局需求。

```html
<!-- 底部弹出（默认） -->
<ky-popover-menu :menus="menus" location="bottom-start" />

<!-- 顶部弹出 -->
<ky-popover-menu :menus="menus" location="top-start" />

<!-- 左侧弹出 -->
<ky-popover-menu :menus="menus" location="left" />

<!-- 右侧弹出 -->
<ky-popover-menu :menus="menus" location="right" />
```

## 带图标菜单

通过 `icon` 属性为菜单项添加图标。

```html
<ky-popover-menu :menus="menus" @chooseMenu="chooseMenu"></ky-popover-menu>
```

```javascript
const menus = [
  { label: '取消运单', icon: 'https://ic-img.ky-express.com/netc/20250816_91771_!!1755336867851_96_96.png', type: 1 },
  { label: '修改地址', type: 2 },
  { label: '联系客服', type: 3 },
]
```

## 使用按钮渲染

通过 `useButton` 属性使用按钮组件渲染菜单项。

```html
<ky-popover-menu :menus="menus" use-button @chooseMenu="chooseMenu"></ky-popover-menu>
```

## 自定义触发元素

通过 `reference` 插槽自定义触发元素。

```html
<ky-popover-menu :menus="menus" @chooseMenu="chooseMenu">
  <template #reference>
    <view class="custom-trigger">
      <text>点击打开菜单</text>
    </view>
  </template>
</ky-popover-menu>
```

## 偏移设置

通过 `offset` 属性调整弹出位置偏移。

```html
<!-- 默认偏移 [0, 10] -->
<ky-popover-menu :menus="menus" :offset="[0, 10]" />

<!-- 自定义偏移 -->
<ky-popover-menu :menus="menus" :offset="[10, 20]" />
```

## 方法调用

通过 ref 调用组件方法。

```html
<ky-popover-menu ref="menuRef" :menus="menus" />
```

```javascript
const menuRef = ref()

// 关闭菜单
menuRef.value?.closePopover()
```

## 组件 API

### Attributes

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| ---- | ---- | ---- | ---- | ---- |
| location | 弹出位置 | string | bottom / top / left / right / top-start / top-end / bottom-start / bottom-end / left-start / left-end / right-start / right-end | bottom-start |
| menus | 菜单项数组 | Array<{label: string, icon?: string, type?: string, id?: string, openType?: string}> | - | [] |
| useButton | 是否使用按钮渲染菜单项 | boolean | - | false |
| offset | 偏移量，格式为 [x, y] | [number, number] | - | [0, 10] |

### Methods

| 方法名 | 说明 | 参数 | 返回值 |
| ---- | ---- | ---- | ---- |
| closePopover | 关闭弹出菜单 | - | void |

### Events

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| chooseMenu | 选择菜单项时触发 | (type: string, menu: object) |

### Slots

| 插槽名 | 说明 |
| ---- | ---- |
| reference | 自定义触发元素 |
| content | 自定义菜单内容 |

## 常见问题

### Q1: 菜单项不显示？

**检查项：**

- 确保 `menus` 属性传入了正确的数组格式
- 数组元素需要包含 `label` 字段

```javascript
// 正确格式
const menus = [
  { label: '菜单项', type: 1 },
  { label: '菜单项2', type: 2 },
]
```

### Q2: 如何处理菜单项点击事件？

**通过 `chooseMenu` 事件处理：**

```html
<ky-popover-menu :menus="menus" @chooseMenu="handleChoose" />
```

```javascript
const handleChoose = (type, menu) => {
  switch (type) {
    case 1:
      // 处理取消运单
      break
    case 2:
      // 处理修改地址
      break
  }
}
```

### Q3: 如何自定义触发按钮样式？

**使用 `reference` 插槽：**

```html
<ky-popover-menu :menus="menus">
  <template #reference>
    <view class="custom-btn">
      <text>⋮</text>
    </view>
  </template>
</ky-popover-menu>
```

```scss
.custom-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  color: #999;
}
```
