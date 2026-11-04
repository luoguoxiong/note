export const ua = navigator.userAgent

export const isAndroid = /(Android);?[\s/]+([\d.]+)?(.*Mobile)/.test(ua)
export const isAppBrowse = /appType=/.test(ua)
export const isIpad = /(iPad).*OS\s([\d_]+)/.test(ua)
export const isIphone = !isIpad && /(iPhone\sOS)\s([\d_]+)/.test(ua)
export const isAppiOS = isAppBrowse && isIphone
export const isAppAndroid = isAppBrowse && isAndroid

//获取版本号
export const getVersion = () => {
  const userAgent = navigator.userAgent
  const deviceInfo = userAgent.split(' ')
  const col = deviceInfo.find((e) => e.includes('version'))
  if (!col) return null
  const version = col.split('=')[1]
  return version
}

/**
 * 版本号比较，v1 是否大于等于 v2
 * @param v1
 * @param v2
 * @returns {boolean}
 */
export const compareVersion = (v1, v2) => {
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)

  // 调整两个版本号位数相同
  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  // 循环判断每位数的大小
  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i])
    const num2 = parseInt(v2[i])

    if (num1 > num2) {
      return true
    } else if (num1 < num2) {
      return false
    }
  }

  return true
}
