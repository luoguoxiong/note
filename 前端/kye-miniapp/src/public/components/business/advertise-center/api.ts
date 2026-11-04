import { http } from '@public/utils/request'
import * as type from './type'
import { getToken } from '@/public/storage'
import { getGrayHeaderWithApplication } from '@/public/utils'
import { ApplicationCodeMap, AreaCodePlatMap } from '@/public/utils/application/constants'
// 用户操作事件上报 (V1.0)
export const reportEvent = (param: type.IReportEventParam) => {
  if (!getToken()) return
  return http<object>('web.advertisement.event.report', param)
}

export const getRoutePathByChannel = (parmas: type.RouterInfoChannelReq) => {
  return http<type.RouterInfoChannelRes[]>('web.advertisement.getRoutePathByChannel', parmas)
}

// 用户操作事件触发接口 (V1.0)
export const confirmByUserAdv = (param: type.IConfirmByUserAdv) => {
  if (!getToken()) return
  return http<object>('web.advertisement.confirmByUser', param)
}

// 获取广告内容详情 (V1.0)
export const getAdvertisementDetail = (
  param: type.IGetAdvertisementDetailParam,
  options: { unToken?: boolean } = { unToken: false },
) => {
  const grayHeader = getGrayHeaderWithApplication(
    ApplicationCodeMap.广告中心灰度头.areaCode,
    ApplicationCodeMap.广告中心灰度头.menuCode,
  )
  return http<type.IGetAdvertisementDetail[]>('web.advertisement.getDetails', param, {
    hideToast: true,
    unToken: options.unToken,
    extraHeader: grayHeader,
  })
}

// 获取我的页奖励金数量
export const getWithdrawAmount = () => {
  return http<number>('web.withdraw.getWithdrawAmount', {}, { hideToast: true })
}
