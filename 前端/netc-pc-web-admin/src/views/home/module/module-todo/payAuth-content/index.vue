<template>
  <div class="pay-auth-box">
    <div
      id="pay-auth-content"
      @mousemove="onHover"
      @mouseenter="onHover"
      @mouseleave="onNoHover"
      @click="
        linkPayAuth({
          id: `${data.id}`,
          operateType: '3',
          url: data.detailsUrl,
        })
      "
    >
      <div class="title">
        <div class="title-name">
          <img :src="icon" class="title-icon" />
          {{ title }}
          <span v-if="total">（共{{ total }}票）</span>
        </div>
        <div class="title-warn" v-if="deliverCount && deliverCount > 0">
          有{{ deliverCount }}票运单派送中，请及时审批
        </div>
      </div>
      <div class="pay-auth-info">
        <slot></slot>
      </div>
      <div class="apply-info">
        <div class="apply-info-item">
          <span class="label">申请人</span>
          {{ data.applyName }} {{ data.applyName && data.applyMobile && '/' }} {{ data.applyMobile }}
        </div>
        <div class="apply-info-item">
          <span class="label">申请公司</span>
          {{ data.applyCustomerName }}({{ data.applyCustomerCode }})
        </div>
        <div class="apply-info-item end">
          <span class="label">申请日期</span>
          {{ data.applyDate }}
        </div>
      </div>
    </div>
    <div class="apply-btn" id="apply-btn">
      <KButton
        type="default"
        id="home-btn"
        @click.stop="
          linkPayAuth({
            id: `${data.id}`,
            operateType: '2',
            url: data.rejectUrl,
          })
        "
        style="width: 76px"
        >拒绝付款</KButton
      >
      <KButton
        type="primary"
        id="home-btn"
        style="width: 76px"
        @click.stop="
          linkPayAuth({
            id: `${data.id}`,
            operateType: '1',
            url: data.agreeUrl,
          })
        "
        >同意付款</KButton
      >
    </div>
  </div>
</template>
<script lang="ts" setup>
import { PayAuthListVO, PayAuthTypeEnum } from '@/apis/home/types'
import { useLinkTo } from '@/hooks/useLinkTo'
import { Any } from '@/types'
import { KButton } from '@netc-design-pc/ui'
import { computed, ref } from 'vue'
interface PayContentProps {
  title: string
  total?: number
  data: PayAuthListVO
  deliverCount?: number
}
const { linkPayAuth } = useLinkTo()

const props = defineProps<PayContentProps>()

const isHover = ref(false)

const onHover = (e: MouseEvent | Any) => {
  if (e.target instanceof Element && e.target.closest('#home-btn')) {
    isHover.value = false
  } else {
    isHover.value = true
  }
}

const onNoHover = () => {
  isHover.value = false
}

const icon = computed(() => {
  const map = {
    [PayAuthTypeEnum.COMPANY]: 'https://ic-img.ky-express.com/netc/20240515_71870395177_!!1715779491379_32_32.png',
    [PayAuthTypeEnum.USER]: 'https://ic-img.ky-express.com/netc/20240515_25270395177_!!1715779448629_32_32.png',
    [PayAuthTypeEnum.WAYBILL]: 'https://ic-img.ky-express.com/netc/20240515_8370395152_!!1715779452296_32_32.png',
  }
  return map[props.data.authType]
})
</script>
<style lang="scss" scoped>
.pay-auth-box {
  position: relative;
  height: 254px;
}
#pay-auth-content {
  padding: 16px;
  height: 100%;
  box-sizing: border-box;
  cursor: pointer;
  .title {
    height: 18px;
    padding-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .title-name {
    font-weight: 600;
    font-size: 15px;
    color: #24262b;
    display: flex;
    align-items: center;
    height: 16px;
    .title-icon {
      width: 16px;
      height: 16px;
      margin-right: 4px;
    }
    span {
      font-size: 13px;
      font-weight: 400;
      line-height: 20px;
      color: #8c8f99;
    }
  }
  .title-warn {
    font-size: 12px;
    color: #ff8c00;
  }
  .pay-auth-info {
    position: absolute;
    top: 68px;
    left: 40px;
    right: 40px;
  }
  .apply-info {
    position: absolute;
    bottom: 26px;
    left: 40px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    width: 322px;
    height: 82px;
    padding: 0 0 20px;
    gap: 4px;
    box-sizing: border-box;
  }
  .apply-info-item {
    font-size: 12px;
    font-weight: normal;
    height: 18px;
    display: flex;
    align-items: center;
    color: #24262b;
    .label {
      color: #8c8f99;
      width: 50px;
      display: inline-block;
      margin-right: 16px;
    }
  }
}

.apply-btn {
  position: absolute;
  right: 38px;
  bottom: 26px;
  z-index: 1;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  width: 164px;
  height: 32px;
}
</style>
