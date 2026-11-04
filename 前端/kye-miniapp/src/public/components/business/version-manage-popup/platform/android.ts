/**
 * @Desc: android
 * @Date: 2025/8/26
 */
import Taro from '@tarojs/taro'
import { ref, computed } from 'vue'
import { AppPlugin } from '@public/appPlugins'
import { AndroidDownProgressType } from '@public/components/business/version-manage-popup/type'
import { VersionPluginProps } from '@public/appPlugins/version/types'
import { safeJsonParse } from '@public/appPlugins/utils/common'
import { useVersionReport } from '@public/components/business/version-manage-popup/hooks/useVersionReport'

const { handleInstallVersionReport } = useVersionReport()

/** 创建可控 Promise（带 resolve / reject） */
const createControlledPromise = <T>() => {
  let resolve!: (v: T) => void
  let reject!: (e?: any) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

/* 安卓app-版本升级hook */
const useAndroidAppVersion = () => {
  const androidDownloadProgress = ref<AndroidDownProgressType>({
    fileMd5: '', //下载传进来的md5
    versionNo: '', //下载传进来的versionNo
    total: 0, //下载总进度条
    progress: 0, //下载当前进度
    filePath: '', //下载完成文件路径
  })

  const downVersionReady = ref(false) // 是否下载版本完成
  let currentTask: ReturnType<typeof createControlledPromise> | null = null // 当前安装任务promise

  // 安装按钮状态
  const installDisabled = computed(() => {
    return !downVersionReady.value
  })

  // 手动-检测下载是否完成
  // @ts-ignore
  const checkUpdateApkDownloadDone = ({ fileMd5 }) => {
    AppPlugin?.version?.checkUpdateApkDownloadDone({ fileMd5 })
  }

  /* 唤起安卓安装流程 */
  const handleAppInstall = (opts: VersionPluginProps['DownLoadUpdateApkOpts']) => {
    console.log('[appPlugin version]handleAppInstall', opts)
    const { fileMd5, versionLink, versionNo, showNotification } = opts
    const downParams = {
      fileMd5,
      versionLink,
      versionNo,
      showNotification,
      autoInstallApk: true,
    }
    // 开始下载
    AppPlugin?.version?.downloadUpdateApk(downParams)

    // TODO 调试代码待移除
    // setTimeout(() => {
    //   androidDownloadProgress.value = {
    //     fileMd5: '', //下载传进来的md5
    //     versionNo: '', //下载传进来的versionNo
    //     total: 100, //下载总进度条
    //     progress: 20, //下载当前进度
    //     filePath: 0, //下载完成文件路径
    //   }
    // }, 2000)
    // setTimeout(() => {
    //   currentTask?.reject(new Error('下载失败'))
    //   currentTask = null
    // }, 4000)
    // 开启监听
    onMiniVersionPluginEvent()
    // 返回当前下载Promise
    currentTask = createControlledPromise<any>()
    return currentTask.promise
  }
  // android更新链路
  const handleAndroidAppUpdate = (opts: VersionPluginProps['DownLoadUpdateApkOpts'], callback) => {
    downVersionReady.value = false
    callback && callback()
    return handleAppInstall(opts)
  }

  /* 唤起android-安装apk */
  const handleAndroidInstallUpdateApk = (opts) => {
    console.log('[appPlugin version]handleAndroidInstallUpdateApk', opts)
    const { fileMd5, versionNo } = opts
    const downParams = {
      fileMd5,
      versionNo,
    }
    // 开始安装
    AppPlugin?.version?.installUpdateApk(downParams)
    handleInstallVersionReport()
  }

  /**
   * 升级版本成功逻辑
   * 写入版本状态
   */
  // @ts-ignore
  const handleUpdateSuccessCallback = () => {}

  // 监听-android升级进度
  const onMiniVersionPluginEventListener = (message) => {
    console.log('[app version message]onMiniVersionPluginEventListener>>', message)
    const { type, data } = message || {}
    const dataValue = safeJsonParse<AndroidDownProgressType>(data)
    // 升级进度更新
    if (type === 'onDownloadUpdateApkProgress' && dataValue) {
      androidDownloadProgress.value = dataValue
    } else if (type === 'onDownloadUpdateApkError') {
      // 下载失败
      Taro.showToast({ icon: 'none', title: '下载失败' })
      currentTask?.reject(new Error('下载失败'))
      currentTask = null
      offMiniVersionPluginEventDelay()
    } else if (type === 'onDownloadUpdateApkCancel') {
      // 下载取消
      Taro.showToast({ icon: 'none', title: '下载取消' })
      currentTask?.reject(new Error('下载取消'))
      currentTask = null
      offMiniVersionPluginEventDelay()
    } else if (type === 'onDownloadUpdateApkDone') {
      // 下载完成
      androidDownloadProgress.value.progress = 100
      downVersionReady.value = true
      // 下载promise完成
      currentTask?.resolve(dataValue)
      currentTask = null
      offMiniVersionPluginEventDelay()
    }
  }

  // 监听android升级状态
  const onMiniVersionPluginEvent = () => {
    AppPlugin?.version.onMiniPluginEvent(onMiniVersionPluginEventListener)
  }
  // 取消监听android升级状态
  const offMiniVersionPluginEvent = () => {
    AppPlugin?.version.offMiniPluginEvent(onMiniVersionPluginEventListener)
  }
  // 延迟-取消权限监听android升级状态
  const offMiniVersionPluginEventDelay = () => {
    setTimeout(() => {
      offMiniVersionPluginEvent()
    }, 0)
  }

  return {
    installDisabled,
    androidDownloadProgress,
    handleAndroidAppUpdate,
    handleAndroidInstallUpdateApk,
  }
}

export default useAndroidAppVersion
