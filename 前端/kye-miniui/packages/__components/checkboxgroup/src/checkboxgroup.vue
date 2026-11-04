<template>
  <view class="ky-checkbox-group" :class="`ky-checkbox-group--${direction}`" v-bind="$attrs">
    <slot></slot>
  </view>
</template>

<script setup lang="ts">
import './index.scss'
import { computed } from 'vue'
import { CHECKBOX_KEY } from './types'
import { CheckboxType } from '@packages/__components/checkbox/src/types'
import { useChildren } from '@packages/__components/checkboxgroup/src/hooks/useChildren'

export type CheckboxGroupProps = Partial<{
  modelValue: any
  direction: 'vertical' | 'horizontal' // 方向vertical: 垂直 , horizontal: 水平
  size: 'large' | 'medium' | 'normal' | 'small' | 'mini' // 尺寸大小
  type: CheckboxType // checkbox 类型
  disabled: boolean // 是否禁用整个checkbox-group
  iconSize: string | number // 图标大小
  max: number
  isError: boolean // 是否错误样式显示
  checkedHighlight: boolean // 是否开启选中高亮
  singleMode: boolean // 是否开启单选模式
}>

const props = withDefaults(defineProps<CheckboxGroupProps>(), {
  modelValue: [],
  type: 'round',
  direction: 'vertical',
  size: 'normal',
  iconSize: '20px',
  max: 0,
  isError: false,
  checkedHighlight: false,
})

const emit = defineEmits(['update:modelValue', 'change'])

const convertValue = (val: (string | boolean | number)[]) =>
  val.map((v) => (v === 'true' ? true : v === 'false' ? false : v))

const updateValue = (value: (string | boolean | number)[]) => {
  console.log('updateValue', value)
  const valueFormat = convertValue(value)
  emit('update:modelValue', [...valueFormat])
  emit('change', valueFormat)
}

const onChange = (e) => {
  console.log('[log] checkboxGroup onChange', e)
  // 单选模式
  if (props.singleMode) {
    onChangeSingleMode(e)
  } else {
    // 正常checkbox
    onChangeNormal(e)
  }
}
/* 正常checkbox */
const onChangeNormal = (e) => {
  const value = e?.detail?.value
  updateValue(value, e)
}

/* 单选模式更新 */
const onChangeSingleMode = (e) => {
  const value = e?.detail?.value
  const lastSelect = [value[value.length - 1]]
  updateValue(lastSelect, e)
}

/**
 * 全选
 * @param checked true选中, false 全取消
 */
const toggleAll = (checked: boolean) => {
  const checkedChildren = children.value.filter((item: any) => {
    if (item?.disabled) {
      return item?.checked
    }
    return checked ? true : item?.checked
  })
  const names = checkedChildren.map((item: any) => item.name)
  updateValue(names)
}

/**
 * 取反，返回当前相反的逻辑
 * @param
 */
const toggleReverse = () => {
  console.log('toggleReverse', props.modelValue)
  const checkedChildren = children.value.filter((item: any) => {
    if (item?.disabled) {
      return item?.checked
    }
    return !props.modelValue.includes(item.name)
  })
  const names = checkedChildren.map((item: any) => item.name)
  updateValue(names)
}

/* provide 注册 */
const { children } = useChildren(CHECKBOX_KEY, {
  name: computed(() => props.modelValue), // 当前选中
  disabled: computed(() => props.disabled),
  type: computed(() => props.type),
  max: computed(() => props.max),
  size: computed(() => props.size),
  iconSize: computed(() => props.iconSize),
  isError: computed(() => props.isError),
  checkedHighlight: computed(() => props.checkedHighlight),
  updateValue,
})

defineExpose({
  toggleAll,
  toggleReverse,
})

console.log('props checkboxgroup children>>>', children.value)

console.log(props)
</script>
