<template>
  <ProductSpecVolumeBus class="freight-time-product-spec-volume">
    <template #switch>
      <ky-switch v-model="switchValue" type="checkbox" @change="onChangeSwitch" />
    </template>
    <template #extra-stepper v-if="switchValue">
      <div class="freight-time-volume-bus flex">
        <KyStepper
          input-stuffix="m³"
          v-model.number="volumeSize"
          :min="0"
          :max="9999"
          type="digit"
          :disable-minus="volumeSize < 1 ? true : false"
          :formatter="formatter"
          :focusClearZone="true"
          @plus="onVolumeChange"
          @minus="onVolumeChange"
          @blur="onVolumeChange"
          @minusTouchstart="minusTouchstart"
          @plusTouchstart="plusTouchstart"
          v-keyboard
        /></div
    ></template>
  </ProductSpecVolumeBus>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import ProductSpecVolumeBus from '@order-global-package-freight-time/components/business/product-spec-volume-bus/index.vue'
import { useFreightTimeStore } from '@freight-time/store'
import KyStepper from '@order-global-package-freight-time/components/ui/stepper-ui/index.vue'
import { reportOther } from '@freight-time/report'

const store = useFreightTimeStore()

const volumeSize = computed({
  get: () => store.getVolumeSize,
  set: (val: number) => store.setVolumeSize(val),
})

const emit = defineEmits<{
  (e: 'switchChange', value: boolean): void
}>()

const switchValue = ref(false)

const onChangeSwitch = (val: boolean) => {
  switchValue.value = val
  emit('switchChange', val)
}

const formatter = (value: string | number) => {
  // 将输入值转换为字符串并移除开头的点
  value = value.toString().replace(/^[。.]/, '')

  // 移除除了数字和小数点之外的所有字符
  value = value.toString().replace(/[^\d.]/g, '')

  // 如果有多个小数点，只保留第一个出现的小数点
  const parts = value.split('.')
  if (parts.length > 2) {
    // 如果分割后的数组长度大于2，意味着有超过一个小数点
    value = parts[0] + '.' + parts.slice(1).join('') // 只保留第一个小数点，其余的去掉
  } else {
    value = parts.join('.') // 原始情况，直接连接
  }

  // 处理整数部分，如果长度超过4，则截取前4位
  const valueParts = value.split('.')
  if (valueParts[0].length > 4) {
    valueParts[0] = valueParts[0].substring(0, 4)
  }

  // 处理小数部分，如果长度超过3，则截取前3位
  if (valueParts[1] && valueParts[1].length > 3) {
    valueParts[1] = valueParts[1].substring(0, 3)
  }

  // 将整数部分和小数部分合并
  value = valueParts.join('.')

  return value.toString()
}

const onVolumeChange = () => {
  if (!volumeSize.value || String(volumeSize.value) === '.') {
    store.setVolumeSize(0)
  }

  reportOther('other_express_single_consignment_vol_v1', {
    number_volume: volumeSize.value,
  })
}

const minusTouchstart = () => {}

const plusTouchstart = () => {}
</script>
