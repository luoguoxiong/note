---
name: "cell"
description: "单元格组件，用于显示列表项。当需要列表项带图标、标题、值和点击操作时调用。"
---

# Cell 单元格

单元格组件，用于显示列表项内容。

## 何时使用

- 带图标、标题、值的列表项
- 设置页面项目
- 列表中的导航链接
- 表单显示项

## 组件路径

- 源码: `packages/__components/cell/src/cell.vue`
- 类型: `packages/__components/cell/src/types.ts`

## Props 入参

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| title | string | '' | 左侧标题 |
| label | string | '' | 标题下方描述 |
| value | string | '' | 右侧内容 |
| placeholder | string | '' | 右侧占位文字（value 为空时显示，呈现占位样式） |
| icon | string | '' | 左侧图标链接 |
| isLink | boolean | false | 是否显示右侧箭头 |
| clickable | boolean | false | 是否可点击（添加点击态样式） |
| center | boolean | true | 是否使左右内容垂直居中 |
| required | boolean | false | 是否显示必填标记 |
| size | 'large' \| 'normal' | 'normal' | 单元格尺寸 |
| inset | boolean | false | 是否开启圆角 |
| isError | boolean | false | 内容是否为错误状态 |
| descTextAlign | string | 'right' | 右侧内容文字对齐 |
| requiredDirection | 'right' \| 'left' | 'right' | 必填图标展示位置 |
| disabled | boolean | false | 是否禁用 |

## Events 事件

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| click | 点击单元格时触发 | (event: Event) |

## Slots 插槽

| 插槽名 | 说明 |
| ---- | ---- |
| default | 自定义整个内容（替换默认结构） |
| title | 自定义标题 |
| icon | 自定义左侧图标 |
| value | 自定义右侧内容 |
| right-icon | 自定义右侧图标（仅 isLink 为 true 时生效） |
| extra | 单元格外部额外内容 |

## 使用示例

```vue
<template>
  <ky-cell title="标题" value="内容" is-link @click="onClick" />
  <ky-cell title="用户名" value="张三" />
  <ky-cell title="设置" is-link />
  <ky-cell title="带描述" label="描述信息" value="内容" />
  <ky-cell title="必填项" required placeholder="请输入" />
  <ky-cell title="大尺寸" value="内容" size="large" is-link />
</template>
```
