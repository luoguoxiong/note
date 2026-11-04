import Taro from '@tarojs/taro'

/**
 * @Desc: webNative web端能力调用
 * @Date: 2025/11/10
 */

type TaroMethod = 'navigateTo' | 'navigateBack' | 'switchTab' | 'reLaunch' | 'redirectTo'

type TaroMethodMap = {
  navigateTo: Taro.navigateTo.Option
  navigateBack: Taro.navigateBack.Option
  switchTab: Taro.switchTab.Option
  reLaunch: Taro.reLaunch.Option
  redirectTo: Taro.redirectTo.Option
}

interface WebNationOptions<M extends TaroMethod = TaroMethod> {
  platform: 'tt'
  method: M
  data?: TaroMethodMap[M]
}

const webNative = <M extends TaroMethod>(options: WebNationOptions<M>) => {
  const { platform, method, data = {} } = options || {}
  // 飞书环境
  if (platform === 'tt') {
    debugger
    if (Taro[method]) {
      Taro[method](data as any) // TS此处知道 data 类型与方法匹配
    } else {
      console.error(`[tt native log][${method}]方法不存在`)
    }
    // switch (method) {
    //   case 'navigateTo':
    //     if (data?.url) {
    //       Taro.navigateTo({ url: data?.url })
    //     }
    //     break
    //   case 'navigateBack':
    //     Taro.navigateBack(data)
    //     break
    //   case 'switchTab':
    //   case 'reLaunch':
    //   case 'redirectTo':
    //     Taro[method](data)
    //     break
    //   default:
    //     break
    // }
  }
}

export default webNative
