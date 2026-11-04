/**
 * @Desc: types
 * @Date: 2025/8/20
 */

/* 极光消息-返回数据 */
export type PushMsgContentParams = {
  messageId: string // 极光消息id
  extra: string // 极光消息内容
  message: string // 消息消息content
  contentType?: string
  title: string // 极光消息标题
  senderId: string
  appId: string // app bundleId
  platform: string // 平台
}

/* 极光消息-extra json序列化返回数据 */
export type PushMsgExtraModel = {
  msgClass: string
  msgResult: string
}

export type PushMsgResult = {
  title: string
  contInfo: string
  msgRid: string
  userId: string
  dataTime: string
  accessUrl: string
  pushId: string
}
