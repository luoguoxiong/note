import { ref, computed } from 'vue'
import { useStore } from '@order-public-sub-public/store'
import { ModuleType } from '@order-public-sub-public/constants'
import useEffect from '@order-public-sub-public/validate'
import { CommonDynamicItem } from '@order-public-sub-public/apis/types'
import { WaybillRemark, WaybillRemarkDimension } from '@order-public-sub-public/types'
const piniaStore = useStore()

export function useState() {
  const inputValue = ref('') //文本域输入值
  const modalShow = ref(false)
  const { remoteCheck } = useEffect()

  const onConfirm = async () => {
    const val = inputValue.value.trim()
    piniaStore.order.updateOrderByType({
      type: ModuleType['运单备注'],
      data: { waybillRemark: val },
    })
    window.$umpOtherReport(
      'CLK',
      {
        eventCode: 'clk_express_remarks_control_v1',
      },
      {
        button_name: '确认',
      },
    )
    window.$umpOtherReport(
      'OTHER',
      {
        eventCode: 'other_express_single_remarks_v1',
      },
      {
        remark_msg: val,
        request_result: '成功',
        failure_reason: '',
      },
    )
    remoteCheck('waybillRemark')
    modalShow.value = false
  }

  return {
    inputValue, //文本域输入值
    modalShow, //是否显示modal
    onConfirm,
  }
}

export const required = computed(() => piniaStore.schema.moduleConfigData(ModuleType['运单备注']).required)

export function useData() {
  const value = computed(() => piniaStore.order.moduleFormData(ModuleType.运单备注)?.waybillRemark || '')
  const waybillRemarkList = computed(
    () => piniaStore.schema.moduleDimensionData(ModuleType.运单备注)?.waybillRemarkList || [],
  )

  return {
    value,
    waybillRemarkList,
  }
}
