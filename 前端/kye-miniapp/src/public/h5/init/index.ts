import { getQueryObject, isH5Env, isPc } from '@public/utils'
import { setToken } from '@public/storage'
import { fsApiAuth } from '@public/h5/tt'
import { PC_DESIGN_WIDTH, BASE_REM } from '../config/index'
export const enableTouchPolyfill = () => {
  if (process.env.TARO_ENV === 'h5') {
    const script = document.createElement('script')
    script.src = './assets/touch-emulator.js'
    script.async = true
    document.head.appendChild(script)
  }
}

const setLayout = () => {
  // 👉 PC 场景
  if (isPc && isH5Env) {
    const addPcClass = () => document.body.classList.add('isPc')
    document.body ? addPcClass() : document.addEventListener('DOMContentLoaded', addPcClass)
  }

  setTimeout(() => {
    const setDynamicRem = () => {
      const width = Math.min(
        document.documentElement.clientWidth,
        540, // 可选：限制最大宽度，防止横屏 / 平板过大
      )
      const rem = (width / PC_DESIGN_WIDTH) * BASE_REM
      document.documentElement.style.fontSize = rem + 'px'
    }

    const lockRem = () => {
      document.documentElement.style.fontSize = BASE_REM + 'px'
    }

    // 👉 PC 场景
    if (isPc && isH5Env) {
      lockRem()
      window.addEventListener('resize', lockRem)
    }
    // 👉 H5 场景（手机）
    else {
      setDynamicRem()
      window.addEventListener('resize', setDynamicRem)
    }
  }, 0)
}

/* 初始化token */
const initH5Token = () => {
  const { token } = getQueryObject()
  if (token) {
    setToken(token)
  }
}

/* h5环境初始化 */
export const h5Init = () => {
  // dev环境注入token
  if (isH5Env) {
    initH5Token()
    setLayout()
    enableTouchPolyfill()
  }
  fsApiAuth()
}

// 修复ios tabbar切换首页丢失问题
export const fixIosPageHide = () => {
  // #ifdef H5
  if (isH5Env) {
    document.querySelectorAll('.taro_router>.taro_page:not(.taro_navigation_page)').forEach((e) => {
      e.classList.add('taro_tabbar_page')
    })
  }
  // #endif
}
