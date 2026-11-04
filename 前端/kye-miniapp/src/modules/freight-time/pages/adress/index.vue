<template>
  <div class="address-page">
    <!-- 智能识别模块 -->
    <AddressOcr :addressType="addressType === 'send' ? '10' : '20'" moduleStyle="page" @onClickAudio="onClickAudio" @onClickImg="onClickImg" @onClickIdentify="onClickIdentify" :isInitAddressFlag="false"
      @getAddressOcrData="onGetAddressOcrData" @getResolutionData="onResolutionData" />

    <!-- 城市/区域 + 详细地址 -->
    <div class="address-container">
      <!-- 城市/区域 -->
      <div class="address-item">
        <div class="item-label">
          <img class="label-icon" :src="ICON_MAP.城市" />
          <span class="label-text">城市/区域</span>
          <img class="required-icon" :src="ICON_MAP.必填" />
        </div>
        <div class="city-selector" @click="handleCityClick">
          <span class="selector-text" :class="{ placeholder: !tertiaryAddress }">
            {{ tertiaryAddress || '请选择省/市/区' }}
          </span>
          <img class="arrow-icon" :src="ICON_MAP.右箭头" />
        </div>
      </div>

      <!-- 详细地址 -->
      <div class="address-item">
        <div class="item-label">
          <img class="label-icon" :src="ICON_MAP.详细地址" />
          <span class="label-text">详细地址</span>
        </div>
        <div class="detail-address-wrapper">
          <div class="detail-input" :class="{ placeholder: !addressInfo.detailAddress }" @click="handleDetailClick">
            {{ addressInfo.detailAddress || '输入详细地址，查询更精准(选填)' }}
          </div>
          <div class="location-btn" @click="handleLocation">
            <img class="location-icon" :src="ICON_MAP.定位" />
            <span>定位</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近地址模块 -->
    <RecentAddress isFreightTime :addressType="addressType === 'send' ? '10' : '20'"
      :title="addressType === 'send' ? '最近寄件地址' : '最近收件地址'" @onSelect="onSelectRecentAddress" @onChange="onRecentChange"
      @clearAll="clearAll" />

    <!-- 底部确定按钮 -->
    <div class="footer-btn">
      <div class="footer__wrap">
        <ky-button type="primary" block class="confirm-btn" @click="handleConfirm">确定</ky-button>
      </div>
    </div>

    <!-- 省市区选择弹窗 -->
    <AreaAddress sceneType="freightTime" ref="areaAddressRef" @onSelectSearchItem="onAreaConfirm"
      @onConfirm="onAreaConfirm" />

    <!-- 详细地址选择弹窗 -->
    <DetailAddress sceneType="freightTime" ref="detailAddressRef"
      :addressType="addressType === 'send' ? 'SENDER' : 'RECEIVE'" :area="tertiaryAddress.split('/')"
      @onSelect="onDetailSelect" @getResolutionData="onResolutionData" @onClickConfirm="onClickConfirm" @originalAddress="onOriginalAddress" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ICON_MAP, getSendAddress, getReceiveAddress, setSendAddress, setReceiveAddress, AddressInfo, defaultAddressData } from '../../components/sendAndReceive/hooks/useState'
import Taro from '@tarojs/taro'
import { getQueryObject } from '@/public/utils/url'
import { showDialog } from '@kye-netc/kye-miniui'
import AddressOcr from '@order-global-package-freight-time/components/business/address-ocr/index.vue'
import AreaAddress from '@order-global-package-freight-time/components/business/area-address/index.vue'
import DetailAddress from '@order-global-package-freight-time/components/business/detail-address/index.vue'
import RecentAddress from '@order-global-package-freight-time/components/business/recent-address/index.vue'
import { clk_express_single_send_paste_and_recognize_button_v1, clk_express_send_information_control_v1, other_express_receiver_address_v1, clk_express_single_recently_v1, other_express_single_sender_address_v1 } from '../../report'

const addressType = ref<'send' | 'receive'>('send')
let pageTitle = '填写寄件地址'
const query = getQueryObject()
addressType.value = (query.type === 'receive') ? 'receive' : 'send'

