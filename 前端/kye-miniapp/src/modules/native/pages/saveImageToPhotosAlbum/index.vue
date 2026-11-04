<template>
  <view></view>
</template>
<script setup lang="ts">
import { isWxAppIosEnv } from '@/public/utils'
import Taro, { useRouter } from '@tarojs/taro'

const { params } = useRouter()

/**
 * 保存图片到相册
 * @param url 图片地址
 */
const saveImageToPhotosAlbum = async (url: string): void => {
  if (url.startsWith('data:image/')) {
    const suffix = url.split(';')[0].split('/')[1] || 'png'
    const filePath = `${Taro.env.USER_DATA_PATH}/temp_image` + `.${suffix}`
    // base64 转成文件。获取 filePath
    Taro.getFileSystemManager().writeFile({
      filePath,
      data: url.split(',')[1],
      encoding: 'base64',
      success: () => {
        saveImageByFilePath(filePath)
      },
    })
  } else {
    const downloadRes = await Taro.downloadFile({
      url,
      filePath: wx.env.USER_DATA_PATH + '/' + new Date().valueOf() + '.jpg',
    })
    saveImageByFilePath(downloadRes.filePath)
  }
}

const saveImageByFilePath = (filePath: string): void => {
  Taro.saveImageToPhotosAlbum({
    filePath,
    success: () => {
      Taro.hideLoading()
      Taro.navigateBack({
        success: () => {
          Taro.showModal({ title: '提示', content: '图片保存成功', showCancel: false })
        },
      })
    },
    fail: async (err) => {
      let isDenied =
        err.errMsg === 'saveImageToPhotosAlbum:fail:auth denied' ||
        err.errMsg === 'saveImageToPhotosAlbum:fail auth deny' ||
        err.errMsg === 'saveImageToPhotosAlbum:fail authorize no response'

      if (isWxAppIosEnv) {
        const authSetting = Taro.getAppAuthorizeSetting()
        isDenied =
          isDenied ||
          // @ts-ignore
          (authSetting?.albumAuthorized !== 'authorized' && authSetting.albumAddOnlyAuthorized !== 'authorized')
      }

      if (isDenied) {
        // 需要用户授权
        Taro.showModal({
          title: '提示',
          content: '需要您授权保存相册',
          showCancel: false,
          success: () => {
            Taro.openSetting({
              success: (settingData) => {
                if (settingData.authSetting['scope.writePhotosAlbum']) {
                  Taro.navigateBack({
                    success: () => {
                      Taro.showModal({
                        title: '提示',
                        content: '获取权限成功,再次点击图片即可保存',
                        showCancel: false,
                      })
                    },
                  })
                } else {
                  Taro.navigateBack({
                    success: () => {
                      Taro.showModal({
                        title: '提示',
                        content: '获取权限失败，将无法保存到相册哦~',
                        showCancel: false,
                      })
                    },
                  })
                }
              },
              fail: (failData) => {
                console.log('failData', failData)
                Taro.navigateBack()
              },
              complete: (finishData) => {
                console.log('finishData', finishData)
              },
            })
          },
        })
      } else {
        Taro.navigateBack({
          success: () => {
            Taro.showModal({ title: '提示', content: '图片保存失败，请重试', showCancel: false })
          },
        })
      }
    },
    complete: () => {
      Taro.hideLoading()
    },
  })
}

saveImageToPhotosAlbum(decodeURIComponent(params.url as string) as string)
</script>
