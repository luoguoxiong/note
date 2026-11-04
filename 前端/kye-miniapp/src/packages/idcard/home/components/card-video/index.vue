<template>
  <Card
    :isFirst="isFirst"
    :isLast="isLast"
    :title="title"
    :isEdit="isEdit"
    :isOpen="isOpen"
    :hiddenWrapPadding="true"
    @switch="onSwitch"
    @move="onMove"
    :editTools="{
      switch: false,
      hasEditBtn: false,
      hasMoveBtn: true,
    }"
  >
    <template #prefix>
      <view v-if="!isQw && data.length > 0" class="video-all" @click="toAllVideo">
        全部
        <image
          class="video-all-arrow"
          src="https://ic-img.ky-express.com/netc/20250221_15570395176_!!1740137227949_64_64.png"
        />
      </view>
    </template>

    <view v-if="isQw" class="qw-notice">
      【视频号】栏目暂不支持在企业微信查看，您可将名片转发至微信，客户点击即可完整浏览【视频号】内容。
    </view>
    <scroll-view
      v-else
      scroll-x="true"
      enhanced
      :showScrollbar="false"
      style="white-space: nowrap"
      enable-flex
      class="card-video__scroll-content"
    >
      <view v-for="item in data" :key="item.contentId" class="video-item">
        <view v-if="isEdit" class="video-cover" @click="showNotice"></view>
        <channel-video style="width: 100%; height: 100%" :feed-id="item.subTitle"></channel-video>
      </view>
    </scroll-view>
  </Card>
</template>

<script setup lang="ts">
import Taro from '@tarojs/taro'
import { isQw } from '@/packages/idcard/utils/idcard-device'
import Card from '../card'
import { commonTrackEvent } from '@/packages/idcard/idcard-report/common-func'
import { debounce } from 'lodash-es'

interface VideoItem {
  contentId: string
  subTitle: string
}

interface CardVideoProps {
  isFirst: boolean
  isLast: boolean
  data: VideoItem[]
  isEdit: boolean
  title: string
  isOpen: boolean
  employeeId: any
}

const props = defineProps<CardVideoProps>()

const emits = defineEmits(['switch', 'move'])

const toAllVideo = debounce(() => {
  commonTrackEvent('clk_page_business_cardhomepage_all_wechat_videos', '全部微信视频', {
    page_name: 'page_business_card_homepage',
    sales_id: props.employeeId,
  })

  if (Array.isArray(props.data) && props.data.length > 0) {
    Taro.openChannelsUserProfile({
      finderUserName: 'sphBpoMFYUMoRIO',
      feedId: props.data[props.data.length - 1].subTitle,
    })
  }
}, 300)

const showNotice = () => {
  Taro.showToast({ icon: 'none', title: '编辑模式不支持查看详情' })
}

const onSwitch = (e) => emits('switch', e)
const onMove = (direction: number) => emits('move', direction)
</script>

<style lang="scss">
@import './index.scss';
</style>
