<template>
  <div
    class="waybiil-ramark row-item"
    :class="{ hasValue: value }"
    v-if="isShow"
    :visible="isShow"
    type="WaybillRemark"
    v-exposure-report="exp_express_remarks_v1()"
  >
    <Cell
      :required="props.required && orderPageType !== OrderPageType.批量寄"
      title="运单备注"
      placeholder="打印内容/收方留言，请在此填写"
      :value="value"
      :maxLen="13"
      :no-bg-disabled="disabled"
      @click="handleClick"
      :large-value="true"
      id="waybillRemark"
      data-validate="waybillRemark"
      v-click-report="clk_express_remarks_v1()"
    />
    <ModalContent
      title="运单备注"
      :tipText="'(打印在面单上的信息)'"
      :placeholder="'打印内容/收方留言，请在此填写'"
      :type="modalContentType['运单备注']"
      v-model="inputValue"
      :modalShow="modalShow"
      :tagList="tagList"
      :onClose="onClose"
      :wordLimit="wordLimit"
      @closed="closed"
      :onConfirm="onConfirm"
      :onQuickFill="onQuickFill"
      :customInputClass="'waybillRemark'"
      :componentType="modalContentType['运单备注']"
      :showMaxTip="true"
      :showScrollBar="true"
      :rows="4"
      @input="onInput"
      @blur="onBlur"
      ref="modalContentRef"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ComputedRef, watchEffect } from 'vue'
import { PickModule, WaybillRemarkConfig } from '@order-public-sub-public/types'
import Cell from '@order-public-sub-public/components/base/ky-cell/index.vue'
import ModalContent from '../waybill-remark/components/modalContent.vue'
import { modalContentType } from '../waybill-remark/components/modalContentHook'
import { useState, useData } from './hooks/index'
import { SlideTagDetail } from '@order-public-sub-public/components/ui/slide-tag/types'

import { MaxLengthNum, OrderPageType } from '@order-public-sub-public/constants'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { blurTextAreaReport } from '@order-public-sub-public/report/messageTodriver'
import {
  exp_express_remarks_v1,
  clk_express_remarks_v1,
  remarksPopupClosedReport,
  clk_express_remarks_control_v1,
} from './hooks/report'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const { inputValue, onConfirm, modalShow } = useState()

const props = defineProps<PickModule<WaybillRemarkConfig>>()
const wordLimit = MaxLengthNum.备注最大值
const { value, waybillRemarkList } = useData()
// const modalContentRef = ref<InstanceType<typeof ModalContent>>()

// 显示
const isShow = computed(() => props.visible || false)
const tagList: ComputedRef<SlideTagDetail[]> = computed(() => {
  return waybillRemarkList.value.map((item) => ({
    tagCode: item.type,
    tagName: item.value,
    tagType: item.type,
    strategyId: item.strategyId,
    waybillLogId: item.waybillLogId,
  }))
})

watchEffect(() => {
  inputValue.value = value.value
})

const handleClick = () => {
  modalShow.value = true
}
const onClose = () => {
  modalShow.value = false
  // console.log('下单_寄件页_运单备注_弹窗消失')
  clk_express_remarks_control_v1('关闭')
  inputValue.value = value.value
}

const closed = () => {
  remarksPopupClosedReport()
}

const onQuickFill = (text: string) => {
  console.log('object', text)
  if (!inputValue.value.includes(text)) {
    text = inputValue.value ? `，${text}` : text
    text = inputValue.value + text
    text = text.slice(0, MaxLengthNum.备注最大值)
    inputValue.value = text
  }
  // const inputRef = modalContentRef.value?.textareaRef
  // const textarea = inputRef && (inputRef.$el as HTMLDivElement).querySelector('textarea')

  // if (!inputValue.value.includes(text)) {
  //   const currentValue = inputValue.value
  //   if (inputRef) {
  //     if (textarea) {
  //       const startPos = textarea.selectionStart
  //       const endPos = textarea.selectionStart
  //       console.log(startPos, endPos)
  //       if (startPos !== null && endPos !== null) {
  //         text = currentValue.substring(0, startPos) + text + currentValue.substring(endPos)
  //         inputValue.value = text
  //       } else {
  //         text = inputValue.value ? `，${text}` : text
  //         inputValue.value += text
  //       }
  //     }
  //   }
  // }
  // textarea?.focus()
}
const onInput = () => {
  if (inputValue.value) {
    setTimeout(() => {
      const val = inputValue.value.trim()
      if (val && val.length >= MaxLengthNum.备注最大值) {
        showToast('字数已达上限')
      }
    })
  }
}

const orderPageType = computed(() => piniaStore.root.getOrderPageType)

const onBlur = () => {
  setTimeout(() => {
    blurTextAreaReport('运单备注', inputValue.value)
  }, 500)
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
.custom-tips {
  margin-left: 8px;
  font-size: 22px;
  font-weight: normal;
  letter-spacing: 0px;
  color: #888ea6;
}
.slider-tag-wrapper {
  // 取消标签的下边距
  margin-top: 16px;
  // margin-bottom: -20px;
  // padding-bottom: env(safe-area-inset-bottom, 20px);
}
</style>
