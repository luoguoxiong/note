<template>
  <view :class="classes">
    <!--  顶部栏  -->
    <picker-header
      v-if="showToolbar"
      :showToolbar="showToolbar"
      :title="title"
      :showClose="showClose"
      :confirmButtonText="confirmButtonText"
      :cancelButtonText="cancelButtonText"
      @confirm="confirm"
      @cancel="cancel"
      @close="onClose"
    ></picker-header>
    <template v-if="showLoading">
      <picker-loading :height="pickerViewStyles.height" />
    </template>
    <!--  自定义选项上方内容  -->
    <slot name="columns-top"></slot>
    <template v-if="showColumns">
      <!--  content-h5   -->
      <view class="ky-picker__column ky-picker__column-weapp" :style="pickerViewStyles">
        <view v-for="(column, columnIndex) in columnsList" :key="columnIndex" class="ky-picker__columnitem">
          <picker-column-h5
            ref="swipeRef"
            :column="column"
            :columns-type="columnsType"
            :field-names="columnFieldNames"
            :value="defaultValues[columnIndex]"
            :three-dimensional="false"
            :visible-option-num="visibleOptionNum"
            :option-height="optionHeight"
            taro
            @change="(option: any) => onChangeH5(columnIndex, option)"
          ></picker-column-h5>
        </view>
      </view>
    </template>
    <template v-if="showEmpty">
      <slot name="empty"></slot>
    </template>
    <!--  自定义选项下方内容  -->
    <slot name="columns-bottom"></slot>
  </view>
</template>

<script lang="ts" setup name="ky-picker-new">
import '../scss/pickerItem.scss'
import Taro from '@tarojs/taro'
import { PickerNewProps } from '@packages/__components/picker/src/types'
import { usePicker } from '../usePicker'
import { computed, CSSProperties, reactive } from 'vue'
import PickerHeader from './picker-header.vue'
import PickerColumnH5 from './column.vue'
import PickerLoading from '@packages/__components/picker/src/components/picker-loading.vue'

import usePickerStatus from '@packages/__components/picker/src/usePickerStatus'

const props = withDefaults(defineProps<PickerNewProps>(), {
  columns: [] as PickerNewProps['columns'] & null,
  confirmButtonText: '确认',
  cancelButtonText: '取消',
  title: '标题',
  showToolbar: true,
  optionHeight: 36,
  visibleOptionNum: 7,
  loading: false,
})

const emit = defineEmits(['cancel', 'confirm', 'change', 'update:modelValue'])

const state = reactive({
  show: false,
  ENV: Taro.getEnv(),
  ENV_TYPE: Taro.ENV_TYPE,
})

const prefix = 'ky-picker'

const classes = computed(() => {
  return {
    [`${prefix}`]: true,
    [`${prefix}--tool-left`]: !props.cancelButtonText && !props.cancelButtonText,
  }
})

const { defaultValues, columnsList, columnFieldNames, columnsType, onClose, cancel, confirm, changeHandler, swipeRef } =
  usePicker(props, emit)

const { showEmpty, showColumns, showLoading } = usePickerStatus(props)

const onChangeH5 = (columnIndex, option) => {
  return changeHandler(columnIndex, option)
}

const pickerViewStyles = computed(() => {
  const styles: CSSProperties = {}
  styles.height = `${+props.visibleOptionNum * +props.optionHeight}px`
  styles['--lineHeight'] = `${+props.optionHeight}px`
  return styles
})

defineExpose({
  confirm,
})
</script>
