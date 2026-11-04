# 滑动标签

```ts
import { ref } from 'vue'
import SlideTag from '@order-public-sub-public/components/ui/slide-tag/index.vue'

const handleClick = (tagName: string) => {
  console.log(tagName)
}
```

```html
<SlideTag @click="handleClick" />
```
