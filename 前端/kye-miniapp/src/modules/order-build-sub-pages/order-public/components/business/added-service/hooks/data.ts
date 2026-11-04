/*
 * @Description:
 * @Date: 2023-11-28 10:25:46
 */
import { computed } from 'vue'

import { ModuleType } from '@order-public-sub-public/constants'
import { EstimatedCostDimension } from '@order-public-sub-public/types'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

export const addedServiceFee = computed(() => piniaStore.schema.moduleDimensionData(ModuleType.预估费用).response)