const addressInfo = ref<AddressInfo>({
  ...defaultAddressData,
})

/** 设置地址信息：只接受 province/city/county/detailAddress/mobile/person/telephone/companyName，，，未传的字段保持原值 */
const ADDR_KEYS = [
  'province',
  'city',
  'county',
  'detailAddress',
  'mobile',
  'person',
  'telephone',
  'companyName',
  'extension',
  'remark',
] as const

const setAddressInfo = (data: any, replace: boolean | undefined = false) => {
  const pick = Object.fromEntries(
    ADDR_KEYS.filter(key => data[key] !== undefined).map(key => [key, data[key] ?? ''])
  )
  addressInfo.value = { ...(replace ? {} : addressInfo.value), ...pick } as typeof addressInfo.value
}

const areaAddressRef = ref<InstanceType<typeof AreaAddress>>()
const detailAddressRef = ref<InstanceType<typeof DetailAddress>>()

const tertiaryAddress = computed(() => {
  if (addressInfo.value?.province || addressInfo.value?.city || addressInfo.value?.county) {
    return [addressInfo.value.province, addressInfo.value.city, addressInfo.value.county].filter(Boolean).join('/')
  } else {
    return ''
  }
})

onMounted(() => {
  try {
    pageTitle = addressType.value === 'send' ? '填写寄件地址' : '填写收件地址'
    Taro.setNavigationBarTitle({ title: pageTitle }).catch((e) => {
      console.error('setNavigationBarTitle error:', e)
    })

    // 寄件页过来有默认值则回填
    if (addressType.value === 'send') {
      const defaultAddr = getSendAddress()
      setAddressInfo(defaultAddr.value, true)
    } else if (addressType.value === 'receive') {
      const defaultAddr = getReceiveAddress()
      setAddressInfo(defaultAddr.value, true)
    }
  }
  catch (e) {
    console.error('onMounted error:', e)
  }
})
/** 智能识别回填地址数据 */
const onGetAddressOcrData = (data: any) => {
  console.log('[adress] getAddressOcrData', data)
  setAddressInfo(data, true)
}

/** 智能识别解析完成 */
const onResolutionData = () => {
  console.log('[adress] getResolutionData')
}

const handleCityClick = () => {
  // 传入当前已选值用于回显：[省, 市, 区]
  const current = tertiaryAddress.value ? tertiaryAddress.value.split('/') : []
  areaAddressRef.value?.open(current)
}

/** 省市区选择确认回调 */
const onAreaConfirm = (data: { province: string; city: string; county: string }) => {
  setAddressInfo(data)
}

/** 点击详细地址 → 打开弹窗 */
const handleDetailClick = () => {
  detailAddressRef.value?.open(addressInfo.value.detailAddress)
}

/** 校验省市区是否一致，不一致则弹窗提示 */
const showAreaMismatchDialog = (recommended: { province: string; city: string; county: string }) => {
  const current = addressInfo.value
  const mismatches: { level: string; currentVal: string; recommendVal: string }[] = []

  if (current.province && recommended.province && current.province !== recommended.province) {
    mismatches.push({ level: 'province', currentVal: current.province, recommendVal: recommended.province })
  }
  if (current.city && recommended.city && current.city !== recommended.city) {
    mismatches.push({ level: 'city', currentVal: current.city, recommendVal: recommended.city })
  }
  if (current.county && recommended.county && current.county !== recommended.county) {
    mismatches.push({ level: 'county', currentVal: current.county, recommendVal: recommended.county })
  }

  console.log('[adress] showAreaMismatchDialog', mismatches)
  // 无不一致则直接替换
  if (mismatches.length === 0) {
    setAddressInfo(recommended)
    return
  }

  // 取第一个不一致项来展示弹窗
  const first = mismatches[0]
  const levelLabelMap: Record<string, { full: string; short: string }> = {
    province: { full: `${recommended.province}${recommended.city || ''}`, short: recommended.province },
    city: { full: `${recommended.province}${recommended.city || ''}`, short: recommended.city },
    county: { full: `${recommended.city}${recommended.county || ''}`, short: recommended.county },
  }
  const label = levelLabelMap[first.level]

  showDialog({
    parentClassName: 'address-page',
    zIndex: 1000,
    title: '温馨提示',
    message: `<view style="font-weight:normal;color:#55596C;">您选择的地址可能属于<text style="color:#8365F6;">${label.full}</text>，是否需要切换到${label.short}？</view>`,
    showCancelButton: true,
    confirmButtonText: '切换',
    cancelButtonText: '不切换',
    cancle: () => {
      console.log(11)
    },
    confirm: async () => {
      setAddressInfo(recommended)
    },
  })
}

