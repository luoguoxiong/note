<!-- 选择框-简易版-脱离双向绑定 -->

```vue
<KyRadio :isChecked="isChecked" @change="(val: boolean) => (isChecked = val)">
  我是label
</KyRadio>

const isChecked = ref(false)
```

```json
特别说明: 此组件不会绑定任何值,你只需要告诉它是否选中即可,如果有点击后需要判断其他东西再确定是否要选中的,建议用这个,脱离了双向绑定
```
