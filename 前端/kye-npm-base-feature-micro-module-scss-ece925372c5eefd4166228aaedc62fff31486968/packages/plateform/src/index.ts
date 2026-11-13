import Taro from '@tarojs/taro'
import {
  isAmapMiniApp,
  isWxApp,
  checkParams,
  isWxMiniApp,
  isAliMiniApp,
  isPcWorkWx,
  isWorkWx,
  isIos,
  isAndroid,
  ensureWechatInstalled,
  compareVersion,
  isH5FSEnv,
  isPcFsEnv,
  isPureHarmony,
} from './utils'
import * as fsApi from './fs'
import * as type from './type'

declare const my: any
declare const wx: any

/**
 * 能力检测守卫
 * @description
 * - 小程序端 canIUse 为原生 API 透传，存在于 Taro 对象上
 * - H5 端 canIUse 仅是 taro 运行时的命名导出，未挂到默认对象上，
 *   直接调用 Taro.canIUse 会抛 TypeError，故退化为检测 API 本身是否存在
 */
const canUseApi = (name: string): boolean => {
  const canIUse = (Taro as any).canIUse
  if (typeof canIUse === 'function') {
    return canIUse.call(Taro, name)
  }
  return typeof (Taro as any)[name] === 'function'
}

/**
 * 获取设备窗口信息
 * @description
 * - 优先使用 Taro.getWindowInfo（新 API，字段更完整，精度更高）
 * - 如果当前基础库不支持，则回退到 Taro.getSystemInfoSync
 * @returns 窗口信息对象，包含屏幕尺寸、状态栏高度、安全区域等
 */
const getWindowInfo = (): Taro.getWindowInfo.Result => {
  if (canUseApi('getWindowInfo')) {
    return Taro.getWindowInfo()
  }
  const res = Taro.getSystemInfoSync()
  return {
    pixelRatio: res.pixelRatio,
    screenWidth: res.screenWidth,
    screenHeight: res.screenHeight,
    windowWidth: res.windowWidth,
    windowHeight: res.windowHeight,
    statusBarHeight: res.statusBarHeight,
    safeArea: res.safeArea,
  }
}

/**
 * 获取小程序胶囊按钮（右上角菜单按钮）位置信息
 * @description
 * - 优先使用 Taro.getMenuButtonBoundingClientRect
 * - 如果是高德小程序且 Android 端，需要额外除以像素比（高德返回的是物理像素）
 * - 如果不支持 API，则返回预设的默认值（防止布局错乱）
 * @returns 胶囊按钮的位置信息（位置、尺寸）
 */
const getMenuButtonBoundingClientRect =
  (): Taro.getMenuButtonBoundingClientRect.Rect => {
    if (canUseApi('getMenuButtonBoundingClientRect')) {
      const rect = Taro.getMenuButtonBoundingClientRect() || {}

      // 高德小程序 Android 平台特殊处理：需将物理像素转换为逻辑像素
      if (isAmapMiniApp && my?.env?.platform === 'Android') {
        const { pixelRatio, version } = Taro.getSystemInfoSync()

        // 大于16.05的版本不需要特殊处理
        const isLowVersion = compareVersion(version as string, '16.05') !== 1

        if (isLowVersion) {
          return {
            ...rect,
            height: rect?.height / pixelRatio,
            width: rect?.width / pixelRatio,
            left: rect?.left / pixelRatio,
            right: rect?.right / pixelRatio,
            top: rect?.top / pixelRatio,
            bottom: rect?.bottom / pixelRatio,
          }
        }
      }
      return rect
    }

    // API 不可用时的默认值（按常见机型估算）
    const res = Taro.getSystemInfoSync()
    const top = res.statusBarHeight ? res.statusBarHeight + 8 : 20
    return {
      bottom: 82,
      height: 28,
      left: 306,
      right: 382,
      top,
      width: 76,
    }
  }

/**
 * 打开微信小程序（支持 App 和 小程序两种环境）
 * @description
 * - 在微信 App 内，使用 wx.miniapp.launchMiniProgram
 * - 在小程序内，使用 Taro.navigateToMiniProgram
 * @param params 打开小程序所需参数
 */
