/**
 * 下载中心完成通知(下载中心入口轮询到压缩完成任务后的 Notification 提醒)
 * 来源: netc-pc-web/src/views/download/notification.js
 * element-ui Notification -> element-plus ElNotification
 * (title/message/type 基本兼容; HTML 按钮的 el-button--mini -> el-button--small)
 */
import { ElNotification } from 'element-plus'
import { cloneDeep, uniqueId } from 'lodash-es'

/** 通知项(未下载任务) */
export interface NotificationItem {
  id?: string
  compressionId?: string | number
  message?: string
  hasBeenShown?: boolean
  [key: string]: any
}

interface DownloadNotificationOptions {
  maxShowCount?: number
  onClick?: () => void
  onShowAll?: (data: boolean) => void
}

class DownloadNotification {
  list: NotificationItem[] = []
  maxShowCount: number
  curShowCount = 0
  onClick?: () => void
  onShowAll: (data: boolean) => void

  constructor({ maxShowCount = 3, onClick, onShowAll }: DownloadNotificationOptions = {}) {
    this.maxShowCount = maxShowCount
    this.onClick = onClick
    this.onShowAll = onShowAll || (() => undefined)
  }

  add(list: NotificationItem[] = []) {
    if (!list?.length) return
    const newList = cloneDeep(list)
    newList.forEach((item) => {
      item.id = `${item.compressionId}-${uniqueId()}` // 唯一id
    })
    this.list.push(...newList)

    this.show()
  }

  show(config: { checkShowAll?: boolean } = {}) {
    const data = this.getNotificationItem()
    console.log('notification item::::', data)
    if (config?.checkShowAll && !data) {
      // 检查是否全部通知展示完毕
      this.onShowAll(true)
    }
    if (this.curShowCount < this.maxShowCount && data) {
      this.curShowCount += 1
      this.onShowAll(false)
      this.setNotificationItemShown(data)
      ElNotification.success({
        title: data.message,
        dangerouslyUseHTMLString: true,
        // duration: 20000,
        message:
          '<div class="download-center-notification__msg">可前往下载中心下载</div><div class="download-center-notification__btn"><button type="button" class="el-button el-button--default el-button--small" style="color:#03050D">前往下载</button></div>',
        customClass: 'download-center-notification',
        onClose: () => {
          this.curShowCount -= 1
          setTimeout(() => {
            this.show({ checkShowAll: true })
          }, 500)
        },
        onClick: () => {
          console.log('前往下载1111')
          ElNotification.closeAll()
          this.onClick && this.onClick()
        },
      })
      setTimeout(() => {
        this.show() // 最多展示maxShowCount个
      }, 500)
    }
  }

  getNotificationItem() {
    return this.list.find((item) => !item.hasBeenShown)
  }

  setNotificationItemShown(data: NotificationItem) {
    const item = this.list.find((item) => item.id === data.id)
    if (item) item.hasBeenShown = true
  }
}

export default DownloadNotification
