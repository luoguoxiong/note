import { http } from '@public/utils/request'
import { setEncrypt } from '../../utils'
import axios from 'axios'

import { type AuthDetailResponse } from './type.ts'
const timeout = 10000
const service = axios.create({ timeout })
export type CommonData = Record<string, any>
// 文件中心上传
export const httpFile = (data) => {
  const formData = new FormData()
  Object.keys(data).forEach((key) => {
    formData.append(key, data[key])
  })
  return service({
    url: '/router/upload',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// const appkey = 55262

/** 文件上传 */
export const fileUpload = (params) => {
  return httpFile(params)
}

/** 获取微信jssdk签名 */
// export const getJsSdkSign = (params) => {
//   return http<CommonData>('web.ssoWeChatTool.getJsSdkSign', params)
// }

/** 获取用户基本信息 */
// export const getUserInfo = (params) => {
//   return http<CommonData>('web.ssoUser.getUserInfoByPhone', params)
// }

/** 查询用户认证信息 */
export const getAuthDetail = (params) => {
  return http<AuthDetailResponse>('web.v2.userRealName.getAuthDetail', params)
}

/** 实名认证-校验企业证件 (V1.0) */
export const checkEnterpriseAuth = (params) => {
  return http<CommonData>('bigdata.userRealName.checkEnterpriseAuth', params)
}

/** 校验实名认证 */
// export const checkAuth = (params) => {
//   return http<CommonData>('web.v2.userRealName.checkAuth', params)
// }

/** 用户身份证图片识别 */
export const ocrImgByIdentityCard = (params) => {
  return http<CommonData>('web.v2.userRealName.ocrImgByIdentityCard', params)
}

/** 港澳台居住证图片识别 */
export const ocrImgByGatIdentityCard = (params) => {
  return http<CommonData>('web.userRealName.ocrHmtResidentPermit', params)
}

/** 外国人身份证图片识别 */
export const ocrImgByForeignResidentIdCard = (params) => {
  return http<CommonData>('web.userRealName.ocrImgByForeignResidentIdCard', params)
}

/** 企业认证图片识别 */
export const ocrImgRecognition = (params) => {
  return http<CommonData>('web.v2.userRealName.ocrImgRecognition', params)
}

/** 个人申请实名认证（新增/修改） */
export const applyPersonal = async (params) => {
  params.idCardNo = await setEncrypt(params.idCardNo)
  return http<CommonData>('web.userRealName.applyPersonAuthV2', params, {
    // resolveRes: true,
    headers: { 'X-Risk-Version': 'captcha' },
  })
}

/** 企业申请实名认证（新增/修改） */
export const applyEnterprise = async (params) => {
  params.idCardNo = await setEncrypt(params.idCardNo)
  return http<CommonData>('web.v2.userRealName.applyEnterpriseAuth', params)
}

/** 移动端、客户端取消保存昵称日志 */
// export const insertPermissionLogByCancel = (params) => {
//   return http<CommonData>('web.uam.uamUserPermissionLog.insertPermissionLogByCancel', params)
// }

/** 巴枪实名认证扫码验证 */
export const realNameQrCodeCheck = (params = {}) => {
  return http<CommonData>('web.userRealName.realNameQrCodeCheck', params, { hideToast: true })
}

/** 巴枪实名认证扫码-确认使用当前登录人实名认证信息进行认证 */
export const confirmQrcodeResult = (params = {}) => {
  return http<CommonData>('web.userRealName.confirmQrcodeResult', params)
}

/** 删除实名认证信息 */
export const delPersonRealName = (params = {}) => {
  return http<CommonData>('web.userRealName.delPersonRealName', params)
}

/** 引导用户实名认证check */
export const checkUserStatus = (params = {}) => {
  return http<CommonData>('web.uam.sendRealNameStatus.check', params)
}

/** 区域-菜单-轻应用信息 */
// export const getApplicationInfo = (params) => {
//   return http<CommonData>('web.lightApplication.getApplicationInfo', params)
// }

/** 校验公司全称 */
export const checkCompanyName = (params: CommonData) => {
  return http<CommonData>('web.uam.center.realNameAuth.checkCustomerName', params)
}
