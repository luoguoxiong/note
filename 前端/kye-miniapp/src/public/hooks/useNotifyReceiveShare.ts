import { getWechatSharePicture } from '@/public/apis/order/index'
import Taro from '@tarojs/taro'
import { isWechatEnv, isWxPcAppletEnv } from '@/public/utils'
import { isWeixinAppSync } from '../config'
import { ref } from 'vue'

export const isPROD = process.env.TARO_APP_ENV === 'prod'

/**
 * @description 获取分享的参数
 * @param waybillNumber
 */
export const getShareParams = async (param) => {
  const { waybillNumber, onlineH5Url } = param
  const { data } = await getWechatSharePicture({ waybillNumber: waybillNumber })
  const wechatSharePicture = data?.picUrl
  const url = `${onlineH5Url}/waybill-share?waybillNo=${waybillNumber}`
  const params = {
    platform: 'weixin',
    contentType: 'miniprogram',
    title: '',
    desc: '',
    imgUrl: wechatSharePicture || 'https://ic-h5.kye-erp.com/intro/miniprogram/share_router.png',
    imageUrl: wechatSharePicture || 'https://ic-h5.kye-erp.com/intro/miniprogram/share_router.png', // 兼容小程序分享
    programUserName: 'gh_e42a21bb8f82',
    programPath: `/packages/webview/openWebview?url=${encodeURIComponent(url)}&needLogin=true`,
    programType: 0, // 小程序版本，0-正式版，1-开发版，2-体验版
  }
  return params
}

/**
 * @description 新版app分享 通知收件人
 */
export const getNotifyReceiveShareParams = async (param) => {
  const { waybillNumber, onlineH5Url } = param
  const { data } = await getWechatSharePicture({ waybillNumber: waybillNumber, source: 10 })
  const wechatSharePicture = data?.picUrl
  const url = `${onlineH5Url}/waybill-share?waybillNo=${waybillNumber}`
  const imgUrl = wechatSharePicture || 'https://ic-h5.kye-erp.com/intro/miniprogram/share_router.png'
  const imagePath = await Taro.downloadFile({ url: imgUrl })
  const params = {
    platform: 'weixin',
    contentType: 'miniprogram',
    title: data?.title || '',
    desc: '',
    webpageUrl: imagePath.tempFilePath,
    // 分享小程序相关缩略图，支持代码包图片资源路径或者本地临时、缓存、用户文件；不支持网络图片路径
    imagePath: imagePath.tempFilePath,
    userName: 'gh_e42a21bb8f82',
    path: `/packages/webview/openWebview?url=${encodeURIComponent(url)}&needLogin=true`,
    withShareTicket: false,
    miniprogramType: isPROD ? 0 : 2, // 小程序版本，0-正式版，1-开发版，2-体验版
    scene: 0, // 发送的目标场景,0=分享到会话，1=分享到朋友圈
  }
  console.log('paramsparams', params)
  return params
}

/**
 * @description app唤起原生分享 通知取货人
 * @param param {
 * waybillNumber：运单号
 * onlineH5Url：线上h5地址
 * }
 */
export const getNotifyReceiveShare = async (param) => {
  console.log('getNotifyReceiveShare', param)
  try {
    if (isWeixinAppSync()) {
      Taro.showLoading({ title: '加载中', mask: true })
      const res = await new Promise((success, fail) => {
        wx.miniapp.hasWechatInstall({ success, fail })
      }).catch(() => ({ hasWechatInstall: false }))

      if (res.hasWechatInstall) {
        const shareParams = await getNotifyReceiveShareParams(param)
        try {
          wx.miniapp.shareMiniProgramMessage(shareParams)
        } catch (e) {
          console.error('111111', e)
        }
      } else {
        Taro.showModal({
          title: '温馨提示',
          content: '您的手机还没装微信哦，装好就能愉快使用啦',
          confirmText: '我知道了',
          confirmColor: '#8365F6',
          showCancel: false,
        })
      }
    } else {
      // 微信小程序分享 - 卡片形式
      const shareParams = await getNotifyReceiveShareParams(param)
      window.wx.showShareImageMenu({
        title: shareParams.title,
        imageUrl: shareParams.imagePath,
        path: shareParams.imagePath,
        needShowEntrance: true,
        entrancePath: shareParams.path,
      })
    }
  } catch (error) {
    console.error('error', error)
  } finally {
    Taro.hideLoading()
  }
}

export const notifyReceiveShareWaybill = ref('')

/**
 * 微信小程序分享 通知取货人（分享小程序链接）返回的是微信onShareAppMessage所需参数
 * @param res useShareAppMessage的参数
 * @param param 通知收件人方法
 */
export const getNotifyReceiveShareWx = (res, param) => {
  if (isWechatEnv && ((res.from === 'button' && res.target.id === 'notify_recipient') || param.isPageShare)) {
    const { waybillNumber = notifyReceiveShareWaybill.value, onlineH5Url } = param
    const obj = {
      title: '您的好友分享了一条运单信息 ，货急找跨越，跨省最快8小时',
      imageUrl: 'https://ic-h5.kye-erp.com/intro/miniprogram/share_router.png',
      path: `layout/pages/waybill/index?waybillNo=${waybillNumber}&source=10`,
    }
    const promise = new Promise(async (resolve) => {
      let data = null
      try {
        const result = await getWechatSharePicture({ waybillNumber: waybillNumber, source: 10 })
        data = result.data
      } catch (e) {
        console.log('e', e)
      }
      const url = `${onlineH5Url}/waybill-share?waybillNo=${waybillNumber}`
      const path = `/packages/webview/openWebview?url=${encodeURIComponent(url)}&needLogin=true`
      let imageUrl = data?.picUrl || obj.imageUrl
      if (isWxPcAppletEnv) {
        // 微信pc端 有兼容问题，需要使用本地路径才能展示缩略图
        imageUrl = (await Taro.downloadFile({ url: imageUrl }))?.tempFilePath || imageUrl
      }
      const result = {
        ...obj,
        imageUrl: imageUrl,
        // api有返回路径则使用返回路径，否则使用默认路径
        path: path,
        title: data?.title || obj.title,
      }
      console.log('result', result)
      resolve(result)
    })
    return {
      ...obj,
      promise,
    }
  } else {
    return {}
  }
}
