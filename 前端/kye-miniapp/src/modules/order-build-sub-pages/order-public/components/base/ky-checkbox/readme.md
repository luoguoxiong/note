# 多选

```ts
import { ref } from 'vue'

import KyCheckbox from '@order-public-sub-public/components/base/ky-checkbox/index.vue'

const checked = ref(['a', 'b'])

const handleChange = (names: any[]) => {
  console.log(names)
}
```

```html
<KyCheckbox v-model="checked" @change="handleChange">
  <van-checkbox name="a">复选框 a</van-checkbox>
  <van-checkbox name="b">复选框 b</van-checkbox>
</KyCheckbox>
```
