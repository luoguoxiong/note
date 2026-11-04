export interface ApiReLoginMsgPushResponse {}

export interface ApiGetRoutePathByChannelResponse {
  pageName: string
  type: 'h5' | 'native' | 'miniProgram'
  url: string
  customParams: any
}
