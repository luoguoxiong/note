/* eslint-disable no-unused-vars */
/* 轻应用接口相关service */

import { fetchApplicationInfoListMark, fetchApplicationInfoListNew, getRealtimeCorner } from '@public/apis/application'
import { ApplicationListRequestParamNewRes, WebUserNativeLightAppListOut } from '@public/apis/application/types'
import grayHeaderStore from '@public/utils/request/grayHeader'
import useApplicationStorage from './useApplicationStorage'
import { ApplicationItem, AreaItem } from './applicationType'
import { isLogined } from '../user'
import { HttpResponse } from '../types'
import { AreaCodePlatMap } from './constants'
import { sleep } from '../tools'
import { getDefaultApplication } from './applicationDefault'
import { debounce } from 'lodash-es'
import { setMarksByMenuCodes } from './applicationMarks'

let fetchGlobalTask: Promise<HttpResponse<ApplicationListRequestParamNewRes>> | null

/** 全局轻应用缓存时间 */
const FETCH_GLOBAL_TASKTIMEOUT = 10 * 1000

/** 获取区域角标延迟时间 */
const DELETE_FETCH_MARKERTIME = 3 * 1000

/** 正在发起角标请求的Resolvers */
let PENDING_MARKER_RESOLVERS: Array<(value: any) => void> = []

/** 接口拉取所有轻应用列表数据 */
export const getApplicationListAll = async () => {
  // ⚠️ 关键点：结束所有正在等待的 fetchApplicationMarks
  PENDING_MARKER_RESOLVERS.forEach((resolve) => resolve([]))
  PENDING_MARKER_RESOLVERS = []

  // 继续原来的逻辑
  fetchGlobalTask = fetchApplicationInfoListNew({
    pageCode: 'homepage',
    areaCodes: Object.values(AreaCodePlatMap).filter((item) => item),
  })

  try {
    const res = await fetchGlobalTask
    if (res.code === 0 && res.data.lightAppInfo?.vos) {
      useApplicationStorage().setApplicationStorage(res.data.lightAppInfo.vos)
      grayHeaderStore.updateNativeGrayHeader()
      setTimeout(() => (fetchGlobalTask = null), FETCH_GLOBAL_TASKTIMEOUT)
    } else {
      await getDefaultApplication()
    }
  } catch (e) {
    await getDefaultApplication()
  }
}

export const getApplicationListAllDebounce = debounce(() => {
  return getApplicationListAll()
}, 50)

/** 延迟获取轻应用角标信息 */
export const delayUpdateMarkesByApplicationCodes = async (apps: AreaItem[]) => {
  await sleep(DELETE_FETCH_MARKERTIME)
  const menuCodeList = apps.flatMap((app) => (app.lightApplicationInfos || []).map((item) => item.menuCode))
  const flatMenuCodeList = [...new Set(menuCodeList)]
  if (flatMenuCodeList.length > 0) {
    const data = await fetchApplicationMarks(flatMenuCodeList)
    if (data.length > 0) {
      setMarksByMenuCodes(flatMenuCodeList, data)
      useApplicationStorage().updateApplicationMarkStorage()
    }
  }
}

/** 获取区域应用和角标 */
export const getAreasApplicationAndMarkers = async (areaCodes: string[] = [], isNeedMarks: boolean = true) => {
  try {
    // 如果已有全局任务并且需要角标
    if (fetchGlobalTask) {
      const { data } = await fetchGlobalTask
      const apps = data?.lightAppInfo?.vos ?? []

      const applicationList = apps.filter((app) => areaCodes.includes(app.areaCode))

      if (isNeedMarks) {
        delayUpdateMarkesByApplicationCodes(applicationList)
      }
      return
    }

    const res = await fetchApplicationList(areaCodes.filter((item) => item))
    const applicationList = res?.vos ?? []

    useApplicationStorage().updateAreasApplicationListStorage(applicationList)

    if (isNeedMarks) {
      delayUpdateMarkesByApplicationCodes(applicationList)
    }
  } catch (error) {
    console.error('getAreasApplicationAndMarkers Error:', error)
  }
}

