import { isWxAppAndroidEnv, isWxAppIosEnv } from '@public/utils/device'
import Taro from '@tarojs/taro'
import { showToast } from '../hooks/useShowToast'
import { isAmapApp } from './device'

interface IDownLoadParams {
  url: string
  filePath?: string
  success?: (res: any) => void
  fail?: (res: any) => void
  complete?: (res: any) => void
}

export const downLoadFile = (url: string, type: keyof Taro.openDocument.FileType = 'docx', fileName = '') => {
  if (isAmapApp) {
    return showToast('受小程序功能限制，无法下载文件，请前往跨越寄件app寄件')
  }

  console.log(fileName, 'fileNamefileNamefileName')

  const downLoadParams: IDownLoadParams = {
    url,
    success(downloadRes) {
      console.log(downloadRes, 'downloadResdownloadRes', downLoadParams.filePath)
      if (downloadRes.statusCode === 200) {
        if (isWxAppAndroidEnv || isWxAppIosEnv) {
          // 如果是多端app需要使用shareFile方法
          wx.miniapp.shareFile({
            filePath: downloadRes.tempFilePath || downloadRes.filePath,
            success: function (item) {
              console.log('打开文档成功', item)
            },
            fail: function (err) {
              console.log('打开文档失败', err)
            },
          })
        } else {
          // 如果是wx小程序需要使用 Taro.openDocument
          Taro.openDocument({
            filePath: downloadRes.tempFilePath || downloadRes.filePath,
            fileType: type,
            showMenu: true,
            success: function (item) {
              console.log('打开文档成功', item)
            },
            fail: function (err) {
              console.log('打开文档失败', err)
            },
          })
        }
      }
    },
    fail() {
      showToast('下载失败')
    },
  }

  if (fileName) {
    downLoadParams.filePath = Taro.env.USER_DATA_PATH + '/' + fileName
  }
  Taro.downloadFile(downLoadParams)
}
