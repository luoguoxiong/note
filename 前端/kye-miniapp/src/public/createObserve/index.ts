import Taro from '@tarojs/taro'
import { isH5Env } from '../utils'

const createWebObserve = function (id: string, invoke: Function) {
  const target = document.getElementById(id) as any
  if (!target) return () => {}

  let triggered = false

  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (!triggered && entry && entry.intersectionRatio > 0) {
        triggered = true
        invoke()
        observer.disconnect()
      }
    },
    {
      threshold: [0],
    },
  )

  observer.observe(target)

  return function () {
    observer.disconnect()
  }
}

const createNativgeObserve = function (id: string, invoke: Function) {
  const observer = Taro.createIntersectionObserver(this, {
    thresholds: [0],
  })

  observer.relativeToViewport().observe(`#${id}`, (res) => {
    if (res?.intersectionRatio && res?.intersectionRatio > 0) invoke()
  })

  return function () {
    observer.disconnect()
  }
}

export const createObserve = isH5Env ? createWebObserve : createNativgeObserve
