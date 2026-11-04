<template>
  <ky-empty :type="realImage" :description="realDescription">
    <slot></slot>
  </ky-empty>
</template>
<script setup lang="ts">
import { EmptyProps } from '@order-public-sub-public/components/ui/ky-empty/types'
import { EMPTY_CONFIGS } from './config'
import { ref, toRefs } from 'vue'
import { EmptyTypeEnum } from '@order-public-sub-public/constants'

const props = withDefaults(defineProps<EmptyProps>(), {
  customConfig() {
    return {
      description: '',
      image: '',
    }
  },
})

const realImage = ref('')
const realDescription = ref('')

// 如果是自定义类型，则image和description需要自行传入
if (props.type === EmptyTypeEnum.CUSTOM) {
  const { customConfig } = toRefs(props)
  const { image, description } = customConfig.value

  realImage.value = image
  realDescription.value = description
} else {
  const { image, description } = EMPTY_CONFIGS[props.type]

  realImage.value = image
  realDescription.value = description
}
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

.ky-empty {
  .ky-empty__description {
    margin: 24px 0;
  }
}
</style>
