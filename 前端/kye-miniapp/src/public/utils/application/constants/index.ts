import { WeappAreaCodeMap, WeappMenuCodeMap } from '@public/utils/application/constants/wx.index'
import { ApliPayAreaCodeMap, AliPayMenuCodeMap } from '@public/utils/application/constants/alipay.index'
import {FsAreaCodeMap,FsMenuCodeMap} from '@/public/utils/application/constants/fs.index';
import { isAliMiniApp, isAmapMiniApp } from '../../device'

export type WeappAreaCodeMapType = typeof WeappAreaCodeMap
export type WeappMenuCodeMapType = typeof WeappMenuCodeMap
export type ApliPayAreaCodeMapType = typeof ApliPayAreaCodeMap
export type AliPayMenuCodeMapType = typeof AliPayMenuCodeMap
export type FsAreaCodeMapType = typeof FsAreaCodeMap
export type FsMenuCodeMapType = typeof FsMenuCodeMap

// 渠道类型
export enum ChannelCodeType {
  alipay = 'alipayMini',
  weapp = 'wechatApplet',
  lark = 'lark'
}

export let AreaCodePlatMap: WeappAreaCodeMapType | ApliPayAreaCodeMapType | FsAreaCodeMapType
export let MenuCodeMap: WeappMenuCodeMapType | AliPayMenuCodeMapType | FsMenuCodeMapType

export let ChannelCodePlat = ChannelCodeType.weapp
if (process.env.TARO_ENV === 'weapp') {
  AreaCodePlatMap = WeappAreaCodeMap
  ChannelCodePlat = ChannelCodeType[process.env.TARO_ENV]
  MenuCodeMap = WeappMenuCodeMap
} else if (process.env.TARO_ENV === 'alipay') {
  AreaCodePlatMap = ApliPayAreaCodeMap
  ChannelCodePlat = ChannelCodeType[process.env.TARO_ENV]
  MenuCodeMap = AliPayMenuCodeMap
} else {
  AreaCodePlatMap = FsAreaCodeMap
  MenuCodeMap = FsMenuCodeMap
  ChannelCodePlat = ChannelCodeType.lark
}

// 所有轻应用区域，wx、alipay文件单独维护
export const defaultApplicationAll = Object.values(AreaCodePlatMap)

// 默认轻应用渠道
export const defaultChannelCode = ChannelCodePlat

export const menuCodeMap = MenuCodeMap

/* 轻应用列表code map */
export const ApplicationCodeMap = {
  ['绑码组件']: {
    areaCode: AreaCodePlatMap['绑码组件'],
    menuCode: MenuCodeMap['绑码组件'],
  },
  ['地址簿']: {
    areaCode: AreaCodePlatMap['我的-常用功能新'],
    menuCode: MenuCodeMap['地址簿'],
  },
  ['实名认证']: {
    areaCode: AreaCodePlatMap['我的-常用功能新'],
    menuCode: MenuCodeMap['实名认证'],
  },
  ['账号权限']: {
    areaCode: AreaCodePlatMap['我的-常用功能新'],
    menuCode: MenuCodeMap['账号权限'],
  },
  ['申请客户编码']: {
    areaCode: AreaCodePlatMap['用户通用H5'],
    menuCode: MenuCodeMap['申请客户编码'],
  },
  ['首页CMS跳转']: {
    areaCode: AreaCodePlatMap['首页-通用跳转'],
    menuCode: MenuCodeMap['首页-关于跨越'],
  },
  ['首页搜索']: {
    areaCode: AreaCodePlatMap['首页-通用跳转'],
    menuCode: MenuCodeMap['首页-搜索'],
  },
  ['首页消息中心']: {
    areaCode: AreaCodePlatMap['首页-通用跳转'],
    menuCode: MenuCodeMap['首页-消息中心'],
  },
  ['首页轻应用编辑']: {
    areaCode: AreaCodePlatMap['首页-通用跳转'],
    menuCode: MenuCodeMap['首页轻应用编辑'],
  },
  ['首页-付款授权']: {
    areaCode: AreaCodePlatMap['首页-通用跳转'],
    menuCode: MenuCodeMap['首页-付款授权'],
  },
  ['首页-调价审核-详情']: {
    areaCode: AreaCodePlatMap['首页-通用跳转'],
    menuCode: MenuCodeMap['首页-调价审核-详情'],
  },
  ['首页-调价审核-列表']: {
    areaCode: AreaCodePlatMap['首页-通用跳转'],
    menuCode: MenuCodeMap['首页-调价审核-列表'],
  },
  ['首页-权限审批']: {
    areaCode: AreaCodePlatMap['首页-通用跳转'],
    menuCode: MenuCodeMap['首页-权限审批'],
  },
  ['首页-申请专属商务']: {
    areaCode: AreaCodePlatMap['首页-通用跳转'],
    menuCode: MenuCodeMap['首页-申请专属商务'],
  },
  ['首页-优惠券']: {
    areaCode: AreaCodePlatMap['首页-通用跳转'],
    menuCode: MenuCodeMap['首页-优惠券'],
  },
  ['唯品会订单-查看列表']: {
    areaCode: AreaCodePlatMap['首页-通用跳转'],
    menuCode: MenuCodeMap['唯品会订单-查看列表'],
  },
  ['唯品会订单-查看详情']: {
    areaCode: AreaCodePlatMap['首页-通用跳转'],
    menuCode: MenuCodeMap['唯品会订单-查看详情'],
  },
  ['首页-预约司机取货']: {
    areaCode: AreaCodePlatMap['首页-通用跳转'],
    menuCode: MenuCodeMap['首页-预约司机取货'],
  },
  ['用户-切换登录手机号']: {
    areaCode: AreaCodePlatMap['用户通用H5'],
    menuCode: MenuCodeMap['用户-切换登录手机号'],
  },
  ['用户-密码设置']: {
    areaCode: AreaCodePlatMap['用户通用H5'],
    menuCode: MenuCodeMap['用户-密码设置'],
  },
  ['用户-密码修改']: {
    areaCode: AreaCodePlatMap['用户通用H5'],
    menuCode: MenuCodeMap['用户-密码修改'],
  },
  ['用户-注销账号']: {
    areaCode: AreaCodePlatMap['用户通用H5'],
    menuCode: MenuCodeMap['用户-注销账号'],
  },
  ['用户-职务编辑']: {
    areaCode: AreaCodePlatMap['首页-通用跳转'],
    menuCode: MenuCodeMap['用户-职务编辑'],
  },
  ['首页-积分']: {
    areaCode: AreaCodePlatMap['首页-营销区'],
    menuCode: MenuCodeMap['首页-积分签到'],
  },
  ['联系商务-虚拟号实名认证']: {
    areaCode: AreaCodePlatMap['特殊区域'],
    menuCode: MenuCodeMap['虚拟号-实名认证'],
  },
  ['我的-奖励金']: {
    areaCode: (isAliMiniApp || isAmapMiniApp) ? AreaCodePlatMap['我的-营销区一'] : AreaCodePlatMap['我的-常用功能新'],
    menuCode: MenuCodeMap['我的-奖励金'],
  },
  ['广告中心灰度头']: {
    areaCode: AreaCodePlatMap['首页-通用跳转'],
    menuCode: MenuCodeMap['广告中心灰度'],
  },
}

export type ApplicationCodeMapType = keyof typeof ApplicationCodeMap

export enum ApplicationGrayType {
  '是' = 10,
  '否' = 20,
}
