import { defineStore } from 'pinia'

let timer = null

export const useToastStore = defineStore('toast', {
  state: () => ({
    visible: false,
    title: '',
    icon: 'none', // success | error | loading | none
    duration: 1500,
    mask: false,
    style: '',
    toastId: ''
  }),

  actions: {
    showToast(options = {}) {
      // 清理旧定时器
      if (timer) {
        clearTimeout(timer)
        timer = null
      }

      this.title = options.title || ''
      this.icon = options.icon || 'none'
      this.duration = options.duration ?? 1500
      this.mask = options.mask ?? false
      this.style = options.style || ''
      this.toastId = options.toastId || ''
      setTimeout(() => {
        this.visible = true
      })
      if (this.duration > 0) {
        timer = setTimeout(() => {
          this.hideToast()
        }, this.duration)
      }
    },

    hideToast() {
      this.visible = false
    },
  },
})
