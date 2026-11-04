<template></template>
<script lang="ts">
import Taro, { useLoad, useUnload } from '@tarojs/taro'
import { ref } from 'vue'
import { handleAppAliPay, handleAppAliPayResultSubscribe, handleAppAliPayResultUnSubscribe } from '@public/utils/appPay'
import { report_other_event } from '@/public/utils'
const queryParams = ref<any>({}) // 支付参数

const alipayCodeResult = {
  '9000': '订单支付成功', // 支付成功-是否刷新页面
  '8000': '正在处理中，支付结果未知（有可能已经支付成功），请查询商户订单列表中订单的支付状态',
  '4000': '订单支付失败',
  '5000': '重复请求',
  '6001': '用户中途取消',
  '6002': '网络连接出错',
  '6004': '支付结果未知(有可能已经支付成功), 请查询商户订单列表中订单的支付状态',
  其他: '其他支付错误',
}

type AlipayResultCode = keyof typeof alipayCodeResult

/**
 * 根据code获取支付支付结果
 * @param code
 * @returns {string}
 */
const getAlipayMessageWithCode = (code: AlipayResultCode) => {
  if (code && alipayCodeResult[code]) {
    return alipayCodeResult[code]
  } else {
    return alipayCodeResult['其他']
  }
}

/**
 * 支付宝支付-唤起
 * @param query
 */
const handleAliPay = (query) => {
  if (query) {
    handleAppAliPay(query)
  }
}

/**
 * 支付宝支付-处理结果
 */
const handleAppAliPayResult = (message) => {
  const { type, data } = message || {}
  if (type === 'AliPayResult') {
    const { kAlipayResultCode, kAlipayResultMsg } = data || {}
    report_other_event('appAlipayResult', {
      code: data?.kAlipayResultCode,
      resultInfo: typeof message !== 'string' ? JSON.stringify(message) : message,
    })
    if (kAlipayResultCode === 9000) {
      showToast('订单支付成功')
    } else {
      const msg = getAlipayMessageWithCode(kAlipayResultCode)
      if (msg) {
        showToast(msg)
      }
    }
    setTimeout(() => {
      Taro.navigateBack()
    }, 1500)
  }
}

const showToast = (data: string | { message: string }) => {
  if (typeof data === 'string') return Taro.showToast({ title: data, icon: 'none' })

  return Taro.showToast({ title: data?.message, icon: 'none' })
}

useLoad((query) => {
  queryParams.value = query
  report_other_event('appAlipayQuery', query)
  handleAliPay(query)
  // 订阅支付消息
  handleAppAliPayResultSubscribe(handleAppAliPayResult)
})

// 离开页面
useUnload(() => {
  // 取消订阅支付消息
  handleAppAliPayResultUnSubscribe(handleAppAliPayResult)
})
</script>

<style lang="scss"></style>
