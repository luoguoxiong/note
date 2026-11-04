/* 管理轻应用列表数据 */

import { getApplicationInfoStorage } from '@public/utils'
import { setStorageSync } from '@public/storage'
import { ApplicationItem, AreaItem } from './applicationType'
import { getAppMarks } from './applicationMarks'

export default () => {
  // 覆盖轻应用列表storage
  const setApplicationStorage = (data) => {
    if (Array.isArray(data)) {
      setStorageSync('applicationInfoList', data)
    } else {
      console.error('setApplicationStorage', data)
    }
  }

  /** 更新单个轻应用数据 */
  const setSingleApplicationListStorage = ({ areaCode, menuCode, applicationInfo }) => {
    const lists = getApplicationInfoStorage()
    const listsNew = updateMenuInfo(lists, areaCode, menuCode, applicationInfo)
    setApplicationStorage(listsNew)
  }

  /* 返回更新后的所有轻应用列表 */
  const updateMenuInfo = (data: AreaItem[], areaCode: string, menuCode: string, applicationInfo: ApplicationItem) => {
    // 直接查找符合 areaCode 的对象
    const area = (data || []).find((item) => item.areaCode === areaCode)
    if (area && area.lightApplicationInfos) {
      // 在找到的区域中查找符合 menuCode 的菜单对象
      const menu = area.lightApplicationInfos.find((info) => info.menuCode === menuCode)
      if (menu) {
        Object.assign(menu, {
          ...applicationInfo,
          menuBackground: menu.menuBackground,
          menuIconContent: menu.menuIconContent,
          menuIconType: menu.menuIconType,
          menuName: menu.menuName,
          smallIcon: menu.smallIcon,
          smallIconContent: menu.smallIconContent,
          smallIconType: menu.smallIconType,
        })
      }
    }
    return data
  }

  /*  更新多个区域的轻应用信息*/
  const updateAreasApplicationListStorage = (areaApplications: AreaItem[]) => {
    const allLightAppInfo = getApplicationInfoStorage()

    // 创建一个映射表 { areaCode: lightApplicationInfos[] }
    const areaLightInfoMap: Record<string, ApplicationItem[]> = Object.fromEntries(
      areaApplications
        .filter((item) => item.areaCode)
        .map((item) => [item.areaCode!, item.lightApplicationInfos ?? []]),
    )

    allLightAppInfo.forEach((item) => {
      if (areaLightInfoMap[item.areaCode]) {
        item.lightApplicationInfos = areaLightInfoMap[item.areaCode]
      }
    })

    const widthMarks = updateMarks(allLightAppInfo)

    setApplicationStorage(widthMarks)
  }

  const updateMarks = (allLightAppInfo: AreaItem[]) => {
    const marks = getAppMarks()
    allLightAppInfo.forEach((area) => {
      area.lightApplicationInfos = area.lightApplicationInfos?.map((app) => {
        const markData = marks.get(app.menuCode)
        return markData
          ? {
              ...app,
              ...{
                menuBackground: markData.menuBackground,
                menuIconContent: markData.menuIconContent,
                menuIconType: markData.menuIconType,
                smallIcon: markData.smallIcon,
                smallIconContent: markData.smallIconContent,
                smallIconType: markData.smallIconType,
              },
            }
          : app
      })
    })
    return allLightAppInfo
  }

  /** 更新轻应用角标 */
  const updateApplicationMarkStorage = () => {
    const allLightAppInfo: AreaItem[] = getApplicationInfoStorage()
    const widthMarks = updateMarks(allLightAppInfo)
    setApplicationStorage(widthMarks)
  }

  return {
    updateApplicationMarkStorage,
    updateAreasApplicationListStorage,
    setSingleApplicationListStorage,
    setApplicationStorage,
  }
}
