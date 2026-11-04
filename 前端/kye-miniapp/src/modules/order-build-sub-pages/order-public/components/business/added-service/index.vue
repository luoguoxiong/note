<template>
  <div class="added-service" :class="{ disabled: disabled }" v-if="visible" :type="type" :visible="visible">
    <component :disabled="disabled" :is="moduleStyleMap[moduleStyle]" />
  </div>
</template>

<script lang="ts" setup>
import { ref, provide, computed, watch } from 'vue'
import { PickModule, AddedServiceConfig, AddedServiceDimension, AiItems } from '@order-public-sub-public/types'
import Popup from './popup/index.vue'
import Unfold from './unfold/index.vue'
import Page from './page/index.vue'
import { ModuleType } from '@order-public-sub-public/constants'
import { packageServiceListBase } from './hooks/state'
import { exp_ai_packing_v1 } from './components/package-service/report'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const moduleStyleMap = {
  unfold: Unfold,
  popup: Popup,
  page: Page,
}

const props = defineProps<PickModule<AddedServiceConfig>>()

const moduleStyle = ref(props.moduleStyle as keyof typeof moduleStyleMap)

console.log('moduleStyle', moduleStyle)

provide('addedServiceProps', props)

const visible = computed(() => {
  const visible = props?.visible
  const config = props?.config?.fieldsConfig?.filter((item) => item.visible) || []
  return visible && config?.length > 0 ? true : false
})

const aiItem = computed(() => {
  const arr = piniaStore.schema.moduleDimensionData(ModuleType['增值服务'])?.aiItems || []
  return arr.find((v) => v.type === 'woodenFrame') || ({} as AiItems)
})

// 兼容新老前端版本不一致问题
const packageServiceList = computed(() => {
  const moduleDimensionData = piniaStore.schema.moduleDimensionData(ModuleType['增值服务'])

  let newList = moduleDimensionData?.woodenFrameInfoListV2
  let oldList = moduleDimensionData?.woodenFrameInfoList
  let list = newList || []
  if (!newList && oldList) {
    list = [...packageServiceListBase, ...oldList]
  }
  return list || []
})

watch(
  () => aiItem.value,
  (val) => {
    if (val) {
      packageServiceList.value.forEach((v) => {
        exp_ai_packing_v1(aiItem.value, v)
      })
    }
  },
  { deep: true, immediate: true },
)
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
