import { http } from '@public/utils/request'
import {
  CustomerInfoResponseData,
  MergeUserInfoParams,
  MergeUserInfoRes,
  WithdrawResp,
} from '@layout/pages/mine/api/types'

// 获取当前人角色及未审批数量 (V1.0)
export const getApprovalApplyAndWaybillCount = () => {
  return http('web.uam.net.appUser.getUnAuditCountInfo', {}, { hideToast: true })
}

//  获取付款授权角标数量
export const getUnAuthCount = () => {
  return http('web.uam.payAuth.getUnAuthCount', {}, { hideToast: true })
}

// 获取是否有关联绑定权限
export const getAppUserRelationAuth = (params = {}) => {
  return http<any>('web.uam.uamAppUserRelation.getAppUserRelationAuth', params, { hideToast: true })
}

// 用户绑码信息
export const ApiGetCustomerInfo = (params = {}) => {
  return http<CustomerInfoResponseData>('web.wechat.user.getcustomerInfo', params, { hideToast: true })
}

// 我的页面聚合接口
export const getMergeUserInfo = (params: MergeUserInfoParams) => {
  return http<MergeUserInfoRes>('web.mine.page.merge.userInfo', params, { hideToast: true })
}
