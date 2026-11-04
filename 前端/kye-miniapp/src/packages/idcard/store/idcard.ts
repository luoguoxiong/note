/**
 * @Desc: idCardStore
 * @Date: 2025/8/12
 */
// 主要给个人介绍 - 上传视频使用
import { defineStore } from 'pinia'

export const useIdCardStore = defineStore('idCard', {
  state: () => ({
    needFresh: true,
    isStop: false,
    uplodaTimer: null as any,
    uploader: null as any,

    // 进度条展示:
    videoLastProgress: 0,
  }),

  actions: {
    updateFresh(refresh: boolean) {
      this.needFresh = refresh
    },

    setUploadTimer(timer: number) {
      this.uplodaTimer = timer
    },

    startUpload(uploader: any) {
      this.isStop = false
      this.uploader = uploader
    },

    getIsStop(): boolean {
      console.error(this.isStop)
      return this.isStop
    },

    stopUpload() {
      try {
        if (this.uplodaTimer) {
          clearInterval(this.uplodaTimer)
        }
        this.isStop = true
        if (this.uploader?.cancel) {
          this.uploader.cancel()
        }
      } catch (error) {
        console.error('取消上传', error)
      }
    },

    updateVideoLastProgress(newval) {
      this.videoLastProgress = newval
    },
  },
})
