<template>
  <div class="send-and-receive">
    <!-- 标题区域 -->
    <div class="send-receive-header">
      <div class="header-title">
        <span class="title-text">寄收地址</span>
        <img class="required-mark" :src="ICON_MAP.必填" />
      </div>
      <div class="header-guide" @click="handleGuideClick">
        <span>新手指引</span>
        <img class="guide-icon" :src="ICON_MAP.问号" />
      </div>
    </div>

    <!-- 地址选择区域 -->
    <div class="address-content">
      <!-- 寄件地址 -->
      <div class="address-row" @click="handleSendAddressClick" data-validate="address.send">
        <img class="icon-img" :src="ICON_MAP.寄" />
        <div class="address-text" :class="{ 'has-value': sendAddress }">
          {{ sendAddress || '选择寄件地址' }}
        </div>
        <div class="line"></div>
        <div class="address-book-btn" @click.stop="handleSendAddressBook">
          <img class="book-icon" :src="ICON_MAP.地址簿" />
          <span>地址簿</span>
        </div>
      </div>

      <!-- 切换按钮 -->
      <div class="switch-wrapper">
        <img class="switch-icon" :src="ICON_MAP.切换" @click="handleSwitchAddress" />
        <div class="divider"></div>
      </div>

      <!-- 收件地址 -->
      <div class="address-row" @click="handleReceiveAddressClick" data-validate="address.receive">
        <img class="icon-img" :src="ICON_MAP.收" />
        <div class="address-text" :class="{ 'has-value': receiveAddress }">
          {{ receiveAddress || '选择收件地址' }}
        </div>
        <div class="line"></div>
        <div class="address-book-btn" @click.stop="handleReceiveAddressBook">
          <img class="book-icon" :src="ICON_MAP.地址簿" />
          <span>地址簿</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ICON_MAP, getSendAddress, setSendAddress, getReceiveAddress, setReceiveAddress } from './hooks/useState'
import { globalEventBus } from '@/public/hooks/useEventBus'
import { onBeforeUnmount, onMounted, computed } from 'vue'
import Taro from '@tarojs/taro'
import { urlContact } from '@/public/utils'
import {
  clk_express_receiver_box_v1,
  clk_express_sender_box_v1,
  clk_express_single_choise_v1,
  other_express_single_received_address_book_v1,
  other_express_single_send_address_book_v1,
} from '../../report'
const emit = defineEmits<{
  (e: 'sendAddressChange', address: string): void
  (e: 'receiveAddressChange', address: string): void
  (e: 'guideClick'): void
  (e: 'switchAddress'): void
}>()

enum AddressType {
  寄件地址 = '10',
  收件地址 = '20',
}

const sendAddressRef = getSendAddress()
const receiveAddressRef = getReceiveAddress()

/** 展示用：fullAddress  已是完整地址，优先取 */
const sendAddress = computed(() => {
  const v = sendAddressRef.value
  if (v.fullAddress) return v.fullAddress
  if (!v.province && !v.detailAddress) return ''
  const area = [v.province, v.city, v.county].filter(Boolean).join('')
  return `${area}${v.detailAddress || ''}`.trim()
})
const receiveAddress = computed(() => {
  const v = receiveAddressRef.value
  if (v.fullAddress) return v.fullAddress
  if (!v.province && !v.detailAddress) return ''
  const area = [v.province, v.city, v.county].filter(Boolean).join('')
  return `${area}${v.detailAddress || ''}`.trim()
})

const handleGuideClick = () => {
  Taro.navigateTo({
    url: '/modules/freight-time/pages/guide/index',
  })
}

const handleSendAddressClick = () => {
  const url = `/modules/freight-time/pages/adress/index?type=send`
  Taro.navigateTo({ url: url })
  clk_express_sender_box_v1({ button_name: '寄件_快速寄件页_填写寄件人信息框_点击', recognition_type: '寄件' })
}

const handleReceiveAddressClick = () => {
  const url = `/modules/freight-time/pages/adress/index?type=receive`
  Taro.navigateTo({ url: url })
  clk_express_receiver_box_v1({ button_name: '寄件_收件信息_点击', recognition_type: '收件' })
}

const openAddressBook = (addressType: AddressType) => {
  Taro.navigateTo({
    url: urlContact('/modules/order-build-sub-pages/order-public/components/business/address-book/page/index', {
      addressType: addressType,
      pageSource: 'freight-time',
      pageFromNative: 1,
    }),
  })
}

