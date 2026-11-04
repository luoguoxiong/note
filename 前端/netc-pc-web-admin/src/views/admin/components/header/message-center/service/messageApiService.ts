/**
 * messageApiService 消息中心接口层
 * 来源:
 *  - netc-pc-web/src/services/api/messageCenterApi.js (headerUrl 原样作为 apiCode)
 *  - netc-pc-web/src/views/message-center-entry/service/messageApiService.js
 *
 * 差异说明:
 *  - 老请求层 code!==0 仍 resolve, 新请求层 reject;
 *    此处 catch 后原样返回, 保证调用方 `res.code === 0` 判断行为与老项目一致
 */
import { http } from '@/utils/request/request'
import type { HttpOptions } from '@/utils/types'

/** 旧基座统一响应结构 */
export interface LegacyResponse<T = any> {
  code: number
  data: T
  msg?: string
  [key: string]: any
}

/** 旧请求封装(hideErrMsg -> toast:false) */
const req = async <T = any>(
  apiCode: string,
  data: Record<string, any> = {},
  hideErrMsg = false
): Promise<LegacyResponse<T>> => {
  try {
    return (await http<T>(apiCode, data, {
      retryCount: 0,
      ...(hideErrMsg ? ({ toast: false } as HttpOptions) : {}),
    })) as LegacyResponse<T>
  } catch (e) {
    // 新请求层 code!==0 / 网络异常 reject; 老项目此时 resolve 并由调用方判断 code,
    // 这里把 reject 值原样返回, 维持老项目行为(调用方 res.code === 0 不成立则跳过)
    return e as LegacyResponse<T>
  }
}

/** 消息中心行数据 */
export interface MessageRow {
  messageTitle: string
  messageContent: string
  messagePushTime: string
  messageSerialNumber: string
  messageType: number | string
  messageReadState?: number
  /** 跳转限制，1：仅移动端跳转，2：仅PC端跳转，其他：无限制 */
  jumpRestrict?: number
  /** pc端跳转类型 0=不跳转；1=h5；2=原生；3=外部小程序；4=调接口 */
  pcJumpType?: number
  appJumpType?: number
  pcH5JumpType?: number
  pcUrl?: string
  appUrl?: string
  customParams?: string
  [key: string]: any
}

/** 消息分类 tab */
export interface MessageTypeItem {
  label: string
  value: string | number
  hasNewMessage: boolean
  isHaveNewMessage?: boolean
  unreadCount?: number
}

/** 消息中心接口(旧 messageCenterApi.js) */
export const messageCenterApi = {
  /** 用户消息中心-用户消息列表（出参（新增字段）：展示渠道） */
  userMessage_pageList(params: Record<string, any> = {}) {
    return req('web.advertisement.userMessage.pageList', params)
  },

  /** 用户消息中心-未读消息数 (不传渠道即总未读) */
  userMessage_getUnreadCount(params: Record<string, any> = {}) {
    return req('web.advertisement.userMessage.getUnreadCount', params, true)
  },

  /** 用户消息中心-用户消息分类列表，出参（新增字段）：未读消息数字段 */
  userMessage_getUserMessageType(params: Record<string, any> = {}) {
    return req('web.advertisement.userMessage.getUserMessageType', params)
  },

  /** 用户消息中心-分类列表已读上报 */
  userMessage_readStateUpdate(params: Record<string, any> = {}) {
    return req('web.advertisement.userMessage.readStateUpdate', params, true)
  },

  /** 用户消息中心-批量删除 */
  userMessage_batchDel(params: Record<string, any> = {}) {
    return req('web.advertisement.userMessage.batchDel', params)
  },

  /** 用户消息中心-获取用户消息详情 */
  userMessage_getUserMessageDetail(params: Record<string, any> = {}) {
    return req('web.advertisement.userMessage.getUserMessageDetail', params)
  },

  /** 用户消息中心-上报用户数据 */
  userMessage_reportUserMsg(params: Record<string, any> = {}) {
    return req('web.advertisement.userMessage.reportUserMsg', params)
  },
}

class MessageApiService {
  /**
   * 新消息最大值显示
   */
  messageLimitView(value: number | string = ''): number | string {
    return Number(value) > 99 ? '99+' : value
  }

  /**
   * 用户消息中心-分类列表已读上报 (V1.0)
   */
  userMessage_readStateUpdate(messageParams: Record<string, any> = {}) {
    const params = {
      type: 10,
      channelCode: 'pc',
      ...messageParams,
    }
    return messageCenterApi.userMessage_readStateUpdate(params)
  }
}

const messageApiService = new MessageApiService()

export default messageApiService
