import { computed } from "vue"
import { useStore } from '@order-public-sub-public/store'
import { Module } from "@order-public-sub-public/types"
import { ModuleType } from "@order-public-sub-public/constants"
const piniaStore = useStore()


export const pickupInformationConfigData = computed(() => {
  return piniaStore.schema.moduleConfigData(ModuleType['取货资料'], true)
})
