<template>
  <ky-redirct-webview :url="init()" needLogin />
</template>

<script lang="tsx" setup>
import { urlContact } from '@/public/utils'
import Taro, { useRouter } from '@tarojs/taro'

const { params } = useRouter()
const { type, sources, customerShortName, customerCode, configdata, q, src, from, giftBagMarketId, no } = params || {}

const baseUrl = process.env.TARO_APP_HTTP_URL

// 工具函数：拼接 openId
const withOpenId = (link: string) => urlContact(link, { openId: Taro.getStorageSync('openId') })

// 类型路由处理
const typeHandlers: Record<string, () => string | undefined> = {
  prescription: () => `${baseUrl}/freight-prescription.html#/`,

  hotline: () =>
    urlContact(`${baseUrl}/netc-h5-tools-optimize/president-mailbox/president-mailbox.html#/feedback-home`, {
      sources,
    }),

  freight: () => withOpenId(`${baseUrl}/deposit-freight.html#/`),

  customer: () =>
    urlContact(`${baseUrl}/custom-code.html#/`, {
      customerShortName,
      customerCode,
      configdata,
    }),

  welfare: () => {
    const grayLink = `${baseUrl}/netc-h5-marketing-optimize/buy-stock/buy-stock.html#/`
    return grayLink ? withOpenId(grayLink) : undefined
  },

  scan: () => decodeURIComponent(q as string),

  feedback: () => urlContact(src as string),

  newCustomGift: () =>
    urlContact(`${baseUrl}/gift.html#/`, {
      no,
      from,
      giftBagMarketId,
    }),

  barnnerGift: () => decodeURIComponent(src as string),

  withdrawRecord: () => `${baseUrl}/bonus.html#/withdraw-record`,

  productIntro: () => `${baseUrl}/product-intro.html`,

  bonus: () => `${baseUrl}/bonus.html#/bonus-home/`,
}

// 初始化并跳转
const init = () => {
  if (!type) return
  const handler = typeHandlers[type]
  const rawUrl = handler ? handler() : undefined

  return rawUrl
}
</script>
