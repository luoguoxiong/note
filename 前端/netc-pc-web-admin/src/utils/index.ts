/**
 * @Desc: index
 * @Author: wu xingtao
 * @Date: 2024/4/15
 */
import { Any, PlainObject } from '@/types'
import md5 from 'js-md5'
import native from '@/utils/native'

/**
 * 创建签名，用于网络请求
 * @param token
 * @param timestamp
 * @param body
 * @returns {string}
 */
export const createSign = (token: string, timestamp: number, body: PlainObject): string => {
  return md5(md5(token).toUpperCase() + timestamp + JSON.stringify(body || {})).toUpperCase()
}

/**
 * 获取 url 参数
 * @param url
 * @returns {{}}
 */
export const getQueryObject = (url = ''): Record<string, string> => {
  url = url ? url : window.location.href
  const search = url.substring(url.lastIndexOf('?') + 1)
  const obj: Record<string, Any> = {}
  const reg = /([^?&=]+)=([^?&=]*)/g
  search.replace(reg, (rs, $1, $2) => {
    const name = decodeURIComponent($1)
    let val = decodeURIComponent($2)
    val = String(val)
    obj[name] = val
    return rs
  })
  return obj
}

/** 对象转url参数 */
export const objectToUrlParams = (obj: Record<string, Any> = {}) => {
  const tempArray = []
  for (const item in obj) {
    if (item) {
      tempArray.push(`${item}=${obj[item]}`)
    }
  }
  return tempArray?.join('&')
}

// uuid
export const uuid = (): string => {
  function b(a?: number) {
    return a
      ? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
      : (([1e7] as Any) + -[1e3] + -4e3 + -8e3 + -1e11).replace(/[018]/g, b)
  }
  return b()
}

export const isCRMInformVideoInKuashengClient = (url: string): boolean => {
  return url.includes('inform-video') && native.isKuaShenClientMode() && window['kuasheng_openUrl']
}

const getVersionPrecision = (version: string) => {
  return version.split('.').length
}

export const compareVersions = (versionA = '', versionB = '', isLoose = false) => {
  // 1) get common precision for both versions, for example for "10.0" and "9" it should be 2
  const versionAPrecision = getVersionPrecision(versionA)
  const versionBPrecision = getVersionPrecision(versionB)

  let precision = Math.max(versionAPrecision, versionBPrecision)
  let lastPrecision = 0

  const chunks = [versionA, versionB].map((version) => {
    const delta = precision - getVersionPrecision(version)

    // 2) "9" -> "9.0" (for precision = 2)
    const _version = version + new Array(delta + 1).join('.0')

    // 3) "9.0" -> ["000000000"", "000000009"]
    return _version
      .split('.')
      .map((chunk) => new Array(20 - chunk.length).join('0') + chunk)
      .reverse()
  })

  // adjust precision for loose comparison
  if (isLoose) {
    lastPrecision = precision - Math.min(versionAPrecision, versionBPrecision)
  }

  // iterate in reverse order by reversed chunks array
  precision -= 1
  while (precision >= lastPrecision) {
    // 4) compare: "000000009" > "000000010" = false (but "9" > "10" = true)
    if (chunks[0][precision] > chunks[1][precision]) {
      return 1
    }

    if (chunks[0][precision] === chunks[1][precision]) {
      if (precision === lastPrecision) {
        // all version chunks are same
        return 0
      }

      precision -= 1
    } else if (chunks[0][precision] < chunks[1][precision]) {
      return -1
    }
  }

  return undefined
}
