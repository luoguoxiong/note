<template>
  <Card
    class="card-func__warp"
    :title="title"
    :isFirst="isFirst"
    :isLast="isLast"
    :isEdit="isEdit"
    :isOpen="isOpen"
    :hiddenWrapPadding="true"
    @edit="toEdit"
    @switch="onSwitch"
    @move="onMove"
    :editTools="{
      switch: true,
      hasEditBtn: true,
      hasMoveBtn: true,
    }"
    :isEmpty="list?.length === 0"
  >
    <scroll-view
      scroll-x="true"
      enhanced
      :showScrollbar="false"
      style="white-space: nowrap"
      enable-flex
      class="func-swiper"
    >
      <view v-for="(item, _index) in list" :key="_index" class="func-item" @click="() => handleItemClick(item)">
        <view class="func-title">{{ item.title }}</view>
        <view class="func-content">
          <image :src="item.coverImg" class="func-icon"></image>
          <view class="func-desc">{{ item.subTitle }}</view>
        </view>
      </view>
    </scroll-view>
    <view style="height: 24rpx"></view>
  </Card>
</template>

<script setup lang="ts">
import Taro from '@tarojs/taro'
import { computed } from 'vue'
import { toRichTextPage } from '../../../utils/content'
import { useIdCardStore } from '../../../store/idcard'
import type { ItemData, CardFuncProps } from './types'
import { trackEvent } from './report'
import Card from '../card'

const props = defineProps<CardFuncProps>()

const emits = defineEmits(['switch', 'move'])

const { updateFresh } = useIdCardStore()

const list = computed(() => props.data?.data || [])

const toEdit = () => {
  const originData = props.data?.originData
  const realData = props.data?.data
  const allOpenKeys = realData.map((item) => item.contentId)
  const afterData = originData.map((item) => ({
    ...item,
    showSwitch: allOpenKeys.includes(item.contentId),
  }))

  Taro.setStorageSync('idcard-func', JSON.stringify(afterData))
  Taro.navigateTo({
    url: `/packages/idcard/industry-solutions/index?businessCardId=${props.data.businessCardId}&menuId=${props.data.menuId}&employeeId=${props.employeeId}`,
  })
  updateFresh(true)
}

const handleItemClick = (item: ItemData) => {
  try {
    trackEvent('clk_page_business_card_homepage_view_the_plan', item.title, {
      sales_id: props.employeeId,
    })
  } catch (error) {
    console.log(error)
  }
  toRichTextPage({
    title: item.title,
    content: item.content,
  })
}

const onSwitch = (e) => emits('switch', e)

const onMove = (e) => emits('move', e)
</script>

<style lang="scss">
@import './index.scss';
</style>
