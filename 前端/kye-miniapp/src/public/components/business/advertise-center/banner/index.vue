<template>
  <view v-if="list.length > 1" class="advertisement-banner">
    <swiper
      ref="swiper"
      :autoplay="true"
      :circular="true"
      :interval="3000"
      :key="list.length"
      :current="activeIndex"
      @change="handleSwiperChange"
      class="advertisement-banner-swiper"
    >
      <swiper-item v-for="(item, index) in list" :key="item.advertisementCode">
        <img :src="item.posterLink" class="img" draggable="false" @click="handleBanner({ param: item, index })" />
      </swiper-item>
    </swiper>

    <view class="advertisement-banner-dots" :style="{ bottom: px2real(props.paginationOffset) + 'px' }">
      <view
        v-for="(_, index) in list"
        :key="index"
        :class="{
          'advertisement-banner-dots-item': true,
          'advertisement-banner-dots-item-active': activeIndex === index,
        }"
        @click="changeSwiper(index)"
      ></view>
    </view>
  </view>

  <img :src="onceBanner" v-else class="advertisement-banner" @click="handleBanner({ param: list?.[0], index: 0 })" />
</template>

<script setup lang="ts" name="Banner">
import { SwiperProps } from '@tarojs/components'
import { ref, computed, nextTick } from 'vue'
import place_holderPng from '../assets/place_holder.png'
import './index.scss'
import { confirmByUserAdv, reportEvent } from '../api'
import { report_CLK_event } from '@public/utils/reportUtil'
import { advertisementJump, getReportSorce } from '../utils'
import { getConfig } from '../config'
import { EntrySectionProps, IBannerProp } from './type'
import { isH5Env, px2real } from '@/public/utils'
const props = withDefaults(defineProps<EntrySectionProps>(), {
  paginationOffset: 12,
})

const emit = defineEmits<{
  // eslint-disable-next-line no-unused-vars
  (e: 'update:modelValue', value: IBannerProp[]): void
}>()

const list = computed({
  get() {
    return props.modelValue
  },
  set(value: IBannerProp[]) {
    emit('update:modelValue', value)
  },
})

const activeIndex = ref(0)

const swiper = ref()

const onceBanner = computed(() => {
  if (props.isFetching) {
    return place_holderPng
  } else {
    return list.value.length > 0 ? list.value[0].posterLink : getConfig(props.pageName).banner?.default
  }
})

/** swiper 切换 */
const handleSwiperChange = (res: { detail: SwiperProps.onChangeEventDetail }) => {
  activeIndex.value = res.detail.current
}

/** 下方圆点点击 */
const changeSwiper = (index: number) => {
  if (isH5Env) {
    return
  }
  updateIndex(index)
  if (props.changeQT) {
    report_CLK_event(props.changeQT.event_code, {
      event_code: props.changeQT.event_code,
      region_code: props.changeQT.region_code,
      page_code: props.changeQT.page_code,
    })
  }
}

const updateIndex = (index: number) => {
  activeIndex.value = index
  if (isH5Env) {
    swiper.value.$forceUpdate()
  }
}

/** banner 点击 */
const handleBanner = async ({ param, index }: { param: IBannerProp; index: number }) => {
  if (!param) return
  const { buttonIndex, advertisementCode, showStrategy } = param
  confirmByUserAdv({
    advertisementCodeList: [advertisementCode],
    eventType: 1,
    buttonIndex,
    ...getReportSorce(),
  })
  reportEvent({
    adCodes: [advertisementCode],
    eventType: 4,
    ...getReportSorce(),
  })
  report_CLK_event('clk_home_banner', {
    button_name: param.advertisementTitle || param.subject,
    pageName: '首页',
    page_code: 'page_home_head',
    ranking_number: index + 1,
  })
  if (props.clickQT) {
    report_CLK_event(props.clickQT.event_code, {
      event_code: props.clickQT.event_code,
      region_code: props.clickQT.region_code,
      page_code: props.clickQT.page_code,
      advertising_code: advertisementCode,
    })
  }

  // 只展示一次
  if (showStrategy === 2) {
    list.value = list.value.filter((item) => item.advertisementCode !== advertisementCode)
    updateIndex(0)
  }
  advertisementJump(param)
}
</script>
