<template>
  <component :is="poppable ? 'ky-popup' : 'view'" v-bind="popupProps" v-model:show="showPop">
    <picker-item-view
      v-model="modelValue"
      :columns="columns"
      :title="title"
      :confirm-button-text="confirmButtonText"
      :cancel-button-text="cancelButtonText"
      :loading="loading"
      :showToolbar="showToolbar"
      :showClose="showClose"
      @change="onChange"
      @cancel="onCancel"
      @confirm="onConfirm"
      @close="onClose"
      v-bind="$attrs"
      ref="pickerRef"
    >
      <!-- slot 透传   -->
      <template v-for="slotName in Object.keys($slots)" :key="slotName" v-slot:[slotName]>
        <slot :name="slotName"></slot>
      </template>
    </picker-item-view>
    <!-- popup-picker 底部区域slot  -->
    <slot name="bottom" v-if="poppable && showFooterBtn">
      <view class="ky-picker__bottom">
        <ky-button class="ky-picker__bottom-button" type="primary" size="large" @click="handleConfirm">{{
          footerConfirmText
        }}</ky-button>
      </view>
    </slot>
  </component>
</template>

<script setup lang="ts">
import './index.scss'
import { computed, ref, watch, defineAsyncComponent } from 'vue'
import KyPopup from '@packages/__components/popup'
import {
  PickerInstance,
  PickerNewProps,
  PickerOption,
  PickerPopProps,
  PickerValues,
} from '@packages/__components/picker/src/types'
import KyButton from '@packages/__components/button/src/button.vue'
import usePickerStatus from '@packages/__components/picker/src/usePickerStatus'

import PickerItemViewH5 from '@packages/__components/picker/src/components/picker-h5.vue'
import PickerItemViewDefault from '@packages/__components/picker/src/components/picker.vue'

const PickerItemView = process.env.TARO_ENV === 'h5' ? PickerItemViewH5 : PickerItemViewDefault

const props = withDefaults(defineProps<PickerPopProps>(), {
  // 是否使用popup
  poppable: true,
  show: false,
  showFooterBtn: true,
  columns: [] as PickerNewProps[PickerOption],
  confirmButtonText: '确定',
  cancelButtonText: '取消',
  title: '标题',
  showToolbar: true,
  optionHeight: 36,
  visibleOptionNum: 7,
  footerConfirmText: '确定',
  loading: false,
  showClose: false,
})
console.log('props>>>>> Picker', props)

const modelValue = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  },
})

const emit = defineEmits(['cancel', 'confirm', 'change', 'open', 'update:modelValue', 'update:show'])

const showPop = ref(false)

const pickerRef = ref<PickerInstance | null>(null)

const { showEmpty } = usePickerStatus(props)

const popupProps = computed(() => {
  if (!props.poppable) return {}

  return {
    position: 'bottom',
    round: true,
    closeable: true,
    'destroy-on-close': false,
    closeOnClickOverlay: true,
    onOpened: opened,
    onClose,
  }
})

const onClose = () => {
  emit('update:show', false)
}

const onChange = (value: PickerValues) => {
  emit('change', value)
}

const onCancel = (value: PickerValues) => {
  emit('cancel', value)
  onClose()
}

const onConfirm = (value: PickerValues) => {
  emit('confirm', value)
  onClose()
}

const opened = () => {
  emit('open', showPop.value)
}

/* popup-picker 底部按钮 */
const handleConfirm = () => {
  pickerRef.value?.confirm()
}

const handleCancel = () => {
  pickerRef.value?.cancel()
}

watch(
  () => props.show,
  (value) => {
    showPop.value = value
    opened()
    if (value) {
      console.log('value-show', value)
    }
  },
  { immediate: true },
)

defineExpose({
  handleConfirm,
  handleCancel,
})
</script>
