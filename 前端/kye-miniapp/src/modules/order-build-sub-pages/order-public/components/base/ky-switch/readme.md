# 开关

```ts
import { ref } from 'vue'

import KySwitch from '@order-public-sub-public/components/base/ky-switch/index.vue'

const checked = ref(true)

const handleClick = (e: MouseEvent) => {
  console.log(e)
}

const handleChange = (value: any) => {
  console.log(value)
}
```

```html
<KySwitch size="15px" v-model="checked" @click="handleClick" @change="handleChange" />
```
