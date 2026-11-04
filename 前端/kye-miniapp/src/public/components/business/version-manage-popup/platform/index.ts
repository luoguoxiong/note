import useAndroidAppVersion from './android'
import useIosAppVersion from './ios'
import { isWxAppIos } from '@public/appPlugins/utils/device'

/**
 * @Desc: index app升级原生能力相关
 * @Date: 2025/8/26
 */

export const useAppVersion = () => {
  const { installDisabled, androidDownloadProgress, handleAndroidAppUpdate, handleAndroidInstallUpdateApk } =
    useAndroidAppVersion()
  const { handleIosAppUpdate } = useIosAppVersion()

  /**
   * 升级app通知成功公共回调
   */
  const handleAppUpdateSuccessCallback = (opts) => {}

  /* 唤起多端立即更新 */
  const handleAppUpdate = async (opts) => {
    const isWxAppIOS = await isWxAppIos()
    if (isWxAppIOS) {
      // ios
      return handleIosAppUpdate(opts, handleAppUpdateSuccessCallback)
    } else {
      // 安卓 + 鸿蒙
      return handleAndroidAppUpdate(opts, handleAppUpdateSuccessCallback)
    }
  }

  /* 唤起app-安装更新 */
  const handleAppInstall = async (opts) => {
    const isWxAppIOS = await isWxAppIos()
    if (!isWxAppIOS) {
      handleAndroidInstallUpdateApk(opts)
    } else {
      console.log('')
    }
  }

  return {
    installDisabled,
    androidDownloadProgress,
    handleAppUpdate,
    handleAndroidInstallUpdateApk,
  }
}
