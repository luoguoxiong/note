<template>
  <div class="dismantling-wooden-frame" @click.stop="handleRadio">
    <div class="hot-zone" v-if="moduleDimensionData?.dismantlingWoodenFrame?.disabled" @tap.stop="handleHotZone"></div>
    <div class="flex space-between items-center dismantling-wooden-frame-content">
      <div
        class="font-level3"
        :class="{ 'font-normal': moduleStyle === 'unfold' }"
        v-exposure-report="{
          eventCode: 'exp_express_single_insurance_wooden_v1',
          regionCode: 'pop',
        }"
      >
        拆木架服务
      </div>
      <SvgIcon
        class="font-level2 dismantling-wooden-frame-icon"
        name="radio-checked"
        v-if="svgIconName === 'radio-checked'"
        @click.stop="handleRadio"
      />
      <SvgIcon
        class="font-level2 dismantling-wooden-frame-icon"
        name="radio-unchecked"
        v-else-if="svgIconName === 'radio-unchecked'"
        @click.stop="handleRadio"
      />
      <SvgIcon
        class="font-level2 dismantling-wooden-frame-icon"
        name="radio-disabled-checked"
        v-else-if="svgIconName === 'radio-disabled-checked'"
        @click.stop="handleRadio"
      />
      <SvgIcon
        class="font-level2 dismantling-wooden-frame-icon"
        name="radio-disabled-unchecked"
        v-else-if="svgIconName === 'radio-disabled-unchecked'"
        @click.stop="handleRadio"
      />
    </div>
    <div class="dismantling-reminder" v-if="moduleDimensionData?.dismantlingWoodenFrame?.costTipsMsg">
      <SvgIcon name="dollar-reminder-line" class="icon" />
      <div class="bottom-desc font-level4" v-html="moduleDimensionData?.dismantlingWoodenFrame?.costTipsMsg"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { useStore } from '@order-public-sub-public/store'
import { useDismantlingWoodenFrame } from '../../hooks/useState'
import { AddedServiceDimension } from '@order-public-sub-public/types'
import { ModuleType } from '@order-public-sub-public/constants'
import { DismantlingWoodenFrameEnum } from '../../types'
import { useValidate } from '../../hooks/useValidate'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { clk_express_single_insurance_wooden_v1 } from '../../hooks/report'
const piniaStore = useStore()

const emit = defineEmits(['change'])
defineProps({
  moduleStyle: {
    type: String,
    default: '',
  },
})

const { useAddedServiceValidate } = useValidate()

const { dismantlingWoodenFrame, setDismantlingWoodenFrame } = useDismantlingWoodenFrame()

const moduleDimensionData = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType['增值服务'])
})

const handleRadio = async () => {
  if (moduleDimensionData.value?.dismantlingWoodenFrame?.disabled) {
    handleHotZone()
    return
  }

  if (dismantlingWoodenFrame.value === DismantlingWoodenFrameEnum.选中) {
    setDismantlingWoodenFrame('20')
  } else {
    setDismantlingWoodenFrame(DismantlingWoodenFrameEnum.选中)
  }
  // clk_express_single_insurance_wooden_v1(dismantlingWoodenFrame.value as DismantlingWoodenFrameEnum)
  emit('change', dismantlingWoodenFrame.value)

  try {
    await useAddedServiceValidate({ field: 'dismantlingWoodenFrame' })
  } catch (error) {
    console.error(error)
  }
}

const handleHotZone = () => {
  showToast(moduleDimensionData.value?.dismantlingWoodenFrame?.tipsMsg)
}

const svgIconName = computed(() => {
  let name = ''
  if (dismantlingWoodenFrame.value === DismantlingWoodenFrameEnum.选中) {
    if (moduleDimensionData.value?.dismantlingWoodenFrame?.disabled === true) {
      name = 'radio-disabled-checked'
    } else {
      name = 'radio-checked'
    }
  } else {
    if (moduleDimensionData.value?.dismantlingWoodenFrame?.disabled === true) {
      name = 'radio-disabled-unchecked'
    } else {
      name = 'radio-unchecked'
    }
  }
  return name
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
