<template>
  <div class="ocr" :class="{ 'batch-ocr-wrap': !singleOcr }">
    <!-- 内容 -->
    <div class="text-area" :class="{ 'batch-Ocr': !singleOcr }">
      <KyTextarea
        ref="ocrRef"
        :clearable="false"
        :customPlaceholder="true"
        :maxlength="maxlength"
        :modelValue="ocrMessage"
        :placeholder="placeholder"
        :rows="rows"
        :formatter="formatter"
        @update:modelValue="onInputOcr"
        v-click-report="clk_express_single_send_intellect_button_v1(addressType)"
        v-keyboard
        @clear="clearOcr"
      ></KyTextarea>
    </div>
    <!-- 额外内容 -->
    <div class="extra">
      <div class="left">
        <slot name="extra">
          <!-- <PcWxUploader v-if="showImageOcr && !isWxPcAppletOrAliPay" @uploaderAfterRead="uploaderAfterRead">
            <div
              class="left__img"
              v-click-report="{
                eventCode:
                  addressType === 'SENDER_PAGE' || addressType === '10'
                    ? 'clk_express_single_send_image_recognition_button_v1'
                    : 'clk_express_single_receiver_image_recognition_button_v1',
              }"
            >
              <div class="text" v-html="imgBtnText"></div>
            </div>
          </PcWxUploader> -->
          <div v-if="showImageOcr" class="left__img">
            <div class="text" @click.stop="onClickImg" v-html="imgBtnText"></div>
          </div>
          <div
            class="left__audio"
            @click.stop="audioHandle"
            v-if="!isWxPcApplet && showImageOcr && !isAliPayClient && !isAmapApp && versionCompare && !isH5FSEnv"
          >
            <div class="text">语音识别</div>
          </div>
          <div class="left__help" @click.stop="onClickHelp" v-if="singleOcr">
            <div class="text">帮助</div>
          </div>
        </slot>
      </div>
      <div class="right" v-if="singleOcr">
        <div v-if="ocrMessage" class="clear-btn" @click="clearOcr">清空</div>
        <KyButton
          v-if="ocrMessage || isAliPayClient || isH5FSEnv"
          class="right__identify"
          :loading="loading"
          loading-text="识别"
          text="识别"
          @click="onClickIdentify"
        />
        <PasteAndRecognize
          :ocrMessage="ocrMessage"
          :addressType="addressType"
          @onPasteAndRecognize="onPasteAndRecognize"
        />
      </div>
    </div>
    <!-- 帮助弹窗 -->
    <HelpPopup :show="show" @onClose="show = false" />
    <AudioPopup />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

// 组件
import KyTextarea from '@order-public-sub-public/components/base/ky-textarea/index.vue'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import HelpPopup from '@order-public-sub-public/components/ui/ocr/components/help-popup/index.vue'
import PasteAndRecognize from './components/paste-and-recognize/index.vue'
import PcWxUploader from './components/pc-uploader/index.vue'
import AudioPopup from '@order-public-sub-public/components/ui/ocr/components/audio/index.vue'
// 方法
import { filterEmojis } from '@order-public-sub-public/utils/pattern'
import vKeyboard from '@order-public-sub-public/directives/keyboard'
import { isWechatEnv } from '@public/utils'
import { clk_express_single_send_intellect_button_v1 } from './report/index'
import { $native, debounce } from '@order-public-sub-public/utils'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { isWxPcApplet, isWechat, isAppiOS, isAliPayClient, isAmapApp } from '@order-public-sub-public/utils/device'
import { OCR_PLACEHOLDER } from '@order-public-sub-public/constants'
import { clickOrcHelpReport } from '@order-public-sub-public/report/sender'
import Taro from '@tarojs/taro'
import { MINI_APP_VERSION, compareVersionNew } from '@/public/constants'
import { getRecorderManager, stopRecording } from './utils'
import { isH5FSEnv } from '@/public/utils'

const emit = defineEmits([
  'onClickIdentify',
  'onClickImg',
  'onClickHelp',
  'update:ocrMessage',
  'onComplete',
  'uploaderAfterRead',
  'clear',
])