/** 获取单个轻应用信息 */
export const getApplicationSingle = async (areaCode?: string, menuCode?: string) => {
  const areaCodes = areaCode ? [areaCode] : []
  const menuCodes = menuCode ? [menuCode] : []

  const data = await fetchApplicationList(areaCodes, menuCodes)
  const areaInfo = data?.vos?.[0]
  const applicationInfo = areaInfo?.lightApplicationInfos?.[0]

  // 写入缓存
  useApplicationStorage().setSingleApplicationListStorage({
    areaCode: areaInfo?.areaCode,
    menuCode: applicationInfo?.menuCode,
    applicationInfo,
  })

  return applicationInfo
}

/** 获取首页轻应用信息 */
export const gethHomePageLightApp = async () => {
  try {
    if (fetchGlobalTask) {
      const res = await fetchGlobalTask
      return {
        menuList: res.data.menuList,
        waitNoticeNum: res.data.waybillStat?.waitNoticeNum || 0,
      }
    } else {
      const res = await fetchApplicationInfoListNew({
        pageCode: 'homepage',
        areaCodes: [AreaCodePlatMap['首页-通用跳转'], AreaCodePlatMap['首页-营销区'], AreaCodePlatMap['新客首页']],
      })
      if (res.code === 0) {
        useApplicationStorage().updateAreasApplicationListStorage(res.data.lightAppInfo?.vos || [])
        return {
          menuList: res.data.menuList,
          waitNoticeNum: res.data.waybillStat?.waitNoticeNum || 0,
        }
      }
    }
  } catch (error) {
    console.error('gethHomePageLightApp', error)
    throw error
  }
}

/** 获取轻应用数据接口请求 */
export const fetchApplicationList = async (
  areaCodes: string[] = [],
  menuCodes: string[] = [],
): Promise<WebUserNativeLightAppListOut> => {
  const params = {
    areaCodes,
    menuCodes,
  }
  const res = await fetchApplicationInfoListNew(params)
  if (res.code === 0 && res.data?.lightAppInfo) {
    return res.data?.lightAppInfo
  } else {
    return {}
  }
}

/** 获取角标接口请求 */
export const fetchApplicationMarks = (menuCodes: string[] = []): Promise<ApplicationItem[]> => {
  if (!isLogined()) return Promise.resolve([])

  let externalResolve!: (value: ApplicationItem[]) => void

  // 创建一个可被外部提前 resolve 的 Promise
  const wrappedPromise = new Promise<ApplicationItem[]>((resolve) => {
    externalResolve = resolve
  })

  // 注册到 pending 列表
  PENDING_MARKER_RESOLVERS.push(externalResolve)

  // 真实请求发起（不等待 wrappedPromise）
  fetchApplicationInfoListMark(menuCodes)
    .then((res) => {
      // 1. 如果已经被 getApplicationListAll 提前 resolve，把响应丢弃
      if (!PENDING_MARKER_RESOLVERS.includes(externalResolve)) return

      // 2. 正常 resolve 真实数据
      externalResolve(res.code === 0 ? res.data?.lightApplicationInfos || [] : [])
    })
    .catch(() => {
      // 3. 请求失败，仍要 resolve（避免卡住）
      if (!PENDING_MARKER_RESOLVERS.includes(externalResolve)) return

      externalResolve([]) // catch 返回空数组
    })
    .finally(() => {
      // 4. 无论如何，删除 pending 项
      PENDING_MARKER_RESOLVERS = PENDING_MARKER_RESOLVERS.filter((fn) => fn !== externalResolve)
    })

  return wrappedPromise
}

// export const getRealtimeMarks = async (menuCodes: string[] = []) => {
//   const { data } = await getRealtimeCorner(menuCodes)
//   const lightApplicationInfos = data?.lightApplicationInfos ?? []
//   if (lightApplicationInfos.length > 0) {
//     setMarksByMenuCodes(menuCodes, lightApplicationInfos)
//     useApplicationStorage().updateApplicationMarkStorage()
//   }
// }
