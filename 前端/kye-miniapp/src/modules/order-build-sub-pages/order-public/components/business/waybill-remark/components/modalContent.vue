<!-- 运单备注/给司机捎句话公告弹窗 -->
<template>
  <BottomPopup
    v-bind="$attrs"
    :style="{
      ...popupStyles,
      maxHeight: '90%',
    }"
    :title="title"
    :showTips="true"
    :tipText="tipText"
    :show="modalShow"
    :footerText="'确定'"
    showFooter
    @onClose="onClose"
    @onConfirm="onSubmit"
    :loading="btnLoading"
    :scrollTop="scrollTop"
    class="waybill-remark-modal-content-popup"
    :safeAreaInsetBottom="safeAreaBottom"
    :catchMove="false"
  >
    <template #tips>
      <slot name="tips">
        <span class="custom-tips">{{ tipText }}</span>
      </slot>
    </template>
    <slot name="extra" />
    <div class="content-wrapper">
      <!--  v-show用于解决popup组件渲染不全异常   -->
      <KyTextarea
        v-show="true"
        :class="customInputClass"
        :noPadding="true"
        :modelValue="inputValue"
        :showWordLimit="true"
        :placeholder="placeholder"
        :rows="rows"
        :maxlength="wordLimit"
        clearable
        v-bind="$attrs"
        :fixed="true"
        ref="inputRef"
        :formatter="formatter"
        @focus="clickTextAreaReport(title, driverReportPageCode().page_code)"
        @clear="clearText(title)"
        :enableNative="true"
      ></KyTextarea>
      <div class="slider-tag-wrapper" v-if="tagList.length">
        <SlideTagList
          class="tag-container"
          :showScrollBar="showScrollBar"
          :warp="true"
          :type="componentType"
          :tagList="tagList"
          @click="handleQuickFilld"
          @clear="toDeleteTag"
        />
      </div>
    </div>
  </BottomPopup>
</template>

<script setup lang="ts">
import KyTextarea from '@order-public-sub-public/components/base/ky-textarea/index.vue'
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import { SlideTagDetail } from '@order-public-sub-public/components/ui/slide-tag/types'
import { useKeyboardPopupStyles } from '@order-public-sub-public/hooks/useKeyboardPopupStyles'
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { clickTextAreaReport, clearReport } from '@order-public-sub-public/report/messageTodriver'
import { reportClickTag } from '@order-public-sub-public/components/ui/slide-tag/report'
import { modalContentType } from './modalContentHook'
import { reportPerception } from '@order-public-sub-public/reportUmp/util/index'
import SlideTagList from '@order-public-sub-public/components/business/waybill-remark/components/slide-tag-list/index.vue'
import { WaybillRemarkDimension, MessageToDriverDimension, CommonTypeForRemark } from '@order-public-sub-public/types'
import { ModuleType } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { delteWaybillRemarkTag, delteMessageToDriverRemarkTag } from '@order-public-sub-public/apis/waybill/remark'
import { hideKeyboardUtil } from '@order-public-sub-public/utils/common'
import { setDefaultScrollTop } from '@order-public-sub-root-pages/order-single/hooks/useScrollTop'
const piniaStore = useStore()

export interface IProps {
  title: string
  tipText?: string
  modalShow: boolean
  placeholder?: string
  onClose: () => void
  onConfirm: () => void
  inputValue?: string
  tagList: SlideTagDetail[]
  onQuickFill: (text: string) => void
  customInputClass: string
  showMaxTip?: boolean
  showScrollBar?: boolean
  componentType?: string
  wordLimit?: number
  rows?: number
  /** 埋点页面编码覆盖（给司机捎句话在取货资料页内为 page_express_pickup_v1） */
  reportPageCode?: string
}

const props = defineProps<IProps>()

// page_code 覆盖仅对「给司机捎句话」生效（运单备注不传 reportPageCode）
const driverReportPageCode = () =>
  props.componentType === modalContentType['给司机捎句话'] && props.reportPageCode
    ? { page_code: props.reportPageCode }
    : {}

const btnLoading = ref(false)

const textAreaRef = ref<HTMLInputElement | null>(null)

const { allPopupStyles, safeAreaBottom, handleInputs } = useKeyboardPopupStyles()

const popupStyles = computed(() => allPopupStyles[`.${props.customInputClass}`]?.styles ?? {})
const scrollTop = ref(0)
onMounted(() => {
  const textAreaEle = document.querySelector(
    'textarea.van-field__control.van-field__control--min-height',
  ) as HTMLInputElement
  textAreaRef.value = textAreaEle
  nextTick(() => handleInputs(`.${props.customInputClass}`, 'textarea'))
})

