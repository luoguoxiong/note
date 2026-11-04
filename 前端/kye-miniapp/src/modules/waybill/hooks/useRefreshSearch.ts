import { ref, watch } from 'vue'

const isRefresh = ref(false)

export default function useRefreshSearch() {
  // 设置监听刷新页面
  const onWatchSearchPageRefresh = (fn: Function) => {
    watch(isRefresh, (val) => {
      console.log('刷新列表页-------', val)
      if (val) {
        fn && fn()
        isRefresh.value = false // 重置回来
      }
    })
  }

  const setIsRefresh = (is: boolean) => {
    isRefresh.value = is
  }

  return {
    isRefresh,
    setIsRefresh,
    onWatchSearchPageRefresh,
  }
}