/** 列表选中地址回调 */
const onDetailSelect = (data: any) => {
  addressInfo.value.detailAddress = data.detailAddress
  // 如果省市区为空，回填选中的省市区
  if (!tertiaryAddress.value && data.province) {
    setAddressInfo(data)
    return
  }

  setAddressInfo({ detailAddress: data.detailAddress })

  // 没有省市区返回时不覆盖省市区
  if (!data.province && !data.city && !data.county) {
    return
  }

  // 如果有值则对比省市区是否一致
  const recommended = { province: data.province || '', city: data.city || '', county: data.county || '' }
  showAreaMismatchDialog(recommended)
}

/** 原始地址回调 */
const onOriginalAddress = (val: string) => {
  console.log('[adress] originalAddress:', val)
}

/** 点击详细地址确认回调 */
const onClickConfirm = (val: string) => {
  other_express_receiver_address_v1({
    button_name: '确认',
    recognition_type: addressType.value === 'send' ? '寄件' : '收件',
    sender_address: val,
  })
  console.log('[adress] onClickConfirm:', val)
}



/** 选中最近地址回填 */
const onSelectRecentAddress = (data: any) => {
  console.log('[adress] onSelectRecentAddress', data)
  clk_express_single_recently_v1({
    button_name: '最近寄件地址_点击',
    recognition_type: addressType.value === 'send' ? '寄件' : '收件',
    id: data.id,
    no: data.no,
    Address_msg: `${data.province}${data.city || ''}${data.county || ''}${data.detailAddress || ''}`,
  })
  setAddressInfo(data, true)
  Taro.pageScrollTo({ scrollTop: 0, duration: 300 })
}

const onRecentChange = () => {
  console.log('[adress] onRecentChange')
}

const clearAll = () => {
  console.log('[adress] clearAll')
}
// 跳转定位页面

const handleLocation = () => {
  clk_express_send_information_control_v1({ button_name: '定位', recognition_type: addressType.value === 'send' ? '寄件' : '收件' })
  const from = addressType.value === 'send' ? 'freightSenderPage' : 'freightReceiverPage'
  // 监听定位页面回传数据
  Taro.eventCenter.on('freightMapPositionData', (data: any) => {
    console.log('[adress] onMapPositionData', data)
    // 回填省市区详细地址
    if (data) {
      setAddressInfo({ detailAddress: data.detailAddress })
      showAreaMismatchDialog(data)
    }
    // 一次性监听，用完移除
    Taro.eventCenter.off('freightMapPositionData')
  })
  Taro.navigateTo({
    url: `/modules/order-build-sub-pages/order-public/components/business/map-position/page/index?from=${from}`,
  })
}

