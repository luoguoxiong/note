<template>
  <ky-tag
    class="waybill-card__tag"
    v-if="showPrintTag"
    size="3"
    bgColor="#F0FFF7"
    borderColor="#7DE3B7"
    textColor="#00C58C"
    >已打印</ky-tag
  >
  <ky-tag
    class="waybill-card__tag"
    v-if="showProxyPickup"
    size="3"
    bgColor="#EFF7FE"
    borderColor="#ADD9FF"
    textColor="#57A8F9"
    >代收</ky-tag
  >
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  waybillData: any
}

const props = defineProps<Props>()

const baseInfo = computed(() => props.waybillData?.waybill?.baseInfo)
const functionInfo = computed(() => props.waybillData?.functionInfo)

/** 是否显示已打印标签 */
const showPrintTag = computed(() => {
  return Number(baseInfo.value?.printStatus) === 10
})

/** 是否显示代收标签 */
const showProxyPickup = computed(() => {
  return !!functionInfo.value?.showProxyPickupLabel?.showStatus
})
</script>
<style>
.waybill-card__tag + .waybill-card__tag {
  margin-left: 8px;
}
</style>
