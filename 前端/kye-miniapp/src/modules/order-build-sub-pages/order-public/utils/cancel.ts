/** 以下接口不会被cancelToken在路由切换的场景中被取消 （例：常规下单跳转戈壁下单） */

import { ChangeKeys } from '@order-public-sub-public/types'
import { ref } from 'vue'
import { pendingAjax } from './request'

/** 大部分是一些全局接口 */
export const cancelWhiteList = [
  'web.order.verification.config',
  'web.ssoUser.getUserInfoByPhoneNew',
  'web.ssoWeChatTool.getJsSdkSign',
  'web.ssoUser.getBuriedPointUserInfo',
]

// 过程中接口不能被cancel的elementChange key
export const elementsChangeWhiteList = ['protectPrice.declarativeValue']

// 当前的elementsChange
export const currentElementsChange = ref(new Set<string>())

// 待消费的elementsChange
export const elementsChange = ref(new Set<string>())

const IGNORE_ELEMENTS = ['init', 'waybill', '', 'returnWaybillEnd', null]

/**
 * @description 噶接口通用函数，不传就全部取消
 * @param api
 */
export const cancelApi = (api?: string) => {
  if (!api) {
    pendingAjax.forEach((cancel) => {
      cancel?.()
    })
  }

  const cancel = pendingAjax.get(api)
  if (cancel) {
    cancel(api)
    pendingAjax.delete(api)
  }
}

/**
 * @description 过程中接口开始的操作
 * @param changeKeys
 */
export const beforeProcess = (changeKeys: ChangeKeys[]) => {
  // 将changeKeys添加到当前set
  for (const key of changeKeys) {
    if (!IGNORE_ELEMENTS.includes(key)) {
      currentElementsChange.value.add(key)
    }
  }

  //将当前set添加到elementsChange
  currentElementsChange.value.forEach((key) => elementsChange.value.add(key))

  // console.log('process开始了，当前changeKeys和elementsChange: ', changeKeys, elementsChange.value)

  return Array.from(elementsChange.value) as ChangeKeys[]
}

/**
 * @description 过程中接口成功结束的操作，删除掉已被消费的key
 */
export const afterProcess = (changeKeys: ChangeKeys[]) => {
  console.log('process结束了，当前changeKeys和elementsChange: ', changeKeys, elementsChange.value)

  for (const key of changeKeys) {
    elementsChange.value.delete(key)
  }

  console.log('process结束了，剩余elementsChange: ', elementsChange.value)

  currentElementsChange.value.clear()
}

/**
 * @description 接口异常的场景使用、收集待消费的elementsChange
 * @param method
 */
export const onProcessError = (changeKeys: ChangeKeys[]) => {
  for (const key of changeKeys) {
    elementsChange.value.add(key)
  }

  console.log('process噶掉了，待消费的elementsChange: ', elementsChange.value)
}

/**
 * @description 汇总函数，统一处理入口判断条件
 * @param changeKeys
 * @param handleFunc
 */
const handleElementsChange = (
  changeKeys: ChangeKeys[],
  handleFunc: (changeKeys: ChangeKeys[]) => ChangeKeys[] | undefined | void,
) => {
  // 如果为空或者有忽略的key，那么直接返回
  if (!changeKeys || !changeKeys.length || changeKeys.find((key) => IGNORE_ELEMENTS.includes(key))) {
    return changeKeys
  }

  return handleFunc(changeKeys)
}

/**
 * @description 清空
 */
export const resetElementsChange = () => {
  elementsChange.value.clear()
  currentElementsChange.value.clear()
}

/**
 * @description 处理elementsChange
 */
export const useElementsChange = () => {
  return {
    handleElementsChange,
    beforeProcess,
    afterProcess,
    onProcessError,
    elementsChange,
    resetElementsChange,
  }
}
