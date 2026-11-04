import { ENV_TYPE } from '@tarojs/taro'
import { getEnv } from '../device'
import aliPayNative from './aliPayNative'
import wxNative from './wxNative'
import webNative from './webNative'
const native = (parmas: any, webviewId: string) => {
  switch (getEnv()) {
    case ENV_TYPE.ALIPAY:
      aliPayNative(parmas, webviewId)
      break
    case ENV_TYPE.WEAPP:
      wxNative(parmas)
      break
    case ENV_TYPE.WEB:
      webNative(parmas)
      break
  }
}

export default native
