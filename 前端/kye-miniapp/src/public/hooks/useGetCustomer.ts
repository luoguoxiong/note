import { getToken, getUserPhoneStorage, setCustomerInfo } from '@public/storage'
import { ApiGetCustomerInfo } from '@public/apis/user'

interface CustomerInfo {
  customerCode: string
  customerShortName: string
}

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

export const useGetCustomer = () => {
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

  return {
    updateCustomerInfo,
  }
}
