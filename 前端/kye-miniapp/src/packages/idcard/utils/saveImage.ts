import Taro from '@tarojs/taro'

// 保存远程图片
export const saveRemoteImage = async (imageUrl: string): Promise<void> => {
  try {
    // 1. 下载图片到本地临时路径
    const { tempFilePath } = await Taro.downloadFile({
      url: imageUrl, // 远程图片地址
    })
    console.log('🚀 ~ saveRemoteImage ~ tempFilePath:', tempFilePath)

    // 3. 保存图片到相册
    await Taro.saveImageToPhotosAlbum({
      filePath: tempFilePath,
    })

    Taro.showToast({
      title: '保存成功',
      icon: 'success',
    })
  } catch (error: any) {
    if (error?.errMsg?.includes('auth')) {
      Taro.showToast({
        title: '保存失败，请开启相册权限',
        icon: 'none',
      })
    } else {
      Taro.showToast({
        title: '保存图片失败',
        icon: 'none',
      })
      console.error('保存图片失败:', error)
    }
  }
}

export default {}
