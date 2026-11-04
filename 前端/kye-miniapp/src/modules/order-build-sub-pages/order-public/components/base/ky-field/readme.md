# ky-field 输入框

## 引入

```js
import KyField from '@order-public-sub-public/components/base/ky-field'
```

## 代码演示

```html
<ky-field class="info__name" :value="info.name" placeholder="真实姓名" @onInput="onInputName" />
```

```js
export default {
  components: { KyField },
}
```

## Props

| 参数      | 说明               | 类型           | 默认值 |
| --------- | ------------------ | -------------- | ------ |
| value     | 当前输入的值       | string, number | ---    |
| formatter | 输入内容格式化函数 | Function       | ---    |

## Event

| 事件    | 说明                 | 回调参数                     |
| ------- | -------------------- | ---------------------------- |
| onInput | 输入框内容变化时触发 | value: string (当前输入的值) |
| onFocus | 输入框获得焦点时触发 | event: Event                 |
| onBlur  | 输入框失去焦点时触发 | event: Event                 |
| onClick | 点击 Field 时触发    | event: Event                 |
| onClear | 点击清除按钮时触发   | event: Event                 |
