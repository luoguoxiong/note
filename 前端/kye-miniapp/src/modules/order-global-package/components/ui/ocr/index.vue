<template>
  <div class="ocr ocr-showdialog-content" :class="{ 'batch-ocr-wrap': !singleOcr }">
    <!-- 内容 -->
    <div class="text-area" :class="{ 'batch-Ocr': !singleOcr, 'has-hotspot': showPasteRecognizeInTextarea }">
      <KyTextarea
        ref="ocrRef"
        :clearable="false"
        :customPlaceholder="true"
        :enableWxNative="true"
        :maxlength="maxlength"
        :modelValue="ocrMessage"
        :placeholder="placeholderWord"
        @focus="onFocus"
        @blur="onBlur"
        :rows="rows"
        :formatter="formatter"
        @update:modelValue="onInputOcr"
        v-keyboard
        @clear="clearOcr"
        @click="clickText"
      ></KyTextarea>
      <!-- 文本框内粘贴识别热区（仅 iOS App） -->
      <span
        v-if="showPasteRecognizeInTextarea"
        class="paste-recognize-hotspot"
        @click.stop="onPasteRecognizeHotspotClick"
      >
        <span class="paste-recognize-hotspot__text">粘贴文本</span>
      </span>
    </div>
    <!-- 额外内容 -->
    <div class="extra">
      <div class="left">
        <slot name="extra">
          <div v-if="showImageOcr" class="left__img">
            <div class="text" @click.stop="onClickImg" v-html="imgBtnText"></div>
          </div>
          <div
            class="left__audio"
            @click.stop="audioHandle"
            v-if="
              !isWxPcApplet &&
              (showAudioButton || voiceAiDiscernVisible) &&
              showImageOcr &&
              !isAliPayClient &&
              !isAmapApp &&
              !isH5FSEnv &&
              versionCompare
            "
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
    <HelpPopup :fromSource="fromSource" :show="show" @onClose="show = false" />
    <AudioPopup />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, onBeforeUnmount } from 'vue'

import KyTextarea from '../../base/ky-textarea/index.vue'
import KyButton from '../../base/ky-button/index.vue'
import HelpPopup from './components/help-popup/index.vue'
import AudioPopup from './components/audio/index.vue'
import PasteAndRecognize from './components/paste-and-recognize/index.vue'
import { filterEmojis, OCR_PLACEHOLDER } from '../../../types/constants'
import vKeyboard from '../../../directives/keyboard'
import { showToast } from '../../../hooks/useShowToast'
import { isAppiOS, isAliPayClient, isWxPcApplet, isAmapApp } from '../../../utils/device'
import { voiceAiDiscernVisible } from '../../../types/voice'
import Taro from '@tarojs/taro'
import { isWechatEnv, isWxAppIosEnv } from '@/public/utils'
import { getClipboardPermission, getRecorderManager, setWaybillNumber, stopRecording } from './utils'
import { debounce } from 'lodash-es'
import { MINI_APP_VERSION, compareVersionNew } from '@/public/constants'
import { isH5FSEnv } from '@/public/utils'
import { setFooterZIndex } from '../../../types/footer'

// 埋点函数 — 从 global-package/report 引入
import { clk_ocr_text_click, clk_ocr_img_recognition, clk_ocr_voice, clickOrcHelpReport } from '../../../report/index'

const emit = defineEmits([
  'onClickIdentify',
  'onClickImg',
  'onClickHelp',
  'onClickAudio',
  'update:ocrMessage',
  'onComplete',
  'uploaderAfterRead',
  'clear',
])
const showAudioButton = ref(true)

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
  /** 运单号（注入给语音识别上报使用） */
  waybillNumber: {
    type: String,
    default: '',
  },
  /**
   * 语音识别按钮是否显示（替代原 getUserSettingInfoByKey('voiceVisible')）
   * 默认 true，由父组件根据用户设置控制
   */
  showVoiceButton: {
    type: Boolean,
    default: true,
  },
  fromSource: {
    type: String,
    default: '',
  },
  /** 是否显示文本框内的粘贴识别热区按钮 */
  showOcrPlaceholderButton: {
    type: Boolean,
    default: true,
  },
})