// 支付宝原生上传图片无法转base64,这里和PC小程序保持一致
const isWxPcAppletOrAliPay = computed(() => {
  // return isWxPcApplet || isAliPayClient
  return true
})

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  addressType: {
    type: String,
    default: '',
  },
  ocrMessage: {
    type: String,
    default: '',
  },
  showImageOcr: {
    type: Boolean,
    default: true,
  },
  placeholder: {
    type: String,
    default: OCR_PLACEHOLDER,
  },
  maxlength: {
    type: Number,
    default: 300,
  },
  rows: {
    type: Number,
    default: 6,
  },
  imgBtnText: {
    type: String,
    default: 'AI图片识别',
  },
  singleOcr: {
    type: Boolean,
    default: true,
  },
})

const show = ref(false)
console.log('props.placeholder>>>>', props.placeholder)
const versionCompare = ref(true)
const doVerionCompare = () => {
  if (isWechatEnv) return
  const res = compareVersionNew(MINI_APP_VERSION?.replace(/v|V/g, ''), '8.2.0')
  versionCompare.value = res >= 0
}

watch(show, (val) => {
  if (process.env.TARO_ENV === 'weapp') {
    if (val) {
      wx.setPageStyle({
        style: {
          overflow: 'hidden',
        },
      })
    } else {
      wx.setPageStyle({
        style: {
          overflowY: 'scroll',
        },
      })
    }
  } else if (process.env.TARO_ENV === 'alipay') {
    // if (val) {
    //   my?.setPageScrollable({
    //     scrollable: false
    //   })
    // } else {
    //   my?.setPageScrollable({
    //     scrollable: true
    //   })
    // }
  }
})

const ocrRef = ref<HTMLElement | null | any>(null)

const audioHandle = debounce(() => {
  const oldMessage = props.ocrMessage
  getRecorderManager((res: string) => {
    const text = oldMessage + res
    onInputOcr(text)
  }, props.addressType)
}, 200)

const onInputOcr = (value: string) => {
  emit('update:ocrMessage', value)
}

const onClear = () => {
  emit('update:ocrMessage', '')
  emit('clear')
}
/**
 * 图片识别
 */
const onClickImg = () => {
  // 桌面版微信小程序没有图像识别的原生方法直接给与提示
  // if (isWxPcAppletOrAliPay.value) return showToast('当前登录设备，暂不支持图片识别功能')
  emit('onClickImg')
}

/**
 * 帮助
 */
const onClickHelp = () => {
  show.value = true
  clickOrcHelpReport(props.addressType)
  emit('onClickHelp')
}

/**
 * 识别
 */
const onClickIdentify = () => {
  emit('onClickIdentify')
}

/**
 * 清空
 */
const clearOcr = () => {
  if (isAppiOS) {
    setTimeout(() => {
      ocrRef.value?.textAreaRef?.focus() //为了解决ios样式兼容，bug463073,定时器是为了不真的聚焦
    })
  }
  onClear()
}
/**
 * 粘贴并识别
 */
const onPasteAndRecognize = async () => {
  let word = (await Taro.getClipboardData())?.data || ''
  if (typeof word !== 'string' || !word) {
    showToast('未识别到粘贴板内容，请输入文本')
    return ''
  }
  let str = word.trim() // 去除空格
  if (str) {
    // 截断100个字
    if (str.length > props.maxlength) {
      str = str.slice(0, props.maxlength)
    }
    onInputOcr(str as string)
  }
  emit('onClickIdentify')
}
// PC小程序选择文件后
const uploaderAfterRead = (data: string) => {
  if (data) {
    emit('uploaderAfterRead', data)
  }
}

onMounted(() => {
  doVerionCompare()
})

onBeforeUnmount(() => {
  stopRecording()
})

defineExpose({
  onPasteAndRecognize,
  // 导出ref对象
  ocrRef,
})

// 输入格式化
const formatter = (value: string): string => value.replace(filterEmojis, '')
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
