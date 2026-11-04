/**
 * 下载入口配置
 * 迁移自: netc-pc-web/src/views/layout/config/download.js
 * 图片资源已复制至 ../images/（require 改为 ESM import）
 */
import kyjjxcx_qrcode from '../images/kyjjxcx_qrcode.png'
import kygzh_qrcode from '../images/kygzh_qrcode.png'
import kylx_qrcode from '../images/kylx_qrcode.png'
import kysyapp from '../images/kysyapp.png'
import ghjs_qrcode from '../images/ghjs_qrcode.png'
import default_qrcodeImg from '../images/default.png'
import khdwyb from '../images/khdwyb.png'
import khjs from '../images/khjs1.png'
import kyjjxcx from '../images/kyjjxcx1.png'
import kylx from '../images/kylx.png'
import kysy_app from '../images/kysy_app1.png'
import kysygzh from '../images/kysygzh.png'
import kyzcxcx from '../images/kyzcxcx1.png'
import kyzcxcx_qrcode from '../images/kyzcxcx_qrcode.png'

const khdbdb = 'https://ic-img.ky-express.com/netc/20260610_22382_!!1781086796325_176_176.png'

export interface DownloadItem {
  title: string
  icon: string
  type: 'qrcode' | 'link' | 'copy' | 'agreement'
  desc?: string
  url?: string
  qrcodeImg?: string
  button?: string
  video?: string
  tip?: string
  method?: string
}

export const webConfig: DownloadItem[] = [
  {
    title: '跨越寄件小程序',
    icon: kyjjxcx,
    type: 'qrcode',
    desc: '微信扫码进入',
    qrcodeImg: kyjjxcx_qrcode,
    button: '复制图片',
  },
  {
    title: '跨越速运APP',
    icon: kysy_app,
    type: 'qrcode',
    desc: '微信扫码进入',
    qrcodeImg: kysyapp,
    // qrcodeImg: kysyapp_test,
    button: '复制图片',
  },
  {
    title: '跨越公众号',
    icon: kysygzh,
    type: 'qrcode',
    desc: '微信扫码进入',
    qrcodeImg: kygzh_qrcode,
    button: '复制图片',
  },
  {
    title: '跨越领鲜',
    icon: kylx,
    type: 'qrcode',
    desc: '微信扫码进入',
    qrcodeImg: kylx_qrcode,
    button: '复制图片',
  },
  {
    title: '客户介绍',
    icon: khjs,
    type: 'qrcode',
    desc: '微信扫码进入',
    qrcodeImg: ghjs_qrcode,
    button: '复制图片',
  },
  {
    title: '跨越本地客户端',
    icon: khdbdb,
    type: 'link',
    desc: '点击图标下载',
    url: 'https://ver1.ky-express.com/DATA/Upgrade/KYEClientSetup-0323.exe',
    qrcodeImg: default_qrcodeImg,
    button: '点击下载',
    video: 'https://kydl.kyslb.com/ic/prd/static/video/pc_client_setting.mp4',
    tip: '操作指引',
  },
  {
    title: '跨越整车',
    icon: kyzcxcx,
    type: 'qrcode',
    desc: '微信扫码进入',
    qrcodeImg: kyzcxcx_qrcode,
    button: '复制图片',
  },
]

export const clientConfig: DownloadItem[] = [
  {
    title: '跨越寄件小程序',
    icon: kyjjxcx,
    type: 'qrcode',
    desc: '微信扫码进入',
    qrcodeImg: kyjjxcx_qrcode,
    button: '复制图片',
  },
  {
    title: '跨越速运APP',
    icon: kysy_app,
    type: 'qrcode',
    desc: '微信扫码进入',
    qrcodeImg: kysyapp,
    // qrcodeImg: kysyapp_test,
    button: '复制图片',
  },
  {
    title: '跨越公众号',
    icon: kysygzh,
    type: 'qrcode',
    desc: '微信扫码进入',
    qrcodeImg: kygzh_qrcode,
    button: '复制图片',
  },
  {
    title: '跨越领鲜',
    icon: kylx,
    type: 'qrcode',
    desc: '微信扫码进入',
    qrcodeImg: kylx_qrcode,
    button: '复制图片',
  },
  {
    title: '客户介绍',
    icon: khjs,
    type: 'qrcode',
    desc: '微信扫码进入',
    qrcodeImg: ghjs_qrcode,
    button: '复制图片',
  },
  {
    title: '客户端网页版',
    icon: khdwyb,
    type: 'copy',
    desc: '点击复制链接',
    url: 'https://uc.ky-express.com/',
    qrcodeImg: default_qrcodeImg,
    button: '复制链接',
  },
  {
    title: '跨越整车',
    icon: kyzcxcx,
    type: 'qrcode',
    desc: '微信扫码进入',
    qrcodeImg: kyzcxcx_qrcode,
    button: '复制图片',
  },
]

export const fileAndAgreementConfig: DownloadItem[] = [
  {
    title: '电子运单契约协议',
    icon: 'https://ic-img.ky-express.com/netc/20231013_59105448891_!!1697190621758_370_370.png',
    type: 'agreement',
    desc: '点击图标下载',
    qrcodeImg: 'https://ic-img.ky-express.com/netc/20231013_59105448891_!!1697190621758_370_370.png',
    button: '点击下载',
    method: '',
  },
]
