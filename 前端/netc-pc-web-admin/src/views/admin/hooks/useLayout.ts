import { reactive, toRefs, ToRefs } from 'vue'

interface LayoutState {
  /** 是否折叠 */
  isCollapse: boolean
}

interface UseLayoutRe {
  handleCollapse: (isCollapse: boolean) => void
}
/**
 * useLayout 布局相关
 * @returns { UseLayoutRe & ToRefs<LayoutState> } 布局相关状态。
 */
export function useLayout(): UseLayoutRe & ToRefs<LayoutState> {
  const state = reactive<LayoutState>({
    isCollapse: false,
  })

  const handleCollapse = (isCollapse: boolean) => {
    state.isCollapse = isCollapse
  }

  return {
    ...toRefs(state),
    handleCollapse,
  }
}
