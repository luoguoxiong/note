<template>
  <view :class="classes">
    <!--  顶部栏  -->
    <picker-header
      v-if="showToolbar"
      :showToolbar="showToolbar"
      :title="title"
      :confirmButtonText="confirmButtonText"
      :cancelButtonText="cancelButtonText"
      :showClose="showClose"
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
      <!-- content Taro 下转换成 微信小程序 -->
      <picker-view
        v-if="state.ENV != state.ENV_TYPE.WEB"
        :indicator-style="`height:${optionHeight}px;font-weight:bold;`"
        indicator-class="ky-picker__indicator"
        :style="pickerViewStyles"
        :value="defaultIndexes"
        :immediate-change="true"
        @change="onChange"
        @pickstart="handlePickstart"
        @pickend="handlePickend"
      >
        <picker-view-column
          v-for="(column, columnIndex) in columnsList"
          :key="columnKeys[columnIndex]"
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
              ...styleFn(item[columnFieldNames.value] === defaultValues[columnIndex]),
            }"
          >
            {{ item[columnFieldNames.text] }}
          </view>
        </picker-view-column>
      </picker-view>
    </template>
    <template v-if="showEmpty">
      <slot name="empty"></slot>
    </template>
    <!--  自定义选项下方内容,不支持暴露插槽作用域方法  -->
    <slot name="columns-bottom"></slot>
  </view>
</template>

<script lang="ts" setup name="ky-picker-new">
import '../scss/pickerItem.scss'
import Taro from '@tarojs/taro'
import { PickerNewProps } from '@packages/__components/picker/src/types'
import { usePicker } from '@packages/__components/picker/src/usePicker'
import { computed, CSSProperties, provide, reactive } from 'vue'
import PickerHeader from './picker-header.vue'
import PickerLoading from '@packages/__components/picker/src/components/picker-loading.vue'
import { limitFunctionCalls, pxCheck } from '../utils'
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
  showClose: false,
})

const emit = defineEmits(['cancel', 'confirm', 'change', 'update:modelValue', 'close'])

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
  columnKeys,
  cancel,
  confirm,
  changeHandler,
  onClose,
} = usePicker(props, emit)
const { showEmpty, showColumns, showLoading } = usePickerStatus(props)
console.log('columnsList.value>>>>', columnsList.value)
// class 在支付宝初始化样式不生效，用行内样式
const styleFn = (active) => {
  let _style = {
    display: 'block',
    textAlign: 'center',
    width: '100%',
    fontSize: '16px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: 400,
    color: '#8C8F99',
  }
  if (active) {
    _style.fontWeight = 600
    _style.color = '#24262B'
  }
  return _style
}
/* change回调处理 */
const onChange = (data: any) => {
  if (state.ENV == state.ENV_TYPE.WEAPP) {
    // /* 用于适配skyline-cascade 关联多次触发 */
    // return onChangeWeApp(data)
    return onChangeNative(data)
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

  // 选择的是哪个 option
  changeHandler(changeIndex, columnsList.value[changeIndex][data.detail.value[changeIndex]])
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

provide('kyPickerMethods', {
  confirm,
  cancel,
})

defineExpose({
  confirm,
  cancel,
})
</script>