const show = ref(false)
const versionCompare = ref(true)
const doVerionCompare = () => {
  if (isWechatEnv) return
  const res = compareVersionNew(MINI_APP_VERSION?.replace(/v|V/g, ''), '8.2.0')
  versionCompare.value = res >= 0
}

// 计算是否显示文本框内的粘贴识别热区（仅 iOS App）
const showPasteRecognizeInTextarea = computed(() => {
  return isWxAppIosEnv && !props.ocrMessage && !focusStatus.value && props.showOcrPlaceholderButton
})

const placeholderWord = computed(() => {
  if (!props.showOcrPlaceholderButton || !showPasteRecognizeInTextarea.value) {
    return props.placeholder
  }
  return focusStatus.value ? props.placeholder : props.placeholder?.replace(/粘贴文本/g, '\u3000\u3000\u3000\u3000')
})

watch(show, (val) => {
  setFooterZIndex(val)
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
    // 保持原有逻辑不变
  }
})

const ocrRef = ref<HTMLElement | null | any>(null)
const focusStatus = ref(false)

const audioHandle = debounce(() => {
  emit('onClickAudio')
  const oldMessage = props.ocrMessage
  getRecorderManager((res: string) => {
    const text = oldMessage + res
    onInputOcr(text)
  }, props.addressType)
  clk_ocr_voice(props.addressType)
}, 200)

const onInputOcr = (value: string) => {
  emit('update:ocrMessage', value)
}

const onClear = () => {
  emit('update:ocrMessage', '')
  emit('clear')
}
const onFocus = () => {
  focusStatus.value = true
}
const onBlur = () => {
  focusStatus.value = false
}
const clickText = () => {
  try {
    clk_ocr_text_click(props.addressType)
    if (!focusStatus.value) {
      focusStatus.value = true
    }
  } catch (error) {
    console.log(error)
  }
}
/**
 * 图片识别
 */
const onClickImg = () => {
  try {
    clk_ocr_img_recognition(props.addressType)
  } catch (error) {
    console.log(error)
  }
  emit('onClickImg')
}

/**
 * 帮助
 */
const onClickHelp = () => {
  show.value = true
  clickOrcHelpReport(props.addressType)
  emit('onClickHelp')
  if (isWechatEnv) {
    Taro.hideKeyboard()
  }
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
      ocrRef.value?.textAreaRef?.focus()
    })
  }
  onClear()
}
/**
 * 粘贴并识别
 */
const onPasteAndRecognize = async () => {
  let word = (await getClipboardPermission('ocr-showdialog-content', false)) || ''
  if (typeof word !== 'string' || !word) {
    showToast('未识别到粘贴板内容，请输入文本')
    return ''
  }
  let str = word.trim()
  if (str) {
    if (str.length > props.maxlength) {
      str = str.slice(0, props.maxlength)
    }
    onInputOcr(str as string)
  } else {
    showToast('未识别到粘贴板内容，请输入文本')
  }
  emit('onClickIdentify')
}

/**
 * 文本框内粘贴识别热区点击
 */
const onPasteRecognizeHotspotClick = async () => {
  await onPasteAndRecognize()
  if (props.ocrMessage) {
    return
  }
  ocrRef.value?.textAreaRef?.focus()
}

// 通过父组件 prop 控制语音按钮显隐（替代原 getUserSettingInfoByKey('voiceVisible')）
const initShow = async () => {
  showAudioButton.value = props.showVoiceButton
}

onMounted(() => {
  initShow()
  doVerionCompare()
  if (props.waybillNumber) {
    setWaybillNumber(props.waybillNumber)
  }
})

onBeforeUnmount(() => {
  stopRecording()
})

defineExpose({
  onPasteAndRecognize,
  ocrRef,
})

// 输入格式化
const formatter = (value: string): string => value.replace(filterEmojis, '')
</script>

<style lang="scss">
@import './index.scss';
</style>
