import { onMounted, onUnmounted, Ref } from 'vue'
import Taro from '@tarojs/taro'

/**
 * @Desc: useCellOutClick 外部点击事件
 * @Date: 2025/11/5
 */

const CellOutClickEvent = '__global_out_click__'

interface UseOutClickOptions {
  name?: Ref<string>
  onOutsideClick: (params: { e: any; currentId?: string }) => void
}

const useOutClick = ({ name, onOutsideClick }: UseOutClickOptions) => {
  const onPageTap = (e: any) => {
    const currentId = name?.value
    // 点击外部-关闭已展开项
    onOutsideClick?.({
      e,
      currentId,
    })
  }
  onMounted(() => {
    // 实际注册全局捕获
    Taro.eventCenter.on(CellOutClickEvent, onPageTap)
  })
  onUnmounted(() => {
    Taro.eventCenter.off(CellOutClickEvent, onPageTap)
  })
}

export default useOutClick
