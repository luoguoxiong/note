import { ENV_TYPE } from '@tarojs/taro'
import { getEnv } from '../device'
import aliPayNative from './aliPayNative'
import wxNative from './wxNative'
const native = (parmas: any, webviewId: string) => {
  switch (getEnv()) {
    case ENV_TYPE.ALIPAY:
      aliPayNative(parmas, webviewId)
      break
    case ENV_TYPE.WEAPP:
      wxNative(parmas)
  }
}

export default native
