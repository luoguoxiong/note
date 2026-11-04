import { fetchScanQrcodeGetConfig } from '@order-public-sub-public/apis/application'
import { getToken } from '@order-public-sub-public/storage/user'
import { loginReadyStatus } from '@order-public-sub-public/utils/user/useAutoLogin'

/* 用户心跳检测 */
export const usePingPong = () => {
  const pollingTime = 30 * 1000 // 轮询间隔
  let pollingInterval: ReturnType<typeof setTimeout> | null = null
  const fetchData = () => {
    const Token = getToken()
    if (!Token) {
      return Promise.resolve('token为空')
    }
    // 未执行登录初始化不执行
    if (!loginReadyStatus.value) {
      return
    }
    return fetchScanQrcodeGetConfig().then((res) => {
      if (res.code === 0 && res.data) {
        console.log('fetchScanQrcodeGetConfig', res.data)
      }
    })
  }

  /* 轮询获取客户编码信息 */
  const startPingInterval = () => {
    clearPolling()
    setTimeout(() => {
      // 立即执行一次
      fetchData()
    }, 10000)
    pollingInterval = setInterval(async () => {
      fetchData()
    }, pollingTime)
  }

  /* 清空轮询 */
  const clearPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval)
    }
  }

  return {
    startPingInterval,
    fetchData,
  }
}
/* 手动检测用户ping情况 */
export const checkUserPing = () => {
  const { fetchData } = usePingPong()
  setTimeout(() => {
    fetchData()
  }, 0)
}
