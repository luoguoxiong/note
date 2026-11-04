export interface WebSsoUserLogOffIn {
  /**
   * 输入原因
   */
  reason?: string
  /**
   * 注销原因类型 1=手机号更换；2=更换物流公司；3=产品不喜欢；4=其他
   */
  type: number
  /**
   * 来源（跟登陆一致）2：ios，4：安卓，6：小程序，7:PC客户端'
   */
  from: number
}

export type WebSsoUserLogOffOut = object
