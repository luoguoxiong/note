<template>
  <view v-if="!loading">
    <AuthMismatch v-if="showAuth" :params="pageParams" />
    <AuthPass v-else :params="pageParams" />
  </view>
</template>

<script setup lang="ts">
import { useUserInfo } from '@/public/hooks'
import AuthMismatch from './AuthMismatch.vue'
import AuthPass from './AuthPass.vue'
import { onBeforeMount, ref } from 'vue'
const loading = ref(true)
const showAuth = ref(true)
const { userInfo } = useUserInfo()
const pageParams = ref({})
import { getQueryObject } from '@public/utils/url'
import otherServiceAPI from '@/packages/other/changeFeedbackNew/apis'
const setLoading = (value: boolean): void => {
  loading.value = value
}
const setShowAuth = (value: boolean): void => {
  showAuth.value = value
}

const initData = async () => {
  const params = getQueryObject()
  try {
    const url = decodeURIComponent(params.url)
    const urlParams = getQueryObject(decodeURIComponent(url)) || {}
    const batchId = urlParams.batchId || params.batchId
    const batchNo = urlParams.batchNo || params.batchNo
    if (batchId || batchNo) {
      const data = await otherServiceAPI.agingMobileSearch({
        batchId,
        batchNo,
      })
      const { authPhone, forwardPhone } = data || {}
      if (authPhone) {
        params.authPhone = authPhone
      }
      if (forwardPhone) {
        params.forwardPhone = forwardPhone
      }
    }
  } catch (e) {
    console.log(e)
  }
  console.log(params.authPhone, 'params')
  pageParams.value = params
  setTimeout(() => {
    if (userInfo.value.phone !== params.authPhone && userInfo.value.phone !== params.forwardPhone) {
      setLoading(false)
      setShowAuth(true)
    } else {
      setLoading(false)
      setShowAuth(false)
    }
  }, 0)
}

onBeforeMount(() => {
  initData()
})
</script>

<style scoped lang="scss"></style>
