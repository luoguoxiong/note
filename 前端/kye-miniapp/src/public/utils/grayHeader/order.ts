import { getApplicationByCode } from '@public/utils/applicationUtil'
import { getVersionAsHeader } from '@public/constants/version'
import { getGrayHeaderLists } from '@public/utils/request/grayHeader'
export const getOrderGrayHeader = () => {
  let result = {
    'X-framework-Icgray': '1029',
  }
  try {
    let grayHeader = [{ key: 'X-framework-Icgray', value: '1029' }]
    const version = getVersionAsHeader()
    const appInfo = getApplicationByCode('A6010', 'M6888')
    console.log('appInfo', appInfo)
    const versionCustomParam = appInfo?.versionCustomParam
    if (versionCustomParam?.includes(version)) {
      grayHeader = appInfo?.grayHeader || []
    }
    result = getGrayHeaderLists(grayHeader)
    if (!appInfo) {
      console.error('未获取到轻应用告警')
    }
  } catch (e) {
    console.error(e)
  }
  return result
}
