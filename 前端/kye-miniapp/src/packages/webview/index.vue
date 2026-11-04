<template>
  <KyWebView :src="webviewSrc" id="webview-barcode" v-if="webviewSrc"></KyWebView>
</template>
<script setup lang="tsx">
import { useDidShow, useRouter } from '@tarojs/taro'
import KyWebView from '@public/components/business/webview/index.vue'
import { urlContact } from '@/public/utils'
import { ref } from 'vue'
import { useLogin, useUserInfo } from '@/public/hooks'
import { useAutoLogin } from '@/public/utils/user/useAutoLogin'
import { refreshWebviewCheck } from '@/public/utils/webview'
import { md5 } from 'js-md5'
import Taro from '@tarojs/taro'

const { params } = useRouter()

const base_url = process.env.TARO_APP_HTTP_URL

const { src, type, id, sources, no, applets, customerCode, uuid, pageKey } = (params || {}) as any

const { autoLoginHook } = useAutoLogin()

const webviewSrc = ref()

const { token } = useLogin()

const { userInfo } = useUserInfo()

console.error('userInfo', userInfo)

const getCommonQuery = () => {
  const system = Taro.getSystemInfoSync()
  /**
   * 跨越h5 第三方链接参数
   * @type {string}
   */
  const ua = `${system.model.replace(/<.*>/g, '')} ${system.system}`.substring(0, 50)
  const h5Params = {
    source: 'miniprogram',
    version: system.version,
    ua: ua,
  }

  return h5Params
}

const updateWebview = (src) => {
  webviewSrc.value = src
}

const getWebview = () => {
  const openId = Taro.getStorageSync('openId')

  const typeMap: Record<string, () => string> = {
    refund: () =>
      urlContact(src, {
        id,
        ...getCommonQuery(),
      }),

    coupon: () =>
      urlContact(decodeURIComponent(src), {
        orderResource: 6,
        phone: userInfo.value.phone,
      }),

    chat: () => {
      const sign = md5(
        (userInfo.value.userName ? `name${userInfo.value.userName}` : '') +
          `phone${userInfo.value.phone}sourceWECHAT_APPLETimcloudMethod`,
      ).toUpperCase()
      return urlContact(src, {
        name: userInfo.name,
        source: 'WECHAT_APPLET',
        phone: userInfo.value.phone,
        sign,
      })
    },

    hotline: () =>
      urlContact(`${base_url}/netc-h5-tools-optimize/president-mailbox/president-mailbox.html#/feedback-home`, {
        sources,
      }),

    crabFeedBack: () =>
      urlContact(`https://m.ky-express.com/feedback-crab.html`, {
        openId,
        appId: 114,
        source: 'miniprogram',
        phone: userInfo.value.phone,
      }),

    invoice: () =>
      urlContact(src, {
        phone: userInfo.value.phone,
        openId,
        source: 'applet',
      }),

    prescription: () => src,

    miniSarch: () =>
      urlContact(src, {
        source: 'applet',
      }),

    ys: () =>
      urlContact(`${base_url}/qr-code-ielts.html#/`, {
        no,
      }),

    rebate: () =>
      urlContact(src, {
        from: '6',
      }),

    applyAuth: () =>
      urlContact(
        src,
        applets
          ? {
              applets: 'true',
              customerCode,
            }
          : {},
      ),

    loginFlag: () => src,

    questionnaire: () =>
      urlContact(src, {
        p: uuid,
        sourceKey: 10,
        pageKey,
      }),

    bonus: () => src,
  }

  webviewSrc.value = urlContact(typeMap[type]?.() ?? src, {
    token: token.value,
  })
}

const onRefresh = () => {
  updateWebview('')
  setTimeout(() => {
    getWebview()
  }, 300)
}

let isLoad = false

useDidShow(async () => {
  try {
    await autoLoginHook({ needLogin: true })
    if (!isLoad) {
      isLoad = true
      getWebview()
    } else {
      if (refreshWebviewCheck(webviewSrc.value)) {
        onRefresh()
        return
      }
    }
  } catch (error) {
    console.error(error)
  }
})
</script>
