import { createApp } from 'vue'
import LoadingTipsComp from './index.vue'

import type { LoadingTipsOptions } from './types'

interface IDialog {
  instance: any
  mountNode: HTMLDivElement | null
  create: (options: any) => void
  destroy: () => void
}

const LoadingTips: IDialog = {
  instance: null,
  mountNode: null,
  create(options: LoadingTipsOptions) {
    console.log('OrderSuccessDialog options', options)
    const messageInstance = createApp(LoadingTipsComp, {
      ...options,
      close: () => {
        console.log('close loadingTips...')
        messageInstance.unmount()
        if (mountNode) {
          document.body.removeChild(mountNode)
        }
      },
    })

    const mountNode = document.createElement('div')
    document.body.appendChild(mountNode)

    messageInstance.mount(mountNode)

    this.instance = messageInstance
    this.mountNode = mountNode
  },

  destroy() {
    try {
      this.instance?.unmount()
    } catch (error) {
      console.error('LoadingTips destroy error:', error)
    } finally {
      if (this.instance) {
        if (this.mountNode) {
          document.body.removeChild(this.mountNode)
        }
        this.instance = null
        this.mountNode = null
      }
    }
  },
}

export default LoadingTips
