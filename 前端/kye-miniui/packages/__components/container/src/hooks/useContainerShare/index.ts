import Taro from '@tarojs/taro'
import { onMounted, ref } from 'vue'

export function useContainerShare({ toolOptions }) {
  const containerShareInfo = ref({
    title: toolOptions?.title,
    path: toolOptions?.path,
  })
  // 关闭转发按钮
  const hideShareMenu = () => {
    Taro.hideShareMenu()
  }
  // 开启转发按钮
  const showShareMenu = () => {
    Taro.showShareMenu({
      withShareTicket: true,
    })
  }

  const containerShareInit = () => {
    console.log('shareinit')
    // 关闭转发按钮
    if (toolOptions?.isHideShareMenu) {
      hideShareMenu()
    } else {
      // 开启分享
      showShareMenu()
    }
  }

  /* 初始化分享信息 */
  const __containerShareInfoInit = () => {
    // 无需开启分享 或者 已存在分享信息，无需获取兜底配置
    if (toolOptions?.isHideShareMenu || (toolOptions?.title && toolOptions?.path)) {
      return
    }
    const instance = Taro.getCurrentInstance()
    const shareInfo = { path: '', title: '' }
    if (instance?.router) {
      shareInfo.path = instance.router?.path
    }
    if (instance?.page) {
      shareInfo.title = instance?.page?.navigationBarTitleText
    }
    containerShareInfo.value = {
      title: toolOptions?.title || shareInfo?.title,
      path: toolOptions?.path || shareInfo?.path,
    }
  }

  onMounted(() => {
    __containerShareInfoInit()
  })
  return {
    containerShareInfo,
    containerShareInit,
    hideShareMenu,
    showShareMenu,
  }
}
