<template>
  <ky-popup round catchMove position="bottom" :show="show" :lazy-render="false" v-bind="$attrs" class="agreement-popup">
    <view class="agreement-popup__header">
      {{ title }}
      <image
        class="agreement-popup__header-close"
        src="https://ic-img.ky-express.com/netc/20250731_84451_!!1753952732865_64_64.png"
        @tap="$emit('update:show', false)"
      />
    </view>
    <view class="agreement-popup__content">
      <scroll-view :show-scrollbar="false" style="height: 50vh" :scroll-y="true" ref="body" @scroll="throttledOnScroll">
        <rich-text class="content" :nodes="state.articleContent" ref="contentRef"></rich-text>
      </scroll-view>
      <view class="agreement-popup__footer">
        <ky-button block type="primary" :disabled="buttonDisabled" @click="onConfirm">
          {{ buttonText }}
        </ky-button>
      </view>
    </view>
  </ky-popup>
</template>

<script lang="ts" setup>
import Taro from '@tarojs/taro'
import { computed, reactive, watch } from 'vue'
import { throttle } from 'lodash-es'
import { getAgreementContent } from './utils'
import './index.scss'
// 判断当前是否是微信的环境
const isALIPAY: boolean = Taro.getEnv() === Taro.ENV_TYPE.ALIPAY

defineOptions({ name: 'AgreementPopup' })

const props = defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: '协议' },
  /** 协议Id */
  agreementCode: { type: [String], required: true },
  pageCode: { type: [String], required: true },
  /** 同意的 */
  agreed: { type: Boolean, default: false },
  /** 同意了的文案 */
  agreedText: { type: String, default: '知道了' },
  /** 按钮禁用时文案 */
  disabledText: { type: String, default: '下拉滑动阅读本协议' },
  /** 可以点击时文案 */
  enabledText: { type: String, default: '我已阅读并同意本协议' },
})

const emits = defineEmits(['confirm', 'update:show'])

const state = reactive({
  loading: false,
  isReachBottom: false,
  articleContent: '',
})

const buttonDisabled = computed(() => {
  return !props.agreed && !state.isReachBottom
})

const buttonText = computed(() => {
  return props.agreed ? props.agreedText : buttonDisabled.value ? props.disabledText : props.enabledText
})

const onConfirm = () => {
  emits('confirm', buttonText.value)
}

const throttledOnScroll = throttle(
  (e) => {
    if (e.detail.scrollHeight - e.detail.scrollTop <= 1.5 * e.detail.scrollWidth) {
      state.isReachBottom = true
    }
  },
  200,
  { trailing: true },
)

const apiParams = computed(() => ({
  pageCode: props.pageCode,
  agreementCode: props.agreementCode,
}))

// 预处理函数示例（增强版）
const sanitizeForAlipay = (htmlStr) => {
  // 1. 移除所有 <style> 标签及其内容
  htmlStr = htmlStr.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')

  // 2. 移除 class 属性（或替换为内联 style，但需谨慎）
  htmlStr = htmlStr.replace(/class="[^"]*"/g, '')

  // 3. 替换 font -> span
  htmlStr = htmlStr.replace(/<(\/?)font\b/g, '<$1span')

  // 4. b -> span with font-weight
  htmlStr = htmlStr.replace(/<b\b([^>]*)>/g, '<span style="font-weight:bold">')
  htmlStr = htmlStr.replace(/<\/b>/g, '</span>')

  // 5. 移除注释等无用内容
  htmlStr = htmlStr.replace(/<!--[\s\S]*?-->/g, '')

  // 6. 【关键】移除所有不支持的 style 属性（保留 color, font-weight 等）
  // 可以用正则过滤掉不支持的 CSS
  htmlStr = htmlStr.replace(/style="([^"]*)"/g, (match, styleContent) => {
    const allowedProps = ['color', 'font-weight', 'background-color']
    const validStyles = styleContent
      .split(';')
      .map((s) => s.trim())
      .filter((s) => {
        const prop = s.split(':')[0]?.trim()
        return allowedProps.some((p) => prop?.startsWith(p))
      })
      .join('; ')
    return validStyles ? `style="${validStyles}"` : ''
  })

  // 7. 移除 div 外壳（如果最外层是 div，可考虑换成支持的标签或直接取 innerHTML）
  if (htmlStr.startsWith('<div') && htmlStr.endsWith('</div>')) {
    // 提取 innerHTML（简单场景可用，复杂需用 DOMParser）
    const match = htmlStr.match(/^<div[^>]*>([\s\S]*)<\/div>$/i)
    if (match) htmlStr = match[1]
  }

  return htmlStr
}
watch(
  apiParams,
  async (id) => {
    if (!id) return
    state.loading = true
    const content = await getAgreementContent(apiParams.value).finally(() => {
      state.loading = false
    })

    state.articleContent = content[0].agreementContent!
    if (isALIPAY) {
      state.articleContent = sanitizeForAlipay(state.articleContent)
    }
  },
  { immediate: true },
)
watch(
  () => props.show,
  (val) => {
    if (!val) {
      state.isReachBottom = false
    }
  },
)
</script>