const openMiniProgram = async (params: type.OpenMiniProgramParmas) => {
  if (isWxApp()) {
    // 微信 App 环境
    const hasWechatInstall = await ensureWechatInstalled()
    if (!hasWechatInstall) {
      return Taro.showToast({ title: '您尚未安装微信客户端', icon: 'none' })
    }
    if (!checkParams(params, ['userName', 'path', 'miniprogramType'])) return
    wx.miniapp.launchMiniProgram({
      userName: params.userName, // 小程序原始 ID
      path: params.path, // 目标页面路径
      miniprogramType: params.miniprogramType, // 小程序类型（0: 正式, 1: 开发, 2: 体验）
    })
  } else {
    // 小程序环境
    if (!checkParams(params, ['appId', 'path', 'envVersion'])) return
    Taro.navigateToMiniProgram({
      appId: params.appId, // 目标小程序 AppId
      path: params.path, // 页面路径
      envVersion: params.envVersion, // 版本类型（develop, trial, release）
    })
  }
}

const showAuthModal = (onConfirm: () => void, authName: string) => {
  // 非微信App场景，针对特定权限检查是否已触发过
  if (isAliMiniApp) {
    // Taro.showToast({
    //   title: `未授权当前小程序获取您的${authName}权限，可点击右上角【...】-【设置】修改授权状态`,
    //   icon: 'none',
    // })
    return
  }

  Taro.showModal({
    title: '温馨提示',
    content: `需要获取您的${authName}权限,用于扫码寄件、查单服务,您可设置手机${authName}权限`,
    confirmText: '去设置',
    cancelText: '暂不设置',
    confirmColor: '#8365f6',
    cancelColor: '#686B75',
    success: (res) => {
      if (res.confirm) {
        onConfirm()
      } else {
        console.log('用户点击取消')
      }
    },
  })
}

const handleScanCodeError = (err: any) => {
  if (isWxMiniApp && err?.errMsg?.includes('denied')) {
    showAuthModal(() => Taro.openAppAuthorizeSetting({}), '相机')
    return
  }

  if (isAmapMiniApp && err?.errorMessage?.includes('not allow authorization')) {
    showAuthModal(() => Taro.openSetting({}), '相机')
    return
  }

  if (isAliMiniApp && err?.error === 2001) {
    showAuthModal(() => Taro.openSetting({}), '相机')
    return
  }
}

const iosAppScanCode = (): Promise<{
  path?: string
  result?: string
}> => {
  return new Promise((reslove, reject) => {
    wx.miniapp.loadNativePlugin({
      pluginId: 'wxbe1a61223a0aa4d7',
      success(plugin: any) {
        console.error(
          'openScanASynWithCallback ',
          plugin?.openScanASynWithCallback,
        )
        plugin?.openScanASynWithCallback(
          { onlyFromCamera: false },
          (res: any) => {
            reslove(res)
          },
        )
      },
      fail(err: any) {
        reject(err)
        console.error('openScanASynWithCallback插件扫码失败：', err)
      },
    })
  })
}

const scanCode = async (): Promise<{
  path?: string
  result?: string
} | void> => {
  if (isPcWorkWx() || isPcFsEnv) {
    Taro.showToast({
      title: '当前登录设备，暂不支持该功能',
      icon: 'none',
    })
    return
  }
  try {
    if (isH5FSEnv) {
      return await fsApi.scanCode({})
    }
    const { platform } = await Taro.getSystemInfo()
    const isIOS = platform.toLowerCase() === 'ios'
    const isIOSApp = isIOS && isWxApp()
    if (isIOSApp) {
      return await iosAppScanCode()
    }
    const res = (await Taro.scanCode({})) as any
    return {
      ...res,
      path: res?.path,
      result: res?.result || res?.qrCode || res?.barCode || res?.code,
    }
  } catch (error) {
    handleScanCodeError(error)
    throw error
  }
}

