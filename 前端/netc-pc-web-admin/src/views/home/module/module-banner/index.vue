<template>
  <Content>
    <div class="module_banner_box">
      <div class="more_box" @click="onClickOpen">
        <span>{{ isOpen ? '收起' : '展开' }}</span>
        <svg-icon name="arrow-top" :class="['arrow-top-icon', isOpen ? '' : 'open']"></svg-icon>
      </div>
      <!-- 收起 -->
      <div v-show="!isOpen" class="retract_box">
        <img class="left_bg" :src="LEFT_BG" alt="" />
        <img class="right_bg" :src="RIGHT_BG" alt="" />
        <div class="icon-content">
          <svg-icon name="carousel"></svg-icon>
        </div>
        <el-carousel
          style="width: 700px"
          height="48px"
          direction="vertical"
          indicator-position="none"
          v-if="!isOpen && bannerData.length > 1"
          @change="handleReport"
        >
          <el-carousel-item v-for="(item, index) in bannerData" :key="index">
            <div :class="item.jumpMode === 0 ? 'carousel_item_default' : 'carousel_item'" @click="handleLink(item)">
              <span>{{ item.advertisementTitle }}</span>
            </div>
          </el-carousel-item>
        </el-carousel>
        <div
          v-else-if="bannerData.length === 1"
          :class="bannerData[0].jumpMode === 0 ? 'carousel_item_default' : 'carousel_item'"
          @click="handleLink(bannerData[0])"
        >
          <span>{{ bannerData[0].advertisementTitle }}</span>
        </div>
        <div class="carousel_item_default" style="cursor: default" v-else>
          <span>创快递先锋，建百年跨越</span>
        </div>
      </div>

      <!-- 展开 -->
      <div v-show="isOpen">
        <el-carousel
          @change="handleReport"
          height="200px"
          arrow="never"
          trigger="click"
          v-if="isOpen && bannerData.length > 1"
        >
          <el-carousel-item v-for="(item, index) in bannerData" :key="index">
            <img
              class="carousel-img"
              :style="`cursor: ${item.jumpMode === 0 ? 'default' : 'pointer'}`"
              @click="handleLink(item)"
              v-click-report="{
                eventCode: 'clk_homepage_top_banner_v1',
                region_code: 'top_banner',
                otherParams: () => {
                  return {
                    banner_code: item.advertisementCode,
                  }
                },
              }"
              v-lazyload="{
                src: item.posterLink,
                placeholder: ERRORIMG,
                error: ERRORIMG,
              }"
            />
          </el-carousel-item>
        </el-carousel>
        <!-- 只有一张 -->
        <img
          v-else-if="bannerData.length === 1"
          class="carousel-img"
          :style="`cursor: ${bannerData[0].jumpMode === 0 ? 'default' : 'pointer'}`"
          @click="handleLink(bannerData[0])"
          v-click-report="{
            eventCode: 'clk_homepage_top_banner_v1',
            region_code: 'top_banner',
          }"
          v-lazyload="{
            src: bannerData[0].posterLink,
            placeholder: ERRORIMG,
            error: ERRORIMG,
          }"
        />
        <!-- 没有配置 -->
        <img
          v-else
          class="carousel-img"
          v-click-report="{
            eventCode: 'clk_homepage_top_banner_v1',
            region_code: 'top_banner',
          }"
          v-lazyload="{
            src: EMPTYIMG,
            placeholder: ERRORIMG,
            error: ERRORIMG,
          }"
        />
      </div>
    </div>
  </Content>
</template>

<script setup lang="ts">
import { BannerData } from '@/apis/home/types'
import Content from './content/index.vue'
import { useAdvertisementJump, useHomeStore } from '@/hooks'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { advertisementConfirmByUser, eventReport } from '@/apis/home'

const { bannerData, store } = useHomeStore()
const { jumpByAdvertisement } = useAdvertisementJump()

const EMPTYIMG = 'https://ic-img.ky-express.com/netc/20241128_87870395178_!!1732801698323_2320_400.png'
// const EMPTYIMG = 'https://ic-img.ky-express.com/netc/20240422_20570395140_!!1713752401603_1160_96.png'

const LEFT_BG = './img/left_bg.png'
const RIGHT_BG = './img/right_bg.png'

const ERRORIMG = 'https://ic-img.ky-express.com/netc/20240422_99070395148_!!1713752507447_838_96.png'

const handleLink = async (bannerData: BannerData) => {
  advertisementConfirmByUser({
    advertisementCodeList: [bannerData.advertisementCode],
    channelSource: 'pc',
    eventType: 1,
  })
  eventReport({
    adCodes: [bannerData.advertisementCode],
    eventType: 4,
  })
  if (bannerData.jumpMode === 0) return
  await jumpByAdvertisement(bannerData, {
    pushToStyle: bannerData.pushToStyle,
    extraQuery: { needQuerySave: 'false' },
  })
}

const handleReport = (index: number) => {
  const adCode = bannerData.value && bannerData.value[index] && bannerData.value[index].advertisementCode
  const clientRect = document.documentElement.getBoundingClientRect()
  const hidden = !clientRect || clientRect.width < 10 || clientRect.height < 10

  if (!adCode || hidden) return

  eventReport({ adCodes: [adCode], eventType: 3 })
}

watch(bannerData, () => handleReport(0), { immediate: true })

const onClickIndicators = () => {
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_homepage_top_banner_toggle_v1',
    },
    {
      region_code: 'top_banner',
    }
  )
}

const isOpen = ref(true)
const onClickOpen = () => {
  isOpen.value = !isOpen.value
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_homepage_top_banner_fold_v1',
    },
    {
      region_code: 'top_banner',
      button_name: isOpen.value ? '展开' : '收起',
    }
  )
}

onMounted(() => {
  void store.getBannerData()
})
onMounted(() => {
  setTimeout(() => {
    const indicators = document.querySelectorAll('.el-carousel__indicator--horizontal')
    const eleArray = Array.from(indicators)
    eleArray.forEach((eleItem) => {
      eleItem.addEventListener('click', onClickIndicators)
    })
  }, 1000)
})
onBeforeUnmount(() => {
  const indicators = document.querySelectorAll('.el-carousel__indicator--horizontal')
  const eleArray = Array.from(indicators)
  eleArray.forEach((eleItem) => {
    eleItem.removeEventListener('click', onClickIndicators)
  })
})
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
<style lang="scss">
@import './el-reset.scss';
</style>
