# 按钮

```ts
import { ref } from 'vue'
import KyRadio from '@order-public-sub-public/components/base/ky-radio/index.vue'

const handleClick = (name: any) => {
  console.log(name)
}

const handleChange = (name: string) => {
  console.log(name)
}

const checked = ref('1')
```

```html
<KyRadio
  v-model="checked"
  :radio-props="[{ name: '1', text: '全新未拆封', disabled: true }]"
  @click="handleClick"
  @change="handleChange"
>
</KyRadio>
```
