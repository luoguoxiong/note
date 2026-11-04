<template>
  <div class="specify-address-empty">
    <kyEmpty :type="EmptyTypeEnum.CUSTOM" :custom-config="{ description, image }" />
  </div>
</template>

<script setup lang="ts">
import kyEmpty from '@order-public-sub-public/components/ui/ky-empty/index.vue'
import { computed } from 'vue'

import { EmptyTypeEnum } from '@order-public-sub-public/constants'

const props = defineProps({
  keyword: {
    type: String,
    default: '',
  },
})

// 缺省文案
const description = computed(() => (props.keyword ? '搜索无结果' : '暂无数据'))

// 缺省图片，UI定制
const image = computed(() => {
  let str = ''
  str = 'https://ic-img.ky-express.com/netc/20250619_31981_!!1750313133365_560_560.png'

  if (props.keyword) {
    str = 'https://ic-img.ky-express.com/netc/20250619_5081_!!1750313034323_560_560.png'
  }

  return str
})
</script>

<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
