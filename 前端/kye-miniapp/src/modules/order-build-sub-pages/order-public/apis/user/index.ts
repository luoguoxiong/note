import { http } from '@order-public-sub-public/utils/request'
import { loginFromType } from '@order-public-sub-public/constants'
import {
  FeeQuestionnaireParams,
  LogoutTipDataResponse,
  IQuestionnaireData,
} from '@order-public-sub-public/apis/user/types'
import { UserInfo } from './types'
import { lastWaybillInfo, userProfileInfo } from '@order-public-sub-public/types'

/* 查询退登原因 */
export const fetchLogoutTip = (param) => {
  return http<LogoutTipDataResponse>(
    'web.login.logoutTip',
    { ...param, from: loginFromType },
    { unToken: true, hideToast: true },
  )
}

/**
 * @description 获取用户信息
 * @param from
 * @returns
 */
export const getInfo = (from = 6) => {
  return http<UserInfo>('web.ssoUser.getUserInfoByPhoneNew', { from })
}

/**
 * 实名认证状态
 */
export const checkAuth = (params: Record<string, any>) => {
  return http('web.user.userRealName.checkAuth', params, {
    cancelDuplicated: true,
    toast: false,
  })
}

/**
 * 获取公众号关注状态
 */
export const getOfficialSubscribe = (params: Record<string, any>) => {
  return http('web.login.user.getUserInfoByPhone', params, {
    cancelDuplicated: true,
    toast: false,
  })
}

/**
 * 发起下单审核
 */
export const applyOrder = (params: Record<string, any>) => {
  return http('web.order.configOrder.auth.apply', params)
}

/**
 * 上报调价结果
 */
export const uploadAdjustPriceResult = (params: Record<string, any>) => {
  return http('web.order.configOrder.uploadAdjustPriceResult', params, { toast: false })
}

/**
 * 地址推荐选择更新
 */
export const updateSelectStatus = () => {
  return http('web.client.userAddress.updateSelectStatus', { toast: false })
}

/**
 * 获取上次下单信息
 */
export const getLastWaybillDetail = () => {
  return http<lastWaybillInfo>('web.order.configOrder.getLastWaybillDetail')
}

/**
 * 获取用户埋点上报信息
 */
export const getUserProfileInfo = (params: Record<string, any>) => {
  return http<userProfileInfo>('web.ssoUser.getBuriedPointUserInfo', params)
}

/**
 * 上报普通弹框的点击结果
 */
export const reportDialogResult = (params: Record<string, any>) => {
  return http<any>('web.order.configOrder.common.updateBizStatus', params, { toast: false })
}

/**
 * @description 获取轻应用信息
 */
export const getOrderSearchUal = (params: { channelCode: string; menuCodes: string[] }) => {
  return http<any>('web.user.lightApplication.getCustomApplicationList', params, { toast: false })
}

/**
 * @description 费用问卷数据提交
 */
export const feeQuestionAddFeedback = (params: FeeQuestionnaireParams) => {
  return http<any>('web.basic.biz.feedback.user.addFeedback', params, { toast: false })
}

/**
 * @description 查询要不要弹框
 */
export const getCustomerShortInfo = (params: Record<string, any>) => {
  return http<IQuestionnaireData>('web.order.configOrder.checkAlert', params, { toast: false })
}

/**
 * @description 上报语音结果
 */
export const audioReport = (params: Record<string, any>) => {
  return http<any>('web.order.configOrder.common.bizReport', params, { toast: false })
}
