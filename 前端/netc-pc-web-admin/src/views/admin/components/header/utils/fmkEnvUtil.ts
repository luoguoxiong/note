/**
 * 泳道测试环境工具
 * 来源: netc-pc-web/src/utils/fmkEnvUtil.js (isTestScene / urlEnvIdCover)
 * 泳道标识存储与老项目 utils/storage.js 的 fmk_set_env/fmk_get_env 一致(localStorage.NETC_FMK_ENV)
 */
import { getQueryObject } from '@/utils'

/** 泳道环境 localStorage key(与老项目 storage.js 一致) */
const NETC_FMK_ENV_KEY = 'NETC_FMK_ENV'

/** 泳道环境信息 */
interface FmkEnv {
  envId: string
  envName: string
  description: string
  module: string
  resourcePath: string
  state: null
}

/** 写入泳道环境(老项目 storage.fmk_set_env) */
const fmkSetEnv = (data: FmkEnv) => {
  const value = data instanceof Object ? JSON.stringify(data) : data
  localStorage.setItem(NETC_FMK_ENV_KEY, value)
}

/** 读取泳道环境(老项目 storage.fmk_get_env) */
export const fmkGetEnv = (): FmkEnv | null => {
  const value = localStorage.getItem(NETC_FMK_ENV_KEY) || ''
  return value ? JSON.parse(value) : null
}

class FmkEnvUtil {
  /**
   * 是否泳道环境(测试环境)
   */
  isTestScene(): boolean {
    return /uat|stg|dev/.test(window.location.host) || process.env.NODE_ENV === 'development'
  }

  /**
   * 从url写入本地envId
   * <demo:'https://uc-uat.ky-express.com/netc-pc-web-offline/1.2.29/index.html?envId=41#/login'>
   */
  urlEnvIdCover(href?: string): { urlEnvId?: string; envSelect: FmkEnv | null } {
    const url = href || window.location.href
    let envSelect: FmkEnv | null = null
    // 摩天轮mock url
    const urlNew = url ? url.split('#')[0] : ''
    const { envId: urlEnvId } = process.env.NODE_ENV === 'production' ? getQueryObject(urlNew) : getQueryObject(url)
    if (urlEnvId) {
      envSelect = {
        envId: urlEnvId,
        envName: 'url env',
        description: 'url env',
        module: '',
        resourcePath: '',
        state: null,
      }
      fmkSetEnv(envSelect)
    }
    return {
      urlEnvId,
      envSelect,
    }
  }
}

export default new FmkEnvUtil()
