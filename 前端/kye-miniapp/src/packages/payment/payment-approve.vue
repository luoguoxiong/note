<template>
  <KyWebView v-if="src" :query="{ needLogin: true }" :src="src"></KyWebView>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { getToken } from '@/public/storage'
import urlLists from '@/public/constants/h5-config'
import KyWebView from '@public/components/business/webview/index.vue'

defineOptions({ name: 'PaymentApprove' })

const src = ref('')

const { authId, ksPhone, isKs } = Taro.getCurrentInstance().router.params

onMounted(async () => {
  const webviewSrc =
    urlLists.paymentAuth.url +
    `approve-detail/${authId}?requestSource=10&token=${getToken()}&applets=true&ksPhone=${ksPhone}&isKs=${isKs || ''}&miniprogramType=applet`

  src.value = webviewSrc
})
</script>
