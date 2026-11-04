import Taro from '@tarojs/taro'
import { isWxAppAndroidEnv, isWxAppIosEnv, isWxAppOhosEnv } from './device'
import { isPROD } from './env'

interface IOptions {
  title: string
  desc?: string
  webpageUrl?: string
  // 分享小程序相关缩略图，支持代码包图片资源路径或者本地临时、缓存、用户文件；不支持网络图片路径
  imagePath: string
  path?: string
  withShareTicket?: boolean
  scene?: string // 发送的目标场景,0=分享到会话，1=分享到朋友圈
}

// app分享
export const appWxShare = (options: IOptions) => {
  return new Promise(async (resolve, reject) => {
    // 不是app就直接return
    if (!(isWxAppIosEnv || isWxAppAndroidEnv || isWxAppOhosEnv)) {
      reject(false)
      return
    }
    const res = await new Promise((success, fail) => {
      wx.miniapp.hasWechatInstall({ success, fail })
    })

    // 是否安装微信
    if (res?.hasWechatInstall) {
      const { tempFilePath } = await Taro.downloadFile({ url: options.imagePath })
      const shareParams = {
        platform: 'weixin',
        contentType: 'miniprogram',
        userName: 'gh_e42a21bb8f82',
        withShareTicket: true,
        miniprogramType: isPROD ? 0 : 2, // 小程序版本，0-正式版，1-开发版，2-体验版
        scene: 0, // 发送的目标场景,0=分享到会话，1=分享到朋友圈
        success: (res) => {
          console.log('分享成功', res)
          resolve(true)
        },
        fail: (error) => {
          console.log('分享失败', error)
          reject(false)
        },
        ...options,
        imagePath: tempFilePath,
        webpageUrl: tempFilePath,
      }
      wx.miniapp.shareMiniProgramMessage(shareParams)
    } else {
      Taro.showModal({
        title: '温馨提示',
        content: '您的手机还没装微信哦，装好就能愉快使用啦',
        confirmText: '我知道了',
        confirmColor: '#8365F6',
        showCancel: false,
      })
    }
  })
}
