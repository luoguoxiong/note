<template>
  <view></view>
</template>

<script setup>
import Taro, { useDidShow, useRouter } from '@tarojs/taro'
import { useAutoLogin } from '@public/utils/user/useAutoLogin'
import { getCustomerBindWaybill, qrcodeScanQRCode } from './api'

const MENU_ID = '1294231344178597919'

const handleSingleSend = async (billNoAll, buryingPoint = {}) => {
  // 雅思打单处理
  const resys = await getCustomerBindWaybill({ waybillNo: billNoAll })
  if (resys.data.customerBindCode === 1 && resys.data.waybillBindInfoVo.status === 2) {
    Taro.navigateTo({ url: `/packages/webview/index?type=ys&no=${billNoAll}` })
    return
  }

  //senderProvince senderCity senderArea senderAddr province city area address
  qrcodeScanQRCode({ scanCodeText: billNoAll })
    .then((res) => {
      res = res.data
      if (res.qrCodeType === 1) {
        res = res.waybillInfo
      }
      // 是否超时
      if (res.beoverdue) {
        return Taro.showToast({
          icon: 'none',
          title: '无法识别数据，请重新扫描',
        })
      }
      Taro.setStorageSync('scan', 1)
      switch (res.statusCode) {
        case 0:
          Taro.reLaunch({ url: `/packages/other/qrcodeScan/index?buryingPoint=${JSON.stringify(buryingPoint)}` })
          break
        case 1:
          Taro.showToast({
            icon: 'none',
            title: '无法识别数据，请重新扫描',
          })
          break
        case 2:
          setTimeout(() => {
            Taro.reLaunch({
              url: `/modules/order-build/pages/order/index?type=scan&channel=20&waybillNo=${billNoAll}&customerCode=${res.companyNo || ''}&companyName=${res.companyName || ''}&sourcePage=${buryingPoint.sourcePage || ''}&sourceAction=${buryingPoint.sourceAction || ''}`,
            })
          }, 500)
          break
        case 3:
          if (res.receiveDate && !res.visitorFlag) {
            Taro.reLaunch({
              url: `/modules/waybill-build/pages/waybill-detail/index?waybillNumber=${res.waybillNumber}`,
            })
          } else {
            Taro.reLaunch({
              url: `/modules/waybill-build/pages/waybill-route/index?waybillNumber=${res.waybillNumber}&type=batchScan`,
            })
          }

          break
        default:
      }
    })
    .catch(() => {
      Taro.showToast({
        icon: 'none',
        title: '无法识别数据，请重新扫描',
      })
    })
}

const urlToObj = (str) => {
  const obj = {}
  const arr1 = str.split('?')
  const arr2 = arr1[1].split('&')
  for (let i = 0; i < arr2.length; i++) {
    const res = arr2[i].split('=')
    obj[res[0]] = res[1]
  }
  return obj
}

const { autoLoginHook } = useAutoLogin()
// 获取路由参数
const { params } = useRouter()

useDidShow(async () => {
  await autoLoginHook({ needLogin: true })

  let { q, no, type } = params || {}

  if (q) {
    no = urlToObj(decodeURIComponent(q)).no
  }

  if (no) {
    handleSingleSend(no, { sourcePage: 'wx-scan', sourceAction: 'receipt' })
  } else {
    console.log('运单号解析失败，进入q解析')
  }
})
</script>
