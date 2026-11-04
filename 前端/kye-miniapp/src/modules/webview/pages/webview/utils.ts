import { urlContact, getQueryObject } from '@/public/utils/url'
import Taro from '@tarojs/taro'

// 是否开启灰度头配置
export const NeedGrayType = {
  是: 10,
  否: 20,
}

export const matchApplicationVersion = (url) => {
  const versionMatchRule = new RegExp('^.*[A-Zaz-z0-9]+(?:[.|_][A-Za-z0-9]+){2}/?.*$')
  return versionMatchRule.test(url)
}

/* 获取url携带的版本号 */
export const getApplicationVersionFromUrl = (url) => {
  if (!url) {
    return null
  }
  // 正则表达式匹配版本号
  const versionRegex = /\/(\d+\.\d+\.\d+)\//g
  const match = decodeURIComponent(url).match(versionRegex)
  if (match && match.length > 0) {
    // 返回第一个匹配项（版本号），去掉斜杠
    return match[0].replace(/\//g, '')
  }
  return null
}

/**
 * 根据url + url version聪轻应用列表匹配轻应用信息
 * @param url
 * @param urlVersion
 * @returns {{}}
 */
export const matchApplicationInfoListFromVersion = (url, urlVersion) => {
  const applicationInfo = Taro.getStorageSync('applicationInfoList')
  let applicationObj = {}
  try {
    applicationInfo.forEach((obj) => {
      obj.lightApplicationInfos.forEach((item) => {
        if (urlVersion === item.versionNumber && decodeURIComponent(url).includes(item.loadAddress)) {
          applicationObj = item
          throw new Error('匹配成功，中断循环')
        }
      })
    })
  } catch (e) {
    console.log(e)
  }
  return applicationObj
}

/**
 * url凭借grayheader灰度头参数
 * @param url
 * @param applicationInfo
 * @returns {string}
 */
const applicationUrlAndGray = (url, applicationInfo) => {
  let result = url
  const { needGray, grayHeader } = applicationInfo || {}
  // needGray开启灰度头, grayHeader存在
  if (needGray && Number(needGray) === NeedGrayType['是'] && grayHeader && grayHeader.length > 0) {
    result = urlContact(result, {
      grayheader: encodeURIComponent(JSON.stringify(grayHeader)),
    })
  }
  return result
}

export const addAppGrayHeader = (src: string) => {
  const parmas = getQueryObject(src)
  const grayheader = parmas.grayheader
  if (grayheader) {
    return src
  }
  if (!matchApplicationVersion(src)) {
    return src
  }
  const applicationVersion = getApplicationVersionFromUrl(src)
  const matchApplication = applicationVersion ? matchApplicationInfoListFromVersion(src, applicationVersion) : null
  if (matchApplication) {
    return applicationUrlAndGray(decodeURIComponent(src), matchApplication)
  } else {
    return src
  }
}

export const downloadImage = async (imageSrc) => {
  if (!imageSrc) return
  try {
    // 1. 下载文件到临时路径
    const res = await Taro.downloadFile({
      url: imageSrc,
    })

    if (res.statusCode === 200) {
      const tempFilePath = res.tempFilePath

      // 2. 保存到相册
      await Taro.saveImageToPhotosAlbum({
        filePath: tempFilePath,
      })
    } else {
      throw new Error('图片下载失败')
    }
  } catch (error) {
    // 处理错误
    if (error.errMsg.includes('auth')) {
      Taro.showModal({
        title: '提示',
        content: '请授权保存图片到相册',
        success: (res) => {
          if (res.confirm) {
            Taro.openSetting()
          }
        },
      })
    } else {
      Taro.showToast({
        title: '下载失败',
        icon: 'none',
      })
      console.error(error)
    }
  }
}
