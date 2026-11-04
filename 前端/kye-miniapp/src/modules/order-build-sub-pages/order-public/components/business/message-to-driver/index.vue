<template>
  <div
    class="message-to-driver row-item"
    :class="{ hasValue: cellValue, 'no-border-bottom': orderPageType === OrderPageType.批量寄 }"
    v-if="isShow"
    :type="type"
    :visible="visible"
  >
    <KyCell
      title="给取货司机捎句话"
      placeholder="给取货司机留言，请在此填写"
      :value="cellValue"
      :maxLen="13"
      :no-bg-disabled="disabled"
      @click="handleClick"
      :large-value="true"
      v-exposure-report="{
        eventCode: 'exp_express_driver_v1',
      }"
      v-click-report="{
        eventCode: 'clk_express_driver_v1',
      }"
    />
    <ModalContent
      title="给取货司机捎句话"
      placeholder="给取货司机留言，请在此填写"
      v-model="inputValue"
      :modalShow="modalShow"
      :tagList="tagList"
      :onClose="onClose"
      :onConfirm="handleConfirm"
      :onQuickFill="onQuickFill"
      @input="onInput"
      @blur="onBlur"
      @closed="closed"
      :componentType="modalContentType['给司机捎句话']"
      ref="modalContentRef"
      :showMaxTip="true"
      :customInputClass="'messageToDriver'"
      :wordLimit="150"
      :rows="4"
    >
      <template v-slot:extra>
        <HighFrequencyWordWrapper :options="highWordOptions" v-if="driverHighFrequencyWordList?.length > 0" />
      </template>
    </ModalContent>
  </div>
</template>

<script setup lang="ts">
import { computed, ComputedRef, ref, watchEffect } from 'vue'
import { PickModule, WaybillRemarkConfig } from '@order-public-sub-public/types'
import KyCell from '@order-public-sub-public/components/base/ky-cell/index.vue'
import ModalContent from '../waybill-remark/components/modalContent.vue'
import { modalContentType } from '../waybill-remark/components/modalContentHook'
import { useState, useData } from './hooks/index'
import { SlideTagDetail } from '@order-public-sub-public/components/ui/slide-tag/types'
import HighFrequencyWordWrapper from './components/HighFrequencyWordWrapper.vue'
import { MaxLengthNum, OrderPageType } from '@order-public-sub-public/constants'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { blurTextAreaReport, closeLogReport } from '@order-public-sub-public/report/messageTodriver'
import { driverRemarkPopupClosedReport } from './hooks/report'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const triggerUpdate = ref(false)

const { inputValue, onConfirm, modalShow } = useState()

const props = defineProps<PickModule<WaybillRemarkConfig>>()

const { value, highWordValue, messageToDriverList, driverHighFrequencyWordList } = useData()

const modalContentRef = ref<InstanceType<typeof ModalContent>>()

const SelfSignVisible = ref(false)

const orderPageType = computed(() => piniaStore.root.getOrderPageType)
// 显示
const isShow = computed(() => props.visible || false)
const tagList = computed(() => {
  return (
    messageToDriverList.value.map((item) => ({
      tagCode: item.type,
      tagName: item.value,
      tagType: item.type,
      strategyId: item.strategyId,
      waybillLogId: item.waybillLogId,
    })) || []
  )
})

// TODO: 使用类型推断会 报Cannot read property 'parentNode'
// const tagList: ComputedRef<SlideTagDetail[]> = computed(() => {
//   return messageToDriverList.value.map((item) => ({
//     tagCode: item.type,
//     tagName: item.value,
//     tagType: item.type,
//     strategyId: item.strategyId,
//   }))
// })
/**
 * @description: 给司机捎句话 如果有选高频词，需要拼接到首页，存在自己输入的内容则高频词拼接到最后面
 * @param {*} computed
 * @return {*}
 */
const cellValue = computed(() => {
  if (highWordValue?.value?.length) {
    let changeList = driverHighFrequencyWordList?.value
      ?.filter((item) => highWordValue?.value?.includes(item.code))
      ?.sort((a, b) => a.sort - b.sort)
    let word = changeList.map((item) => item.value).join(',')
    if (value?.value) {
      return `${word},${value.value}`
    }
    return `${word}`
  }
  return value.value
})

let closed = () => {
  driverRemarkPopupClosedReport()
}

const highWordOptions = computed(() => {
  if (!driverHighFrequencyWordList.value || driverHighFrequencyWordList.value.length === 0) {
    return []
  }
  console.log('highWordValue', highWordValue.value)
  console.log(triggerUpdate.value)
  return driverHighFrequencyWordList.value.map((item) => ({
    id: item.code,
    label: item.value,
    selected: highWordValue.value.includes(item.code) ? ref(true) : ref(false),
  }))
})

const handleConfirm = async () => {
  const wordList = highWordOptions.value?.filter((item) => item.selected.value).map((item) => item.id) || []
  console.log('wordList', wordList)
  onConfirm(wordList)
}

// const placeholder = computed(() => {
//   if (driverHighFrequencyWordList.value.length > 0) {
//     return '如果上面没有您想要捎给司机的话，请在此留言'
//   }
//   return '给取货司机留言，请在此填写'
// })

watchEffect(() => {
  inputValue.value = value.value
  const selfSignConfig = piniaStore.globalData.dynamicConfig('selfSign')
  SelfSignVisible.value = selfSignConfig?.visible || false
})

const handleClick = () => {
  modalShow.value = true
  triggerUpdate.value = true
}
const onClose = () => {
  modalShow.value = false
  triggerUpdate.value = false
  closeLogReport('给司机捎句话')
  inputValue.value = value.value
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
    const val = inputValue.value.trim()
    if (val && val.length >= MaxLengthNum.给司机捎句话最大值) {
      showToast('字数已达上限')
    }
  }
}

const onBlur = () => {
  setTimeout(() => {
    blurTextAreaReport('给司机捎句话', inputValue.value)
  }, 500)
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
