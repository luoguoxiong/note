/**
 * 切换登录手机号成功处理
 * 来源: netc-pc-web/src/views/login/hooks/useLogin.js switchLoginSuccess
 *
 * 依赖映射(登录态体系差异):
 *  - storageUtil.setLoginData/setUserData/setCustomerData/getLoginLog/initShareLoginStatus
 *      -> 新基座登录态由 sessionStorage(token) + guard 刷新后 userStore.init 重建
 *  - __setLocalCache('AUTO_*')(壳30天免登录清理) -> 新基座无该缓存体系, 略
 *  - apm.setUserId -> 新基座 pvReport 自取用户信息, 略
 *  - envSdk.routerReload -> @/stores/pc-web/deps/misc routerReload
 */
import { useRouter } from 'vue-router'
import { uuid } from '@/utils'
import { routerReload } from '@/stores/pc-web/deps/misc'

/** 解析 URL query(needQuerySave 判断, 与 module-customer-code/hooks/useCustomerCode 同实现) */
function getQueryObject(): Record<string, string> {
  const parse = (search: string) => {
    const params: Record<string, string> = {}
    new URLSearchParams(search).forEach((value, key) => {
      params[key] = value
    })
    return params
  }
  const hashQueryIndex = window.location.hash.indexOf('?')
  return {
    ...parse(window.location.search),
    ...(hashQueryIndex > -1 ? parse(window.location.hash.slice(hashQueryIndex + 1)) : {}),
  }
}

export function useSwitchLoginSuccess() {
  const router = useRouter()

  /**
   * 切换登录手机号成功: 清空会话写入新登录态后刷新重建
   * @param data userLoginInfoResponse(phone/ecasToken/customerCode/userStatus...)
   */
  const switchLoginSuccess = (data: Record<string, any> = {}) => {
    sessionStorage.clear()
    localStorage.setItem('TOKEN', '')
    const token = data?.ecasToken?.accessToken
    if (token) {
      // 对齐 main.ts syncTokenFromUrl 的三键写法(新基座请求层从 sessionStorage 取 token)
      sessionStorage.setItem('Token', token)
      sessionStorage.setItem('token', token)
      sessionStorage.setItem('TOKEN', token)
    }
    // 老基座 LOGIN_DATA/PHONE/CUSTOMER_CODE 键保留(白名单/埋点等读同键)
    sessionStorage.setItem('LOGIN_DATA', JSON.stringify(data))
    if (data?.phone) {
      sessionStorage.setItem('PHONE', data.phone)
    }
    if (data?.customerCode) {
      sessionStorage.setItem('CUSTOMER_CODE', data.customerCode)
    }
    sessionStorage.setItem('sessionId', uuid())
    const { needQuerySave } = getQueryObject()
    if (needQuerySave === 'false') {
      window.location.replace(window.location.href.split('?')[0])
    }
    // 新基座无灰度版本跳转体系, 走基座路由刷新
    router.push('/admin/home').catch(() => {
      // 已在首页等重复导航, 忽略
    })
    routerReload()
  }

  return {
    switchLoginSuccess,
  }
}
