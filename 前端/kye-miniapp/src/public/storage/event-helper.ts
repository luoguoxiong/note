import Taro from '@tarojs/taro'

const depsHandles: Record<string, Array<Function>> = {}

const getRouterEventKey = (eventKey: string) => {
  return (Taro.Current.router?.$taroPath || Taro.Current.router?.path || '') + `_${eventKey}`
}

export const wrapRemoveEventListener = (off: Function, key: string) => {
  return (fun?: Function) => {
    if (fun) {
      return off(fun)
    }

    const current = getRouterEventKey(key)

    depsHandles[current]?.forEach((listener) => off(listener))
    delete depsHandles[current]
  }
}

export const wrapAddEventListener = (on: Function, key: string) => {
  return (fun: Function) => {
    const current = getRouterEventKey(key)
    depsHandles[current] = depsHandles[current] || []
    depsHandles[current].push(fun)
    // 调用原始的事件监听注册方法
    return on(fun)
  }
}
