/**
 * url字符串追加字符串参数
 * @param url
 * @param str
 * @returns {string|*}
 */
export const urlQueryStringAdd = (url, str) => {
  if (!str) {
    return url
  }
  return `${url}${url.indexOf('?') < 0 ? '?' : '&'}${str}`
}

// params参数转url参数
const paramsToUrlStr = (params) => {
  let arr: String[] = []
  Object.keys(params).forEach((item) => {
    arr.push(`${item}=${params[item] || ''}`)
  })
  return arr.join('&')
}

/**
 * url拼接对象参数
 * @param url
 * @param paramData {}
 * @returns {string}
 */
export const urlContact = (url, paramData) => {
  return url + (url.indexOf('?') < 0 ? '?' : '&') + paramsToUrlStr(paramData)
}

export const getQueryObject = (url) => {
  url = url == null ? window.location.href : url
  const search = url.substring(url.lastIndexOf('?') + 1)
  const obj = {}
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
