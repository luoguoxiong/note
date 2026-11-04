<template>
  <div class="detail-address-list__item">
    <div class="detail-address-list__item__title" v-html="highlightText(suggestItem.title, keyword)"></div>
    <div class="detail-address-list__item__des" v-html="highlightText(fullAddress, keyword)"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
// 方法
import { FindSuggestItem } from '@order-public-sub-public/apis/address/types'
import highlightText from '@order-public-sub-public/utils/highlightText'

const props = defineProps<{ suggestItem: FindSuggestItem; keyword: string }>()

// 完整地址
const fullAddress = computed(() => {
  const { province = '', city = '', county = '', district = '', address = '' } = props.suggestItem || {}
  return `${province || ''}${city || ''}${district || county || ''}${address || ''}`
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
