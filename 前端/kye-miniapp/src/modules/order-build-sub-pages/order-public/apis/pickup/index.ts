// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import { http } from '@order-public-sub-public/utils/request'
import {
  pickupMaterialConfigData,
  pickupMaterialConfigParam,
  recommendContactData,
  recommendContactParam,
  deleteRecommendContactParam,
  pickupOcrParams,
  pickupOcrData,
  deleteFileParams,
  deleteFileData,
  fileType,
  getFileByMultiBizCodeAndBizIdParams,
  SetOrderFileTagParams,
} from '@order-public-sub-public/apis/pickup/type'
import axios from 'axios'
import { isLocalUseIp, RequestBaseUrl, RequestBaseUrlAngle } from '@order-public-sub-public/utils/env'
import { getToken } from '@order-public-sub-public/utils/auth'
import { getChannel } from '@order-public-sub-public/configs'
import { getEnvConfig } from '@/public/config'
import Taro from '@tarojs/taro'

/**
 * 获取取货联系人历史记录
 * @param params
 * @returns
 */
export const getRecommendContact = (params?: recommendContactParam) => {
  return http<recommendContactData>('web.order.configOrder.getPickupContactInfo', params, { toast: false })
}
/**
 * 删除、清空取货联系人
 * @param params
 * @returns
 */
export const deletePickupContactInfo = (params?: deleteRecommendContactParam) => {
  return http<recommendContactData>('web.order.configOrder.deletePickupContactInfo', params)
}

/**
 * 获取派货资料配置信息
 * @param params
 * @returns
 */
export const getPickupMaterialConfig = (params?: pickupMaterialConfigParam, waybillId: string, extPrams = {}) => {
  return http<pickupMaterialConfigData>(
    'web.order.pickupMaterialConfig.get',
    { ...params, waybillId, channel: getChannel() ?? '', ...extPrams },
    { toast: false },
  )
}

/**
 * 文件初始化接口
 * @param params
 * @returns
 */
export const initConfig = (params?: initConfigParams) => {
  return http<initConfigResponse>('web.order.configOrder.material.initConfig', params, {
    toast: false,
  })
}

/**
 * 文件确认提交接口
 * @param params
 * @returns
 */
export const submitFile = (params?: materialList) => {
  return http('web.order.configOrder.material.submit', params, {
    toast: false,
  })
}

/**
 * 查件场景取货资料提交（更新取货/货物照片标记）
 * @param params
 * @returns
 */
export const setOrderFileTag = (params: SetOrderFileTagParams) => {
  return http('web.order.waybill.updatePickupFiles', params, {
    toast: false,
  })
}

/**
 * 获取取货和派货资料历史记录
 * @param params
 * @returns
 */
export const getFileByMultiBizCodeAndBizId = (params?: getFileByMultiBizCodeAndBizIdParams) => {
  if (params.list && params.list[0] && !params.list[0].bizId) {
    return { data: [] }
  }
  return http<fileType[]>('web.order.configOrder.material.getFiles', params, {
    toast: false,
  })
}

/**
 * 智能解析派货资料文本
 * @param params
 * @returns
 */
export const pickupOcr = (params?: pickupOcrParams) => {
  return http<pickupOcrData>('web.order.deliveryMaterial.analysis', params)
}
/**
 * 删除文件
 * @param params
 * @returns
 */
export const deleteFile = (params?: deleteFileParams) => {
  return http<deleteFileData>('web.order.configOrder.material.delete', params)
}
/* eslint-disable */
/**
 * 文件上传
 * @deprecated
 */
const timeout = 10000
const service = axios.create({ timeout })
export const httpFile = async (data) => {
  delete data.base64
  delete data.fileType
  delete data.fileName
  const formData = new FormData()
  Object.keys(data).forEach((key) => {
    formData.append(key, data[key])
  })
  const headers = {
    // 跨越速运_APP x-from:111 跨越寄件_微信小程序 x-from:114
    'Content-Type': 'multipart/form-data',
  }

  if (!isLocalUseIp) {
    headers['x-from'] = getEnvConfig().xForm
  }

  return service({
    url: `${RequestBaseUrl}/router/upload`,
    method: 'POST',
    data: formData,
    headers,
  })
}
// 电子回单角度校验
export const httpFileAngle = async (data) => {
  const token = await getToken()
  data.token = token
  data.token_from = getEnvConfig().xForm
  const formData = {}
  const headers = {
    // 跨越速运_APP x-from:111 跨越寄件_微信小程序 x-from:114
    'Content-Type': 'multipart/form-data',
  }
  if (data.path?.indexOf('http') !== -1) {
    const res = await Taro.downloadFile({
      url: data.path,
    })
    data.path = res.tempFilePath
  }
  const uploadRes = await Taro.uploadFile({
    url: `${RequestBaseUrlAngle}/openapi_ai/img_txt_angle_reg`,
    filePath: data.path,
    name: 'file',
    method: 'POST',
    formData: data,
    headers,
  })
  return JSON.parse(uploadRes.data)
}
export const fileUpload = (params) => {
  return httpFile(params)
}
/* eslint-disable */
