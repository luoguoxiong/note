import { GlobalState } from '@/stores/type'
import { native } from '@kye-netc/micro-native'

export enum NativeEventKeys {
  /** 全局定义的数据发生变更 */
  GlobalStateChange = 'globalState-change',
}

// 通知全局信息发生变更
export const emitGlobalStateChange = (gloalData: GlobalState) => {
  native.emit(NativeEventKeys.GlobalStateChange, gloalData)
}
