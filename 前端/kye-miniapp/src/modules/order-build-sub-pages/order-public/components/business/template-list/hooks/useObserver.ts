//观察实例

import { ref } from 'vue'

export const isIntersectionVisible = ref(true)

//曝光的回调
const callback = (entries: IntersectionObserverEntry[]) => {
  entries.forEach((entry) => {
    // 不可见的操作
    if (entry.intersectionRatio <= 0) {
      isIntersectionVisible.value = false
    } else {
      isIntersectionVisible.value = true
    }
  })
}

// 判断是否函数，浏览器兼容问题
export const observer =
  typeof IntersectionObserver === 'function'
    ? new IntersectionObserver(callback, {
        root: document.querySelector('.template-list-wrap'),
      })
    : null

export const addIntersectionListener = () => {
  const target = document.querySelector('.template-list') as HTMLElement
  // 监控元素和观察者，一个为空则退出
  if (!target || !observer) return
  observer.observe(target)
}
