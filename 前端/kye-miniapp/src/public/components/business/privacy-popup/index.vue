<template>
  <ky-popup :show="show" :closeOnClickOverlay="false" position="bottom" :offsetBottom="offsetBottom">
    <view class="login-dialog__title">
      <view>温馨提示</view>
      <view class="login-dialog__close" @tap="handleClose" @touchstart="null">
        <KyImage name="user/icon-close.png" />
      </view>
    </view>
    <view class="login-dialog__content">
      <view class="dialogText">
        <view>感谢您使用跨越寄件！</view>
        <view>
          我们非常重视用户的隐私和个人信息保护，希望您仔细阅读《隐私政策》和《用户协议》，详细了解我们对信息的收集、使用方式，以便您更好地了解我们的服务并作出适当的选择。如您同意隐私政策和用户协议，请点击“同意并继续”并开始使用我们的产品及服务。若点击“不同意”则相关服务不可用。
        </view>
        <view class="dialogText__footer" v-if="isSelfPhoneLogin">
          点击查看完整的<text class="highlight" @tap="() => openArticlePage('209')">《隐私政策》</text>
          <text class="highlight" @tap="() => openArticlePage('127')">《用户协议》</text>
          <text class="highlight" v-for="item in extraLinks || []" :key="item.url" @tap="() => openURL(item.url)">
            {{ item.name }}
          </text>
        </view>
        <view class="dialogText__footer" v-else>
          点击查看完整的<text class="highlight" @tap="() => openArticlePage('209')">《隐私政策》</text>和
          <text class="highlight" @tap="() => openArticlePage('127')">《用户协议》</text>
        </view>
      </view>
    </view>
    <view className="login-dialog__footer">
      <view className="login-dialog__button">
        <button @tap="handleCancel">不同意</button>
        <button v-if="isSelfPhoneLogin" @tap="handleTap">同意并继续</button>
        <button
          v-else
          :open-type="openType"
          scope="phoneNumber"
          @tap="handleTap"
          @getphonenumber="onGetPhoneNumber"
          @error="onError"
        >
          同意并继续
        </button>
      </view>
    </view>
  </ky-popup>
</template>

<script setup lang="ts">
import KyImage from '@public/components/base/ky-image/index.vue'
import './index.scss'
import { openURL } from '@modules/webview/utils'
import { checkNetworkTypeToast } from '@public/utils/platformApi'
import useLoginLoading from '@modules/user/pages/login/hooks/useLoginLoading'
import { isAliMiniApp, isWxMiniApp, urlContact } from '@/public/utils'
import { computed } from 'vue'
import { getEnvConfig } from '@/public/constants'

const props = withDefaults(
  defineProps<{
    show: boolean
    isQuickyLogin: boolean
    isSelfPhoneLogin?: boolean
    isWeixinApp?: boolean
    extraLinks?: any[]
    offsetBottom?: number
  }>(),
  {
    isQuickyLogin: false,
    isSelfPhoneLogin: false,
    isWeixinApp: false,
    offsetBottom: 0,
  },
)

const emit = defineEmits(['confirm', 'cancel', 'getPhone', 'error'])

const { loginLoading } = useLoginLoading()

const openType = computed(() => {
  if (props.isWeixinApp) {
    return ''
  }
  if (props.isQuickyLogin) {
    return isWxMiniApp ? 'getPhoneNumber' : isAliMiniApp ? 'getAuthorize' : ''
  }
  return ''
})

/* 打开协议 */
const openArticlePage = (id) => {
  if (loginLoading.value) {
    return
  }
  const { isProd } = getEnvConfig()

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
    articleUrl[id] ? openURL(articleUrl[id]) : openURL('/article.html?id=' + id)
  })
}
/* 关闭按钮 */
const handleCancel = () => {
  handleClose()
}

/* 关闭弹窗 */
const handleClose = () => {
  emit('cancel')
}
/* 同意并拒绝 */
const handleTap = () => {
  if (openType.value === '') {
    emit('confirm')
    return
  }
}

const onGetPhoneNumber = (e) => {
  if (isAliMiniApp) {
    const { encryptedData, iv, errMsg, code, errno, sign } = e.detail
    if (!encryptedData) {
      console.log('授权失败')
      return
    }
    emit('getPhone', { encryptedData, iv, errMsg, code, errno, sign })
  }
  if (isWxMiniApp) {
    const { encryptedData, iv, errMsg, code, errno } = e.detail
    if (errMsg !== 'getPhoneNumber:ok') {
      console.log('失败-用户拒绝')
      return
    } else {
      emit('getPhone', { encryptedData, iv, errMsg, code, errno })
    }
  }
}

const onError = (e) => {
  emit('error', e)
}
</script>
