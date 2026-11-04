/**
 * 旧基座(netc-pc-web) storage 工具移植层
 * 来源: netc-pc-web/src/utils/storage.js
 *
 * 使用场景:
 *  - pc-web 各 Pinia store 的 action 内部需要读写登录态(手机号/客户编码/用户数据)时使用
 *  - 键名与旧基座保持一致(PHONE / CUSTOMER_CODE / USER_DATA / CUSTOMER_DATA),
 *    新壳登录成功后需向这些键写入数据, 迁移的 store 才能拿到登录态
 */

/** 旧基座: sessionStorage.PHONE */
export const getPhone = (): string | null => {
  return sessionStorage.getItem('PHONE')
}

/** 登录 token(新基座 key 为 'Token', 见 @/utils/auth) */
export const getToken = (): string | null => {
  return sessionStorage.getItem('Token') || sessionStorage.getItem('token')
}

/** 旧基座: sessionStorage.CUSTOMER_CODE */
export const getCustomerCode = (): string | null => {
  return sessionStorage.getItem('CUSTOMER_CODE')
}

export const setCustomerCode = (customerCode: string) => {
  return sessionStorage.setItem('CUSTOMER_CODE', customerCode)
}

export const getDepartmentCode = (): string | null => {
  return sessionStorage.getItem('DEPARTMENT_CODE')
}

export const setDepartmentCode = (departmentCode: string) => {
  return sessionStorage.setItem('DEPARTMENT_CODE', departmentCode)
}

export const getCustomerName = (): string => {
  const customerInfo = getUserData().customerInfo
  return customerInfo && customerInfo.customerName
}

export const getCustomerShortName = (): string => {
  const customerInfo = getUserData().customerInfo
  return customerInfo && customerInfo.customerShortName
}

/** 用户相关信息 */
export const setUserData = (data: unknown) => {
  sessionStorage.setItem('USER_DATA', JSON.stringify(data))
}

export const getUserData = (): Record<string, any> => {
  return sessionStorage.getItem('USER_DATA') ? JSON.parse(sessionStorage.getItem('USER_DATA') as string) : {}
}

export const setCustomerData = (data: Record<string, any>) => {
  if (!data || Object.keys(data).length < 1) {
    setCustomerCode('')
  }
  sessionStorage.setItem('CUSTOMER_DATA', JSON.stringify(data))
  if (data?.customerCode) {
    setCustomerCode(data.customerCode)
  }
}

/** 更新客户信息（局部字段） */
export const updateCustomerData = (change: Record<string, any>) => {
  const currentCache = getCustomerData()
  const newCache = {
    ...currentCache,
    ...change,
  }
  sessionStorage.setItem('CUSTOMER_DATA', JSON.stringify(newCache))

  if (Object.prototype.hasOwnProperty.call(change, 'customerCode')) {
    setCustomerCode(change.customerCode)
  }
}

export const getCustomerData = (): Record<string, any> => {
  return sessionStorage.getItem('CUSTOMER_DATA') ? JSON.parse(sessionStorage.getItem('CUSTOMER_DATA') as string) : {}
}

/**
 * 记录登录模块轻应用版本列表
 * APPLICATION_INFO key 来源于登录模块(netc-pc-web)
 * @param data
 */
export const setLoginApplication = (data: Record<string, any>) => {
  const applicationInfo = JSON.stringify({
    ...data,
    localCreateTime: Date.now(),
  })
  sessionStorage.setItem('APPLICATION_INFO', applicationInfo)
  // 解决在线客服中间页跳转需要applicationInfo对象
  localStorage.setItem('APPLICATION_INFO', applicationInfo)
}

export const getLoginApplication = (): Record<string, any> => {
  const APPLICATION_INFO = localStorage.getItem('APPLICATION_INFO')
  return APPLICATION_INFO ? JSON.parse(APPLICATION_INFO) : {}
}

export const clearLoginApplication = () => {
  // 登录轻应用信息
  sessionStorage.removeItem('APPLICATION_INFO')
  localStorage.removeItem('APPLICATION_INFO')
  // 登录主应用信息(手机列表)
  localStorage.removeItem('gray_admin_micro_menu_phone_lists')
}
