<template>
  <ky-popup
    v-model:show="showPopup"
    position="bottom"
    :z-index="zIndex"
    :closeOnClickOverlay="closeOnClickOverlay"
    :safeAreaInsetBottom="safeAreaInsetBottom"
    :round="round"
    @click-overlay="close"
    @open="onPopOpen"
  >
    <view class="ky-action-sheet">
      <!--  顶部title   -->
      <view v-if="title" class="ky-action-sheet__title">{{ title }}</view>
      <!--  自定义内容   -->
      <slot></slot>
      <view v-if="!$slots.default">
        <view v-if="description" class="ky-action-sheet__item ky-action-sheet__desc">{{ description }}</view>
        <view v-if="menuItems && menuItems.length" class="ky-action-sheet__menu">
          <view
            v-for="(item, index) of menuItems"
            :key="index"
            class="ky-action-sheet__item"
            :class="{
              'ky-action-sheet__item--disabled': item.disable,
            }"
            :style="{ color: item.color }"
            @click="chooseItem(item, index)"
          >
            <!--  支持自定义item内容   -->
            <slot name="item" :item="item" :index="index">
              <view class="ky-action-sheet_option-tag"> {{ item[optionTag] }}</view>
              <view v-if="item[optionSubTag]" class="ky-action-sheet__sub-tab">{{ item[optionSubTag] }}</view>
            </slot>
          </view>
        </view>
        <!--  底部按钮    -->
        <view v-if="cancelTxt" class="ky-action-sheet__cancel" @click="handleCancel">
          {{ cancelTxt }}
        </view>
      </view>
    </view>
  </ky-popup>
</template>

<script lang="ts" setup name="ky-action-sheet">
import './index.scss'
import KyPopup from '@packages/__components/popup'
import { computed } from 'vue'
import { ActionSheetProps, MenuItems } from '@packages/__components/action-sheet/src/types'

const props = withDefaults(defineProps<ActionSheetProps>(), {
  show: false,
  safeAreaInsetBottom: false,
  closeOnClickOverlay: true,
  cancelTxt: '取消',
  optionTag: 'name',
  optionSubTag: 'subName',
  round: true,
})

const emit = defineEmits(['open', 'cancel', 'choose', 'close', 'update:show'])

// 是否展示pop
const showPopup = computed({
  get() {
    return props.show
  },
  set(val) {
    emit('update:show', val)
  },
})

/* 底部关闭按钮 */
const handleCancel = () => {
  emit('cancel')
  emit('update:show', false)
}

/* 选中选项 */
const chooseItem = (item: MenuItems, index: number) => {
  if (!item.disable && !item.loading) {
    emit('choose', item, index)
    emit('update:show', false)
  }
}
/* 手动-关闭底部弹框 */
const close = (e: Event) => {
  console.log('close>>>>>')
  emit('close', e)
  emit('update:show', false)
}

/* popup 打开回调 */
const onPopOpen = (value: boolean) => {
  emit('open', value)
}
</script>
