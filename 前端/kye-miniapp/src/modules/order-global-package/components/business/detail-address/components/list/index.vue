<template>
  <div class="detail-address-list__item" @click="$emit('onClick', suggestItem)">
    <div class="detail-address-list__item__title" v-html="highlightText(suggestItem.title, keyword)"></div>
    <div class="detail-address-list__item__des" v-html="highlightText(fullAddress, keyword)"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FindSuggestItem } from '../../../../../apis/address/types'
import highlightText from '../../../../../utils/highlightText'
import './index.scss'

interface PropsType {
  suggestItem: FindSuggestItem
  keyword: string
}

const props = withDefaults(defineProps<PropsType>(), {
  suggestItem: () => ({} as FindSuggestItem),
  keyword: '',
})

// 完整地址
const fullAddress = computed(() => {
  const { province = '', city = '', county = '', district = '', address = '' } = props.suggestItem || {}
  return `${province || ''}${city || ''}${district || county || ''}${address || ''}`
})
defineEmits(['onClick'])
</script>
