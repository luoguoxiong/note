<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { openURL } from '@/modules/webview/utils'
import { getEnvConfig } from '@/public/config'
const { isProd } = getEnvConfig()

const initData = () => {
  const url = isProd
    ? 'https://ic-h5.kye-erp.com/change-feedback.html#/home'
    : 'https://ic-h5-uat.kye-erp.com/change-feedback.html#/home'
  // const url = decodeURIComponent(props?.params?.url)
  openURL(url, { needLogin: true })
}

onBeforeMount(() => {
  initData()
})
</script>
