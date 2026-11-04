<template>
  <div
    id="bind-code"
    v-exposure-report="{
      eventCode: 'exp_homepage_binding_code_v1',
      region_code: 'binding_code',
    }"
  >
    <template v-if="oldUser === 0">
      <div class="bind-info">
        <div class="info">您需先绑定客户编码，才能享受更多服务</div>
        <div class="desc">在跨越速运寄件、查件、对账、开票都需要先绑定客户编码</div>
      </div>
      <KButton type="default" id="home-btn" plain @click.stop="linkToBindCode" style="width: 76px">立即绑码</KButton>
      <KButton
        type="default"
        id="home-btn"
        @click.stop="handleClick"
        :style="{ width: bindSalesFlag === '10' ? '76px' : '102px' }"
      >
        {{ bindSalesFlag === '10' ? '联系商务' : '申请专属商务' }}
      </KButton>
    </template>
    <template v-else>
      <div class="bind-info">
        <div class="info">您需先绑定客户编码，才能享受更多服务</div>
        <div class="desc">在跨越速运寄件、查件、对账、开票都需要先绑定客户编码</div>
      </div>
      <KButton type="default" id="home-btn" plain @click.stop="linkToBindCode" style="width: 76px">立即绑码</KButton>
    </template>
    <CommonContact v-if="showBusiness" :visible="showBusiness" @close="handleClose" />
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useLinkTo } from '@/hooks'
import { KButton } from '@netc-design-pc/ui'
import CommonContact from '@/components/side-navigation/common-contact.vue'
import { useHomeStore } from '@/stores/home'
const { linkToBindCode, linkToApplyCustomerCode } = useLinkTo()
const showBusiness = ref(false)

const oldUser = ref()
const bindSalesFlag = ref()

onMounted(() => {
  const homeStore = useHomeStore()
  oldUser.value = homeStore.oldUser
  bindSalesFlag.value = homeStore.bindSalesFlag
})

const handleClick = () => {
  if (bindSalesFlag.value === '10') {
    // 联系商务
    showBusiness.value = true
  } else {
    linkToApplyCustomerCode()
  }
}

const handleClose = () => {
  showBusiness.value = false
}
</script>
<style lang="scss" scoped>
#bind-code {
  margin-top: 8px;
  padding: 16px 24px;
  background: #ffffff;
  border-radius: 8px;
  display: flex;
  height: 40px;
  align-items: center;
}
.bind-info {
  flex: 1;
}

.info {
  font-size: 15px;
  font-weight: 600;
  color: #24262b;
  margin-bottom: 8px;
}
.desc {
  font-size: 13px;
  line-height: 20px;
  color: #666666;
}
.glost-btn {
  height: 32px;
  padding: 6px 12px;
  border: 1px solid #7143f0;
  box-sizing: border-box;
  font-size: 13px;
  color: #7143f0;
  display: flex;
  align-items: center;
  border-radius: 4px;
  cursor: pointer;
}
</style>
