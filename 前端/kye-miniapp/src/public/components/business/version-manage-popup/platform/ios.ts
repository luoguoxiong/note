/**
 * @Desc: ios
 * @Date: 2025/8/26
 */
import Taro from '@tarojs/taro'

const useIosAppVersion = () => {
  /* 跳转app应用市场 */
  const handleIosAppUpdate = (opts, callback) => {
    console.log('[appPlugin version] handleIosAppUpdate', opts)
    if (wx.miniapp?.jumpToAppStore) {
      wx.miniapp?.jumpToAppStore({
        success: (res) => {
          console.log('jumpToAppStore success:', res)
        },
        fail: (res) => {
          console.log('jumpToAppStore fail:', res)
          if (res.errMsg) {
            Taro.showToast({ title: res.errMsg, icon: 'none' })
          }
        },
      })
    }
  }
  return {
    handleIosAppUpdate,
  }
}

export default useIosAppVersion
