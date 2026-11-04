<template>
  <ModalContent
    title="给取货司机捎句话"
    placeholder="给取货司机留言，请在此填写"
    v-model="inputValue"
    :reportPageCode="reportPageCode"
    :modalShow="visible"
    :tagList="tagList"
    :onClose="onClose"
    :onConfirm="handleConfirm"
    :onQuickFill="onQuickFill"
    @input="onInput"
    @blur="onBlur"
    @closed="onClosed"
    :componentType="modalContentType['给司机捎句话']"
    :showMaxTip="true"
    :customInputClass="'messageToDriver'"
    :wordLimit="150"
    :rows="4"
  >
    <template v-slot:extra>
      <HighFrequencyWordWrapper :options="highWordOptions" v-if="driverHighFrequencyWordList?.length > 0" />
    </template>
  </ModalContent>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useStore } from '@order-public-sub-public/store'
import { ModuleType, MaxLengthNum } from '@order-public-sub-public/constants'
import ModalContent from '../../waybill-remark/components/modalContent.vue'
import { modalContentType } from '../../waybill-remark/components/modalContentHook'
import HighFrequencyWordWrapper from './HighFrequencyWordWrapper.vue'
import { showToast } from '@order-global-package-order-sub/hooks/useShowToast'
import { blurTextAreaReport, closeLogReport } from '@order-public-sub-public/report/messageTodriver'
import { driverRemarkPopupClosedReport } from '../hooks/report'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'

export interface DriverMessageConfirmData {
  orderRemark: string
  driverHighFrequencyWords: string[]
}

const props = defineProps<{
  /** 弹窗显隐（v-model:visible） */
  visible: boolean
  /** 当前手动录入内容，打开弹窗时初始化输入框 */
  remark?: string
  /** 已选高频词 code 数组，打开弹窗时初始化多选态 */
  highWords?: string[]
  /** 埋点页面编码覆盖，不传走路由映射 */
  reportPageCode?: string
}>()
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'confirm', data: DriverMessageConfirmData): void
}>()

const piniaStore = useStore()

// 常用留言标签（历史标签），转换为 SlideTagDetail 结构
const tagList = computed(() =>
  (piniaStore.schema.moduleDimensionData(ModuleType.给司机捎句话)?.messageToDriverList || []).map((item) => ({
    tagCode: item.type,
    tagName: item.value,
    tagType: item.type,
    strategyId: item.strategyId,
    waybillLogId: item.waybillLogId,
  })),
)
// 高频词列表
const driverHighFrequencyWordList = computed(
  () => piniaStore.schema.moduleDimensionData(ModuleType.给司机捎句话)?.driverHighFrequencyWordList || [],
)

const inputValue = ref('')
// 每次打开弹窗自增，驱动高频词选项按最新 highWords 重建选中态
const triggerUpdate = ref(0)

watch(
  () => props.visible,
  (val) => {
    if (val) {
      inputValue.value = props.remark || ''
      triggerUpdate.value++
    }
  },
  { immediate: true },
)

const pageCodeExtra = () => (props.reportPageCode ? { page_code: props.reportPageCode } : {})

// 高频词多选项（selected 为独立 ref，供 HighFrequencyWordWrapper 切换）
const highWordOptions = computed(() => {
  // 依赖 triggerUpdate，保证每次打开弹窗按最新 highWords 重建
  void triggerUpdate.value
  if (!driverHighFrequencyWordList.value || driverHighFrequencyWordList.value.length === 0) {
    return []
  }
  return driverHighFrequencyWordList.value.map((item) => ({
    id: item.code,
    label: item.value,
    selected: ref((props.highWords || []).includes(item.code)),
  }))
})

const handleConfirm = () => {
  const wordList = highWordOptions.value?.filter((item) => item.selected.value).map((item) => item.id) || []
  const val = inputValue.value.trim()
  emit('confirm', { orderRemark: val, driverHighFrequencyWords: wordList })

  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_driver_control_v1',
    },
    {
      button_name: '确定',
      ...pageCodeExtra(),
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
      ...pageCodeExtra(),
    },
  )

  emit('update:visible', false)
}

const onClose = () => {
  emit('update:visible', false)
  closeLogReport('给司机捎句话', props.reportPageCode)
  // 关闭丢弃未确认编辑：输入框恢复为打开时的内容
  inputValue.value = props.remark || ''
}

const onClosed = () => {
  driverRemarkPopupClosedReport(props.reportPageCode)
}

const onQuickFill = (text: string) => {
  if (!inputValue.value.includes(text)) {
    text = inputValue.value ? `，${text}` : text
    let fillText = inputValue.value + text
    if (fillText.length >= MaxLengthNum.给司机捎句话最大值) {
      // 填充截断
      fillText = fillText.slice(0, MaxLengthNum.给司机捎句话最大值)
      showToast('字数已达上限')
    }
    inputValue.value = fillText
  }
}

const onInput = () => {
  if (inputValue.value) {
    setTimeout(() => {
      const val = inputValue.value.trim()
      if (val && val.length >= MaxLengthNum.给司机捎句话最大值) {
        showToast('字数已达上限')
      }
    })
  }
}

const onBlur = () => {
  setTimeout(() => {
    blurTextAreaReport('给司机捎句话', inputValue.value, props.reportPageCode)
  }, 500)
}
</script>
