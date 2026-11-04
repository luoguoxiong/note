/**
 * webview message补充
 */
import { nextTick, ref } from 'vue'
import { useDidShow, useLoad } from '@tarojs/taro'
import { setCustomerInfo } from '@public/storage'
import { loggedUpdateUserInfo } from '@/modules/user/pages/login/service'
import { checkLoginSingleForce } from '@public/hooks/useCheckAutoLogin'

// 绑码组件是否需要刷新状态
const bindCustomerRefresh = ref(false)

export const useMessageDataHook = (onRefresh: () => void) => {
  const queryParams = ref<any>('')
  const updateBindCustomerRefresh = (value: boolean) => {
    bindCustomerRefresh.value = value
  }

  /* 当前是否绑码组件H5页面 */
  const isBindCustomerPage = () => {
    return queryParams.value?.url?.includes('netc-customer-code')
  }

  /* 检测所有webview页面 */
  const handleCurrentPageCheck = () => {
    // 绑码组件H5页面刷新通知
    if (bindCustomerRefresh.value && isBindCustomerPage()) {
      onRefresh && onRefresh()
      nextTick(() => {
        updateBindCustomerRefresh(false)
      })
    }
  }

  /**
   * 接受postMessage 修改客户编码
   * @param data
   */
  const updateCustomerCodeHandler = (data) => {
    console.log('[log] updateCustomerCodeHandler', data)
    const { customerCode, customerName, customerShortName } = data || {}
    setCustomerInfo({
      customerCode,
      customerShortName: customerShortName || customerName,
    })
    checkLoginSingleForce().then((result) => {
      result.code === 0 && loggedUpdateUserInfo(result.data)
    })
  }

  useLoad((query) => {
    queryParams.value = query
  })

  useDidShow(() => {
    handleCurrentPageCheck()
  })

  return {
    bindCustomerRefresh,
    updateBindCustomerRefresh,
    updateCustomerCodeHandler,
  }
}
