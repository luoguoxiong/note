<template>
  <div class="map-position-list">
    <div class="map-position-list__item" :class="{ 'is-select-position': isSelect }" @click="onSelect">
      <div class="title" v-html="highlightText(item.title || '', keyword)"></div>
      <div class="content">
        <template v-if="item.distanceView">
          <div class="content__distance">{{ item.distanceView }}</div>
          <div class="content__line">|</div>
        </template>
        <div class="content__address" v-html="highlightText(fullAddress, keyword)"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import highlightText from '@order-public-sub-public/utils/highlightText'
import { ListItem } from '../../types'

interface PropType {
  isSelect: boolean
  keyword: string
  item: ListItem
}

const props = defineProps<PropType>()

const emit = defineEmits(['onSelect'])

const onSelect = () => emit('onSelect')

// 完整地址
const fullAddress = computed(() => {
  const { province = '', city = '', district = '', county = '', detailAddress = '', address = '' } = props.item || {}

  return `${province}${city}${county || district}${detailAddress || address}`
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
