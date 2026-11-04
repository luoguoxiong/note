/**
 * @Desc: types
 * @Date: 2025/8/11
 */
export interface PushPlugin {
  register: (opts?: any) => Promise<any> | void // 推送极光初始化sdk-注册
  registerPushWithCallback: (opts?: any) => Promise<any> | void // 异步注册
  registerPushSync: (listener: (msg: any) => void) => void // 同步注册
  getRegistrationIDSync: (opts?: any) => Promise<any> | void // 极光-获取唯一id
  onMiniPluginEvent: (listener: (msg: any) => void) => void // 极光-消息监听
  offMiniPluginEvent: (listener: (msg: any) => void) => void // 极光-取消消息监听
  resetBadgeSync: (opts: { badge: number }) => void // 极光消息-APP角标更新
  checkPushHandleMessageSync: () => void // 极光消息-APP启动推松消息

  myAsyncFuncwithCallback: (opts?: any) => Promise<any> | void
  mySyncFunc: (opts?: any) => void
}
