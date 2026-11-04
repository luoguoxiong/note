import { computed, ref } from 'vue'
import { MessageToDriver, MessageToDriverDimension } from '@order-public-sub-public/types'
import { ModuleType } from '@order-public-sub-public/constants'
import useEffect from '@order-public-sub-public/validate'
import { useStore } from '@order-public-sub-public/store'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'

const piniaStore = useStore()

export function useState() {
  const inputValue = ref('') //文本域输入值
  const modalShow = ref(false)
  const { remoteCheck } = useEffect()

  const onConfirm = async (wordList: string[]) => {
    const val = inputValue.value.trim()
    piniaStore.order.updateOrderByType({
      type: ModuleType['给司机捎句话'],
      data: { orderRemark: val, driverHighFrequencyWords: wordList },
    })
    umpOtherReport(
      'CLK',
      {
        eventCode: 'clk_express_driver_control_v1',
      },
      {
        button_name: '确定',
      },
    )
    umpOtherReport(
      'CLK',
      {
        eventCode: 'other_express_single_todriver_v1',
      },
      {
        remark_msg: val,
        request_result: '成功',
        failure_reason: '',
      },
    )
    remoteCheck('messageToDriver')

    modalShow.value = false
  }

  return {
    inputValue, //文本域输入值
    modalShow, //是否显示modal
    onConfirm,
  }
}

export function useData() {
  const value = computed(() => piniaStore.order.moduleFormData(ModuleType.给司机捎句话)?.orderRemark || '')
  // store上存储选中高频值
  const highWordValue = computed(
    () => piniaStore.order.moduleFormData(ModuleType.给司机捎句话)?.driverHighFrequencyWords || [],
  )

  // 业务数据，标签列表
  const messageToDriverList = computed(
    () => piniaStore.schema.moduleDimensionData(ModuleType.给司机捎句话)?.messageToDriverList || [],
  )

  // 高频词列表
  const driverHighFrequencyWordList = computed(() => {
    return piniaStore.schema.moduleDimensionData(ModuleType.给司机捎句话)?.driverHighFrequencyWordList || []
  })

  return {
    value,
    highWordValue,
    messageToDriverList,
    driverHighFrequencyWordList,
  }
}
