import { ref } from 'vue'
import { copyModuleDataType } from '../type'

export const unifiedInfoSwitcher = ref(false)

export const copyModuleData = ref<Partial<copyModuleDataType>>({})
