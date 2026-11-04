<template>
  <Card
    :isFirst="isFirst"
    :isLast="isLast"
    :isEdit="isEdit"
    :isOpen="isOpen"
    @switch="onSwitch"
    @move="onMove"
    :editTools="{
      switch: true,
      hasEditBtn: hasEditBtn,
      hasMoveBtn: true,
    }"
    :title="title"
  >
    <view
      class="rich-wrap"
      :style="{
        overflow: isShowAll ? 'auto' : 'hidden',
        height: isShowAll ? `${richTextHeight}px` : `${defaultHeight}rpx`,
      }"
    >
      <view :id="`rich-content-${id}`" class="rich-content">
        <rich-text :nodes="data.content"></rich-text>
      </view>
      <view class="rich-open" @click="handleToggleShow">
        {{ isShowAll ? '收起' : '展开' }}
        <image
          class="arrow"
          :class="{ rotate: isShowAll }"
          src="https://ic-img.ky-express.com/netc/20250308_1970395176_!!1741400314949_56_56.png"
        />
      </view>
    </view>
  </Card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Card from '../card'
import { commonTrackEvent } from '@/packages/idcard/idcard-report/common-func'

interface CardRichTextInfoProps {
  isEdit: boolean
  hasEditBtn: boolean
  title: string
  isFirst: boolean
  isLast: boolean
  data: {
    content: string
  }
  isOpen: boolean
  defaultHeight: number
  employeeId: any
}

const props = defineProps<CardRichTextInfoProps>()

const emits = defineEmits(['switch', 'move'])

const isShowAll = ref(false)
const richTextHeight = ref('auto')
const id = ref(`${new Date().getTime()}_id`)

const handleToggleShow = () => {
  commonTrackEvent(`clk_page_business_card_homepage_${isShowAll.value ? 'retrieve' : 'expand'}_content`, props.title, {
    page_name: 'page_business_card_homepage',
    employee_id: props.employeeId,
    sales_id: props.employeeId,
  })

  isShowAll.value = !isShowAll.value
}

const onSwitch = (e) => emits('switch', e)
const onMove = (direction: number) => emits('move', direction)
</script>

<style lang="scss">
@import './index.scss';
</style>
