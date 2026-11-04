/**
 * 消息中心列表-新消息指引hook
 * 来源: netc-pc-web/src/views/message-center-entry/components/scroll-list/useMessageIntersection.js
 * @vue/composition-api -> vue; 移除 intersection-observer polyfill(现代浏览器原生支持)
 *
 * Vue3 适配:
 * - 目标组件实例通过 defineExpose 暴露的 separateRef 取值(旧 $refs.separateRef)
 * - scrollListRef 的 $el -> 暴露的 scrollRef(根滚动容器)
 */
import { computed, nextTick, onUnmounted, reactive, ref, watch, type Ref } from 'vue'
import { throttle } from 'lodash-es'

interface SeparateRefTarget {
  separateRef?: HTMLElement
}

/**
 * @param unreadCount 未读消息数量
 * @param scrollListRef 滚动列表ref(scroll-list 组件实例)
 */
export default function useMessageIntersection(
  {
    unreadCount,
    scrollListRef,
  }: {
    unreadCount: Ref<number | undefined>
    scrollListRef: Ref<any>
  } = {} as any
) {
  const state = reactive({
    hasIntersection: false, //是否已经进入过视图
  })
  const isInterSection = ref(false) // 当前是否进入视图
  const observer = ref<IntersectionObserver | null>(null) // 监听视图
  const targetDomRef = ref<SeparateRefTarget | null>(null) // 最后一个未读消息
  const showQuickGuide = ref(false) // 是否显示引导 - 默认否
  const targetDom = computed(() => {
    return targetDomRef.value ? targetDomRef.value?.separateRef : null
  })

  // 是否显示快捷指引 <存在未读消息Ref,存在未读消息数量,当前未展示过分界线>
  const showQuickGuideCheck = throttle(() => {
    nextTick(() => {
      showQuickGuide.value = !!(targetDomRef.value && unreadCount.value && !state.hasIntersection)
    })
  }, 400)

  watch(
    () => [state.hasIntersection, unreadCount.value, targetDomRef.value],
    () => {
      showQuickGuideCheck()
    }
  )

  onUnmounted(() => {
    removeIntersection()
  })

  const initialState = () => {
    state.hasIntersection = false
  }

  /**
   * 初始化domRef
   * @param targetRef
   */
  const initialTarget = (targetRef: Ref<any>) => {
    // Vue3 函数 ref 直接存组件实例; 兼容数组形式
    const val = targetRef?.value
    targetDomRef.value = Array.isArray(val) ? val[0] : val
  }

  const entryCallback = throttle(() => {
    console.log('进入可视区域')
    isInterSection.value = true
    state.hasIntersection = true
    removeIntersection()
  }, 200)
  /**
   * 视图区域监听
   */
  const sectionObserve = () => {
    observer.value = new IntersectionObserver((entries) => {
      if (entries[0].intersectionRatio > 0) {
        entryCallback()
      } else {
        console.log('移出可视区域')
        isInterSection.value = false
      }
    })
  }

  const handleInterSection = (targetRef: Ref<any>) => {
    initialTarget(targetRef)
    initialState()
    // 不存在分界线 || 已存在监听
    if (!targetDom.value || observer.value) {
      return
    }
    if (window.IntersectionObserver) {
      sectionObserve()
      observer.value!.observe(targetDom.value as Element)
    } else {
      // 老壳支持IntersectionObserver，无需scroll兼容
      console.log('不支持视图')
    }
  }

  /* 关闭视图监听 */
  const removeIntersection = () => {
    if (!targetDom.value) {
      return
    }
    if (window.IntersectionObserver) {
      //停止观察
      observer.value?.unobserve(targetDom.value as Element)
      observer.value?.disconnect()
      observer.value = null
      // 清空未读消息ref
      targetDomRef.value = null
    } else {
      // 老壳支持IntersectionObserver，无需scroll兼容
      console.log('不支持视图')
    }
  }

  /* 跳转 */
  const handleGuideCallback = () => {
    const scrollDom = scrollListRef.value?.scrollRef
    if (!scrollDom) {
      return
    }
    const currentScrollTop = scrollDom.scrollTop
    const { top: scrollListTopT, height: scrollListTopH } = scrollDom?.getBoundingClientRect() || {}
    const { top, height } = targetDom.value?.getBoundingClientRect() || {}

    scrollDom.scrollTop = (top || 0) - (scrollListTopT || 0) - (scrollListTopH || 0) + currentScrollTop + (height || 0)
  }

  return { showQuickGuide, isInterSection, handleInterSection, removeIntersection, handleGuideCallback }
}
