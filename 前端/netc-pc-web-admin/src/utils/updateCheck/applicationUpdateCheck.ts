/**
 * applicationUpdateCheck 轻应用版本升级检查(事件轮询队列)
 * 来源: netc-pc-web/src/utils/updateCheck/applicationUpdateCheck.js
 *
 * 迁移说明:
 *  - 消息中心按钮通过 queueAdd 将「未读消息刷新」事件加入队列, 每 15 分钟轮询执行
 *  - 老项目在 admin.vue mounted 中调用 start(); 新基座 admin 布局未接入,
 *    改为首个事件入队时自动 start(幂等), 保证轮询行为等价
 *  - 老项目 applicationUpdateDialogCheck 依赖 offline-upgrade 升级弹窗与
 *    envSdk.applicationHasUpdateCheck(离线包版本检查), 新基座无对应能力, 暂不迁移
 */

interface QueueHandler {
  name: string
  fn: (...args: any[]) => void
}

/**
 * 调试开关 sessionStorage key, 值为正数毫秒时按该间隔轮询(如 60000 表示 60 秒)
 * 控制台执行: sessionStorage.setItem('APP_UPDATE_CHECK_DEBUG', '60000')
 */
const DEBUG_STORAGE_KEY = 'APP_UPDATE_CHECK_DEBUG'

class ApplicationUpdateCheck {
  interval: ReturnType<typeof setInterval> | null = null
  minutes = 15 // TODO 生产需配置15分钟
  time = this.minutes * 60 * 1000
  count = 0 // 递归次数
  maxCount = 4 // 最大递归次数
  queueHandlerList: QueueHandler[] = [] // [{name:string,fn:function}]

  // 实际轮询间隔: sessionStorage 指定正数毫秒时用该值, 否则用默认 15 分钟
  private get intervalTime(): number {
    const debugTime = Number(sessionStorage.getItem(DEBUG_STORAGE_KEY))
    return debugTime > 0 ? debugTime : this.time
  }

  // 创建定时器
  start() {
    this.clear()
    this.interval = setInterval(() => {
      this.count += 1
      if (this.count > this.maxCount) {
        this.start()
        return
      }
      // 执行队列
      this.handleQueue()
    }, this.intervalTime)
  }

  // 清空定时器
  clear() {
    if (this.interval) {
      clearInterval(this.interval)
    }
    this.interval = null
    this.count = 0
  }

  /**
   * 执行队列
   */
  handleQueue() {
    this.queueHandlerList.forEach((f) => {
      if (typeof f?.fn === 'function') {
        f.fn()
      }
    })
  }

  /**
   * 队列追加事件
   * @param f {name:string,fn:function}
   */
  queueAdd(f: QueueHandler) {
    // 不存在追加事件|事件已存在不重复添加
    if (!f || this.queueHandlerList.find((i) => i.name === f.name)) {
      return
    }
    if (f && typeof f.fn === 'function') {
      this.queueHandlerList.push(f)
      // 适配: 老项目由 admin.vue 调 start(), 新基座改为首个事件入队时自动启动轮询
      this.start()
    }
  }

  /**
   * 事件队列清空
   */
  queueClear() {
    this.queueHandlerList = []
  }
}

const applicationUpdateCheck = new ApplicationUpdateCheck()

export default applicationUpdateCheck
