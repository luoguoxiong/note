import { getWechatSharePicture } from '@order-public-sub-public/apis'
import { getEnv, getOnlineH5Url } from '@order-public-sub-public/utils/env'
import { getRealNameUrl } from '@order-public-sub-public/validate/utils'
import Taro from '@tarojs/taro'

/**
 * @description 获取分享的参数
 * @param waybillNumber
 */
export const getShareParams = async (waybillNumber: string) => {
  const { data } = await getWechatSharePicture({ waybillNumber: waybillNumber })
  const wechatSharePicture = data?.picUrl
  const url = `${getOnlineH5Url()}/waybill-share?waybillNo=${waybillNumber}`
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

export const defaultRealNameParams = (senderMobile = '') => {
  const mobile = senderMobile?.replace(/(\d{1})\d{6}(\d{4})/, '$1*****$2') || ''
  const defaultImg = `https://ic-img.ky-express.com/netc/20250524_26163189574_!!1748055438163_840_684.png`
  return {
    title: `邀请寄件人（${mobile}）完成个人实名认证`,
    imageUrl: defaultImg,
    path: `/packages/webview/openWebview?url=https://ic-h5-uat.kye-erp.com/netc-h5-user-optimize/real-name-auth/index.html#/&needLogin=true`,
  }
}

/**
 * @description 获取实名认证分享的参数
 * @param waybillNumber
 * @param senderMobile 寄件人手机号
 */
export const getShareRealNameParams = async (waybillNumber: string, senderMobile: string) => {
  const path = getRealNameUrl({
    waybillNumber,
    isFromShare: true,
  })
  const mobile = senderMobile?.replace(/(\d{1})\d{6}(\d{4})/, '$1*****$2') || ''
  const obj = defaultRealNameParams(mobile)
  const params = {
    ...obj,
    path,
  }
  return params
}

/**
 * 新版app分享功能 使用shareMiniProgramMessage
 */
export const getAppShareRealNameParams = async (waybillNumber: string, senderMobile: string) => {
  const path = getRealNameUrl({
    waybillNumber,
    isFromShare: true,
  })
  const mobile = senderMobile?.replace(/(\d{1})\d{6}(\d{4})/, '$1*****$2') || ''
  const imgUrl = 'https://ic-img.ky-express.com/netc/20250524_26163189574_!!1748055438163_840_684.png'
  const imagePath = await Taro.downloadFile({ url: imgUrl })
  const params = {
    platform: 'weixin',
    contentType: 'miniprogram',
    title: `邀请寄件人（${mobile}）完成个人实名认证`,
    desc: '',
    webpageUrl: imagePath.tempFilePath,
    // 分享小程序相关缩略图，支持代码包图片资源路径或者本地临时、缓存、用户文件；不支持网络图片路径
    imagePath: imagePath.tempFilePath,
    userName: 'gh_e42a21bb8f82', // 小程序原始ID
    path,
    withShareTicket: false,
    miniprogramType: getEnv() === 'PROD' ? 0 : 2, // 小程序版本，0-正式版，1-开发版，2-体验版
    scene: 0, // 发送的目标场景,0=分享到会话，1=分享到朋友圈
  }
  return params
}
