<template>
  <view :class="classes">
    <!--  顶部栏  -->
    <picker-header
      v-if="showToolbar"
      :showToolbar="showToolbar"
      :title="title"
      :confirmButtonText="confirmButtonText"
      :cancelButtonText="cancelButtonText"
      @confirm="confirm"
      @cancel="cancel"
    ></picker-header>
    <template v-if="showLoading">
      <picker-loading :height="pickerViewStyles.height" />
    </template>
    <!--  自定义选项上方内容  -->
    <slot name="columns-top"></slot>
    <template v-if="showColumns">
      <!-- content Taro 下转换成 微信小程序 -->
      <picker-view
        v-if="state.ENV != state.ENV_TYPE.WEB"
        :indicator-style="`height:${optionHeight}px;font-weight:bold;`"
        indicator-class="ky-picker__indicator"
        :style="pickerViewStyles"
        :value="defaultIndexes"
        :immediate-change="false"
        @change="onChange"
        @pickstart="handlePickstart"
        @pickend="handlePickend"
      >
        <picker-view-column
          v-for="(column, columnIndex) in columnsList"
          :key="columnIndex"
          :filed-names="columnFieldNames"
          itemStyle="color:red;"
        >
          <view
            v-for="(item, index) in column"
            :key="item[columnFieldNames.value] ?? index"
            class="ky-picker-roller-item-tarotile"
            :class="{
              [item[columnFieldNames.className]]: item[columnFieldNames.className],
              'ky-picker-roller-item--active': item[columnFieldNames.value] === defaultValues[columnIndex],
            }"
            :style="{
              lineHeight: pxCheck(optionHeight),
            }"
          >
            {{ item[columnFieldNames.text] }}
          </view>
        </picker-view-column>
      </picker-view>
      <!--  content-h5   -->
      <view v-else class="ky-picker__column ky-picker__column-weapp" :style="pickerViewStyles">
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
import { limitFunctionCalls, pxCheck } from '../utils'
import usePickerStatus from '@packages/__components/picker/src/usePickerStatus'
import PickerLoading from '@packages/__components/picker/src/components/picker-loading.vue'
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
  picking: false,
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

const {
  defaultIndexes,
  defaultValues,
  columnsList,
  columnFieldNames,
  columnsType,
  cancel,
  confirm,
  changeHandler,
  swipeRef,
} = usePicker(props, emit)
const { showEmpty, showColumns, showLoading } = usePickerStatus(props)
console.log('columnsList.value>>>>', columnsList.value)

/* change回调处理 */
const onChange = (data: any) => {
  if (state.ENV == state.ENV_TYPE.WEAPP) {
    /* 用于适配skyline-cascade 关联多次触发 */
    return onChangeWeApp(data)
  } else {
    return onChangeNative(data)
  }
}
/* 微信小程序change回调 */
const onChangeWeApp = limitFunctionCalls((data: any) => onChangeNative(data), 1, 50)

/* 小程序change回调 */
const onChangeNative = (data: any) => {
  console.log('onChange local', data)
  const prevDefaultValue = defaultIndexes.value
  let changeIndex = 0
  // 判断变化的是第几个
  for (let i = 0; i < data.detail.value?.length; i++) {
    if (prevDefaultValue[i] !== data.detail.value?.[i]) {
      changeIndex = i
      break
    }
  }
  // console.log('onChange __inner1', changeIndex, data.detail.value)

  // 选择的是哪个 option
  changeHandler(changeIndex, columnsList.value[changeIndex][data.detail.value[changeIndex]])
}

const onChangeH5 = (columnIndex, option) => {
  return changeHandler(columnIndex, option)
}

// 原生事件-开始滚动事件
const handlePickstart = () => {
  state.picking = true
}
// 原生事件-开始滚动选择结束
const handlePickend = () => {
  state.picking = false
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
