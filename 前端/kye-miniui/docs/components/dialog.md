# Dialog

<code-preview path="demos/dialog/dialog-1.vue" title="基本使用" description="各种对话框用法示例"></code-preview>

## 基础用法

Dialog 支持两种调用方式：组件式和函数式。

## 组件式调用

通过 v-model:show 控制对话框的显示与隐藏。

```html
<ky-dialog v-model:show="show" title="提示" message="这是一个对话框" @confirm="show = false" />
```

## 函数式调用

通过 `showDialog` 函数快速创建对话框，无需在模板中声明组件。

```html
<button @click="showPopup">打开对话框</button>
```

```javascript
import { showDialog } from '@ky-miniui-lib/ky-miniui-lib'

const showPopup = async () => {
  try {
    await showDialog({
      parentClassName: 'app',
      title: '提示',
      message: '确认删除吗？',
      showCancelButton: true,
    })
    console.log('用户点击了确认')
  } catch (error) {
    console.log('用户点击了取消或关闭', error)
  }
}
```

### showDialog 参数说明

| 参数                | 类型     | 必填   | 说明                                                                                           |
| ------------------- | -------- | ------ | ---------------------------------------------------------------------------------------------- |
| parentClassName     | string   | **是** | 挂载容器的 className，对话框会挂载到该容器内；若不指定或找不到对应元素，则挂载到 document.body |
| title               | string   | 否     | 对话框标题                                                                                     |
| message             | string   | 否     | 对话框内容文本                                                                                 |
| showConfirmButton   | boolean  | 否     | 是否显示确认按钮，默认 `true`                                                                  |
| showCancelButton    | boolean  | 否     | 是否显示取消按钮，默认 `false`                                                                 |
| confirmButtonText   | string   | 否     | 确认按钮文案，默认 `'确认'`                                                                    |
| confirmButtonColor  | string   | 否     | 确认按钮颜色，默认 `'#8365F6'`                                                                 |
| cancelButtonText    | string   | 否     | 取消按钮文案，默认 `'取消'`                                                                    |
| cancelButtonColor   | string   | 否     | 取消按钮颜色，默认 `'#686B75'`                                                                 |
| overlay             | boolean  | 否     | 是否显示遮罩层，默认 `true`                                                                    |
| closeOnClickOverlay | boolean  | 否     | 点击遮罩是否关闭对话框，默认 `false`                                                           |
| offset              | number   | 否     | 弹窗位置偏移量，默认 `0`                                                                       |
| zIndex              | number   | 否     | 层级设置，默认 `1000`                                                                          |
| catchMove           | boolean  | 否     | 是否阻止触摸穿透，默认 `true`                                                                  |
| showClose           | boolean  | 否     | 是否显示右上角关闭按钮，默认 `false`                                                           |
| useButton           | boolean  | 否     | 是否使用 Button 组件渲染按钮，默认 `false`                                                     |
| buttonId            | string   | 否     | 按钮 id，用于表单提交等场景                                                                    |
| openType            | string   | 否     | 按钮 open-type，如 `getUserInfo`、`contact` 等                                                 |
| confirm             | function | 否     | 点击确认按钮时的回调函数                                                                       |
| cancel              | function | 否     | 点击取消按钮时的回调函数                                                                       |
| close               | function | 否     | 点击关闭按钮时的回调函数                                                                       |
| beforeClose         | function | 否     | 关闭前的回调函数，支持返回 Promise 进行异步处理                                                |

### 返回值说明

`showDialog` 返回一个特殊的 Promise 对象，除了支持 `await` 语法外，还包含以下方法用于动态控制 loading 状态：

| 方法名             | 说明                      |
| ------------------ | ------------------------- |
| showConfirmLoading | 显示确认按钮 loading 状态 |
| hideConfirmLoading | 隐藏确认按钮 loading 状态 |
| showCancelLoading  | 显示取消按钮 loading 状态 |
| hideCancelLoading  | 隐藏取消按钮 loading 状态 |

### 返回值使用示例

```javascript
const dialog = showDialog({
  parentClassName: 'app',
  title: '提交中',
  message: '正在处理您的请求...',
  showCancelButton: true,
  useButton: true,
})

// 显示 loading
dialog.showConfirmLoading()
dialog.showCancelLoading()

// 3 秒后隐藏 loading
setTimeout(() => {
  dialog.hideConfirmLoading()
  dialog.hideCancelLoading()
}, 3000)

// 等待用户操作
try {
  await dialog
  console.log('用户确认')
} catch (error) {
  console.log('用户取消或关闭', error)
}
```

## 按钮配置

## 仅确认按钮

默认情况下只显示确认按钮。

```html
<ky-dialog
  v-model:show="show"
  title="提示"
  message="只有确认按钮"
  :show-cancel-button="false"
  @confirm="show = false"
/>
```

## 确认+取消按钮

通过 show-cancel-button 属性显示取消按钮。

```html
<ky-dialog
  v-model:show="show"
  title="确认删除"
  message="确定要删除吗？"
  show-cancel-button
  @confirm="show = false"
  @cancel="show = false"
/>
```

## 自定义按钮文字

通过 confirm-button-text 和 cancel-button-text 自定义按钮文案。