const handleConfirm = () => {
  const key = addressType.value === 'send' ? 'sender_address' : 'receiver_address'
  other_express_single_sender_address_v1({
    button_name: '确认',
    recognition_type: addressType.value === 'send' ? '寄件' : '收件',
    [key]: `${tertiaryAddress.value}${addressInfo.value.detailAddress || ''}`,
  })
  // 校验省市区必填
  if (!tertiaryAddress.value) {
    Taro.showToast({ title: '请选择省/市/区', icon: 'none', duration: 2000 })
    return
  }

  // 通过共享状态回填数据到父页 SendAndReceive 组件
  const areaStr = tertiaryAddress.value.replace(/\//g, '')
  if (addressType.value === 'send') {
    setSendAddress({ ...addressInfo.value, fullAddress: `${areaStr}${addressInfo.value.detailAddress}` })
  } else {
    setReceiveAddress({ ...addressInfo.value, fullAddress: `${areaStr}${addressInfo.value.detailAddress}` })
  }

  Taro.navigateBack()
}

/** 点击语音识别 */
const onClickAudio = () => {}

/** 点击图片识别 */
const onClickImg = () => {
  // clk_express_single_send_image_recognition_button_v1({ button_name: '图片识别', recognition_type: addressType.value === 'send' ? '寄件' : '收件' })
}

/** 点击手动识别 */
const onClickIdentify = () => {
  clk_express_single_send_paste_and_recognize_button_v1({ button_name: '粘贴并识别', recognition_type: addressType.value === 'send' ? '寄件' : '收件' })
}
</script>

<style lang="scss">
.address-page {
  min-height: 100vh;
  background: #F5F6FA;
  padding: 24px;
  padding-bottom: calc(160px + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

/* 智能识别模块 */
.smart-recognition {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;

  .recognition-hint {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;

    .hint-text {
      font-size: 26px;
      color: #666;
    }

    .required-icon {
      width: 40px;
      height: 24px;
    }
  }

  .recognition-example {
    font-size: 24px;
    color: #999;
    margin-bottom: 20px;
    line-height: 1.4;
  }

  .recognition-actions {
    display: flex;
    align-items: center;
    gap: 32px;
    margin-bottom: 24px;

    .action-item {
      display: flex;
      align-items: center;
      gap: 8px;

      .action-icon {
        width: 32px;
        height: 32px;
      }

      span {
        font-size: 26px;
        color: #666;
      }
    }
  }

  .recognition-btn {
    width: fit-content;
    height: 64px;
    padding: 0 32px;
    background: #7B61FF;
    color: #FFFFFF;
    font-size: 28px;
    border: none;
    border-radius: 32px;
    float: right;
  }
}

/* 地址容器 - 城市/区域 + 详细地址 */
.address-container {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 32px 24px;
  box-sizing: border-box;
  width: 100%;
  margin-bottom: 24px;
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;

  .address-item {
    .item-label {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;

      .label-icon {
        width: 40px;
        height: 40px;
      }

      .label-text {
        font-size: 30px;
        font-weight: 600;
        color: #333;
      }

      .required-icon {
        width: 40px;
        height: 24px;
      }
    }
  }

  /* 城市选择器 */
  .city-selector {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 88px;
    border-radius: 12px;
    opacity: 1;
    padding: 24px 32px;
    box-sizing: border-box;
    background: #F7F8FA;

    .selector-text {
      font-size: 28px;
      font-weight: 600;
      color: #03050D;

      &.placeholder {
        color: #ADB0B8;
        font-weight: normal;
      }
    }

    .arrow-icon {
      width: 28px;
      height: 28px;
      transform: rotate(90deg);
    }
  }

  /* 详细地址 */
  .detail-address-wrapper {
    background: #F8F9FC;
    width: 100%;
    height: 106px;
    border-radius: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 32px;
    align-self: stretch;
    background: #F7F8FA;
    box-sizing: border-box;

    .detail-input {
      flex: 1;
      font-size: 28px;
      font-weight: 600;
      color: #03050D;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      &.placeholder {
        color: #ADB0B8;
        font-weight: normal;
      }
    }

    .location-btn {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      flex-shrink: 0;

      .location-icon {
        width: 32px;
        height: 32px;
      }

      span {
        font-size: 26px;
        color: #7B61FF;
      }
    }
  }
}

/* 底部按钮 */
.footer-btn {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99;
  padding-bottom: env(safe-area-inset-bottom, 20px);
  background: #fff;
  box-shadow: 0 -6px 20px 0 rgb(184 171 255 / 10%);

  .footer__wrap {
    padding: 16px 32px;
    box-sizing: border-box;

    .confirm-btn {
      width: 100%;
      height: 88px;
      font-size: 32px;
      font-weight: 600;
      border-radius: 16px;
    }
  }
}
</style>
