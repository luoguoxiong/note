<template>
  <view>
    <view class="login-form-article">
      <view class="check-box" @click="onToggleCheck">
        <!-- <Image class="check-image" :src="`https://ic-img.ky-express.com/kye-miniapp/${checkBoxImage}`" /> -->
        <image
          v-show="!modelValue"
          class="check-image"
          src="https://ic-img.ky-express.com/kye-miniapp/user/checked-0.png"
        />
        <image
          v-show="modelValue"
          class="check-image"
          src="https://ic-img.ky-express.com/kye-miniapp/user/checked-1.png"
        />
      </view>
      <view>
        <text @tap="onToggleCheck">我已阅读并同意</text>
        <text class="highlight" @tap="() => openArticlePage('127')">《用户协议》</text>
        <text @tap="onToggleCheck" v-if="extraLinks && !extraLinks.length">和</text>
        <text class="highlight" @tap="() => openArticlePage('209')">《隐私政策》</text>
        <text class="highlight" v-for="item in extraLinks" :key="item.name" @tap="() => openURL(item.url)">
          {{ item.name }}
        </text>
      </view>
    </view>
    <PrivacePopup
      :show="showPrivacyPopup"
      :isQuickyLogin="isQuickyLogin"
      :isSelfPhoneLogin="isSelfPhoneLogin"
      :isWeixinApp="isWeixinApp"
      :extraLinks="extraLinks"
      @cancel="showPrivacyPopup = false"
      @getPhone="handleGetPhone"
      @confirm="handleAgreeProtocol"
      @error="handleError"
    ></PrivacePopup>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { openURL } from '@modules/webview/utils'
import { checkNetworkTypeToast, urlContact } from '@public/utils'
import { report_CLK_event } from '@public/utils'
import './index.scss'
import { report_clk_logon_login_other_button } from '@modules/user/report/login'
import { getEnvConfig } from '@/public/constants'
import { createAsyncComp } from '@/public/utils/createAsyncComponent'
const PrivacePopup = createAsyncComp(() => import('@/public/components/business/privacy-popup/index.vue'))

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    disabled?: boolean
    isQuickyLogin?: boolean
    isWeixinApp?: boolean
    isSelfPhoneLogin?: boolean
    extraLinks?: Array
    currentLoginType?: Number
  }>(),
  {
    isQuickyLogin: false,
    isWeixinApp: false,
    isSelfPhoneLogin: false,
    currentLoginType: null,
    extraLinks: [],
  },
)

const showPrivacyPopup = ref(false)

const emits = defineEmits<{
  'update:modelValue': [value: boolean]
  open: [id: string]
  confirm
  error
  getPhone: [
    {
      encryptedData: string
      iv: string
      errMsg: string
      code: string
      errno: string
      sign: string
    },
  ]
}>()

const checkImageList = {
  checked1: 'user/checked-1.png',
  checked0: 'user/checked-0.png',
}

const checkBoxImage = computed(() => {
  return props.modelValue ? checkImageList['checked1'] : checkImageList['checked0']
})

const onToggleCheck = () => {
  if (props.disabled) return
  emits('update:modelValue', !props.modelValue)
  if (!props.modelValue) {
    report_CLK_event('clk_logon_login_other_button', {
      button_name: '勾选协议',
      page_code: 'page_logon_login',
    })
  }
}

const openArticlePage = (id: string) => {
  if (props.disabled) return
  const { isProd } = getEnvConfig()
  const page_code = {
    '127': 'page_user_agreement_v1',
    '209': 'page_privacy_policy_v1',
  }

  const button_name = {
    '127': '用户协议',
    '209': '隐私政策',
  }

  report_clk_logon_login_other_button({
    page_name: '登录_登录页',
    event_name: '登录_登录页_页面按钮点击',
    button_name: button_name[id],
  })

  const articleUrl = {
    '127': urlContact(
      '/article.html',
      isProd ? { id: 'KY01_0003', code: 'KY_2507090003' } : { id: 'KY35_0003', code: 'KY_2507040001' },
    ), // 用户协议
    // '209': 'https://ic-h5.kye-erp.com/article.html?id=131',
    '209': urlContact(
      '/article.html',
      isProd ? { id: 'KY01_0003', code: 'KY_2507090002' } : { id: 'KY35_0003', code: 'KY_2507040002' },
    ),
  }

  checkNetworkTypeToast().then(() => {
    articleUrl[id]
      ? openURL(articleUrl[id], { page_code: page_code[id] })
      : openURL('/article.html?id=' + id, { page_code: page_code[id] })
  })
}

const handleAgreeProtocol = () => {
  emits('update:modelValue', true)
  showPrivacyPopup.value = false
  emits('confirm')
}

const handleGetPhone = (args) => {
  emits('update:modelValue', true)
  emits('getPhone', args)
  showPrivacyPopup.value = false
}

const handleError = (args: any) => {
  emits('error', args)
}

defineExpose({
  show: () => (showPrivacyPopup.value = true),
})
</script>
