<!-- 在线客服（来源: netc-pc-web/src/views/micro-views/extra/customerService.vue） -->
<template>
  <Iframe :src="src" v-if="src" router-name="customerService"></Iframe>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import md5 from 'js-md5'
import Iframe from '../components/iframe/base.vue'
import { getToken } from '@/utils/auth'
import { getPhone } from '@/stores/pc-web/deps/storage'

/** 客服 H5 地址：非生产域名（uat/dev/localhost）走 UAT 环境 */
const getServiceUrl = () => {
  let url = 'https://kuasheng-h5.kye-erp.com/ccms-jd-web/'
  if (['uc-uat.ky-express.com', 'uc-dev.ky-express.com', 'localhost', ''].includes(window.location.hostname)) {
    url = 'https://erp-kuasheng-h5-uat.kye-erp.com/ccms-jd-web/'
  }
  return url
}

const src = ref('')

onMounted(() => {
  const url = getServiceUrl()
  // marketer（商务名称）从老基座 session 键 LOGIN_DATA 取，键名一致
  const marketer = JSON.parse(sessionStorage.getItem('LOGIN_DATA') || '{}')?.marketer
  const params = new URLSearchParams({
    name: marketer || '',
    source: 'PC_CLIENT',
    phone: getPhone() || '',
    sign: md5('imcloudMethod').toUpperCase(),
    token: getToken() || '',
  }).toString()
  const separator = url.includes('?') ? '&' : '?'
  src.value = `${url}${separator}${params}`
})
</script>
