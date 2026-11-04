<!--
  活动扫码页-通用入口中转
  处理小程序码扫码进入活动的逻辑
-->
<template>
  <view>
    <view v-if="!networkLoading">
      <NetworkError
        v-if="show || weaknetwork"
        :weaknetwork="weaknetwork"
        :show-reload="showReload"
        :msg-info="errorMsg"
        @reload="onReload"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Taro from '@tarojs/taro'
import NetworkError from '@public/components/base/network-error/index.vue'
import { imgStatic } from './constants'
import { scanMiniActivityCode, nativeJumpUrl } from './utils/scanCodeHelp'

defineOptions({
  name: 'ActivityEntry',
  navigationBarBackgroundColor: '#ffffff',
  addGlobalClass: true,
})

// 声明全局变量
declare const getCurrentPages: any

let loadingTimeout: any = null // loading定时器
let autoScanLock = false // 自动识别是否开启锁 <true:开启-不执行静默识别，false:关闭-可执行精默识别>
let autoScanTimeOut: any = null // 自动识别图形码timeout控制

// 响应式数据
const errorMsg = ref<any>({}) // 接口错误类型 {msg:'',img:''}
const show = ref(false) // 是否显示网络错误
const networkLoading = ref(true) // 检查网络状况中
const weaknetwork = ref(false) // 是否h5弱网
const showReload = ref(false) // 是否展示重新加载按钮

// 获取路由参数
const getRouteParams = () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  return currentPage.options || {}
}

/**
 * 页面初始化执行
 * @param type ['reload'] reload重新加载场景
 */
const pageInit = (type = '') => {
  init()
  handleLoadingTimeout()
  handleScanCode(type)
}

/**
 * 扫活动图形码
 * @param type ['reload'] reload重新加载场景
 */
const handleScanCode = async (type = '') => {
  const params = getRouteParams()
  const codeId = params.scene || ''

  try {
    // 这里需要调用 scanMiniActivityCode API
    // 由于原项目中的工具函数可能不存在，我们需要创建对应的 API 调用
    // 暂时先模拟成功响应，实际项目中需要根据具体的 API 结构进行调整
    const res = await scanMiniActivityCode(codeId)

    if (res.success && res.data) {
      const { nativeJumpType, url } = res.data
      await nativeJumpUrl({
        jumpType: nativeJumpType,
        url,
      })
    }
  } catch (err: any) {
    // 展示异常错误提示
    const { errorData } = err
    if (errorData && errorData.msg) {
      errorMsg.value = {
        msg: errorData.msg,
        img: errorData.noApiError ? '' : imgStatic.apiError,
      }
      show.value = true

      // 手动重新加载，执行报错提示
      if (type === 'reload') {
        // 延时避免真机闪烁
        setTimeout(() => {
          Taro.showToast({ icon: 'none', title: errorData.msg, duration: 2000 })
        }, 100)
      }

      // 异常报错-检查网络-弱网自动执行图形码识别
      if (errorData.noApiError) {
        showReload.value = true
        Taro.getNetworkType({
          complete: (res: any) => {
            // 错误检查-弱网-重新执行(不执行loading效果)
            if (res.errMsg === 'getNetworkType:ok') {
              switch (res.networkType) {
                case 'none':
                  Taro.showToast({
                    icon: 'none',
                    title: '当前无网络，请检查后重试',
                    duration: 2000,
                  })
                  break
                default:
                  autoScanCode()
                  break
              }
            }
          },
        })
      }
    }
  } finally {
    clearLoadingTimeout()
  }
}

/**
 * 页面初始化-展示状态
 */
const init = () => {
  errorMsg.value = {}
  show.value = false
  showReload.value = false
}

// 获取网络状态
const getNetworkType = () => {
  networkLoading.value = true
  Taro.getNetworkType({
    complete: (res: any) => {
      if (res.errMsg === 'getNetworkType:ok' && res.networkType === 'none') {
        Taro.showToast({ icon: 'none', title: '当前无网络，请检查后重试', duration: 2000 })
        show.value = true
        // 优先展示网络异常报错-去除后台报错
        errorMsg.value = {}
      } else {
        show.value = false
      }
      networkLoading.value = false
    },
  })
}

/**
 * 重新加载按钮
 */
const onReload = () => {
  weaknetwork.value = false
  getNetworkType()
  pageInit('reload')
}

/**
 * 后台精默调用识别图形码
 */
const autoScanCode = () => {
  if (!autoScanTimeOut) {
    autoScanTimeOut = setTimeout(() => {
      autoScanLock = true
    }, 6000)
  }
  // autoScanLock false 未开启静默锁定则执行静默扫码接口
  if (!autoScanLock) {
    handleScanCode()
  }
}

/* 慢加载显示loading */
const handleLoadingTimeout = () => {
  loadingTimeout = setTimeout(() => {
    Taro.showLoading({ mask: true, title: '加载中...' })
  }, 500)
}

/* loading 定时器清除 */
const clearLoadingTimeout = () => {
  if (loadingTimeout) {
    clearTimeout(loadingTimeout)
    loadingTimeout = null
  }
  Taro.hideLoading()
}

// 使用导入的 scanMiniActivityCode 函数，无需重新定义

onMounted(() => {
  // 重置静默识别api调用锁
  autoScanLock = false
  autoScanTimeOut = null
  pageInit()
  getNetworkType()
})

onUnmounted(() => {
  // 清理定时器
  if (loadingTimeout) {
    clearTimeout(loadingTimeout)
  }
  if (autoScanTimeOut) {
    clearTimeout(autoScanTimeOut)
  }
})
</script>

<style lang="scss" scoped>
// 样式可以根据需要添加
</style>
