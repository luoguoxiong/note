import { ref } from 'vue'
import { useFreightTimeStore } from '@freight-time/store'

const store = useFreightTimeStore()

export const unfoldPackageVisible = ref(false)

export const setUnfoldPackageVisible = (visible: boolean) => {
  unfoldPackageVisible.value = visible
}

export const packageCellValue = ref('')

export const reset = () => {
  store.setWoodenFrame('')
  packageCellValue.value = ''
  setUnfoldPackageVisible(false)
}
