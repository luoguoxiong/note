/**
 * @Desc: types
 * @Date: 2025/8/26
 */

interface DownLoadUpdateApkOpts {
  fileMd5: string
  versionLink: string
  versionNo: string
  showNotification?: boolean // 是否在通知栏显示:默认true
  autoInstallApk?: boolean // 下载完是否自动跳转安装 默认: true
}

interface InstallUpdateApkOpts {
  fileMd5: string
  versionNo: string
}

interface CheckUpdateApkOpts {
  fileMd5: string
}

export interface VersionPluginProps {
  DownLoadUpdateApkOpts: DownLoadUpdateApkOpts
  InstallUpdateApkOpts: InstallUpdateApkOpts
  CheckUpdateApkOpts: CheckUpdateApkOpts
}

export interface VersionPlugin {
  downloadUpdateApk: (opts?: DownLoadUpdateApkOpts) => Promise<any> | void // 下载更新apk
  installUpdateApk: (opts?: InstallUpdateApkOpts) => Promise<any> | void // 安装apk
  checkUpdateApkDownloadDone: (opts?: CheckUpdateApkOpts) => Promise<any> | void // 检测apk是否下载完成
  onMiniPluginEvent: (listener: (msg: any) => void) => void // 极光-消息监听
  offMiniPluginEvent: (listener: (msg: any) => void) => void // 极光-取消消息监听
}
