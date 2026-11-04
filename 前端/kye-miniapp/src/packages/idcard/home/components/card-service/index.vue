<template>
  <Card
    :title="title"
    :isEdit="isEdit"
    :isFirst="isFirst"
    :isLast="isLast"
    :hiddenWrapPadding="true"
    :isOpen="isOpen"
    @switch="onSwitch"
    @move="onMove"
    :editTools="{
      switch: true,
      hasEditBtn: false,
      hasMoveBtn: true,
    }"
  >
    <scroll-view
      scroll-x="true"
      enhanced
      :showScrollbar="false"
      style="white-space: nowrap"
      enable-flex
      class="service-item"
    >
      <view v-for="(temp, index) in data" :key="index" class="card-item" @click="handleItemClick(temp)">
        <image mode="aspectFill" class="card-icon" :src="temp.coverImg" />
        <view class="card-info">
          <view class="card-title">{{ temp.title }}</view>
          <view class="card-desc">{{ temp.subTitle }}</view>
        </view>
      </view>
    </scroll-view>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { toRichTextPage } from '../../../utils/content'
import Card from '../card'
import { commonTrackEvent } from '@/packages/idcard/idcard-report/common-func'

interface ServiceItem {
  title: string
  content: string
  coverImg: string
  subTitle: string
}

interface Props {
  isEdit: boolean
  isFirst: boolean
  isLast: boolean
  data: ServiceItem[]
  title: string
  isOpen: boolean
  employeeId: any
}

const props = defineProps<Props>()

const emits = defineEmits(['switch', 'move'])

const groupArray = (arr: ServiceItem[], size: number) => {
  const result = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

const groupData = computed(() => groupArray(props.data, 2))

console.log('groupData', groupData.value)

const handleItemClick = (temp: ServiceItem) => {
  commonTrackEvent('clk_page_business_card_homepage_view_services', temp.title, {
    page_name: 'page_business_card_homepage',
    sales_id: props.employeeId,
  })

  toRichTextPage({
    title: temp.title,
    content: temp.content,
  })
}

const onSwitch = (e) => emits('switch', e)
const onMove = (direction: number) => emits('move', direction)
</script>

<style lang="scss">
@import './index.scss';
</style>
