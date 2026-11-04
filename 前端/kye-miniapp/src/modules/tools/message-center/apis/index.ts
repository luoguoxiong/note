import { http } from '@public/utils/request'
import { UserMessageTypeRes, MsgPreferenceStatusRes, UserMessageListRes } from './types'

/** 用户消息分类列表 (V1.0)*/
export const getUserMessageType = (params) => {
  return http<UserMessageTypeRes[]>('web.advertisement.userMessage.getUserMessageType', params)
}
/** 获取用户消息详情 (V1.0)*/
export const getUserMessageDetail = (params) => {
  return http('web.advertisement.userMessage.getUserMessageDetail', params)
}
/** 用户消息中心-用户消息列表 (V1.0)*/
export const userMessageList = (params) => {
  return http<UserMessageListRes>('web.advertisement.userMessage.pageList', params)
}
/** 用户消息中心-批量删除 (V1.0)*/
export const userMessageBatchDel = (params) => {
  return http('web.advertisement.userMessage.batchDel', params)
}
/** 用户消息中心-分类列表已读上报 (V1.0)*/
export const readStateUpdate = (params) => {
  return http('web.advertisement.userMessage.readStateUpdate', params)
}
/** 用户消息中心-判断个人偏好设置开关状态 (V1.0)*/
export const getMsgPreferenceStatus = () => {
  return http<MsgPreferenceStatusRes>('web.advertisement.userMessage.checkMsgPreferenceStatus')
}

/** 上报用户消息中心数据 (V1.0)*/
export const reportUserMsg = (params) => {
  return http('web.advertisement.userMessage.reportUserMsg', params)
}
