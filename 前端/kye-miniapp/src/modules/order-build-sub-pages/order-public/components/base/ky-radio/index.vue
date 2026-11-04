<template>
  <Radiogroup
    v-bind="$attrs"
    :modelValue="modelValue"
    :direction="direction"
    @change="change"
    :class="['ky-radio', `ky-radio--` + direction]"
    :manualUpdate="isManualUpdate"
  >
    <div
      v-for="(item, index) in radioProps"
      :key="index"
      @click="(event) => click(event, item.name, item)"
      :class="[props.modelValue === item.name ? 'radio-checked' : '', selfclass]"
    >
      <ky-radio v-bind="item" :name="item.name" :data-name="item.name">
        {{ item.text }}
        <template #icon>
          <slot name="icon" v-if="$slots.icon"></slot>
          <span v-else>
            <SvgIcon
              name="radio-checked"
              v-show="radioClassName(item) === 'radio-checked' && !checkedIcon"
              class="radio-icon"
            />
            <SvgIcon :name="checkedIcon" v-show="radioClassName(item) === checkedIcon" class="radio-icon" />
            <SvgIcon
              name="radio-disabled-checked"
              v-show="radioClassName(item) === 'radio-disabled-checked' && !checkedIcon"
              class="radio-icon"
            />

            <SvgIcon name="radio-unchecked" v-show="radioClassName(item) === 'radio-unchecked'" class="radio-icon" />
            <SvgIcon
              name="radio-disabled-unchecked"
              v-show="radioClassName(item) === 'radio-disabled-unchecked'"
              class="radio-icon"
            />
            <SvgIcon name="no-checked-red" v-show="radioClassName(item) === 'no-checked-red'" class="radio-icon" />
          </span>
        </template>
        <!-- <template #icon>
          <slot name="icon"></slot>
        </template> -->
      </ky-radio>
    </div>
  </Radiogroup>
</template>

<script setup lang="ts">
import { Radio as KyRadio } from '@kye-netc/kye-miniui'
import { Radiogroup } from '@kye-netc/kye-miniui'

import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { KyRadioProps } from '@order-public-sub-public/components/base/ky-radio/types'
import { computed } from 'vue'

import { useGlobalPopover } from '@order-global-package-order-sub/components/business/popover-effect/hooks/useUpdate'
const { removeValidateSinge } = useGlobalPopover()

type KyRadioGroupProps = {
  modelValue: any
  showCheckErrorTip?: boolean
  radioProps: KyRadioProps[]
  checkedIcon?: string
  direction: 'vertical' | 'horizontal'
  selfclass?: string
}

const props = withDefaults(defineProps<KyRadioGroupProps>(), {
  modelValue: '',
  disabled: false,
  // 注意：由于此处 direction 是本组件的 prop 故需把 direction 显式的传给 Radiogroup
  direction: 'vertical',
  iconSize: '20',
  checkedColor: '#1989fa',
  showCheckErrorTip: false, // 未勾选状态，标红
  checkedIcon: '',
  radioProps: () => [
    {
      name: '',
      text: '',
      shape: 'round',
      disabled: false,
      labelDisabled: false,
      labelPosition: 'right',
      iconSize: '28pxs',
      checkedColor: '#1989fa',
    },
  ],
})
/* 是否手动更新选中, 用于单选场景 */
const isManualUpdate = computed(() => {
  return props.radioProps?.length === 1
})

const emit = defineEmits(['change', 'click', 'update:modelValue'])

const change = (name: string) => {
  emit('change', name)
  if (!isManualUpdate.value) {
    emit('update:modelValue', name)
  }
}

const click = (event: MouseEvent, name: any, item: KyRadioProps) => {
  emit('click', name, event, item)
  removeValidateSinge()
}

/**
 * @description 禁用、非禁用选中的状态判断函数
 * @param radioProps
 */
const radioClassName = (radioProps: KyRadioProps) => {
  const checked = radioProps.checked || props.modelValue?.toString() === radioProps.name?.toString()
  const suffix = `${checked ? 'checked' : 'unchecked'}`
  if (radioProps.disabled) {
    return `radio-disabled-${suffix}`
  } else {
    const radioFn = () => {
      return props.checkedIcon && checked ? props.checkedIcon : `radio-${suffix}`
    }
    return props.showCheckErrorTip ? 'no-checked-red' : radioFn()
    // return props.showCheckErrorTip ? 'no-checked-red' : `radio-${suffix}`
  }
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
