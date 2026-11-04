import { onBeforeMount, ref } from 'vue'
import { getSystemInfo } from '../utils/getSystemInfo'

export const useGetSystemNavbar = () => {
  const titleHeight = ref(80)

  const statusBarHeight = ref(20)

  const navBarHeight = ref(100)

  onBeforeMount(async () => {
    const systemInfo = await getSystemInfo()

    titleHeight.value = systemInfo.titleHeight
    statusBarHeight.value = systemInfo.statusBarHeight
    navBarHeight.value = systemInfo.navBarHeight
  })

  return {
    titleHeight,
    statusBarHeight,
    navBarHeight,
  }
}
