import { ScriptLoader } from '@/utils/loadScript'
import { promiseOnce } from '@/utils/promise-like'
import { debounce } from 'lodash-es'
import ResizeObserver from 'resize-observer-polyfill'
import { onBeforeMount, onUnmounted, ref, watch } from 'vue'

enum EchartsStatus {
  /**没有加载SDK */
  NOTHING = 'NOTHING',
  /**已加载SDK */
  LOADSDK = 'LOADSDK',
  /**已初始化 */
  ISINIT = 'ISINIT',
}

const defaultEchartSdk = './echarts.5.5.0.js'

const loadSdk = promiseOnce(ScriptLoader.load)

export const useEchart = (jsSdkUrl = defaultEchartSdk) => {
  const refElement = ref<HTMLDivElement | HTMLCanvasElement>()

  //不能用ref去存echarts实例;不然echarts tooltip有BUG https://github.com/apache/echarts/issues/14342
  let chartInstance: echarts.ECharts | undefined = undefined

  const echartsStatus = ref<EchartsStatus>(EchartsStatus.NOTHING)

  const resizeObserverRef = ref<ResizeObserver>()

  const checkEchartStatus = async () => {
    if (echartsStatus.value === EchartsStatus.NOTHING) {
      const isOk = await loadSdk(jsSdkUrl)
      if (!isOk) {
        throw Error(`Echarts:${jsSdkUrl} init Error`)
      }
      echartsStatus.value = EchartsStatus.LOADSDK
    }
    if (!refElement.value) {
      throw Error('Echarts 初始化需要绑定一个节点')
    } else {
      if (echartsStatus.value === EchartsStatus.LOADSDK) {
        chartInstance = window.echarts.init(refElement.value)
        echartsStatus.value = EchartsStatus.ISINIT
        return chartInstance
      } else {
        return chartInstance
      }
    }
  }

  onBeforeMount(() => {
    loadSdk(jsSdkUrl).then((isOk) => {
      if (isOk) {
        echartsStatus.value = EchartsStatus.LOADSDK
      }
    })
  })

  watch([refElement], ([element]) => {
    if (element !== undefined) {
      resizeObserverRef.value?.disconnect()
      resizeObserverRef.value = new ResizeObserver(
        debounce(() => {
          chartInstance?.resize()
        }, 16)
      )
      resizeObserverRef.value.observe(element)
    }
  })

  onUnmounted(() => {
    resizeObserverRef.value?.disconnect()
  })

  return { refElement, checkEchartStatus }
}
