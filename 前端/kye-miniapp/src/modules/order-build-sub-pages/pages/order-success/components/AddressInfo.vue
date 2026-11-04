<template>
  <div :class="classNames">
    <SvgIcon class="left-icon" name="" :imgUrl="ICON_MAP[type]" />
    <div class="addr-detail-wrap flex-column ml-24">
      <div
        class="person-and-phone flex items-center"
        :class="type === 'delivery' && showRealName ? 'has-real-name-icon' : ''"
      >
        <div class="person">{{ waybillInfo.person }}</div>
        <div class="real-name-icon" v-if="type === 'delivery' && showRealName">未实名</div>
        <div v-if="waybillInfo.mobile || waybillInfo.phone" class="phone ml-24">
          {{ waybillInfo.mobile || waybillInfo.phone }}
        </div>
        <div @click.stop="() => {}" v-if="type === 'pickup'" class="copy-btn-wrap">
          <div v-copy="getCopyContent()" class="copy-btn-inner">
            <SvgIcon class="ky-copy-icon" name="icon-copy"></SvgIcon>
          </div>
        </div>
      </div>
      <span v-if="waybillInfo.customerName" class="company-name mt-8 flex items-center">
        {{ waybillInfo.customerName }}
      </span>
      <span class="full-address mt-8 flex items-center">{{ getFullAddress(waybillInfo) }}</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { Delivery, PickUp } from '@order-public-sub-public/types'
import vCopy from '@order-public-sub-public/directives/copy'

const props = defineProps<{
  waybillInfo: PickUp | Delivery
  type: 'delivery' | 'pickup'
  showRealName: boolean
  waybillNumber?: string
}>()

const classNames = ['flex', 'address-info', props.type === 'delivery' ? 'pb-32 address-info-sender' : '']

const getFullAddress = (waybillInfo: PickUp | Delivery) => {
  const { province, city, district, detailAddress } = waybillInfo || {}
  return province + city + district + detailAddress
}

const getCopyContent = () => {
  const { waybillInfo, waybillNumber } = props ?? {}
  const { phone, person, mobile, customerName } = waybillInfo ?? {}
  const address = getFullAddress(waybillInfo)
  console.log(phone, 'phonephone')

  const lines: string[] = []
  if (waybillNumber) lines.push(`运单号：${waybillNumber}`)
  if (person) lines.push(`收件人：${person}`)
  if (mobile) lines.push(`手机号码：${mobile}`)
  if (phone) lines.push(`固定电话：${phone}`)
  if (customerName) lines.push(`收件公司：${customerName}`)
  if (address) lines.push(`收件地址：${address}`)
  const str = lines.join('\n')
  return {
    content: str,
    successText: '复制收件人信息成功',
  }
}

// const IconName = {
//   delivery: 'icon-sender',
//   pickup: 'icon-receiver',
// }
const ICON_MAP = {
  delivery: 'https://ic-img.ky-express.com/netc/20260820_239_!!1787228550482_40_40.svg+xml',
  pickup: 'https://ic-img.ky-express.com/netc/20260820_68127_!!1787228553758_40_40.svg+xml',
}
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import '../index.scss';
</style>
