import { onMounted, ref } from 'vue'
import { getSystemInfo } from '@/public/utils/getSystemInfo'

export const useFloatPlane = () => {
  const floatPlaneTop = ref(0)

  onMounted(async () => {
    const { windowWidth, navBarHeight } = await getSystemInfo()
    const searchBarHeight = (88 * windowWidth) / 750
    floatPlaneTop.value = navBarHeight + searchBarHeight
  })
  return { floatPlaneTop }
}
