import { reactive } from 'vue'
import { localCheckResult } from '@order-public-sub-public/types'
import { useGlobalPopover } from '@order-global-package-order-sub/components/business/popover-effect/hooks/useUpdate'
import { getClientRect, getCurrentPageName, taroScrollToPosition } from '@order-public-sub-public/validate/utils'
import { showToast } from '@order-global-package-order-sub/hooks/useShowToast'
let validateObj: any = reactive({})
const { updateValidateItem, removeValidateSinge, currentBubbleConfig } = useGlobalPopover()

export function useValidate() {
  const getKey = async (key: string) => {
    let target = key?.split('.').join('_')
    console.log('获取判断key', target)
    let targetDom = await getClientRect(target)
    if (!targetDom) {
      target = key.split('.')[0]
      target = `${target}_${target}`
      targetDom = document.getElementById(target)
    }
    if (!targetDom) {
      return ''
    }
    return target
  }
  const updateValidateKey = async (option: localCheckResult) => {
    const { key, bubbleConfig, content } = option
    if (!content) {
      return
    }
    const targetKey = await getKey(key)
    if (!targetKey) {
      return showToast(content)
    }
    const targetOption = {
      ...bubbleConfig,
      content,
      key: targetKey,
    }
    //设置错误红线提醒
    setErrorClassUpdate({
      ...option,
      key: targetKey.split('_').join('.'),
    })
    console.log(targetKey, 'targetKey')
    //生成气泡新版
    taroScrollToPosition(targetKey).finally(() => {
      console.log('滚动了', targetOption)
      updateValidateItem(targetOption)
    })
  }
  const setErrorClassUpdate = (option: localCheckResult) => {
    const { key, bubbleConfig, content, extraData } = option
    if (extraData?.type === 'info' || extraData?.type === 'warning') {
      return
    }
    validateObj[key] = ''
    setTimeout(() => {
      validateObj[key] = {
        ...bubbleConfig,
        content,
      }
    })
  }

  const clearErrorClassObj = () => {
    Object.keys(validateObj).forEach((key) => {
      delete validateObj[key]
    })
  }

  const removeValidateKey = (key: string | undefined) => {
    if (!key) {
      return
    }
    if (currentBubbleConfig.value?.key === key) {
      removeValidateSinge()
    }
    validateObj[key] = ''
    removeValidateSinge()
  }
  const closeTippyGloabl = () => {
    removeValidateSinge()
  }
  const removeValidateKeyByType = (type: string) => {
    Object.keys(validateObj).forEach((key) => {
      if (key.indexOf(type) > -1) {
        delete validateObj[key]
      }
    })
  }
  return {
    updateValidateKey,
    removeValidateKey,
    validateObj,
    removeValidateKeyByType,
    setErrorClassUpdate,
    clearErrorClassObj,
    closeTippyGloabl,
  }
}