const handleSaveImageError = async (err: any) => {
  if (isWxMiniApp && err?.errMsg.includes('fail cancel')) {
    Taro.showToast({
      title: '用户已取消',
      icon: 'none',
    })
    return
  }

  if (isH5FSEnv && err.errCode === '102') {
    Taro.showToast({
      title: '用户已取消',
      icon: 'none',
    })
    return
  }

  const { platform } = await Taro.getSystemInfo()
  const isIOS = platform.toLowerCase() === 'ios'
  const isIOSApp = isWxMiniApp && isIOS && isWxApp()

  const isNotIOSApp = isWxMiniApp && !isIOSApp

  if (isIOSApp) {
    const authScope = Taro.getAppAuthorizeSetting()
    const hasSavePhotoAuth = authScope?.albumAuthorized === 'authorized'

    if (!hasSavePhotoAuth) {
      showAuthModal(() => Taro.openAppAuthorizeSetting({}), '相册')
    }
  }

  if (
    isNotIOSApp &&
    (err?.errMsg?.includes('auth deny') || err?.errMsg?.includes('access deny'))
  ) {
    showAuthModal(() => {
      isWxApp() ? Taro.openAppAuthorizeSetting({}) : Taro.openSetting({})
    }, '相册')
    return
  }

  if (isAmapMiniApp && err?.errorMessage?.includes('not allow authorization')) {
    showAuthModal(() => Taro.openSetting({}), '相册')
    return
  }

  if (
    isAliMiniApp &&
    (err?.error === 2001 || err?.errorMessage?.includes('no permission'))
  ) {
    showAuthModal(() => Taro.openSetting({}), '相册')
    return
  }
}

const saveImageToPhotosAlbum = async (imgUrl: string) => {
  try {
    if (isH5FSEnv) {
      if (isPureHarmony()) {
        Taro.showToast({
          title: '当前登录设备，暂不支持该功能',
          icon: 'none',
        })
        return
      }
      const { path } = await fsApi.getImageInfo({ src: imgUrl })
      await fsApi.saveImageToPhotosAlbum({ filePath: path })
      await Taro.showToast({ title: '成功保存到相册', icon: 'none' })
      // 高德
    } else if (isAmapMiniApp) {
      await my.saveImage({
        url: imgUrl,
      })
      await Taro.showToast({ title: '成功保存到相册', icon: 'none' })
    } else {
      // 微信小程序
      if (isWxMiniApp) {
        const downloadRes = await Taro.downloadFile({
          url: imgUrl,
          filePath: wx.env.USER_DATA_PATH + '/' + new Date().valueOf() + '.jpg',
        })
        await Taro.saveImageToPhotosAlbum({ filePath: downloadRes.filePath })
      } else {
        // 支付宝
        const downloadRes = await Taro.downloadFile({ url: imgUrl })
        await Taro.saveImageToPhotosAlbum({
          filePath: downloadRes.tempFilePath,
        })
      }
      if (!isAliMiniApp) {
        await Taro.showToast({ title: '成功保存到相册', icon: 'none' })
      }
    }
  } catch (error) {
    await handleSaveImageError(error)
    throw error
  }
}