watch(
  () => props.modalShow,
  async (val) => {
    if (val && textAreaRef.value) {
      textAreaRef.value.click()
      await nextTick()
      textAreaRef.value.blur()
    }
    if (val) {
      let reportCode =
        props.componentType === modalContentType['运单备注']
          ? 'other_express_remarks_popup_perception_v1'
          : 'other_express_driver_popup_perception_v1'

      reportPerception(reportCode)
    }
  },
)

const onSubmit = () => {
  try {
    btnLoading.value = true
    props.onConfirm && props.onConfirm()
  } catch (error) {
    console.log('onSubmit error', error)
  } finally {
    btnLoading.value = false
  }
}

const inputRef = ref<InstanceType<any> | null>()

const textareaRef = computed(() => inputRef.value?.textAreaRef)

defineExpose({ textareaRef })

const handleQuickFilld = (text: string, params: { item: SlideTagDetail; type?: string }) => {
  props.onQuickFill && props.onQuickFill(text)
  if (props.componentType !== modalContentType['托寄物']) {
    reportClickTag(params, textareaRef.value?.modelValue)
  }
  scrollTop.value = 0
  // TODO scrollTop需要变化才会生效，否则再次滚动到底部点击后，无法将内容滑到顶部，这里做个延时操作
  setTimeout(() => {
    scrollTop.value = 0.1
    setDefaultScrollTop()
  }, 200)
}
const formatter = (value: string) => {
  return value.replace(/^\s/g, '') // 开头不能为空
}

const waybillRemarkList = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType.运单备注)?.waybillRemarkList || []
})

const messageToDriverList = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType.给司机捎句话)?.messageToDriverList || []
})

const toDeleteTag = (waybillLogId: string, tagName: string, isClear: boolean) => {
  // 如果是运单备注
  if (props.componentType === modalContentType['运单备注']) {
    //  waybillLogId 为空 '' 的时候，表示清空
    //  如果有具体的id 表示删除对应的某一个tag
    waybillLogId = isClear ? '' : waybillLogId
    // 修改前端緩存的托寄物历史数据
    let newList: CommonTypeForRemark[] = []
    if (!isClear) {
      newList = waybillRemarkList.value.filter((i) => waybillLogId !== i.waybillLogId)
    } else {
      newList = []
    }
    piniaStore.schema.updateModuleDimensionByType({
      type: ModuleType['运单备注'],
      data: { waybillRemarkList: newList },
    })
    showToast('删除成功')
    // 需求说 不要等结果返回前端直接先删除
    delteWaybillRemarkTag({
      waybillLogId,
      clearAll: isClear,
    })
  }
  if (props.componentType === modalContentType['给司机捎句话']) {
    // 修改前端緩存的托寄物历史数据
    let newList: CommonTypeForRemark[] = []
    //  waybillLogId 为空 '' 的时候，表示清空
    //  如果有具体的id 表示删除对应的某一个tag
    // 如果有 id请求就传id，没有id就传tagName
    let params: any = {}
    if (isClear) {
      params.waybillLogId = ''
      newList = []
    } else {
      // 如果有id 通过id过滤，没有就通过tagName
      if (!waybillLogId) {
        params.value = tagName
        newList = messageToDriverList.value.filter((i) => tagName !== i.value)
      } else {
        params.waybillLogId = waybillLogId
        newList = messageToDriverList.value.filter((i) => waybillLogId !== i.waybillLogId)
      }
    }
    piniaStore.schema.updateModuleDimensionByType({
      type: ModuleType['给司机捎句话'],
      data: { messageToDriverList: newList },
    })
    showToast('删除成功')
    // 发起请求
    delteMessageToDriverRemarkTag({
      ...params,
      clearAll: isClear,
    })
  }
}

const clearText = (title) => {
  clearReport(title, driverReportPageCode().page_code)
  setTimeout(() => {
    // 产品要点击清空，关闭键盘， clear会触发update这里要延时关闭
    hideKeyboardUtil()
  }, 200)
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
.custom-tips {
  margin-left: 8px;
  font-size: 22px;
  font-weight: normal;
  letter-spacing: 0px;
  color: #888ea6;
}
.waybill-remark-modal-content-popup {
  .container__body {
    padding-top: 16px;
  }

  .slider-tag-wrapper {
    margin-top: 12px;
  }
  .content-wrapper {
    .ky-textarea {
      padding: 24px;
      .bottom {
        position: relative;
        left: auto;
        right: auto;
        bottom: auto;
      }
    }
  }
}
</style>
