import { http } from '@public/utils/request'
import { VisitItem, VisitStat, VisitCallPhone } from '../visitor/types'

export const getUploadSignature = (param: any) => {
  return http<any>('web.activity.businessCard.vod.getUploadSignature', param)
}

export const publishMiniProGramProcess = (param: any) => {
  return http<any>('web.activity.businessCard.vod.publishMiniProGramProcess', param)
}

export const getDetailForEmployee = (param: any) => {
  return http<any>('web.activity.businessCard.getDetailForEmployee', param, {
    isAllErrBack: true,
    hideToast: true,
    retryCount: 0,
    timeout: 15000,
    unToken: false,
  })
}

export const editProfileVideo = (param: any) => {
  return http<any>('web.activity.businessCard.editProfileVideo', param)
}

export const getDetail = (param: any) => {
  return http<any>('web.activity.businessCard.getDetail', param)
}

export const menuEdit = (param: any) => {
  return http<any>('web.activity.businessCard.menuEdit', param)
}

export const videoLike = (param: any) => {
  return http<any>('web.activity.businessCard.videoLike', param)
}

export const getAllInfoInIndex = (param: any) => {
  return http<any>('web.activity.businessCard.getDetail', param)
}

export const callSalePhone = (param: any) => {
  return http<any>('web.activity.businessCard.callSalePhone', param)
}

export const saveCustomer = (param: any) => {
  return http<any>('web.activity.businessCard.saveCustomer', param)
}

export const getLngLatAround = (param: any) => {
  return http<any>('web.activity.businessCard.lngLatAround', param)
}

export const idcardEdit = (param: any) => {
  return http<any>('web.activity.businessCard.edit', param)
}

export const editIdcardContent = (param: any) => {
  return http<any>('web.activity.businessCard.contentEdit', param)
}

export const getQrCodeImg = (param: any) => {
  return http<any>('web.activity.businessCard.getSaleQrCode', param)
}

/** 地址解析 */
export const analysis = (param: any) => {
  return http<any>('web.address.star.quickAnalysisAddress', param)
}

export const getMultiLevelSubList = (param: any) => {
  return http<any>('web.basicBiz.address.getMultiLevelSubList', param)
}

export const jobList = (param = {}) => {
  return http<any>('web.activity.businessCard.situationList', param)
}

export const uploadAvatarUrlApi = (params) => {
  return http<any>('web.user.head.uploadImg', params)
}

export const recoverDutyApi = (params) => {
  return http<any>('web.activity.recover.default.duty', params)
}

export const getCompanyAddressList = (params) => {
  return http<any>('web.activity.businessCard.companyAddress.list', params)
}

/**
 * 访客统计数据
 */
export const getVisitStat = (params) => {
  return http<VisitStat>('web.activity.businessCard.visit.stat', params)
}

/**
 * 我的访客列表
 */
export const getVisitList = (params) => {
  return http<VisitItem[]>('web.activity.businessCard.visit.list', params)
}

/**
 * 访客标识
 */
export const getVisitFlag = (params) => {
  return http<boolean>('web.activity.businessCard.visit.flag', params)
}

/**
 * 获取拨打访客虚拟号码
 */
export const getVisitVirtualPhone = (params) => {
  return http<VisitCallPhone>('web.activity.businessCard.callVisitPhone', params)
}
