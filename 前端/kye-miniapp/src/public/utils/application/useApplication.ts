/* 外部轻应用hook */
import {
  getApplicationByCode,
  getApplicationFullUrlAsync,
  getApplicationInfoStorage,
  getClickId,
  getSingleApplicationUrl,
} from '@public/utils'
import { openURL } from '@modules/webview/utils'
import { ApplicationItem } from '@public/utils/application/applicationType'
import { getApplicationSingle } from '@public/utils/application/applicationService'
import { ApplicationCodeMap, ApplicationCodeMapType } from '@public/utils/application/constants'
import kyeNavigate from '../native/navigate'
import plateform from '@kye-netc/plateform'
import { getEnvConfig } from '@/public/config'
import { compareVersionNew, loginFromType } from '@/public/constants'
import Taro from '@tarojs/taro'
import { getDefaultApplicationSync } from '@/public/utils/application/applicationDefault'
import { useUserInfo } from '@/public/hooks'
import { getToken } from '@/public/storage'
import { getRedirectUrl } from '@/public/hooks/useRedirectH5ToNative'
import { useLoginPublicParmas } from '@/modules/user/pages/login/components/phone-login/hooks'

interface KeyValuePair {
  [key: string]: any
}

export interface ApplicationParams {
  // 是否需要登录
  needLogin?: boolean
  // 以webview打开
  isWebview?: boolean
  // 自定义参数
  params?: KeyValuePair
  [key: string]: any
}

interface OpenWebviewOptions {
  applicationUrl: string
  applicationItem?: { areaCode?: string; menuCode?: string }
  params?: KeyValuePair
  needLogin?: boolean
  navigateFn?: 'navigateTo' | 'redirectTo' | 'switchTab'
  isKyNative?: boolean
  asyncUpdateLightAppInfo?: AsyncUpdateApplicationInfo
}

// eslint-disable-next-line no-unused-vars
type AsyncUpdateApplicationInfo = (app: ApplicationItem) => void

