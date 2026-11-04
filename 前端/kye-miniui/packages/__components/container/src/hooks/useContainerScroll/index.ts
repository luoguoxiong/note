import { nextTick, onMounted, ref } from 'vue'
import Taro from '@tarojs/taro'
import { getNavBarHeightInfo } from '@packages/__components/navbar/src/useNavbar/useNavbar'
import { KyContainerProps } from '@packages/__components/container/src/types'
import { envListMap } from '@packages/__components/navbar/src/constant'

export default (scrollOptions: KyContainerProps['scrollOptions']) => {
  /* 是否开启scroll-view */
  const needScrollView = ref(false)
  const randomId = Math.random().toString(36).slice(-8)
  const containerId = `ky-container-${randomId}`
  const containerRef = ref(null)
  const navAppHeaderHeight = ref<Number>(0)
  const containerHeight = ref(`calc(100vh - ${navAppHeaderHeight.value || 0}px)`)
  const ENV = Taro.getEnv()
  console.log('useContainerScroll')
  // 延迟获取导航栏高度
  const getNavBarHeight = async () => {
    await nextTick()
    try {
      const { appHeaderHeight } = getNavBarHeightInfo()
      navAppHeaderHeight.value = appHeaderHeight
      containerHeight.value = `calc(100vh - ${navAppHeaderHeight.value || 0}px)`
      console.log('appHeaderHeight', appHeaderHeight)
    } catch (error) {
      console.error('获取导航栏高度失败:', error)
    }
  }

  onMounted(() => {
    if (scrollOptions?.scrollViewPlatList.includes(envListMap[ENV])) {
      needScrollView.value = true
    }
    getNavBarHeight()
  })
  return {
    containerId,
    containerRef,
    containerHeight,
    navAppHeaderHeight,
    needScrollView,
  }
}
