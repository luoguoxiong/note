<template>
  <div class="selected-setting">
    <draggable
      class="drag_box"
      v-if="list.length > 0"
      v-model="list"
      @end="onDragEnd"
      @start="onDragStart"
      item-key="menuCode"
    >
      <template #item="{ element, index }">
        <div
          @mousedown="onSelectDrag(index)"
          @mouseup="onReSelectDrag()"
          :class="{
            'drag-border-only': draggedIndex === index,
            active: dradggedSelectIndex === index,
            item_box: true,
          }"
        >
          {{ element.menuName }}
          <div class="remove" @mousedown="stopRemoveItem" @click="onDelete(element.menuCode)">
            <img
              src="https://ic-img.ky-express.com/netc/20240912_52770395157_!!1726121878740_28_28.png"
              alt=""
              srcset=""
            />
          </div>
        </div>
      </template>
    </draggable>
    <Empty v-else></Empty>
  </div>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'
import { watch, ref } from 'vue'
import { SettingDataVO } from '@/apis/home/types'
import Empty from '../empty/index.vue'
import { Any } from '@/types'
interface SelectedSettingProps {
  selectedData: SettingDataVO[]
}

const props = defineProps<SelectedSettingProps>()

const list = ref<SettingDataVO[]>([])

const emit = defineEmits(['delete', 'drag'])

const isDragging = ref(false)

const draggedIndex = ref()

const dradggedSelectIndex = ref()

const onDelete = (menuCode: string) => {
  emit('delete', menuCode)
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_homepage_quick_access_selected_delete_v1',
    },
    {
      region_code: 'quick_access',
    }
  )
}

watch(
  props,
  (newVAL) => {
    list.value = newVAL.selectedData
  },
  {
    immediate: true,
    deep: true,
  }
)

const onSelectDrag = (index: number) => {
  dradggedSelectIndex.value = index
}

const onReSelectDrag = () => {
  dradggedSelectIndex.value = ''
}

const onDragStart = (evt: Any) => {
  isDragging.value = true
  draggedIndex.value = evt.oldDraggableIndex
}

const onDragEnd = () => {
  isDragging.value = false
  draggedIndex.value = null
  dradggedSelectIndex.value = ''
  emit('drag', list.value)
}

const stopRemoveItem = (e: Any) => {
  e.stopPropagation()
}
</script>

<style scoped lang="scss">
.drag-border-only.active {
  box-sizing: border-box;
  border: 1px dashed #adb0b8 !important;
  background: transparent !important;
  color: transparent !important; /* 隐藏文字 */
  .remove {
    display: none;
  }
}
.selected-setting {
  // 固定容纳 3 行卡片（3*40 + 2*16 + 上下 padding 32），不做跟随内容自适应
  height: 184px;
  box-sizing: border-box;
  padding: 16px 52px 16px;
  border-radius: 4px;
  background: #f7f8fa;
  margin-bottom: 16px;
  .drag_box {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 16px 24px;
    .item_box {
      position: relative;
      cursor: pointer;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
      border-radius: 4px;
      opacity: 1;
      background: #7143f0;
      box-sizing: border-box;
      border: 1px solid #7143f0;
      padding: 0 32px 0 8px;
      height: 40px;
      font-size: 13px;
      font-weight: normal;
      line-height: 20px;
      text-align: center;
      letter-spacing: 0px;
      color: #ffffff;
      &.active {
        border: 1px dashed white;
        background: #3e25e9;
        cursor: pointer;
      }
      &:nth-child(3n) {
        margin-right: 0;
      }
    }
  }
}
.remove {
  position: absolute;
  top: 9px;
  right: 8px;
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #bda5f8;
  border-radius: 4px;
  padding: 2px;
  box-sizing: border-box;
  &:hover {
    background: #8a61f2;
  }
  &:active {
    background: #5230ec;
  }
  img {
    width: 14px;
  }
}
</style>
