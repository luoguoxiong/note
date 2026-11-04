<template>
  <View class="idcard-qrcode-content">
    <View class="qrcode-box">
      <!-- Tabs -->
      <View class="qrcode-tabs">
        <View
          v-for="tab in tabs"
          :key="tab.value"
          :class="['qrcode-tabs__item', tab.class, qrcodeType === tab.value ? 'qrcode-tabs__item--active' : '']"
          @tap="setQrcodeType(tab.value)"
        >
          <View :class="`${tab.class}--text`">{{ tab.label }}</View>
        </View>
      </View>

      <!-- Title -->
      <View class="qrcode-title">二维码支持微信扫码直接进入当前名片哦！</View>

      <!-- QR Code / Card -->
      <template v-if="qrcodeType === '二维码样式'">
        <image class="qrcode-img" :src="qrCode" />
      </template>
      <template v-else>
        <View class="qrcode-card">
          <IdcardShareInfo :base-info="baseInfo" :is-share="true" />
          <View class="qrcode-card-content">
            <View class="qrcode-card-content-text">长按识别二维码，查看更多名片信息</View>
            <image class="qrcode-card-content-img" :src="qrCode" />
          </View>
        </View>
      </template>

      <!-- Save Button -->
      <View class="qrcode-save-wrap">
        <View class="qrcode-save-btn" :class="{ 'qrcode-save-btn_active': isShowSaveBtn }" @tap="handleSaveQrcode">
          <Image
            v-if="isShowSaveBtn"
            class="qrcode-save-btn_img"
            src="https://ic-img.ky-express.com/default/20251013_72133_!!1760340507567_64_64.png"
          />
          保存图片
        </View>
      </View>
    </View>

    <!-- Close Button -->
    <image
      @tap="handleCancelShare"
      src="https://ic-img.ky-express.com/netc/20250213_86770395169_!!1739452685428_64_64.png"
      class="qrcode-close"
    />
  </View>
</template>

<script lang="ts" setup>
import { ref, defineEmits, defineProps, watch } from 'vue'
// import IdcardShareInfo from '../share-base/index.vue'
import IdcardShareInfo from '../share-base-v1/index.vue'
import './index.scss'
import { trackPageView } from '../../report'

// Events
const emits = defineEmits(['saveQrcode', 'cancelShare'])

// Props
interface BaseInfo {
  [key: string]: any
}

const props = defineProps<{
  baseInfo: BaseInfo
  qrCode: string
  isShowSaveBtn: boolean
  shareQrcodeShow: boolean
  isSales: boolean
}>()

// Tabs Data
const tabs = [
  { label: '名片样式', value: '名片样式', class: 'qrcode-tabs__item1' },
  { label: '二维码样式', value: '二维码样式', class: 'qrcode-tabs__item2' },
]

// State
const qrcodeType = ref('名片样式')

// Methods
const setQrcodeType = (val: string) => {
  qrcodeType.value = val
}

const handleSaveQrcode = () => emits('saveQrcode', qrcodeType.value)
const handleCancelShare = () => emits('cancelShare', qrcodeType.value)

watch(
  [() => qrcodeType.value, () => props.shareQrcodeShow, () => props.isSales],
  () => {
    console.log('🚀 ~ props.shareQrcodeShow:', props.shareQrcodeShow)
    console.log('props.shareQrcodeShow ,,', props.shareQrcodeShow)
    console.log('00 props.isSales >> ', props.isSales)
    if (props.shareQrcodeShow) {
      let eventCode = ''
      let pageName = ''
      if (props.isSales) {
        if (qrcodeType.value === '名片样式') {
          eventCode = 'exp_business_card_share_card'
        } else {
          eventCode = 'exp_business_card_share_qr_code'
        }
        pageName = 'page_business_card_share'
      } else {
        if (qrcodeType.value === '名片样式') {
          eventCode = 'exp_business_card_homepage_card_save'
        } else {
          eventCode = 'exp_business_card_homepage_qr_code_save'
        }
        pageName = 'page_business_card_homepage'
      }

      console.log('埋点 eventCode >>> ', eventCode)
      console.log('埋点 pageName >>> ', pageName)

      trackPageView(eventCode, {
        page_name: pageName,
        employee_id: props.baseInfo.hrUserId,
        sales_id: props.baseInfo.hrUserId,
      })
    }
  },
  {
    immediate: true,
  },
)
</script>
