/* 打印相关接口 */
import { http } from '@order-public-sub-public/utils/request'
import {
  getSimpleWaybillInfoResultResponse,
  getPrintSettingResultResponse,
  createPrintTaskResultResponse,
  getAsyncPrintDataResultResponse,
  getAsyncPrintTaskFinishResponse,
  getAsyncPrintTaskFinishParams,
  getAsyncRetryPrintTaskParams,
  getPrintPreviewResponse,
  getWaybillLinkParams,
  getWaybillLinkResponse,
  getPrintRecordsParams,
  getPrintRecordsResponse,
  waybillSearchWebParams,
  searchStatisticsParams,
} from './types'

/**
 * @description 获取移动端打印跟踪号
 */
export const getPrintTraceToken = async (params: any) => {
  return http<string>('web.print.getPrintTraceToken', params)
}
/**
 * @description 是否是字母单
 */
export const getSimpleWaybillInfo = async (params: any) => {
  return http<getSimpleWaybillInfoResultResponse[]>('web.print.getMobileSimpleWaybillInfo', params)
}
/**
 * @description 获取打印机配置
 */
export const getPrintSetting = async (params: any) => {
  return http<getPrintSettingResultResponse>('web.print.getPrintSetting', params)
}
/**
 * @description 更新打印机配置
 */
export const updatePrintSetting = async (params: any) => {
  return http('web.print.updatePrintSetting', params)
}
/**
 * @description 创建打印任务
 */
export const createPrintTask = async (params: any) => {
  return http<createPrintTaskResultResponse>('web.print.createPrintTask', params)
}
/**
 * @description 获取打印数据接口
 */
export const getAsyncPrintData = async (params: any) => {
  return http<getAsyncPrintDataResultResponse>('web.print.getAsyncPrintData', params)
}

/**
 * @description 获取打印结果
 */
export const getPrintTaskFinishResult = async (params: getAsyncPrintTaskFinishParams) => {
  return http<getAsyncPrintTaskFinishResponse>('web.print.getPrintTaskFinishResult', params)
}

/**
 * @description 失败单据重新打印
 */
export const getRetryPrintTask = async (params: getAsyncRetryPrintTaskParams) => {
  return http<createPrintTaskResultResponse>('web.print.retryPrintTask', params)
}

/**
 * @description 获取打印预览
 */
export const getPrintPreviewList = async (params: any) => {
  return http<getPrintPreviewResponse>('web.print.printPreview', params)
}

/**
 * @description 检索运单
 */
export const getWaybillLinkList = async (params: getWaybillLinkParams) => {
  return http<getWaybillLinkResponse[]>('web.query.waybill.getWaybillLink', params)
}
/**
 * @description 打印记录
 */
export const getPrintRecordsList = async (params: getPrintRecordsParams) => {
  return http<getPrintRecordsResponse>('web.print.getPrintRecords', params)
}

/**
 * @description 绑定打印机
 */
export const setBindPrinter = async (params: any) => {
  return http<getPrintRecordsResponse>('web.print.usePrinter', params)
}

/**
 * @description 批量打印查询列表接口
 */
export const waybillSearchWeb = async (params: any) => {
  return http<waybillSearchWebParams>('web.query.waybill.searchWeb', params)
}

/**
 * @description 批量打印查询列表tab数量
 */
export const waybillSearchStatistics = async (params: any) => {
  return http<searchStatisticsParams>('web.query.waybill.searchStatistics', params)
}

/**
 * @description 收寄件人部门联想接口
 */
export const linkDepartmentNameAndCode = async (params: any) => {
  return http<any>('web.query.waybill.linkDepartmentNameAndCode', params)
}

/**
 * @description 自定义编码联想
 */
export const getWaybillLink = async (params: any) => {
  return http<any>('web.query.waybill.getWaybillLink', params)
}

/**
 * @description 是否绑码查询
 */
export const getUserInfoByPhoneNew = async (params: any) => {
  return http<any>('web.ssoUser.getUserInfoByPhoneNew', params)
}

/**
 * @description 一年运单权限查询
 */
export const getPermission = async (params: any) => {
  return http<waybillSearchWebParams>('web.uam.net.permission.listByPhone', params)
}

/**
 * @description 获取收、寄件人部门placeholder
 */
export const getDepartmentFilterName = async (params: any) => {
  return http<any>('web.query.waybill.getDepartmentFilterName', params)
}

/**
 * @description 创建待打印单号队列
 */
export const createPrintingWaybillQueue = async (params: any) => {
  return http<any>('web.print.waybill.createPrintingWaybillQueue', params)
}

/**
 * @description 获取待打印运单号
 */
export const listPrintingWaybillQueue = async (params: any) => {
  return http<any>('web.print.waybill.listPrintingWaybillQueue', params)
}

/**
 * @description 云打印创建任务
 */
export const createMobileCloudPrint = async (params: any) => {
  return http<any>('web.print.core.waybill.mobileCloudPrint', params)
}

/**
 * @description 轮询云打印状态
 */
export const getCloundPrintStatus = (params: any) => {
  return http<any>('web.print.core.waybill.getTaskStatus', params)
}

/**
 * @description 轮询云打印状态
 */
export const getBindingCloundPrintStatus = (params: any) => {
  return http<any>('web.print.core.printer.getBindingPrinter', params)
}

/**
 * @description 蓝牙打印-获取异步打印处理数据(轮询接口) (V1.0)
 */
export const getAsyncPrintDataByPage = (params: any) => {
  return http<any>('web.print.getAsyncPrintDataByPage', params)
}

/**
 * @description 蓝牙打印上报日志
 */
export const uploadPrintLog = (params: any) => {
  return http<any>('web.print.uploadPrintLog', params)
}
