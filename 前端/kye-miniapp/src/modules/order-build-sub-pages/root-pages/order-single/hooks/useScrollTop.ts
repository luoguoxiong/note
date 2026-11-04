import { ref, onMounted } from 'vue'

const scrollTop = ref(0)

export const useScrollTop = (selector: string) => {
  const element = ref<HTMLElement | null>(null)

  onMounted(() => (element.value = document.querySelector(selector)))

  return { scrollTop, element }
}

// 页面滚动的历史高度缓存
export const orderPageScrollTopHistory = ref(0)

// 页面滚动绑定的高度
export const orderPageScrollTop = ref(0)
export const scrollIntoViewId = ref('')

export const setDefaultScrollTop = () => {
  orderPageScrollTop.value = orderPageScrollTopHistory.value
}

/**
 * 设置默认滚动高度
 * @param offset 当前位置的偏移
 */
export const setDefaultScrollTopOffset = (offset: number) => {
  orderPageScrollTop.value = orderPageScrollTopHistory.value + offset
}