const handleSendAddressBook = () => {
  openAddressBook(AddressType.寄件地址)
  clk_express_single_choise_v1({ button_name: '地址簿', recognition_type: '寄件' })
}

const handleReceiveAddressBook = () => {
  openAddressBook(AddressType.收件地址)
  clk_express_single_choise_v1({ button_name: '地址簿', recognition_type: '收件' })
}

const handleSwitchAddress = () => {
  // 切换寄件和收件地址
  const temp = { ...sendAddressRef.value }
  setSendAddress({ ...receiveAddressRef.value })
  setReceiveAddress(temp)
  emit('switchAddress')
}

const handleAddressMessage = (data) => {
  console.log('收到地址消息', data)
  const areaStr = [data.province, data.city, data.county].filter(Boolean).join('')
  const fullAddr = `${areaStr}${data.detailAddress || ''}`.trim()
  if (data.addressType === AddressType.寄件地址) {
    other_express_single_send_address_book_v1({
      button_name: '地址簿选择',
      recognition_type: '寄件',
      sender_address: fullAddr,
    })
    setSendAddress({
      companyName: data.companyName || '',
      extension: data.extension || '',
      remark: data.remark || '',
      province: data.province || '',
      city: data.city || '',
      county: data.county || '',
      fullAddress: fullAddr,
      detailAddress: data.detailAddress || '',
      mobile: data.mobile || '',
      person: data.person || '',
      telephone: data.telephone || '',
    })
  } else {
    other_express_single_received_address_book_v1({
      button_name: '地址簿选择',
      recognition_type: '收件',
      receiver_address: fullAddr,
    })
    setReceiveAddress({
      companyName: data.companyName || '',
      extension: data.extension || '',
      remark: data.remark || '',
      province: data.province || '',
      city: data.city || '',
      county: data.county || '',
      fullAddress: fullAddr,
      detailAddress: data.detailAddress || '',
      mobile: data.mobile || '',
      person: data.person || '',
      telephone: data.telephone || '',
    })
  }
}

onBeforeUnmount(() => {
  globalEventBus.off('FreightTimeAddressBookEvent', handleAddressMessage)
})

onMounted(() => {
  globalEventBus.on('FreightTimeAddressBookEvent', handleAddressMessage)
})
</script>

<style lang="scss">
.send-and-receive {
  width: 100%;
  border-radius: 16px;
  box-sizing: border-box;
  padding: 32px 24px;
  gap: 8px;
  background: #ffffff;
}

.send-receive-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .header-title {
    display: flex;
    align-items: center;
    gap: 8px;

    .title-text {
      font-size: 28px;
      font-weight: 600;
      color: #333;
    }

    .required-mark {
      height: 24px;
      width: 40px;
    }
  }

  .header-guide {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 26px;
    color: #666;

    .guide-icon {
      width: 24px;
      height: 24px;
    }
  }
}

.address-content {
  width: 100%;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  padding: 24px;
  box-sizing: border-box;
  background: #f5f6ff;
}

.address-row {
  display: flex;
  align-items: center;
  padding: 0;

  .icon-img {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    margin-right: 16px;
  }

  .address-text {
    flex: 1;
    line-height: 40px;
    font-size: 28px;
    color: #888ea6;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &.has-value {
      font-weight: 600;
      color: #03050d;
    }
  }

  .line {
    margin-top: 3px;
    margin-left: 24px;
    margin-right: 24px;
    width: 0px;
    height: 50px;
    opacity: 1;
    border-right: 1px solid #cfd2de;
  }

  .address-book-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 0;
    height: 56px;

    font-size: 16px;
    font-weight: normal;
    line-height: 16px;
    color: #03050d;

    .book-icon {
      width: 36px;
      height: 36px;
    }

    span {
      font-size: 16px;
      font-weight: normal;
      line-height: 16px;
      color: #03050d;
    }
  }
}

.switch-wrapper {
  display: flex;
  align-items: center;
  padding: 0;
  margin-top: 16px;
  margin-bottom: 16px;

  .switch-icon {
    width: 32px;
    height: 32px;
    margin: 0 16px 0 9px;
    flex-shrink: 0;
  }

  .divider {
    flex: 1;
    height: 1px;
    background: #e1e4f1;
  }
}

.divider {
  height: 1px;
  background: #e1e4f1;
}
</style>
