import { http } from '@public/utils/request'

interface PackageUpdateRes {
  forceUpgrade: boolean
  /** 升级方式 10-强制升级，20-提示升级 */
  upgradeMode: 10 | 20 | null
}

interface PackageUpdateReq {
  // 应用类型 android-安卓，ios-ios，wechat-miniProgram-微信小程序（数据字典 eam_version_manage_app_type）
  packageType: 'android' | 'ios' | 'wechat-miniProgram'
  version: string
}

// 获取app版本升级弹窗
export const getAppUpdateInfo = (parmas: PackageUpdateReq) => {
  return http<PackageUpdateRes>('web.version.manager.package.upgrade', parmas, { hideToast: true })
}
