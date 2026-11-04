export interface UserMessageTypeRes {
  creationDate: string
  hasNewMessage: boolean
  imageUrl: string
  isHaveNewMessage: boolean
  label: string
  messageTitle: string
  orderByNumber: number
  unreadCount: number
  value: string
}

export interface MsgPreferenceStatusRes {
  configStatus: number
  guideBtn: string
  guideDesc: string
}

export interface UserMessageListRes {
  page: number
  pageSize: number
  pageTotal: number
  rowTotal: number
  rows: UserMessageListItem[]
}

export interface UserMessageListItem {
  appJumpType: number
  appUrl: string
  businessId: number
  channels: string[]
  confirmType: number
  creationDate: number
  customParams: any
  jumpRestrict: any
  messageContent: string
  messageIcon: string
  messageId: string
  messageIndex: number
  messagePushTime: number
  messageReadState: number
  messageReadTime: any
  messageSerialNumber: string
  messageTitle: string
  messageType: number
  pcH5JumpType: number
  pcJumpType: any
  pcUrl: any
  phone: string
  priority: any
  remark: any
  requestBatchNo: any
  stateType: any
  updatedBy: any
  updationDate: number
  checked: boolean
}
