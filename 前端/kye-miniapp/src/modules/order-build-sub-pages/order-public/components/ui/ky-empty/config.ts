import { EmptyTypeEnum } from '@order-public-sub-public/constants'
import { EmptyConfig } from './types'

export const EMPTY_CONFIGS: Record<Exclude<EmptyTypeEnum, EmptyTypeEnum.CUSTOM>, EmptyConfig> = {
  data: {
    image: 'https://ic-img.ky-express.com/netc/20261009_59536_!!1791545427948_684_684.png',
    description: '暂无数据',
  },
  coupon: {
    image: 'https://ic-img.ky-express.com/netc/20250619_66314_!!1750313112604_560_560.png',
    description: '暂无优惠券',
  },
  address: {
    image: 'https://ic-img.ky-express.com/netc/20250619_5081_!!1750313034323_560_560.png',
    description: '暂无地址',
  },
  waybill: {
    image: 'https://ic-img.ky-express.com/netc/20250619_89975_!!1750313226341_560_560.png',
    description: '暂无运单',
  },
  network: {
    image: 'network',
    description: '网络异常',
  },
  search: {
    image: 'https://ic-img.ky-express.com/netc/20250619_30145_!!1750313197830_560_560.png',
    description: '搜索无结果',
  },
  timeout: {
    image: 'https://ic-img.ky-express.com/netc/20260119_83926_!!1768816244741_280_280.png',
    description: '超时未下单，系统已自动取消',
  },
  nopermission: {
    image: 'https://ic-img.ky-express.com/netc/20260119_49376_!!1768816670864_280_280.png',
    description: '非本人快递，暂无法查看相关信息',
  },
  invite: {
    image: 'https://ic-img.ky-express.com/netc/20260130_96997_!!1769737254191_560_560.png',
    description: '暂无邀请记录',
  },
}

export const DEFAULT_IMAGE_SIZE = 280
