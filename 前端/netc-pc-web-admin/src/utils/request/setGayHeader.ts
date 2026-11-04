import { getQueryObject } from '@/utils'

interface GrayHeaderIn {
  key: string
  value: string
}

function getVersionFromURL(url = '') {
  const versionMatch = url.match(/\/([\d.]+)\//)
  return versionMatch ? versionMatch[1] : null
}

const setGayHeaderToKey = (sessionKey: string, urlGrayHeader: string) => {
  let grayHeaderArr = []
  if (urlGrayHeader) {
    sessionStorage.setItem(sessionKey, urlGrayHeader)
    grayHeaderArr = urlGrayHeader ? JSON.parse(decodeURIComponent(urlGrayHeader)) : []
  } else {
    const sessionHeader = sessionStorage.getItem(sessionKey)
    grayHeaderArr = sessionHeader ? JSON.parse(decodeURIComponent(sessionHeader)) : []
  }
  return grayHeaderArr
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setGayHeader = (header: Record<string, any>) => {
  const version = getVersionFromURL(location.href)

  // 没有版本号，则没有灰度头
  if (!version) {
    return []
  }

  const { grayHeader } = getQueryObject()

  const sessionKey = `PC_WEB_MAIN_${version}_grayHeader`

  const grayHeaderArr: GrayHeaderIn[] = setGayHeaderToKey(sessionKey, grayHeader)

  grayHeaderArr.forEach((item) => {
    header[item.key] = item.value
  })
}
