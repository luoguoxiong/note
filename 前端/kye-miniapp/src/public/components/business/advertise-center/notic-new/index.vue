<template>
  <view class="notice-new" v-if="list.length > 0">
    <image
      src="https://ic-img.ky-express.com/netc/20261023_2244_!!1792724962532_252_128.png"
      class="notice-tip-icon"
    ></image>
    <swiper
      ref="swiper"
      :autoplay="swiperOptions.autoPlay"
      :interval="swiperOptions.duration"
      :vertical="true"
      :circular="true"
      :current="current"
      :key="list.length"
      class="notice-swiper-content"
    >
      <swiper-item v-for="(item, index) in list" :key="index">
        <view class="notice-text" @click="handleNotice(item)">
          <view class="text">{{ item.noticeText }}</view>
          <image
            src="https://ic-img.ky-express.com/netc/20261023_71037_!!1792724717921_28_28.svg+xml"
            v-if="item.modelRoute || item.h5Link"
          ></image>
        </view>
      </swiper-item>
    </swiper>
    <image
      src="https://ic-img.ky-express.com/netc/20261023_21127_!!1792720212511_24_24.svg+xml"
      v-if="hasClose"
      className="notice-close"
      @tap="handleNoticeClose"
    ></image>
  </view>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { confirmByUserAdv, reportEvent } from '../api'
import { report_CLK_event } from '@/public/utils'
import { advertisementJump, getReportSorce, buildUrlWithParams } from '../utils'
import './index.scss'
import Taro from '@tarojs/taro'
import { EntrySectionProps, INoticeProp } from './type'

const props = withDefaults(defineProps<EntrySectionProps>(), {
  type: 'default',
  swiperOptions: () => ({
    autoPlay: true,
    duration: 3000,
  }),
})

const emit = defineEmits<{
  // eslint-disable-next-line no-unused-vars
  (e: 'update:modelValue', value: INoticeProp[]): void
  // eslint-disable-next-line no-unused-vars
  (e: 'getMoney'): void
}>()

const list = computed({
  get() {
    return props.modelValue
  },
  set(value: INoticeProp[]) {
    emit('update:modelValue', value)
  },
})

const current = ref(0)

const swiper = ref()

const handleNotice = async (item) => {
  if (item.isMoney) {
    emit('getMoney')
    return
  }
  const { showStrategy, advertisementCode } = item

  confirmByUserAdv({
    advertisementCodeList: [advertisementCode],
    eventType: 1,
    buttonIndex: 1,
    ...getReportSorce(),
  })
  reportEvent({
    adCodes: [advertisementCode],
    eventType: 4,
    ...getReportSorce(),
  })
  if (showStrategy === 2) {
    list.value = list.value.filter((item) => item.advertisementCode !== advertisementCode)
    current.value = 0
    swiper.value.$forceUpdate()
  }
  console.log('advertisementJump', item)
  if (item.modelRoute === 'Real-name-authentication') {
    const url = buildUrlWithParams('/modules/user/pages/realname/home/index', item.urlCustomParam || [])
    Taro.navigateTo({ url: url })
  } else {
    advertisementJump(item)
  }
  if (props.clickQT) {
    console.error(props.clickQT.page_code)
    report_CLK_event(props.clickQT.event_code, {
      page_code: props.clickQT.page_code,
      event_code: props.clickQT.event_code,
      region_code: props.clickQT.region_code,
      advertising_code: advertisementCode,
    })
  }
}

const handleNoticeClose = async () => {
  const filterList = list.value.filter((item) => !item.isMoney)
  const advertisementCodeList = filterList.map((item) => item.advertisementCode)
  list.value = []
  if (advertisementCodeList.length === 0) return
  confirmByUserAdv({
    advertisementCodeList: advertisementCodeList,
    eventType: 2,
    ...getReportSorce(),
  })
  reportEvent({
    adCodes: advertisementCodeList,
    eventType: 2,
    ...getReportSorce(),
  })
  if (props.closeQT) {
    report_CLK_event(props.closeQT.event_code, {
      event_code: props.closeQT.event_code,
      page_code: props.closeQT.page_code,
      region_code: props.closeQT.region_code,
    })
  }
}
</script>
