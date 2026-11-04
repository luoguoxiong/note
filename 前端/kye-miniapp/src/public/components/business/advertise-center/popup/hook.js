import Taro from '@tarojs/taro'
import { ref, watchEffect } from 'vue'

class LightAppMenu {
  anchor = new Map()

  set(menuCode, rect) {
    this.anchor.set(menuCode, rect)
  }

  handlers = []

  addListener(cb) {
    this.removeListener(cb)
    this.handlers.push(cb)
    return () => {
      this.removeListener(cb)
    }
  }

  removeListener(cb) {
    this.handlers = this.handlers.filter((c) => c !== cb)
  }

  async update() {
    await Promise.all(this.handlers.map((h) => h()))
  }
}

export const usePopupCloseAnimation = () => {
  const DURATION = 400
  const durationTimer = ref(0)

  const context = new LightAppMenu()

  const animation = ref(
    Taro.createAnimation({ transformOrigin: '0% 0%', duration: DURATION, timingFunction: 'ease-in-out' }),
  )
  console.log(animation.value.export())

  const animationData = ref(animation.value.export())
  const maskStyle = ref({})

  /**
   * @param {string} menuCode
   */
  const updateCloseAnimationData = async (menuCode) => {
    await context.update()

    const rect = context.anchor.get(menuCode)

    if (rect) {
      animation.value
        .left(rect.x + rect.w / 2)
        .top(rect.y + rect.h / 2)
        .scale(0)
        .step()
      animationData.value = animation.value.export()
      maskStyle.value = { background: 'transparent' }

      return new Promise((resolve) => {
        durationTimer.value = setTimeout(resolve, DURATION)
      })
    } else {
      return Promise.resolve()
    }
  }

  watchEffect(() => {
    clearTimeout(durationTimer.value)
  }, [])

  return {
    animationData,
    maskStyle,
    updateCloseAnimationData,
  }
}

export default usePopupCloseAnimation
