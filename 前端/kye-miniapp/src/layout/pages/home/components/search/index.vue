<template>
  <view
    class="search-content"
    id="search-content-ex"
    v-exposure
    :exposure-report="{
      eventCode: 'exp_homepage_search_v1',
      otherParams: {
        page_code: 'page_homepage_v1',
        event_name: '移动端首页_顶部搜索栏菜单_曝光',
        region_code: 'top_search',
        region_name: '搜索栏',
        top_search: '顶部搜索、消息中心、扫一扫',
      },
    }"
  >
    <view class="search-wrap">
      <view class="search-box" @click="handleToSearch">
        <ky-lazy-image
          :delay="500"
          src="https://ic-img.ky-express.com/netc/20250701_12156_!!1751374518818_64_64.png"
          class="search-icon"
        />
        <!-- <view class="search-input">查询运单信息/应用信息</view> -->
        <swipe-placeholder ref="swipePlaceholderRef" @click="toSearch" />
      </view>
      <ky-lazy-image
        :delay="500"
        class="scan search-item"
        id="scan-ex"
        @tap="toScanCode"
        src="https://ic-img.ky-express.com/netc/20250701_23629_!!1751374518822_80_80.png"
      />
      <ky-lazy-image
        :delay="500"
        v-if="!isH5FSEnv"
        id="message-ex"
        @tap="toMessageCenter"
        class="message search-item"
        src="https://ic-img.ky-express.com/netc/20250701_44810_!!1751374518821_100_100.png"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import './index.scss'
// import { ApplicationCodeMap } from '@/public/utils/application/constants'
// import { useApplication } from '@/public/utils/application/useApplication'
import { scanQrcode } from '@/public/utils/scan'
import kyeNavigate from '@/public/utils/native/navigate'
import { useExposureReport } from '@/public/hooks/useExposureReport'
import { reportSerchClick } from '../../report'
import { isH5FSEnv } from '@/public/utils'
import swipePlaceholder from '../swipe-placeholder/index.vue'
import { ref } from 'vue'

useExposureReport(['search-content-ex'])

defineOptions({ name: 'search-bar' })

// const { navigateApplicationWithCode } = useApplication()

const swipePlaceholderRef = ref()

const handleToSearch = () => {
  swipePlaceholderRef.value.handleTosearch()
}

const toSearch = (text: string) => {
  kyeNavigate.navigateBefore('navigateTo', {
    url: `/modules/search/pages/search/index?placeholder=${text}`,
    needLogin: true,
  })
  reportSerchClick('顶部搜索')
}

const toMessageCenter = () => {
  reportSerchClick('消息中心')
  kyeNavigate.navigateBefore('navigateTo', {
    url: '/modules/tools/message-center/home/index',
    needLogin: true,
  })
  // const { areaCode, menuCode } = ApplicationCodeMap['首页消息中心']
  // navigateApplicationWithCode({
  //   areaCode,
  //   menuCode,
  // })
}

const toScanCode = () => {
  scanQrcode()
  reportSerchClick('扫一扫')
}
</script>
