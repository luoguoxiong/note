/**
 * @Desc: wxPay
 * @Date: 2025/8/22
 */
import Taro from '@tarojs/taro'

const wxPayCodeResult = {
  '-1': '订单支付失败', // 支付成功-是否刷新页面
  '-2': '用户取消支付',
}

const wxPayErrNo = {
  10100001: '未通过微信返回跨越寄件,正在处理中，支付结果未知（有可能已经支付成功），请查询商户订单列表中订单的支付状态',
}

const showToast = (data: string | { message: string }) => {
  if (typeof data === 'string') return Taro.showToast({ title: data, icon: 'none' })

  return Taro.showToast({ title: data?.message, icon: 'none' })
}

/**
 * APP唤起微信支付
 * @param opts
 */
export const handleAppWxPay = (opts) => {
  try {
    const {
      timeStamp,
      timestamp,
      mchId,
      prepayId,
      prepayid,
      prepay_id,
      nonceStr,
      nonce_str,
      noncestr,
      sign,
      partnerId,
      partnerid,
    } = opts || {}
    wx.miniapp.requestPayment({
      timeStamp: Number(timeStamp || timestamp),
      mchId: mchId || partnerId || partnerid,
      prepayId: prepayId || prepay_id || prepayid,
      package: 'Sign=WXPay',
      nonceStr: nonceStr || nonce_str || noncestr,
      sign,
      success: (res) => {
        console.warn('wx.miniapp.requestPayment success:', res)
        if (opts?.success) {
          opts?.success(res)
        }
      },
      fail: (res) => {
        console.error('wx.miniapp.requestPayment res:', res)
        const errCode = res?.err_code || res?.errCode
        if (errCode && wxPayCodeResult[errCode]) {
          showToast(wxPayCodeResult[errCode])
        }
        if (res?.errno && wxPayErrNo[res?.errno]) {
          showToast(wxPayErrNo[res?.errno])
        }
        if (opts?.fail) {
          opts?.fail(res)
        }
      },
      complete: (res) => {
        console.error('wx.miniapp.requestPayment res:', res)
        if (opts?.complete) {
          opts?.complete(res)
        }
      },
    })
  } catch (e) {
    console.log(e)
  }
}