```html
<ky-dialog
  v-model:show="show"
  title="提示"
  message="自定义按钮文字"
  confirm-button-text="好的"
  cancel-button-text="不了"
  show-cancel-button
  @confirm="show = false"
  @cancel="show = false"
/>
```

## 按钮样式

通过 confirm-button-color 和 cancel-button-color 自定义按钮颜色。

```html
<ky-dialog
  v-model:show="show"
  title="颜色定制"
  message="自定义按钮颜色"
  confirm-button-color="#ff6b6b"
  cancel-button-color="#6c757d"
  show-cancel-button
  @confirm="show = false"
  @cancel="show = false"
/>
```

## 自定义内容

## 自定义标题和内容

通过 title 和 message 属性自定义内容。

```html
<ky-dialog
  v-model:show="show"
  title="自定义标题"
  message="这是一段自定义的消息内容，可以包含更多详细信息。"
  @confirm="show = false"
/>
```

## 插槽使用

支持 title、default、footer 三个插槽。

```html
<ky-dialog v-model:show="show">
  <template #title>
    <text>🎁 自定义标题</text>
  </template>
  <template #default>
    <view>这是通过插槽自定义的内容区域</view>
  </template>
  <template #footer>
    <button @click="show = false">我知道了</button>
  </template>
</ky-dialog>
```

## 加载状态

## 组件式加载

通过 confirm-loading 属性显示加载状态。

```html
<ky-dialog
  v-model:show="show"
  title="提交中"
  message="正在处理您的请求..."
  :confirm-loading="true"
  :show-cancel-button="false"
/>
```

## 函数式加载控制

函数式调用支持动态控制 loading 状态。

```javascript
const dialog = showDialog({
  parentClassName: 'app',
  title: '加载示例',
  message: '演示 loading 控制',
  showCancelButton: true,
  useButton: true,
})

dialog.showConfirmLoading()
dialog.showCancelLoading()

setTimeout(() => {
  dialog.hideConfirmLoading()
  dialog.hideCancelLoading()
}, 3000)

await dialog
```

## 交互控制

## 点击遮罩关闭

通过 close-on-click-overlay 属性控制点击遮罩是否关闭对话框。

```html
<ky-dialog
  v-model:show="show"
  title="点击遮罩关闭"
  message="点击对话框外部区域即可关闭"
  :close-on-click-overlay="true"
  @confirm="show = false"
/>
```

## 关闭前回调

通过 beforeClose 属性设置关闭前的回调函数，支持 Promise。

```html
<ky-dialog
  v-model:show="show"
  title="关闭前回调"
  message="点击确认后会有延迟"
  :before-close="handleBeforeClose"
  @confirm="show = false"
/>
```

```javascript
const handleBeforeClose = (action) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, 3000)
  })
}
```

## 组件 API

### Attributes

| 参数                | 说明                                | 类型    | 可选值 | 默认值    |
| ------------------- | ----------------------------------- | ------- | ------ | --------- |
| show                | 是否显示对话框（支持 v-model:show） | boolean | -      | false     |
| title               | 对话框标题                          | string  | -      | ''        |
| message             | 对话框内容文本                      | string  | -      | ''        |
| showConfirmButton   | 是否展示确认按钮                    | boolean | -      | true      |
| showCancelButton    | 是否展示取消按钮                    | boolean | -      | false     |
| confirmButtonText   | 确认按钮文案                        | string  | -      | '确认'    |
| confirmButtonColor  | 确认按钮颜色                        | string  | -      | '#8365F6' |
| cancelButtonText    | 取消按钮文案                        | string  | -      | '取消'    |
| cancelButtonColor   | 取消按钮颜色                        | string  | -      | '#686B75' |
| overlay             | 是否显示遮罩层                      | boolean | -      | true      |
| closeOnClickOverlay | 点击遮罩是否关闭                    | boolean | -      | false     |
| offset              | 弹窗位置偏移量                      | number  | -      | 0         |
| zIndex              | 层级设置                            | number  | -      | 1000      |
| catchMove           | 是否阻止触摸穿透                    | boolean | -      | true      |
| confirmLoading      | 确认按钮是否 loading                | boolean | -      | false     |
| cancelLoading       | 取消按钮是否 loading                | boolean | -      | false     |
| showClose           | 是否显示关闭按钮                    | boolean | -      | false     |
| useButton           | 是否使用 button 组件                | boolean | -      | false     |
| buttonId            | 按钮 id                             | string  | -      | -         |
| openType            | 按钮 open-type                      | string  | -      | -         |

### Methods

| 方法名     | 说明             | 参数                       | 返回值                                                                                             |
| ---------- | ---------------- | -------------------------- | -------------------------------------------------------------------------------------------------- |
| showDialog | 函数式打开对话框 | `options: FuncDialogProps` | `Promise<void> & { showConfirmLoading, hideConfirmLoading, showCancelLoading, hideCancelLoading }` |

### Events

| 事件名  | 说明               | 参数 |
| ------- | ------------------ | ---- |
| close   | 对话框关闭时触发   | -    |
| confirm | 点击确认按钮时触发 | -    |
| cancel  | 点击取消按钮时触发 | -    |

### Slots

| 插槽名  | 说明               |
| ------- | ------------------ |
| title   | 对话框标题区域     |
| default | 对话框主体内容区域 |
| footer  | 对话框底部按钮区域 |
