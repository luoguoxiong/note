<template>
  <view class="print-records-empty">
    <kyEmpty :type="EmptyTypeEnum.CUSTOM" :custom-config="{ description, image }" />
  </view>
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
const description = computed(() => (props.keyword ? '暂无搜索无结果' : '暂无数据'))

// 缺省图片，UI定制
const image = computed(() => {
  let str = 'https://ic-img.ky-express.com/default/20231221_58158405370_!!1703125981264_560_560.png'

  if (props.keyword) {
    console.log(props.keyword, 'keyword222')
    str = 'https://ic-img.ky-express.com/netc/20240423_8511365387_!!1713859647609_560_560.png'
  }

  return str
})
</script>

<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
