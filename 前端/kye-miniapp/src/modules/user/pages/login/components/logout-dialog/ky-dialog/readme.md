# 弹框
基于vant的dialog，所有props和event均支持
```ts

import KyDialog from '@order-public/components/base/ky-dialog/index.vue'

```
const show = ref(true)
```html
<KyDialog v-model.show="show" >
    <p>弹框内容</p>
</KyDialog>
```
## Props

| 参数          | 说明         | 类型    | 默认值    |
|-------------|------------| ------- |--------|
| titleIcon   | 标题的图标url   | String  | 空      |