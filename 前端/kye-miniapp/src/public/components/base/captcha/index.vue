<template>
  <t-captcha
    v-if="mountedComponent"
    :id="randomId"
    :class="randomId"
    :appId="appId"
    @close="handleClose"
    @verify="handleVerify"
    @error="handleError"
  />
</template>

<script setup lang="ts">
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { CodeVerifyReq, codeCheck } from './api'
import { computed } from 'vue'
import { isWeixinAppSync } from '@/public/config'
import { createEventChannel } from '@/modules/webview/pages/event-channel/helper'
import { useUserInfo } from '@/public/hooks'

defineOptions({ name: 'uam-captcha' })

const props = defineProps({
  userCheck: { type: Boolean, default: true },
  // eslint-disable-next-line no-undef
  appId: { type: String, default: process.env.TARO_APP_ENV === 'prod' ? '194789023' : '196417537' },
})

const emits = defineEmits<{
  getCode: [string, { randStr: string; ticket: string }]
  handleClose: any
}>()

let captchaInfo: CodeVerifyReq | any = void 0

let captchaComponent: any = null

const mountedComponent = computed(() => {
  if (Taro.getEnv() !== Taro.ENV_TYPE.WEAPP || isWeixinAppSync()) {
    return false
  }
  return true
})

const randomId = `id-${new Date().getTime()}-appid`
const closeEvent = `captcha-close-${randomId}`
const successEvent = `captcha-success-${randomId}`
const errorEvent = `captcha-error-${randomId}`

const instance = getCurrentInstance()
const { userInfo } = useUserInfo()

const handlerCaptchaShow = () => {
  const page = instance?.page

  if (mountedComponent.value && page && typeof page.selectComponent === 'function') {
    captchaComponent = page.selectComponent(`#${randomId}`) || page.selectComponent(`.${randomId}`)
    try {
      captchaComponent?.show()
    } catch (error) {
      captchaComponent?.refresh()
    }
  }
  // webview 兼容模式
  else {
    let detail = { ret: -1 }
    // eslint-disable-next-line no-undef
    const baseURL = process.env.TARO_APP_HTTP_URL
    createEventChannel({
      // TODO 替换轻应用
      url: baseURL + '/netc-h5-modules/t-captcha/index.html?captchaAppId=' + props.appId,

      handlers: {
        message: (e) => {
          detail = Array.isArray(e?.detail?.data) ? e.detail?.data[0] : e?.detail?.data
          handleVerify({ detail })
        },
        destroy: () => {
          // 退出页面，未校验
          if (detail.ret === -1) handleVerify({ detail, destroy: 1 })
        },
      },
    })
  }
}

const awaitResult = () => {
  return new Promise((resolve, reject) => {
    const destroy = () => {
      Taro.eventCenter.off(closeEvent)
      Taro.eventCenter.off(successEvent)
      Taro.eventCenter.off(errorEvent)
    }

    Taro.eventCenter.once(successEvent, (res: any) => {
      resolve(res)
      destroy()
    })

    Taro.eventCenter.once(closeEvent, (ev: any) => {
      if (ev?.detail?.ret !== 0) {
        reject(ev)
        destroy()
      }
    })

    Taro.eventCenter.once(errorEvent, (error: any) => {
      reject(error)
      destroy()
    })
  })
}

const handleVerify = async (ev: any) => {
  if (ev.detail.ret === 0) {
    const { ticket, randstr } = ev.detail

    if (!props.userCheck) {
      emits('getCode', ticket, { randStr: randstr, ticket: ticket })
      Taro.eventCenter.trigger(successEvent, ticket)
      return
    }

    const res = await codeCheck({
      captchaInfo: { ticket: ticket, randStr: randstr, source: 'wechat' },
      ...captchaInfo,
    }).catch((error) => {
      Taro.eventCenter.trigger(errorEvent, error)
      throw error
    })

    emits('getCode', res.data.safeVerifyId, { randStr: randstr, ticket: ticket })
    Taro.eventCenter.trigger(successEvent, res.data.safeVerifyId)
  } else if (ev.destroy) {
    Taro.eventCenter.trigger(errorEvent, ev)
    emits('getCode', '', { randStr: '', ticket: '' })
  }
}

const handleClose = (ev: any) => {
  Taro.eventCenter.trigger(closeEvent, ev)
  emits('handleClose')
}

const handleError = (error) => {
  Taro.eventCenter.trigger(errorEvent, error)
}

const showCaptcha = (info: CodeVerifyReq) => {
  const result: Promise<any> = awaitResult()

  captchaInfo = { phone: userInfo.value.phone, ...info }

  handlerCaptchaShow()

  return result
}

defineExpose({
  showCaptcha,
  handlerCaptchaShow,
})
</script>
