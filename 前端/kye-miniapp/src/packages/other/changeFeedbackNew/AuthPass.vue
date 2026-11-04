<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { openURL } from '@/modules/webview/utils'
interface authPassProps {
  params: any
}
const props = defineProps<authPassProps>()

const initData = () => {
  const url = decodeURIComponent(props?.params?.url)
  openURL(url, { needLogin: true })
  // setSrc(`${url}${url.includes('?') ? '&' : '?'}token=${wxToken}&phone=${useInfo.phone}`)
}

onBeforeMount(() => {
  initData()
})
</script>
