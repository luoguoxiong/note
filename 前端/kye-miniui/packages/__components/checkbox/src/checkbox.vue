<template>
  <view class="ky-checkbox-item" @click="onClick">
    <label :class="classes">
      <!-- icon 固定容器，避免节点结构变化 -->
      <view class="ky-checkbox-icon-wrapper">
        <!-- buttonSelect -->
        <image v-if="showButtonSelect" class="ky-checkbox-select-icon" :src="radioIcon" />

        <!-- 自定义icon -->
        <view v-else-if="$slots.icon" class="ky-checkbox-item-icon">
          <slot name="icon" :checked="checked" />
        </view>

        <!-- 默认icon -->
        <image v-else-if="radioIcon" class="ky-checkbox-icon" :src="radioIcon" :style="imageIconStyle" />
      </view>

      <!-- 文本固定存在 -->
      <view class="ky-checkbox-text">
        <slot />
      </view>
    </label>
  </view>
</template>
<script setup lang="ts" name="ky-checkbox">
import './index.scss'

import { computed, reactive } from 'vue'
import Taro from '@tarojs/taro'
import useRadioType from '@packages/__components/radio/src/useRadioType'
import { CHECKBOX_KEY } from '@packages/__components/checkboxgroup/src/types'
import { CheckboxProps } from '@packages/__components/checkbox/src/types'
import { debounce } from '@packages/__components/checkbox/src/utils'
import { useParent } from '@packages/__components/checkboxgroup/src/hooks/useParent'
import { RadioType } from '@packages/__components/radio/src/types'

defineOptions({
  name: 'ky-checkbox',
})

const props = withDefaults(defineProps<CheckboxProps>(), {
  type: 'round',
  modelValue: false,
  checked: false,
  disabled: false,
  direction: 'vertical',
  isError: false,
  labelPosition: 'right',
  name: '',
})

const emit = defineEmits(['click', 'update:modelValue'])

const state = reactive({
  ENV: Taro.getEnv(),
})

/* checkbox group */
// const parent: any = inject(CHECKBOX_KEY, null)
const { parent } = useParent(CHECKBOX_KEY)

// 是否存在checkboxGroup
const hasParent = computed(() => !!parent)

/* checkbox 配置 */
const prefixCls = 'ky-checkbox'

const classes = computed(() => {
  return {
    [`${prefixCls}`]: true,
    [`${prefixCls}--active`]: checked.value,
    [`${prefixCls}--unchecked`]: !checked.value,
    [`${prefixCls}--disabled`]: disabled.value,
    [`${prefixCls}-type--${type.value}`]: type.value,
    [`${prefixCls}-direction--${props.direction}`]: props.direction,
    [`${prefixCls}--${size.value}`]: size.value,
    [`${prefixCls}--error`]: props.isError,
    [`${prefixCls}--reverse`]: reverseState.value,
    [`${prefixCls}--${state.ENV}`]: state.ENV,
    [`${prefixCls}--highlight`]: checked.value && checkedHighlight.value,
  }
})

const imageIconStyle = computed(() => {
  if (!iconSize.value) {
    return null
  }
  return {
    width: `${iconSize.value}px`,
    height: `${iconSize.value}px`,
  }
})

/* 是否选中 */
const checked = computed(() => {
  if (hasParent.value) {
    const parentValue = parent?.name?.value
    if (Array.isArray(parentValue)) {
      return parentValue.includes(props.name)
    } else {
      return parentValue === props.name // 对比
    }
  } else {
    return props.modelValue
  }
})
/* 是否禁用 */
const disabled = computed(() => {
  return props.disabled || parent?.disabled?.value || false
})
/* 当前是否为error状态 */
const isError = computed(() => {
  return props.isError || parent?.isError.value
})

/* 文字位置 */
const reverseState = computed(() => {
  return props.labelPosition === 'left'
})

/* type:buttonSelect 选中是否展示 */
const showButtonSelect = computed(() => {
  return type.value === ('buttonSelect' as RadioType) && radioIcon && checked.value
})

const size = computed(() => props.size || parent?.size.value)

/* 图标尺寸 */
const iconSize = computed(() => {
  return props.iconSize || parent?.iconSize.value
})

const type = computed(() => {
  return parent?.type.value || props.type
})

const checkedHighlight = computed(() => {
  return parent?.checkedHighlight.value
})

const { radioIcon } = useRadioType(props, { checked, disabled, isError, type })

/* 点击事件- 绑定外层用于支付宝click事件支持 */
const onClick = debounce((e) => {
  if (disabled.value) return

  emit('click', props.name, e)

  if (hasParent.value) {
    const parentValue = parent.name.value || []

    let nextValue = [...parentValue]

    if (parentValue.includes(props.name)) {
      nextValue = nextValue.filter((v) => v !== props.name)
    } else {
      nextValue.push(props.name)
    }

    // 单选模式
    if (parent.singleMode?.value) {
      nextValue = [props.name]
    }

    parent.updateValue(nextValue)
  } else {
    emit('update:modelValue', !props.modelValue)
  }
}, 50)

// const onChange = (e) => {
//   console.log('checkbox onChange', e)
//   if (!parent.value) {
//     emit('update:modelValue', checked)
//   }
// }
</script>
