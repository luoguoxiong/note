import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { urlContact } from '@/utils/micro-utils'
import { defaultData, type MenuItem } from './mock'
import { otherWaybillConfig, waybillMaterialConfig, vtsDetailConfig } from './pc-web/deps/constants'
import { queryAreaMenuList } from '@/apis/lightapp'
import { getToken } from '@/utils/auth'
import { LocalStorageManager } from '@/utils/storageManager'

export interface IframeBridgeItem {
  name: string
  container?: unknown
  menuCode: string
  status: 'pending' | 'resolved'
  loadNoticeReady?: boolean
}

enum AppAreaCodes {
  /** 侧边栏区域编码 */
  'SlideAreaCode' = 'A3003',
}

export const useLightAppStore = defineStore('lightApp', () => {
  /** 侧边栏轻应用 */
  const lightAppList = ref<MenuItem[]>([])

  /** 侧边栏菜单数据 */
  const menusList = ref<MenuItem[]>([])

  /**
   * 仅来源于「localStorage 缓存 / 接口成功」的侧边栏菜单数据
   * 接口失败时的 fallback 兜底数据不写入此处，供权限判断消费（防 mock 越权，见路由权限方案 6.2）
   */
  const serverMenus = ref<MenuItem[]>([])

  /** 权限数据是否就绪：加载过缓存或接口成功返回过（fallback 不置位） */
  const isServerMenuReady = ref(false)

  // 全局轻应用数据
  const appLightAppinfo = ref<Map<string, MenuItem[]>>(new Map())

  const isLoading = ref(false)

  /** 菜单加载失败标记（仅在无缓存数据时用于展示失败态） */
  const loadError = ref(false)

  let initPromise: Promise<void> | null = null

  /** 侧边栏菜单展示状态：有数据（含缓存）即 success，无数据时区分 loading / error */
  const menuStatus = computed<'loading' | 'success' | 'error'>(() => {
    if (menusList.value.length > 0) return 'success'
    return loadError.value ? 'error' : 'loading'
  })

  const lightAppMap = computed(() => {
    const map = new Map<string, MenuItem>()
    lightAppList.value.forEach((item) => {
      map.set(item.menuCode, item)
    })
    return map
  })

  /** 拍平的 menuCode 集合（仅「缓存/接口成功」数据，fallback 兜底不更新，供权限判断使用） */
  const serverMenuCodes = computed(() => {
    const codes = new Set<string>()
    const walk = (list: MenuItem[]) => {
      list.forEach((item) => {
        if (item.menuCode) codes.add(String(item.menuCode))
        if (item.subMenus?.length) walk(item.subMenus)
      })
    }
    walk(serverMenus.value)
    return codes
  })

  async function getLightApp(menuCode: string): Promise<MenuItem | undefined> {
    await init()
    return lightAppMap.value.get(menuCode)
  }

  async function getAppUrl(menuCode: string): Promise<string> {
    const menuInfo = await getLightApp(menuCode)
    if (!menuInfo) return ''
    const { loadAddress, routePath } = menuInfo

    let result = loadAddress || ''

    if (loadAddress && routePath) {
      result = loadAddress + routePath
    }
    return urlContact(result, {
      token: getToken() || '',
      grayHeader: JSON.stringify(menuInfo?.grayHeader || []),
    })
  }

  async function getAppLoadModuleEntry(menuCode: string) {
    const menuInfo = await getLightApp(menuCode)
    return menuInfo?.loadAddress || ''
  }

  /**
   * 获取菜单对应的远程应用地址
   * 对齐老项目 microIframeApp/microMenuRouteUrl → getMicroUrlWithParam：
   * loadAddress + routePath 基础上附加 token + grayHeader
   */
  function microMenuRouteUrl(menuCode: string): string {
    const menuInfo = lightAppMap.value.get(menuCode)
    if (!menuInfo) return ''
    const { loadAddress, routePath } = menuInfo
    if (!loadAddress || !routePath) return ''
    return urlContact(loadAddress + routePath, {
      token: getToken() || '',
      // 对齐老基座: urlContact 内部会统一 encodeURIComponent, 此处不可先手动编码(否则双重编码成 %255B%255D)
      grayHeader: JSON.stringify(menuInfo.grayHeader || []),
    })
  }

  /**
   * 由菜单树构建扁平 lightAppList。
   * 派生菜单合成（对齐老基座 store/modules/microIframeApp.js）：M-WAYBILL-OTHER /
   * M-WAYBILL-MATERIAL 基于 M3060 运单查询菜单信息生成（继承 loadAddress/grayHeader，
   * 仅替换 menuCode/routePath 等），不注册到后端，仅在 M3060 存在时追加；
   * VTS-WAYBILL-DETAIL 整车运单详情同理，基于 M3848 整车运单菜单生成（老基座由
   * M3058 派生，新基座整车运单已注册为独立菜单 M3848，故由其派生）
   */
  function buildLightAppList(menusListData: MenuItem[]): MenuItem[] {
    const list = menusListData.reduce<MenuItem[]>((prev, cur) => {
      return cur.subMenus?.length ? [...prev, ...cur.subMenus] : [...prev, cur]
    }, [])
    const waybillInfo = list.find((item) => item.menuCode === 'M3060')
    if (waybillInfo) {
      list.push({ ...waybillInfo, ...otherWaybillConfig })
      list.push({ ...waybillInfo, ...waybillMaterialConfig })
    }
    const vtsWaybillInfo = list.find((item) => item.menuCode === 'M3848')
    if (vtsWaybillInfo) {
      list.push({ ...vtsWaybillInfo, ...vtsDetailConfig })
    }
    return list
  }

  /**
   * 缓存动态键：登录手机号 + 客户编码（对齐 user.ts loadCache 的 LOGIN_DATA 取值）。
   * 菜单数据按登录身份有权限差异，固定键会导致切换账号/角色后读到他人缓存并误作权限依据（越权），
   * 无登录身份时不读写缓存（缓存仅是加速，宁可多请求一次接口）
   */
  function getCacheKey(): { key: 'lightAppCache$'; selfKey: string } | null {
    try {
      const loginData = JSON.parse(sessionStorage.getItem('LOGIN_DATA') || '{}')
      if (!loginData?.phone) return null
      return { key: 'lightAppCache$', selfKey: `${loginData.phone}` }
    } catch {
      return null
    }
  }

  // 从 localStorage 加载缓存
  function loadCache() {
    try {
      const cacheKey = getCacheKey()
      if (!cacheKey) return
      const entries = LocalStorageManager.get(cacheKey) as [string, MenuItem[]][] | null
      if (!entries) return
      const map = new Map<string, MenuItem[]>(entries)
      appLightAppinfo.value = map

      // 从 appLightAppinfo 重新推导 menusList 和 lightAppList
      const menusListData = map.get(AppAreaCodes.SlideAreaCode) || []
      menusList.value = menusListData
      lightAppList.value = buildLightAppList(menusListData)

      // 缓存数据来自上一次接口成功返回，可作为权限判断依据
      serverMenus.value = menusListData
      isServerMenuReady.value = true
    } catch {
      // 缓存解析失败则忽略
    }
  }

  // 写入 localStorage 缓存
  function saveCache() {
    try {
      const cacheKey = getCacheKey()
      if (!cacheKey) return
      LocalStorageManager.save(cacheKey, Array.from(appLightAppinfo.value.entries()))
    } catch {
      // 缓存写入失败则忽略
    }
  }

  // 获取轻应用列表，包含额外菜单处理
  async function init() {
    if (initPromise) return initPromise

    // 1. 优先从缓存加载，让页面尽快展示
    loadCache()

    isLoading.value = true

    initPromise = (async () => {
      try {
        await microApplicationListGet()
        // 成功后保留 initPromise，后续 init() 复用结果，不再重复请求
      } catch {
        // 仅失败时置空，下次 init() 可重新发起请求（错误已在 microApplicationListGet 内记录并兜底）
        initPromise = null
      } finally {
        isLoading.value = false
      }
    })()

    // 2. 有缓存数据则不阻塞，无缓存则等待接口返回
    if (lightAppList.value.length > 0) return
    await initPromise
  }

  async function microApplicationListGet() {
    try {
      // 开发环境命中 mock/web.lightApplication.getApplicationInfoListByArea.js
      const { data } = await queryAreaMenuList({
        areaCodes: [AppAreaCodes.SlideAreaCode],
        channelCode: 'pc',
        menuCodes: [],
      })
      ;(data?.vos || []).forEach(({ areaCode, menus }) => {
        appLightAppinfo.value.set(areaCode, menus)
      })

      const menusListData = appLightAppinfo.value.get(AppAreaCodes.SlideAreaCode) || []

      menusList.value = menusListData

      lightAppList.value = buildLightAppList(menusListData)

      // 接口成功数据可作为权限判断依据（覆盖缓存数据）
      serverMenus.value = menusListData
      isServerMenuReady.value = true

      // 接口成功响应后写入缓存
      saveCache()
      loadError.value = false
    } catch (error) {
      loadError.value = true
      console.error('获取轻应用列表失败:', error)
      // 接口失败降级：使用本地 defaultData 兜底
      applyFallbackMenu()
      // 抛出错误让 init() 感知失败，以便置空 initPromise 允许重试
      throw error
    }
  }

  /** 接口失败时的本地兜底数据（不写入缓存，下次仍尝试请求接口） */
  function applyFallbackMenu() {
    defaultData.forEach(({ areaCode, lightApplicationInfos }) => {
      appLightAppinfo.value.set(areaCode, lightApplicationInfos)
    })

    const menusListData = appLightAppinfo.value.get(AppAreaCodes.SlideAreaCode) || []
    menusList.value = menusListData
    lightAppList.value = menusListData.reduce<MenuItem[]>((prev, cur) => {
      return cur.subMenus?.length ? [...prev, ...cur.subMenus] : [...prev, cur]
    }, [])
  }

  return {
    isLoading,
    loadError,
    menuStatus,
    lightAppList,
    lightAppMap,
    menusList,
    serverMenus,
    serverMenuCodes,
    isServerMenuReady,
    getAppLoadModuleEntry,
    getLightApp,
    getAppUrl,
    microMenuRouteUrl,
    init,
    microApplicationListGet,
  }
})
