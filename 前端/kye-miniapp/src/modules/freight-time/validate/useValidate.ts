import { reactive } from 'vue'
import { getClientRect, taroScrollToPosition } from '@freight-time/validate/utils'
import { showToast } from '@order-global-package-freight-time/hooks/useShowToast'
import { localCheckResult } from '@freight-time/validate/types'
import { useGlobalPopover } from '@order-global-package-freight-time/components/business/popover-effect/hooks/useUpdate'

const { updateValidateItem, removeValidateSinge, currentBubbleConfig } = useGlobalPopover()

let validateObj: any = reactive({})

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
    //生成气泡新版
    taroScrollToPosition(targetKey).finally(() => {
      updateValidateItem(targetOption)
    })
  }

  const clearErrorClassObj = () => {
    Object.keys(validateObj).forEach((key) => {
      delete validateObj[key]
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

  const removeValidateKey = (key: string | undefined) => {
    if (!key) {
      return
    }
    validateObj[key] = ''
    removeValidateSinge()
  }

  return {
    getKey,
    updateValidateKey,
    removeValidateKey,
    clearErrorClassObj,
    validateObj,
  }
}
