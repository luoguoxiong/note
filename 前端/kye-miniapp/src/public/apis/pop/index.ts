import { Any } from '@/public/utils/types'
import { http } from '@public/utils/request'
import { getOrderGrayHeader } from '@/public/utils/grayHeader/order'

/** 催派结果查询 */
export const waybillRemind = (params = {}) => {
  params.remindSource = 90
  return http<{ waybillNumber: string; remindType: string; clientType: number }>('web.query.waybill.remind', params, {
    appkey: 55262,
  })
}

/** 催派结果查询 */
export const waybillRemindNew = (params: Any = {}) => {
  params.remindSource = 90
  return http<{ remindResultType: number; note: string; guideOperationType: number; message: string }>(
    'web.query.waybill.remindNew',
    params,
    {
      appkey: 55262,
      extraHeader: {
        ...getOrderGrayHeader(),
      },
    },
  )
}

/** 展位信息 */
export const getExhibitionList = (params = {}) => {
  return http<{
    /** 展会信息 */
    exhibitionInfos: {
      /** 会展中心编码 */
      exhibitionCode: string
      /** 展馆号 */
      exhibitionNumber: string
    }[]
    /** 是否必填 */
    required: boolean
  }>('web.query.waybill.queryPickupExhibition', params, { appkey: 55262 })
}

/** 更新收件地址展馆信息 (V1.0)  */
export const setExhibitionList = (params = {}) => {
  return http<boolean>('web.query.waybill.updatePickupExhibition', params, { appkey: 55262 })
}

/** 设置展位信息 */
export const vaildSensitiveWord = (params = {}) => {
  return http('web.order.help.vaildSensitiveWord', params, { appkey: 55262 })
}

/** 设置代收信息 */
export const updateProxyPickupInfo = (params = {}) => {
  return http<{
    /** 代收人信息校验是否通过，1为成功，0为失败，会有对应的错误提示信息（只有新增或修改的场景值有效） */
    passStatus: number
    /** 是否转异步，0否，1是（目前是多票操作会异步，单票操作固定为同步） */
    asyncFlag: number
    /** 任务ID（如果转异步，会返回） */
    taskId: string
    /** 修改总数（转异步情况下，值不返回，需要异步轮询拿结果） */
    totalNum: number
    /** 成功票数（转异步情况下，值不返回，需要异步轮询拿结果） */
    successNum: number
    /** 是否还有更多其他的可添加或编辑的运单，0为否，1为是（单票操作的时候返回） */
    hasAnyMore: number
    /** 失败消息（对象数组） */
    failedMessages: {
      /** 校验失败的字段，目前有proxyPickupPerson、proxyPickupMobile两个字段（表示对应代收人信息对应字段的错误提示） */
      field: string
      /** 字段校验失败的提示内容 */
      message: string
    }[]
  }>('web.query.waybill.batchUpdateProxyPickupInfo', params, { appkey: 55262, hideToast: true })
}

/** 轮训拿代收结果 */
export const getProxyPickupInfoResult = (params = {}) => {
  return http<{
    /** 是否继续轮询，0为否，1为是 */
    continueLoop: number
    /** 任务ID（如果转异步，会返回） */
    taskId: string
    /** 修改总数（转异步情况下，值不返回，需要异步轮询拿结果） */
    totalNum: number
    /** 成功票数（转异步情况下，值不返回，需要异步轮询拿结果） */
    successNum: number
  }>('web.query.waybill.batchUpdateProxyPickupInfoResult', params, { appkey: 55262 })
}

export interface IQueryProxyPickupRecords {
  /** 修改内容 */
  content: string
  /** 操作时间，格式yyyy-MM-dd HHmm */
  operateTime: string
  /** 操作手机号码 */
  operateMobile: string
  /** 操作说明 */
  operateDesc: string
}
/** 查询代收信息更新记录 (V1.0) */
export const queryProxyPickupRecords = (params = {}) => {
  return http<{
    /** 总行数 */
    rowTotal: number
    /** 总页数 */
    pageTotal: number
    /** 当前页 */
    page: number
    /** 当前页大小 */
    pageSize: number
    /** 数据列表 */
    rows: IQueryProxyPickupRecords[]
  }>('web.query.waybill.queryUpdateProxyPickupRecords', params, { appkey: 55262 })
}
