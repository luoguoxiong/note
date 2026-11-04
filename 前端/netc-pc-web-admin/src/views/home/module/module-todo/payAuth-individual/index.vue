<template>
  <PayContent :title="`${data.authType === PayAuthTypeEnum.COMPANY ? '公司' : '个人'}申请`" :data="data">
    <div class="individual">
      {{ desc }}
    </div>
  </PayContent>
</template>

<script setup lang="ts">
import { PayAuthListVO, PayAuthTypeEnum } from '@/apis/home/types'
import PayContent from '../payAuth-content/index.vue'
import { computed } from 'vue'

interface PayAuthIndividual {
  data: PayAuthListVO
}

const props = defineProps<PayAuthIndividual>()
const desc = computed(() => {
  //个人
  const { authLevel, authType, recipientCustomerName, applyCustomerName, applyName, payCustomerName } = props.data
  if (authType === PayAuthTypeEnum.USER) {
    // 制定公司
    if (recipientCustomerName) {
      return `【${applyName}】在【${applyCustomerName}】寄给【${recipientCustomerName}】的所有运单，由【${payCustomerName}】付款`
    } else {
      // 全部公司
      return `【${applyName}】在【${applyCustomerName}】寄出的所有运单由【${payCustomerName}】付款`
    }
  }
  if (authType === PayAuthTypeEnum.COMPANY) {
    // 制定公司
    if (authLevel === 40) {
      return `【${applyName}】寄给【${recipientCustomerName}】的所有运单，由【${payCustomerName}】付款`
    }
    // 全部公司
    if (authLevel === 20) {
      return `【${applyName}】寄出的所有运单由【${payCustomerName}】付款`
    }
    return ''
  }
  return ''
})
</script>
<style lang="scss" scoped>
.individual {
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  height: 40px;
  font-size: 12px;
  color: #24262b;
  line-height: 18px;
  display: flex;
  align-items: center;
}
</style>
