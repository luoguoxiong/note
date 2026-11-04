<template>
  <div class="slide-tag" :class="{ 'tag-contain-clear_edit': editStatus }" v-if="tagList.length">
    <scroll-view
      :class="{ 'slide-tag-warp': warp, 'slide-tag-contain-clear': clearable && visible }"
      class="slide-tag-product"
      ref="scrollViewRef"
      :scroll-x="true"
      scroll-with-animation
      :scroll-y="false"
    >
      <div class="slide-tag-content flex" :data-show-scroll-bar="showScrollBar">
        <ky-button
          v-for="(item, index) in tagList"
          :key="index"
          class="tag-content font-level4 color-sub-title"
          :class="{ edit_tag: editStatus }"
          type="default"
          size="small"
          v-exposure-report="expReport(item, type)"
          @click="handleClick(item, type)"
        >
          <span class="color-sub-title-span">
            {{ tagNameText(item.tagName) }}
            <SvgIcon v-if="editStatus" class="close-tinge-svg" name="close-line"></SvgIcon>
          </span>
        </ky-button>
      </div>
    </scroll-view>
    <div
      v-if="clearable && visible"
      class="slide-tag-clear"
      v-click-report="{
        eventCode: 'clk_express_single_consignment_float_clear_v1',
      }"
    >
      <div class="edit_status" v-if="editStatus">
        <div
          class="btn clear_all"
          @click="clearHistory"
          v-exposure-report="{
            eventCode: 'exp_express_single_goods_message_goods_history_record_empty_button_v1',
          }"
          v-click-report="{
            eventCode: 'clk_express_single_goods_message_goods_history_record_empty_button_v1',
          }"
        >
          清空
        </div>
        <div
          class="btn finish"
          @click.stop="changeEditStatus"
          v-exposure-report="{
            eventCode: 'exp_express_single_goods_message_goods_history_record_complete_button_v1',
          }"
          v-click-report="{
            eventCode: 'page_express_single_goods_message_goods_v1',
          }"
        >
          完成
        </div>
      </div>
      <div
        v-else
        class="clear-icon"
        @click="changeEditStatus"
        v-exposure-report="{
          eventCode: 'exp_express_single_goods_message_goods_history_record_delete_button_v1',
        }"
        v-click-report="{
          eventCode: 'clk_express_single_goods_message_goods_history_record_delete_button_v1',
        }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { SlideTagDetail, SlideTagProps } from '@order-public-sub-public/components/ui/slide-tag/types'
import { expReport, reportClickTag } from './report/index'
import { computed, ref } from 'vue'

import { OrderPageType } from '@order-public-sub-public/constants'
import { modalContentType } from '@order-public-sub-public/components/business/waybill-remark/components/modalContentHook'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()
const props = withDefaults(defineProps<SlideTagProps>(), {
  tagWords: 7,
  tagList: () => [],
  warp: false,
  clearable: false,
  showScrollBar: false,
})

const editStatus = ref(false)

// 此需求没有兼容批量，后续批量单独出需求迭代
const visible = computed(() => {
  const orderPageType = piniaStore.root.getOrderPageType
  return orderPageType !== OrderPageType.批量寄 && orderPageType !== OrderPageType.批量寄单票
})

const tagNameText = (tagName: string) => {
  if (tagName.length <= props.tagWords) {
    return tagName
  } else {
    return `${tagName.slice(0, props.tagWords)}...`
  }
}

const emit = defineEmits(['click', 'clear'])

const handleClick = (item: SlideTagDetail, type?: string) => {
  const { tagName } = item
  if (editStatus.value) {
    clearHistory(item)
    return
  }
  emit('click', tagName, { item, type })
  if (type === modalContentType['托寄物']) {
    reportClickTag({ item, type })
  }
}
const clearHistory = (item?: SlideTagDetail) => {
  emit('clear', item)
}
const changeEditStatus = () => {
  editStatus.value = !editStatus.value
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
