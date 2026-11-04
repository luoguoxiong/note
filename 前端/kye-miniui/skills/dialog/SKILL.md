---
name: "dialog"
description: "对话框组件，用于显示模态对话框。当需要确认/取消对话框时调用。"
---

# Dialog 对话框

对话框组件，用于显示模态对话框。支持组件式调用与函数式调用（`showDialog`）。

## 何时使用

- 确认对话框
- 提示消息
- 模态交互
- 需要确认/取消操作

## 组件路径

- 源码: `packages/__components/dialog/src/dialog.vue`
- 类型: `packages/__components/dialog/src/types.ts`
- 函数调用: `packages/__components/dialog/src/showDialog.ts`

## Props 入参

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| show | boolean | false | 是否显示对话框 |
| showClose | boolean | false | 是否显示关闭按钮 |
| title | string | '' | 对话框标题 |
| message | string | '' | 对话框内容 |
| showConfirmButton | boolean | true | 是否显示确认按钮 |
| showCancelButton | boolean | false | 是否显示取消按钮 |
| confirmButtonText | string | '确认' | 确认按钮文字 |
| confirmButtonColor | string | '#8365F6' | 确认按钮字体颜色 |
| cancelButtonText | string | '取消' | 取消按钮文字 |
| cancelButtonColor | string | '#686B75' | 取消按钮字体颜色 |
| zIndex | number | - | 层级设置 |
| overlay | boolean | true | 是否显示遮罩层 |
| closeOnClickOverlay | boolean | false | 是否点击遮罩关闭 |
| offset | number | 0 | 弹窗位置偏移量 |
| useButton | boolean | false | 是否使用原生 button（小程序场景） |
| buttonId | string | - | 原生按钮 ID（配合 useButton） |
| openType | string | - | 原生按钮 openType（配合 useButton） |
| catchMove | boolean | false | 弹窗是否禁止穿透滚动 |
| confirmLoading | boolean | false | 确认按钮是否 loading |
| cancelLoading | boolean | false | 取消按钮是否 loading |
| beforeClose | (action: string) => void | - | 关闭前的回调，参数为 'confirm' \| 'cancel' \| 'close' |

> 函数式调用 `showDialog` 时无需传 `show`，其余参数相同（`FuncDialogProps` 在此基础上额外支持 `parentClassName`）。

## Events 事件

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| update:show | 显示状态变化时触发 | (show: boolean) |
| confirm | 点击确认按钮时触发 | - |
| cancel | 点击取消按钮时触发 | - |
| close | 点击关闭按钮时触发 | - |

## Slots 插槽

| 插槽名 | 说明 |
| ---- | ---- |
| default | 自定义内容 |
| title | 自定义标题 |
| footer | 自定义底部按钮 |

## 使用示例

```vue
<template>
  <ky-dialog
    v-model:show="show"
    title="提示"
    message="确定要删除吗？"
    show-cancel-button
    :confirm-loading="loading"
    @confirm="onConfirm"
    @cancel="onCancel"
  />
</template>

<script setup>
const show = ref(false)
const loading = ref(false)

const onConfirm = async () => {
  loading.value = true
  await doDelete()
  loading.value = false
  show.value = false
}

const onCancel = () => {
  console.log('取消')
}
</script>
```
