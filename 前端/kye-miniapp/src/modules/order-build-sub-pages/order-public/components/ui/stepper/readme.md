# 步进器

```ts
import { ref } from 'vue'
import Stepper from '@order-public-sub-public/components/ui/stepper/index.vue'

const stepperValue = ref('12')

const handleChange = (value: string) => {
  console.log(value)
}

const handlePlus = () => {
  stepperValue.value = (Number(stepperValue.value) + 1).toString()
}
```

```html
<Stepper v-model="stepperValue" :disable-minus="true" :input-stuffix="'件'" @change="handleChange" @plus="handlePlus" />
```
