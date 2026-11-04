import { Channel } from '@order-public-sub-public/constants'

// 图片资源（CDN 外链，不占子包体积）
export const ICON_DISMANTLE = 'https://ic-img.ky-express.com/netc/20260928_5397_!!1790577180161_112_112.svg+xml'
export const ICON_ARRIVAL = 'https://ic-img.ky-express.com/netc/20260928_35260_!!1790577198932_112_112.svg+xml'
export const ADVANTAGE_IMG = 'https://ic-img.ky-express.com/netc/20260928_98145_!!1790565219541_1372_1728.webp'

// 撤展/来展入口（顺序：撤展 > 来展），卡片各自带渐变背景与箭头图标
export const ENTRY_LIST = [
  {
    channel: Channel.撤展下单,
    title: '撤展下单',
    desc: '展品离场，省心搞定',
    icon: ICON_DISMANTLE,
    bg: 'linear-gradient(180deg, rgba(242, 239, 254, 1) 0%, rgba(242, 239, 254, 0.48) 100%)',
    arrow: 'https://ic-img.ky-express.com/netc/20260929_9405_!!1790650155853_80_80.png',
  },
  {
    channel: Channel.来展下单,
    title: '来展下单',
    desc: '展品到场，轻松办理',
    icon: ICON_ARRIVAL,
    bg: 'linear-gradient(180deg, rgba(239, 247, 254, 1) 0%, rgba(239, 247, 254, 0.48) 100%)',
    arrow: 'https://ic-img.ky-express.com/netc/20260929_28060_!!1790650169134_80_80.png',
  },
]

// 实名认证跳转参数
export const REALNAME_AUTH_URL =
  '/modules/user/pages/realname/personal/index?forceFlag=10&origin=orderExhibition'
