import Taro from '@tarojs/taro'
import { nextTick } from 'vue'
import { getEnvConfig } from '@/public/config'
import { sleep } from '@order-global-package-freight-time/utils/sleep'
import { isAppAndroid } from '@order-global-package-freight-time/utils/device'

let systemInfo: any = null

export const getClientRect = async (currentSelector: string) => {
  return new Promise((resolve) => {
    const query = Taro.createSelectorQuery()
    query
      .select(`#${currentSelector}`)
      .boundingClientRect()
      .exec((res) => {
        const dom = res[0]
        resolve(dom)
      })
  })
}

export const taroScrollToPosition = async (id: string) => {
  const dom = await getClientRect(id)
  const { plateForm } = getEnvConfig()
  if (!dom) {
    return
  }
  //获取屏幕高度
  const getScreenHeight = (systemInfo: any) => {
    let screenHeight = plateForm === 'alipay' ? systemInfo?.screen?.height : systemInfo?.safeArea?.screenHeight
    screenHeight = screenHeight || systemInfo.windowHeight
    return screenHeight
  }

  try {
    systemInfo = systemInfo ?? Taro.getSystemInfoSync()
    const screenHeight = getScreenHeight(systemInfo)
    const midHeight = Math.floor(screenHeight / 2)
    const navHeight = document.getElementsByClassName('ky-navbar--full')[0] ? 80 : 20
    let scrollDiff = 0
    const domTop = dom?.top - navHeight
    const domBottom = dom?.bottom - navHeight
    await nextTick()
    const historyScrollTop = 0
    //如果在顶部超出
    if (domTop < 0) {
      scrollDiff = historyScrollTop + domTop - midHeight
    }
    const footerDom = await getClientRect('order-footer-id')
    //底部超出
    if (domTop > footerDom?.top - 100) {
      scrollDiff = domBottom - screenHeight + historyScrollTop + midHeight
    }
    console.log('判断滚动', domTop, screenHeight, scrollDiff, historyScrollTop)
    //在可视区域
    if (scrollDiff === 0) {
      await sleep(500)
      return
    }
    //滚动动画的延迟
    await sleep(isAppAndroid ? 400 : 300)
  } catch (e) {
    console.error(e)
  }
}
