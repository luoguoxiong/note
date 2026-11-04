import { localStorage } from '@order-public-sub-public/utils/storage'

function getQueryObject(url = '') {
  url = url ? url : window.location.href
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

// url删除指定参数
function removeUrlParameter(url, parameterName) {
  // 使用正则表达式匹配 URL 中的参数部分，并替换掉指定的参数
  const regex = new RegExp(`[?&]${parameterName}=([^&#]*)`, 'g')
  const newUrl = url.replace(regex, '')

  // 清除可能存在的多余符号
  return newUrl.replace(/[?&]$/, '')
}

// 检测下单配置缓存优化参数
function checkQuickOrderUrlQuery() {
  // 存在quickOrderInitConfig参数
  if (location.href.indexOf('quickOrderInitConfig') !== -1 && /miniprogram/i.test(navigator.userAgent)) {
    const { quickOrderInitConfig } = getQueryObject()
    localStorage?.setItem('quickOrderInitConfig', quickOrderInitConfig)
    location.replace(removeUrlParameter(location.href, 'quickOrderInitConfig'))
  } else {
    localStorage.removeItem('quickOrderInitConfig')
  }
}
checkQuickOrderUrlQuery()
