import Taro from '@tarojs/taro'
import { openWebviewH5, urlContact } from '@/public/utils'
import { AppPlugin } from '@public/appPlugins'
/**
 * @Desc: useWeixinPayTest
 * @Date: 2025/8/18
 */
export const useWeixinPayTest = () => {
  const handleWxAppPay = () => {
    const params = {
      timeStamp: '1755914559',
      mchId: '1384947402',
      prepayId: 'wx23100239305162e2e974c0b61d93f90000',
      package: 'Sign=WXPay',
      nonceStr: '1755914559402',
      sign: 'D7574E2897778456940D8432F893AEAED139B18A36293742A75B51B43D7C9078',
    }
    const params2 = {
      timeStamp: '1667792176',
      mchId: '1800009365',
      prepayId: 'wx07113616363804b19dde94884922030000',
      package: 'Sign=WXPay',
      nonceStr: '8ne443gjxxg',
      sign: '4FF5900870B5C5BCB089789BC004156426C46512CE566DB17C131747E09ADEBA',
    }
    wx.miniapp.requestPayment({
      ...params,
      success: (res) => {
        console.warn('wx.miniapp.requestPayment success:', res)
      },
      fail: (res) => {
        console.error('wx.miniapp.requestPayment res:', res)
      },
      complete: (res) => {
        console.error('wx.miniapp.requestPayment res:', res)
      },
    })
  }

  const handleWxAppPay2 = () => {
    const params2 = {
      timeStamp: '1755921430',
      mchId: '1384947402',
      prepayId: 'wx23115709978861218b7c7391db7a450001',
      package: 'Sign=WXPay',
      nonceStr: '1755921430092',
      sign: '7C8BBEB7B1D4AFF9B68F326A7FA7DFC314320DA8FEF09DDE7AF9A1E72737763D',
    }
    wx.miniapp.requestPayment({
      ...params2,
      success: (res) => {
        console.warn('wx.miniapp.requestPayment success:', res)
      },
      fail: (res) => {
        console.error('wx.miniapp.requestPayment res:', res)
      },
      complete: (res) => {
        console.error('wx.miniapp.requestPayment res:', res)
      },
    })
  }
  /* 模拟跳转支付宝支付 */
  const handleAppAliPay = () => {
    const targetUrl = '/modules/native/pages/appPay/alipay/index'
    // const params = {
    //   orderString: 'http://moni.com',
    //   out_trade_no: 'WEB2025082209495081217877',
    // }
    const params = {
      orderString:
        'alipay_root_cert_sn=687b59193f3f462dd5336e5abf83c5d8_02941eef3187dddf3d3b83462e1dfcf6&alipay_sdk=alipay-sdk-java-4.40.8.ALL&app_cert_sn=0848d1cb74666147e7784560c7cdee9c&app_id=2016101102085027&biz_content=%7B%22body%22%3A%22%E8%B7%A8%E8%B6%8A%E9%80%9F%E8%BF%90-%E9%A2%84%E5%AD%98%E8%BF%90%E8%B4%B9%22%2C%22out_trade_no%22%3A%222025082514240650000014495521%22%2C%22subject%22%3A%22%E8%B7%A8%E8%B6%8A%E9%80%9F%E8%BF%90-%E9%A2%84%E5%AD%98%E8%BF%90%E8%B4%B9%22%2C%22timeout_express%22%3A%2230m%22%2C%22total_amount%22%3A%220.01%22%7D&charset=UTF-8&format=json&method=alipay.trade.app.pay&notify_url=https%3A%2F%2Fpay-uat.kye-erp.com%2Fapi%2Ffms%2Fpayment%2Fnotify%2Fali%2Fpay%2F0000668&sign=RPBTkXOY%2FuVywGEmTQjV9yS7J3Pn8nCxBEeBR9uerdKPJhOvOdbzX3yb085MhdCUfDJYuUo%2BVTuob%2BBM89DLr3qz2bmeezN%2Fhk4kr1tAHKPhGoWAnJT%2F%2BMpta3ea4J9CQ9JxbxX2YnNltP%2F2drDFKziGtiM4yQYfGfZ62Ir89ReBOyDG%2FPK4hCILfXGSOeqS1p8NR1YGtWrwZTkMKdE8CBT%2BWVA%2BG00bPzHQ7lTbzM9BsW17d8j4XsR7vClMeztRPc8LpmR6apDQ8Lc5z99K3uotT7Lw1skxgt%2BoUghDWGTC2RwqjBGD8QJFszub0dve4AfYzu9AJ5Kn0aADQJ6pZg%3D%3D&sign_type=RSA2&timestamp=2025-08-25+14%3A24%3A06&version=1.0',
      out_trade_no: 'WEB2025082310242267413065',
    }
    const url = urlContact(targetUrl, params)
    Taro.navigateTo({
      url: url,
    })
  }
  // 安卓-支付宝支付调试
  const handleAppAliPay2 = () => {
    const targetUrl = '/modules/native/pages/appPay/alipay/index'
    const params = {
      orderString:
        'app_id=2015052600090779&biz_content=%7B%22timeout_express%22%3A%2230m%22%2C%22seller_id%22%3A%22%22%2C%22product_code%22%3A%22QUICK_MSECURITY_PAY%22%2C%22total_amount%22%3A%220.02%22%2C%22subject%22%3A%221%22%2C%22body%22%3A%22%E6%88%91%E6%98%AF%E6%B5%8B%E8%AF%95%E6%95%B0%E6%8D%AE%22%2C%22out_trade_no%22%3A%22314VYGIAGG7ZOYY%22%7D&charset=utf-8&method=alipay.trade.app.pay&sign_type=RSA2&timestamp=2016-08-15%2012%3A12%3A15&version=1.0&sign=MsbylYkCzlfYLy9PeRwUUIg9nZPeN9SfXPNavUCroGKR5Kqvx0nEnd3eRmKxJuthNUx4ERCXe552EV9PfwexqW%2B1wbKOdYtDIb4%2B7PL3Pc94RZL0zKaWcaY3tSL89%2FuAVUsQuFqEJdhIukuKygrXucvejOUgTCfoUdwTi7z%2BZzQ%3D',
      out_trade_no: 'WEB2025082310242267413065',
    }
    const url = urlContact(targetUrl, params)
    Taro.navigateTo({
      url: url,
    })
  }

  // 支付宝支付调试 -直接唤起
  const handleAppAliPay3 = () => {
    const params = {
      orderString:
        'alipay_root_cert_sn=687b59193f3f462dd5336e5abf83c5d8_02941eef3187dddf3d3b83462e1dfcf6&alipay_sdk=alipay-sdk-java-4.40.8.ALL&app_cert_sn=0848d1cb74666147e7784560c7cdee9c&app_id=2016101102085027&biz_content=%7B%22body%22%3A%22%E8%B7%A8%E8%B6%8A%E9%80%9F%E8%BF%90-%E9%A2%84%E5%AD%98%E8%BF%90%E8%B4%B9%22%2C%22out_trade_no%22%3A%222025082514240650000014495521%22%2C%22subject%22%3A%22%E8%B7%A8%E8%B6%8A%E9%80%9F%E8%BF%90-%E9%A2%84%E5%AD%98%E8%BF%90%E8%B4%B9%22%2C%22timeout_express%22%3A%2230m%22%2C%22total_amount%22%3A%220.01%22%7D&charset=UTF-8&format=json&method=alipay.trade.app.pay&notify_url=https%3A%2F%2Fpay-uat.kye-erp.com%2Fapi%2Ffms%2Fpayment%2Fnotify%2Fali%2Fpay%2F0000668&sign=RPBTkXOY%2FuVywGEmTQjV9yS7J3Pn8nCxBEeBR9uerdKPJhOvOdbzX3yb085MhdCUfDJYuUo%2BVTuob%2BBM89DLr3qz2bmeezN%2Fhk4kr1tAHKPhGoWAnJT%2F%2BMpta3ea4J9CQ9JxbxX2YnNltP%2F2drDFKziGtiM4yQYfGfZ62Ir89ReBOyDG%2FPK4hCILfXGSOeqS1p8NR1YGtWrwZTkMKdE8CBT%2BWVA%2BG00bPzHQ7lTbzM9BsW17d8j4XsR7vClMeztRPc8LpmR6apDQ8Lc5z99K3uotT7Lw1skxgt%2BoUghDWGTC2RwqjBGD8QJFszub0dve4AfYzu9AJ5Kn0aADQJ6pZg%3D%3D&sign_type=RSA2&timestamp=2025-08-25+14%3A24%3A06&version=1.0',
    }
    AppPlugin.pay?.payAliOrderAsyncWithCallback(params)
  }

  const handleAppUnifyPay = () => {
    const targetUrl = '/modules/native/pages/appPay/unifypay/index'
    const params = {
      channel: 3,
      appScheme: 'iOS:kuayuesuyunpay;Android:kuayuesuyunpay',
      minipath: 'pages/appPay/index/index',
      miniuser: 2019010762862511,
      msgType: 'trade.appPreOrder',
      noncestr: 'YcMzppUxHyyGYLBQnXYnovQhVVtvuhKl',
      package: 'Sign=ALI',
      prepayid: 'ori=39FG2025082314491350000014499767',
      sign: 'HEoFEuiqGuaUPOXqqbbJQsKmhGbwJBfjpsvqTckvwdHYafVMmScjcjvSycsHpeqP',
      timestamp: 20250823144914,
    }
    const url = urlContact(targetUrl, params)
    Taro.navigateTo({
      url: url,
    })
  }

  // 跳转预存运费-支付
  const handleGoFreight = () => {
    const url =
      'https://ic-h5-uat.kye-erp.com/netc-h5-marketing-optimize/deposit-freight-new/0.0.196/deposit-freight.html#/'
    openWebviewH5(url, { needLogin: true })
  }

  const handleAndroidMyAsyncFunc = async () => {
    const params = {
      orderString:
        'app_id=2015052600090779&biz_content=%7B%22timeout_express%22%3A%2230m%22%2C%22seller_id%22%3A%22%22%2C%22product_code%22%3A%22QUICK_MSECURITY_PAY%22%2C%22total_amount%22%3A%220.02%22%2C%22subject%22%3A%221%22%2C%22body%22%3A%22%E6%88%91%E6%98%AF%E6%B5%8B%E8%AF%95%E6%95%B0%E6%8D%AE%22%2C%22out_trade_no%22%3A%22314VYGIAGG7ZOYY%22%7D&charset=utf-8&method=alipay.trade.app.pay&sign_type=RSA2&timestamp=2016-08-15%2012%3A12%3A15&version=1.0&sign=MsbylYkCzlfYLy9PeRwUUIg9nZPeN9SfXPNavUCroGKR5Kqvx0nEnd3eRmKxJuthNUx4ERCXe552EV9PfwexqW%2B1wbKOdYtDIb4%2B7PL3Pc94RZL0zKaWcaY3tSL89%2FuAVUsQuFqEJdhIukuKygrXucvejOUgTCfoUdwTi7z%2BZzQ%3D',
      out_trade_no: 'WEB2025082310242267413065',
    }
    const result = await AppPlugin.push?.payAliOrderAsyncWithCallback(params)
    console.log('[appPlugin]结果 payAliOrderAsyncWithCallback result', result)
  }
  return {
    handleWxAppPay,
    handleWxAppPay2,
    handleAppAliPay,
    handleAppAliPay2,
    handleAppAliPay3,
    handleAppUnifyPay,
    handleGoFreight,
    handleAndroidMyAsyncFunc,
  }
}
