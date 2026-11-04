import { ref } from 'vue'
import { mergerConfig } from '@public/utils/request/utils'
import { ReqConfig } from '@public/utils/types'
// 模块配置容器
const requestPackageConfigs = ref({})

export const useRequest = () => {
  /**
   * 模块配置添加
   * @param packageName 当前分包名
   * @param config request自定义配置
   */
  // const addRequestPackageConfig = (packageName: string, config: ReqConfig) => {
  //   if (!packageName) {
  //     return
  //   }
  //   requestPackageConfigs[packageName] = config
  // }

  /* requestPackageConfigs 模块独立配置检查 */
  const requestConfigUpdate = (config: ReqConfig) => {
    const { packageParams } = config || {}
    if (packageParams) {
      // 合并模块自定义配置
      config = mergerConfig(config, packageParams) as ReqConfig
    }
    return config
  }

  /* request 模块单独request拦截器配置 */
  const requestInterceptorUpdate = (config: ReqConfig) => {
    let result = null
    const { interceptors } = config?.packageParams || {}
    if (interceptors?.requestInterceptor) {
      result = interceptors?.requestInterceptor(config) as ReqConfig & null
    }
    return result
  }

  /* 获取分包request 独立配置 */
  const getRequestPackage = (packageName: string | undefined) => {
    return (packageName && requestPackageConfigs[packageName]) || {}
  }

  /* 获取分包request 拦截器配置 */
  const getRequestPackageInterceptor = (config: ReqConfig) => {
    if (config?.packageParams) {
      return config?.packageParams?.interceptors
    } else {
      return {}
    }
  }

  return {
    requestPackageConfigs,
    requestConfigUpdate,
    requestInterceptorUpdate,
    getRequestPackage,
    getRequestPackageInterceptor,
  }
}

export default useRequest
