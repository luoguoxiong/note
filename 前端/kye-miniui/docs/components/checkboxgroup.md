# Checkboxgroup

## 基本使用

`ky-checkboxgroup` 用于管理一组复选框，实现批量选中、单选模式等功能。

```html
<ky-checkbox-group v-model="val" @change="onChange">
  <ky-checkbox name="1">选项一</ky-checkbox>
  <ky-checkbox name="2">选项二</ky-checkbox>
  <ky-checkbox name="3">选项三</ky-checkbox>
</ky-checkbox-group>
```

```javascript
const val = ref(['1'])

const onChange = (value) => {
  console.log('选中的值:', value)
}
```

## 组件 API

### Attributes

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| ---- | ---- | ---- | ---- | ---- |
| modelValue | 当前选中的值 | array | - | [] |
| direction | 排列方向 | string | vertical / horizontal | vertical |
| size | 尺寸 | string | large / medium / normal / small / mini | normal |
| type | 复选框类型 | string | round / check / button / buttonCheck / buttonSelect | round |
| disabled | 是否禁用 | boolean | - | false |
| iconSize | 图标尺寸 | number / string | - | 20px |
| max | 最大可选数，0 为无限制 | number | - | 0 |
| isError | 是否为错误状态 | boolean | - | false |
| checkedHighlight | 选中时是否高亮 | boolean | - | false |
| singleMode | 是否开启单选模式 | boolean | - | false |

### Methods

| 方法名 | 说明 | 参数 | 返回值 |
| ---- | ---- | ---- | ---- |
| toggleAll | 全选或取消全选 | checked: boolean | - |
| toggleReverse | 反选 | - | - |

### Events

| 事件名 | 说明 | 参数 |
| ---- | ---- | ---- |
| change | 复选框状态变化时触发 | value: array |

### Slots

| 插槽名 | 说明 | 参数 |
| ---- | ---- | ---- |
| default | 复选框内容 | - |