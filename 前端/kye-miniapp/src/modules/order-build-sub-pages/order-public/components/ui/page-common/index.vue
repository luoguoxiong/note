<template>
  <PopovertEffect />
  <GlobalContact />
  <TaroToast />
</template>
<script setup lang="ts">
import GlobalContact from '@order-public-sub-public/components/business/contact-business/components/global-contact/index.vue'
import PopovertEffect from '@order-public-sub-public/components/business/popover-effect/index.vue'
import TaroToast from '@public/components/base/toast/toast.vue'

import { useValidate as globalUseValidate } from '@order-public-sub-public/hooks/useValidate'
import { onMounted } from 'vue'
const { removeValidateKeyByType } = globalUseValidate()
interface PageCommonProps {
  pageValidateName?: string
}
const props = defineProps<PageCommonProps>()
onMounted(() => {
  if (props.pageValidateName) {
    removeValidateKeyByType(props.pageValidateName)
  }
})
</script>

<style scoped lang="scss"></style>
