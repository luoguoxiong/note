<template>
  <div class="waybill-remark-slide-tag-box">
    <div class="waybill-remark-slide-tag-title">
      <div class="title">常用留言</div>
      <div class="delete-box">
        <div v-if="!editStatus" class="no-active" @click="toDeleteTag">
          <SvgIcon class="delete-svg" name="remark-delete"></SvgIcon>
        </div>
        <div class="active-delete" v-else>
          <span @click="handleClear">清空</span>
          <span @click="finish">完成</span>
        </div>
      </div>
    </div>
    <scroll-view :class="{ 'waybill-remark-slide-tag-scroll': showScrollBar }" :scroll-y="true">
      <div class="waybill-remark-slide-tag" :class="{ 'tag-contain-clear_edit': editStatus }">
        <div class="waybill-remark-slide-tag-content flex">
          <div
            v-for="(item, index) in tagList"
            :key="index"
            class="waybill-remark-tag-content font-level4 color-sub-title"
            :class="{ edit_tag: editStatus }"
            type="default"
            size="small"
            @click="handleClick(item, type)"
          >
            <span class="color-sub-title-span">
              <div class="tag-info">{{ item.tagName }}</div>
              <SvgIcon v-if="editStatus" class="close-tinge-svg" name="close-line"></SvgIcon>
            </span>
          </div>
        </div>
      </div>
    </scroll-view>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import {
  SlideTagDetail,
  SlideTagProps,
} from '@order-public-sub-public/components/business/waybill-remark/components/slide-tag-list/types'
// import { expReport, deleteManageReport, deleteItemReport, clearTagReport, finishTagReport } from './report/index'

const props = withDefaults(defineProps<SlideTagProps>(), {
  tagList: () => [],
  showScrollBar: false,
  type: '',
})

const editStatus = ref(false)

const emit = defineEmits(['click', 'clear'])

const handleClear = () => {
  // clearTagReport(props.type)
  emit('clear', '', '', true)
}

const handleClick = (item: SlideTagDetail, type?: string) => {
  const { tagName } = item
  if (editStatus.value) {
    clearHistory(item)
    return
  }
  if (editStatus.value) return
  emit('click', tagName, { item, type })
}
const clearHistory = (item: SlideTagDetail) => {
  // deleteItemReport(props.type)
  emit('clear', item.waybillLogId, item.tagName, false)
}

const toDeleteTag = () => {
  editStatus.value = true
  // deleteManageReport(props.type)
}

const finish = () => {
  // finishTagReport(props.type)
  editStatus.value = false
}

const closeManage = () => {
  editStatus.value = false
}

defineExpose({
  closeManage,
})
</script>

<style lang="scss">
@import './index.scss';
</style>