export const useApplication = () => {
  /** 通用跳转轻应用方法 */
  const navigateApplication = (
    applicationItem: ApplicationItem,
    queryParams: Record<string, any> = {},
    asyncUpdateLightAppInfo?: AsyncUpdateApplicationInfo,
  ) => {
    const parseCustomParam = (param?: string) => {
      try {
        return param ? JSON.parse(param) : {}
      } catch {
        console.warn('Invalid customParam:', param)
        return {}
      }
    }

    const openMiniProgram = (
      { userName, path, appId, appName, miniProgramName, miniprogramType, envVersion },
      isApp: boolean,
    ) => {
      const finalAppName = appName || miniProgramName || applicationItem.menuName

      const open = () =>
        plateform.openMiniProgram({
          userName,
          path,
          miniprogramType,
          appId,
          envVersion,
        })

      if (isApp) {
        Taro.showModal({
          title: '温馨提示',
          content: `即将打开“${finalAppName}”小程序`,
          confirmText: '允许',
          showCancel: true,
          confirmColor: '#8365f6',
          success: (res) => res.confirm && open(),
        })
      } else {
        open()
      }
    }

    const openLightApp = async (navigateFn: 'navigateTo' | 'redirectTo' | 'switchTab' = 'navigateTo') => {
      const customParam = parseCustomParam(applicationItem.customParam)
      const { userInfo } = useUserInfo()
      /** ① 若需要绑码但未绑，则跳转绑码组件 */
      if (customParam.needBindCode && !userInfo.value.customerCode) {
        // todo优化
        const { areaCode, menuCode } = ApplicationCodeMap['绑码组件']
        if (customParam.express_type) {
          queryParams.express_type = customParam.express_type
        }
        const applicationUrl = getApplicationFullUrlAsync(areaCode, menuCode, queryParams)
        return openWebview({
          applicationUrl,
          applicationItem: { areaCode, menuCode },
          navigateFn,
          isKyNative: false,
          asyncUpdateLightAppInfo,
        })
      }

      const accessMode = applicationItem.accessMode ?? 0

      // 实名认证原生化
      if (applicationItem.menuName === '实名认证') {
        const url = await getRedirectUrl('/modules/user/pages/realname/home/index')
        if (url) {
          Taro[navigateFn || 'navigateTo']({ url: url })
          return
        }
      }
      // TODO 运费时效原生化
      if (applicationItem?.menuName?.startsWith('运费时效')) {
        const isVersionMatch = compareVersionNew(applicationItem.versionNumber || '', '0.45.4') === 1
        if (isVersionMatch) {
          const url = '/modules/freight-time/pages/index/index'
          if (url) {
            Taro[navigateFn || 'navigateTo']({ url: url })
            return
          }
        }
      }

      // 切换登录手机号
      if (applicationItem.menuName === '切换登录') {
        const { areaCode, menuCode } = ApplicationCodeMap['用户-切换登录手机号']
        const { deviceType, deviceCode, systemVersion, version } = useLoginPublicParmas()
        const applicationUrl = getApplicationFullUrlAsync(areaCode, menuCode, {
          deviceType: deviceType,
          deviceCode: deviceCode,
          from: loginFromType,
          systemVersion,
          pre_click_id: getClickId(),
          version,
        })

        return kyeNavigate.navigateTo({
          url: `/modules/user/pages/changeLogin/index?url=${encodeURIComponent(applicationUrl)}&needLogin=true`,
        })
      }

      /** ② Webview 应用 */
      if (accessMode === 0) {
        const url = getSingleApplicationUrl(applicationItem, queryParams)
        return openWebview({
          applicationUrl: url,
          applicationItem,
          params: {
            ...customParam,
            title: applicationItem.menuName,
          },
          navigateFn,
          isKyNative: false,
          asyncUpdateLightAppInfo,
        })
      }

      /** ③ H5 Navigate */
      if (accessMode === 1) {
        return Taro[navigateFn]({
          url: `${applicationItem.loadAddress}?pageFromNative=1`,
        })
      }

      /** ④ 打开小程序 */
      if (accessMode === 2) {
        const { isApp, isProd } = getEnvConfig()
        const defaultType = isProd ? 0 : 2
        const token = getToken()

        const mpParams = {
          ...customParam,
          miniprogramType: customParam.miniprogramType ?? defaultType,
        }

        mpParams.envVersion = mpParams.miniprogramType === 0 ? 'release' : 'trial'
        mpParams.path = mpParams.path || applicationItem.routePath

        // 跳转跨越领鲜小程序且为登录状态：需要带上token和fromId参数
        if (mpParams.appId === 'wxb1503f29025cc7aa' && token) {
          const fromId = getEnvConfig().xForm
          mpParams.path = `${mpParams.path}${mpParams.path.indexOf('?') > 0 ? '&' : '?'}token=${token}&fromId=${fromId}`
        }
        console.log('mpParams', mpParams)

        return openMiniProgram(mpParams, isApp)
      }
    }

    const token = getToken()
    // const needLogin = applicationItem.loginType === 1
    // 默认全部都需要登录
    if (token) {
      // 不需要登录 或 已有 token
      openLightApp('navigateTo')
    } else {
      // 需要登录但没有 token
      kyeNavigate.checkLogin(() => {
        openLightApp('redirectTo')
      })
    }
  }

  /** 首页金刚区定制化跳转
   *  自定义角标更新单个轻应用
   */
  const navigateApplicationExtra = (
    applicationItem: ApplicationItem,
    parmas: KeyValuePair = {},
    asyncUpdateLightAppInfo?: AsyncUpdateApplicationInfo,
  ) => {
    navigateApplication(applicationItem, parmas, asyncUpdateLightAppInfo)
  }

  const navigateApplicationWithCode = (
    {
      areaCode,
      menuCode,
      queryParams = {},
    }: {
      areaCode: string
      menuCode: string
      queryParams?: Record<string, any>
    },
    applicationParams: ApplicationParams = { needLogin: true, isWebview: true, title: queryParams?.title },
  ) => {
    // 新客留资，临时写死版本号
    let applicationUrl = getApplicationFullUrlAsync(areaCode, menuCode, queryParams)
    openWebview({
      applicationUrl,
      applicationItem: { areaCode, menuCode },
      params: applicationParams,
    })
  }

  /** 打开轻应用信息 */
  const openWebview = ({
    applicationUrl,
    applicationItem,
    params = {},
    needLogin = true,
    navigateFn = 'navigateTo',
    isKyNative = true,
    asyncUpdateLightAppInfo,
  }: OpenWebviewOptions) => {
    const { areaCode, menuCode } = applicationItem || {}

    if (areaCode || menuCode) {
      asyncSingleApplicationUpdate({ areaCode, menuCode }).then((applicationItem) => {
        if (applicationItem && asyncUpdateLightAppInfo) {
          asyncUpdateLightAppInfo(applicationItem)
        }
      })
    }

    openURL(
      applicationUrl,
      {
        needLogin,
        unDecodeUrl: true,
        ...params,
      },
      navigateFn,
      isKyNative,
    )
  }

  /**
   * 获取完整H5轻应用拼接信息 如：https://ic-h5-uat.kye-erp.com/order-config/0.126.8/#/order
   * @param areaCode 区域编码
   * @param menuCode 菜单编码
   * @returns {string}
   */
  const getSingleApplicationUrlSync = (areaCode: string, menuCode: string) => {
    return getApplicationFullUrlAsync(areaCode, menuCode)
  }

  /**
   * 获取指定区域轻应用数据
   * @param areaCodes
   */
  const getApplicationInfoWithAreaCode = (areaCodes: string[]) => {
    // 本地兜底轻应用数据
    const defaultApplicationLists = getDefaultApplicationSync() || []
    const lists = getApplicationInfoStorage() || defaultApplicationLists || []
    return lists.filter((a) => {
      return areaCodes.includes(a.areaCode)
    })
  }

  /**
   * 获取指定区域轻应用数据
   * @param areaCodes
   */
  const getApplicationInfoByAreaCode = (areaCodes: string) => {
    const lists = getApplicationInfoWithAreaCode([areaCodes])
    if (lists.length > 0) {
      return lists[0].lightApplicationInfos
    } else {
      return []
    }
  }

  const getApplicationAreaNameByAreaCode = (areaCodes: string): string => {
    const lists = getApplicationInfoWithAreaCode([areaCodes])
    if (lists.length > 0) {
      return lists[0].areaName
    } else {
      return ''
    }
  }
  interface ApplicationUpdateOptions {
    areaCode?: string
    menuCode?: string
  }
  /**
   * 异步获取单个轻应用,(提前加载,或者达到最大等待时间则resolve)
   * 如不需要登录，外部调用请勿使用await 等待
   * @param areaCode
   * @param menuCode
   * @param maxWaitTime 最大等待耗时
   * @returns {Promise<?>}
   */
  const asyncSingleApplicationUpdate = async (
    opts: ApplicationUpdateOptions,
    maxWaitTime = 1000,
  ): Promise<ApplicationItem | undefined> => {
    const { areaCode = '', menuCode = '' } = opts

    const timeoutPromise: Promise<undefined> = new Promise((resolve) =>
      setTimeout(() => resolve(undefined), maxWaitTime),
    )

    const requestPromise = getApplicationSingle(areaCode, menuCode)

    return Promise.race([requestPromise, timeoutPromise])
  }

  /**
   * 根据轻应用名称跳转轻应用
   * @param name
   * @param queryParams
   */
  const navigateApplicationWithName = ({
    name,
    queryParams,
  }: {
    name: ApplicationCodeMapType
    queryParams?: Record<string, any>
  }) => {
    const { areaCode, menuCode } = ApplicationCodeMap[name]
    navigateApplicationWithCode({ areaCode, menuCode, queryParams })
  }
  /* 根据menuCode异步获取单个组件轻应用信息 */
  const getApplicationSingleAsync = async ({ areaCode = '', menuCode = '' }) => {
    // 异步拉取单个轻应用
    const data = await asyncSingleApplicationUpdate({ areaCode, menuCode }, 20000)
    if (data) {
      return getSingleApplicationUrl(data)
    } else {
      console.error('[applicationInfo]未异步找到轻应用')
    }
  }

  return {
    navigateApplicationExtra,
    getApplicationByCode,
    navigateApplication,
    navigateApplicationWithCode,
    getSingleApplicationUrlSync,
    getApplicationInfoWithAreaCode,
    getApplicationInfoByAreaCode,
    openWebview,
    navigateApplicationWithName,
    getApplicationSingleAsync,
    getApplicationAreaNameByAreaCode,
  }
}
