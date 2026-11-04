/**
 * @Desc: useBindCustomer 绑码组件相关
 * @Date: 2025/7/9
 */

import { useCommonDataHook } from '@public/storage/hooks/useCommonHook'
import { useDidShow } from '@tarojs/taro'
import { getToken, getUserPhoneStorage, setCustomerInfo } from '@public/storage'
import { ApiGetCustomerInfo, ApiGetDepartmentId } from '@public/apis/user'
import { ApplicationCodeMap } from '@public/utils/application/constants'
import { useApplication } from '@public/utils/application/useApplication'
import { useUserGlobalStore } from '@/store/user'
import { storeToRefs } from 'pinia'
import { usePlatformStore } from '@/store/platform'

interface CustomerInfo {
  customerCode: string
  customerShortName: string
}
/* 绑码组件hook入参 */
type UseBindCustomer = {
  openCustomerApi?: boolean // 是否开启绑码接口查询(默认开启，存在用户信息查询接口，则无需开启)
}

const { navigateApplicationWithCode } = useApplication()

const fetchUserCustomerInfo = async () => {
  return new Promise((resolve, reject) => {
    try {
      const token = getToken()
      if (!token) {
        return
      }
      ApiGetCustomerInfo({
        phone: getUserPhoneStorage(),
      })
        .then((res) => {
          if (res.code === 0 && res.data) {
            resolve(res.data)
          } else {
            reject(res)
          }
        })
        .catch((e) => {
          reject(e)
        })
    } catch (e) {
      reject(e)
      console.log(e)
    }
  })
}

let currentQueryTask: Promise<CustomerInfo> | null = null
const createQueryCustomerInfoTask = () => {
  if (!currentQueryTask) {
    currentQueryTask = fetchUserCustomerInfo().finally(() => (currentQueryTask = null)) as Promise<CustomerInfo>
  }
  return currentQueryTask
}

export const useBindCustomer = (options: UseBindCustomer = { openCustomerApi: true }) => {
  const { onCustomerCodeChange, onCustomerInfoChange } = useCommonDataHook()
  const userGlobalStore = useUserGlobalStore()
  const { customerInfo } = storeToRefs(userGlobalStore)
  // onCustomerCodeChange((data) => {
  //   console.log('绑码组件客户编码CODE变化', data)
  // })

  /* 获取新客户编码并写入storage */
  const updateCustomerInfo = async () => {
    const token = getToken()
    if (!token) {
      return
    }
    try {
      const customerInfo = await createQueryCustomerInfoTask()
      const { customerCode, customerShortName } = customerInfo || {}
      setCustomerInfo({
        customerCode,
        customerShortName,
      })
    } catch (err) {
      if (err && err.code === 15754) {
        setCustomerInfo({
          customerCode: '',
          customerShortName: '',
        })
      }
      console.log('catch', err)
    }
  }

  // 跳转绑码页 TODO 后续接入原生绑码组件
  const openCustomerPage = (expressType = '') => {
    const { areaCode, menuCode } = ApplicationCodeMap['绑码组件']
    navigateApplicationWithCode({
      areaCode,
      menuCode,
      queryParams: {
        express_type: expressType || '快速寄件页',
        title: '更换客户编码', // 飞书头部文案使用
      },
    })
  }

  /* 绑码组件目前为H5-需要手动调用接口 */
  useDidShow(() => {
    if (options?.openCustomerApi) {
      const platformStore = usePlatformStore()
      console.log('platformStore>>userLastUnloadPage', platformStore.userLastUnloadPage)
      const { route, params } = platformStore?.userLastUnloadPage || {}
      // 从web-view绑码页H5返回-才触发
      if (route && params?.url?.includes('netc-customer-code')) {
        updateCustomerInfo()
      }
    }
  })

  // 获取用户部门id
  const fetchUserDepartmentId = async () => {
    return new Promise((resolve, reject) => {
      try {
        const token = getToken()
        if (!token) {
          return
        }
        ApiGetDepartmentId({
          phone: getUserPhoneStorage(),
        })
          .then((res) => {
            if (res.code === 0 && res.data) {
              resolve(res.data)
            } else {
              reject(res)
            }
          })
          .catch((e) => {
            reject(e)
          })
      } catch (e) {
        reject(e)
        console.log(e)
      }
    })
  }

  return {
    customerInfo,
    fetchUserDepartmentId,
    openCustomerPage,
    onCustomerCodeChange,
    onCustomerInfoChange,
  }
}