const chooseMedia = async (
  parmas: type.ChooseMediaParmas,
): Promise<Taro.chooseMedia.SuccessCallbackResult | void> => {
  try {
    if (isAmapMiniApp || isAliMiniApp || isWorkWx()) {
      const { mediaType } = parmas
      if (mediaType && mediaType?.includes('video')) {
        console.error('当前平台不支持上传视频')
      }
      const result = (await Taro.chooseImage({
        count: parmas?.count ?? 1,
        sizeType: parmas?.sizeType ?? ['original', 'compressed'],
        sourceType: parmas?.sourceType ?? ['album', 'camera'],
      })) as any

      if (result.tempFiles) {
        return {
          tempFiles: result.tempFiles.map((item: any, index: number) => {
            return {
              ...item,
              tempFilePath: item.path,
              // 加一个 name，可以取文件名或者用 index + 时间戳生成
              size: item.size || 0,
              name: `image_${Date.now()}_${index}.jpg`,
            }
          }) as any,
          type: 'image',
          errMsg: result.errMsg,
        }
      }
      return {
        tempFiles: result.apFilePaths.map((item: string, index: number) => {
          return {
            tempFilePath: item,
            // 加一个 name，可以取文件名或者用 index + 时间戳生成
            size: 0,
            name: `image_${Date.now()}_${index}.jpg`,
          }
        }) as any,
        type: 'image',
        errMsg: result.errMsg,
      }
    } else {
      const sourceType: any = ['album', 'camera']
      if (isWxApp() && isIos) {
        const setting = wx.getAppAuthorizeSetting()

        const notAlbumAuthorized = isAndroid
          ? false
          : setting.albumAuthorized === 'denied'

        const notCameraAuthorizedNot = setting.cameraAuthorized === 'denied'

        if (notAlbumAuthorized || notCameraAuthorizedNot) {
          showAuthModal(() => {
            isWxApp() ? Taro.openAppAuthorizeSetting({}) : Taro.openSetting()
          }, '相册和相机')
          return
        }
      }

      const result = await Taro.chooseMedia({
        count: parmas?.count ?? 1,
        sizeType: parmas?.sizeType ?? ['original', 'compressed'],
        mediaType: parmas?.mediaType ?? ['image', 'video'],
        sourceType: parmas?.sourceType ?? sourceType,
        maxDuration: parmas?.maxDuration ?? 30,
      })

      return {
        tempFiles: result.tempFiles,
        type: result.type,
        errMsg: result.errMsg,
      }
    }
  } catch (error) {
    console.error('error', error)
    throw error
  }
}

const makePhoneCall = ({ phoneNumber }: { phoneNumber: string }) => {
  if (isPcWorkWx() || isPcFsEnv) {
    Taro.showToast({
      title: '当前登录设备，暂不支持该功能',
      icon: 'none',
    })
    return
  }
  Taro.makePhoneCall({ phoneNumber })
}

const getLocation = async (option: Taro.getLocation.Option) => {
  try {
    return await (isH5FSEnv
      ? fsApi.getLocation(option)
      : Taro.getLocation(option))
  } catch (err: any) {
    if (err?.errCode && err.errCode === 2) {
      Taro.showToast({
        title: '无法获取位置，请检查并开启GPS权限',
        icon: 'none',
        duration: 2000,
      })
      throw err
    }
    const isWxNoAuth =
      isWxMiniApp &&
      (err?.errMsg?.includes('auth') ||
        err?.errMsg?.includes('permission denied'))
    const isAliNoAuth =
      isAliMiniApp && (err?.error === 11 || err?.error === 2001)

    if (isWxNoAuth || isAliNoAuth) {
      showAuthModal(() => {
        isWxApp() ? Taro.openAppAuthorizeSetting({}) : Taro.openSetting()
      }, '定位')
      throw err
    }
    throw err
  }
}

export const openLocation = async (option: Taro.openLocation.Option) => {
  if (isPcFsEnv) {
    Taro.showToast({
      title: '当前登录设备，暂不支持该功能',
      icon: 'none',
    })
    return
  }
  if (isH5FSEnv) {
    return await fsApi.openLocation(option)
  } else {
    return await Taro.openLocation(option)
  }
}

export const getClipboardData = async () => {
  if (isH5FSEnv) {
    return await fsApi.getClipboardData({})
  } else {
    return await Taro.getClipboardData()
  }
}

export const getFileSystemManager = async () => {
  if (isH5FSEnv) {
    return fsApi.getFileSystemManager()
  } else {
    return Taro.getFileSystemManager()
  }
}

export default {
  getWindowInfo,
  getMenuButtonBoundingClientRect,
  openMiniProgram,
  scanCode,
  saveImageToPhotosAlbum,
  chooseMedia,
  makePhoneCall,
  getLocation,
  openLocation,
  getClipboardData,
  getFileSystemManager,
}
