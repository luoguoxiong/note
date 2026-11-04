import Taro from '@tarojs/taro'
import { getEnvConfig } from '@/public/config'
import { getChannelCode } from '@/public/components/business/advertise-center/utils'
import { formatTime, getPlateForm, report_pv_event, sleep } from '@/public/utils'
import { getAdvertisementDetail } from '@/public/components/business/advertise-center/api'
import { ImgLink } from '@/public/components/business/advertise-center/type'
import { MINI_APP_VERSION } from '@/public/constants'
import { eventBus } from '@/public/utils/eventBus'

type AdvertisementCallback = (visible: boolean) => void

/**
 * 广告管理器（单例）
 */
class SplashManager {
  /* ================= 私有状态 ================= */

  private banner = ''
  private adData: any = {}

  private isInit = false

  private isForceClose = false

  private waitingClosePromise: Promise<void> | null = null
  private waitingCloseResolve: (() => void) | null = null

  private initPromise: Promise<void> | null = null
  private initResolve: (() => void) | null = null

  /* ================= 初始化 ================= */

  onShow(callback: AdvertisementCallback): void {
    if (this.isInit || this.isForceClose) return

    eventBus.on('advertisementOpen', callback)
    this.isInit = true

    this.initResolve?.()
  }

  async onHide(callback?: () => void): Promise<void> {
    await this.waitCloseThenOpenPage()
    callback && callback()
  }

  /* ================= 广告打开 ================= */

  async open(): Promise<void> {
    if (!this.isInit) {
      if (!this.initPromise) {
        this.initPromise = new Promise<void>((resolve) => {
          this.initResolve = resolve
        })
      }
      await this.initPromise
    }
    if (!this.isForceClose) {
      eventBus.emit('advertisementOpen', true)
    }
  }

  /* ================= 文件检测 ================= */

  private isExitInLocalFile(path: string): Promise<boolean> {
    if (!path) return Promise.resolve(false)

    const fs = Taro.getFileSystemManager()

    const check = new Promise<boolean>((resolve) => {
      fs.access({
        path,
        success: () => resolve(true),
        fail: () => resolve(false),
      })
    })

    const timeout = new Promise<boolean>((resolve) => {
      setTimeout(() => resolve(false), 300)
    })

    return Promise.race([check, timeout])
  }

  /* ================= 广告筛选 ================= */

  private pickBestAd(adList: ImgLink[]) {
    const { screenWidth, screenHeight } = Taro.getSystemInfoSync()
    const deviceRatio = screenWidth / screenHeight

    return adList.reduce((best, ad) => {
      const w = Number(ad.imgRatio1)
      const h = Number(ad.imgRatio2)
      if (!w || !h) return best

      const diff = Math.abs(w / h - deviceRatio)
      const bestDiff = Math.abs(Number(best?.imgRatio1) / Number(best?.imgRatio2) - deviceRatio)

      return diff < bestDiff ? ad : best
    }, adList[0])
  }

  /* ================= 展示缓存广告 ================= */

  async checkFileExitToShow(): Promise<void> {
    const cachePath = Taro.getStorageSync('STORAGE_KEY')
    const cacheData = Taro.getStorageSync('STORAGE_KEY_DATA')
    const { isApp } = getEnvConfig()

    if (!cachePath) {
      this.close()
      return
    }

    const hasFile = isApp ? await this.isExitInLocalFile(cachePath) : false

    if (!hasFile) {
      this.close()
      return
    }
    // 3. 过期校验（重点）
    const expireTime = cacheData?.endTime
    const now = Date.now()
    if (expireTime && now > expireTime) {
      this.close()
      return
    }

    report_pv_event('page_splash_screen_v1', {
      isMiniApp: 1,
      appVersion: MINI_APP_VERSION,
      platform: getPlateForm(),
    })

    this.banner = cachePath
    this.adData = cacheData
    await this.open()
  }

  /* ================= 拉取广告 ================= */

  async getAdData(): Promise<void> {
    try {
      const { data } = await getAdvertisementDetail(
        {
          channelCode: getChannelCode(),
          pageCode: 'startPage',
          adTypeList: ['40'],
          operatePort: 'APP',
          operatorSystem: getChannelCode(),
          latestUpdateTime: formatTime(Date.now(), 'YYYY-MM-DD HH:mm:ss'),
        },
        { unToken: true },
      )

      const detail = data?.[0]?.detailsList?.[0]
      const advertisement = detail?.advertisementPageDto ?? {
        androidLinks: [],
        iosLinks: [],
      }

      advertisement.advertisementCode = detail?.advertisementCode
      advertisement.endTime = detail?.endTime
      Taro.setStorageSync('STORAGE_KEY_DATA', advertisement)

      const { systemType } = getEnvConfig()
      const adList = systemType === 'iOS' ? advertisement.iosLinks : advertisement.androidLinks

      if (!adList?.length) {
        Taro.setStorageSync('STORAGE_KEY', '')
        return
      }

      const bestAd = this.pickBestAd(adList)
      if (!bestAd?.imgLink) return

      const res = await Taro.downloadFile({ url: bestAd.imgLink })

      if (res?.tempFilePath) {
        Taro.setStorageSync('STORAGE_KEY', res.tempFilePath)
      }
    } catch (e) {
      console.error('[Advertisement] 获取广告失败', e)
    }
  }

  /* ================= 关闭广告 ================= */

  close(): void {
    this.waitingCloseResolve?.()
  }

  /* ================= 强制关闭广告 ================= */
  forceCloseSplash(): void {
    if (!this.isForceClose) {
      this.isForceClose = true
      this.waitingCloseResolve?.()
      Taro.showTabBar()
    }
  }

  /* ================= 启动页等待 ================= */

  waitCloseThenOpenPage(): Promise<void> {
    if (this.waitingClosePromise) return this.waitingClosePromise

    this.waitingClosePromise = new Promise(async (resolve) => {
      this.waitingCloseResolve = resolve

      if (!getEnvConfig().isApp) {
        resolve()
        return
      }

      await this.checkFileExitToShow()
      this.getAdData()
    })

    return this.waitingClosePromise
  }

  /* ================= 状态读取 ================= */

  getState() {
    return {
      banner: this.banner,
      adData: this.adData,
    }
  }
}

export const splashManager = new SplashManager()
