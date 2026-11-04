<template>
  <view class="id-card-visitor-data">
    <view class="visitor-data-sum-wrap">
      <view class="visitor-data-sum-item">
        <view class="visitor-data-sum-item__num">
          {{ numberFormat(visitor) }}
          <text v-if="newVisitor" class="visitor-data-sum-item__new">{{ '+' + newVisitor }}</text>
        </view>
        <text class="visitor-data-sum-item__title">我的访客</text>
      </view>
      <view class="visitor-data-sum-item">
        <view class="visitor-data-sum-item__num">
          {{ numberFormat(visits) }}
          <text v-if="newVisits" class="visitor-data-sum-item__new">{{ '+' + newVisits }}</text>
        </view>
        <text class="visitor-data-sum-item__title">访问次数</text>
      </view>
      <view class="visitor-data-sum-item">
        <text class="visitor-data-sum-item__num">{{ numberFormat(shareCount) }}</text>
        <text class="visitor-data-sum-item__title">分享次数</text>
      </view>
    </view>
    <view class="visitor-data-title">我的访客</view>
    <view v-if="visitorList.length === 0" class="visitor-data-list-empty">
      <Image
        class="visitor-data-list-empty__img"
        src="https://ic-img.ky-express.com/netc/20250928_46088_!!1759048295097_560_560.png"
      ></Image>
      <text v-if="isLogined()" class="visitor-data-list-empty__text">暂无数据</text>
      <view v-else class="visitor-data-list-empty__nologin">
        <view class="visitor-data-list-empty__text">点击登录获取最新访客数据</view>
        <button class="visitor-data-list-empty__btn" @click="handleLoginClick">去登录</button>
      </view>
    </view>
    <view v-else class="visitor-data-list">
      <scroll-view
        class="search-scroll-view"
        :scroll-y="true"
        :trapScroll="true"
        :lowerThreshold="20"
        @scrollToLower="onScrollToLower"
      >
        <view v-for="(item, index) in visitorList" :key="index" class="visitor-data-list-item">
          <Image class="visitor-data-list-item__avatar" :src="item.visitHead || noVisitHead"></Image>
          <view class="visitor-data-list-item__info">
            <view v-if="item.visitPhone" class="visitor-data-list-item__base">
              <text v-if="item.visitName" class="visitor-data-list-item__name">{{ formatName(item.visitName) }}</text>
              <text class="visitor-data-list-item__phone" @tap="handlePhonePopupShow(item.visitPhone)">
                {{ formatPhone(item.visitPhone) }}
              </text>
              <Image
                class="visitor-data-list-item__img"
                src="https://ic-img.ky-express.com/netc/20250929_13735_!!1759116600140_49_49.png"
                @tap="handlePhonePopupShow(item.visitPhone)"
              ></Image>
            </view>
            <view v-else class="visitor-data-list-item__base">
              <text class="visitor-data-list-item__name">未登录用户</text>
            </view>
            <text class="visitor-data-list-item__source">{{ item.tip }}</text>
            <view class="visitor-data-list-item__bottom">
              <text v-if="item.visitPhone" class="visitor-data-list-item__time">
                访问次数：{{ numberFormat(item.visitCnt) }}次
              </text>
              <text v-else class="visitor-data-list-item__time">访问渠道：{{ numberFormat(item.visitChannel) }}</text>
              <text class="visitor-data-list-item__date">{{ item.visitTime }}</text>
            </view>
          </view>
        </view>
        <view v-if="loading" class="visitor-data-list--loading">
          <Image
            class="loading-img"
            src="https://ic-img.ky-express.com/netc/20250928_40098_!!1759052073828_53_53.png"
          ></Image>
          <text class="loading__text">加载中...</text>
        </view>
        <view v-else class="visitor-data-list--loading"></view>
        <view v-if="!loading && finished" class="visitor-data-list--no-more">没有更多了~</view>
      </scroll-view>
    </view>
    <ky-popup
      safe-area-inset-bottom
      position="bottom"
      :is-border-raius="true"
      :show="show"
      @clickOverlay="handleClickOverlay"
    >
      <view class="visitor-call-phone-content">
        <view class="visitor-call-phone-content__title">
          <text class="visitor-call-phone-content__title-text">拨打电话</text>
          <Image
            class="visitor-call-phone-content__title-close"
            src="https://ic-img.ky-express.com/netc/20250929_7366_!!1759137108217_64_64.png"
            @tap="handleClickOverlay"
          ></Image>
        </view>
        <view class="visitor-call-phone-content__wrap">
          <text class="visitor-call-phone-content__wrap-tips">将用此手机号码联系客户</text>
          <view v-if="!isEdit" class="visitor-call-phone-content__wrap-box">
            <text class="visitor-call-phone-content__wrap-phone">{{ formatPhone(phone) }}</text>
            <Image
              class="visitor-call-phone-content__wrap-img"
              src="https://ic-img.ky-express.com/netc/20250929_82554_!!1759138518662_96_96.png"
              @tap="handleEditPhone"
            ></Image>
          </view>
          <PhoneInput
            v-else
            :phone="phone"
            :isError="isError"
            @onBlur="handlePhoneBlur"
            @onChange="handlePhoneChange"
            @onClear="phone = ''"
          ></PhoneInput>
        </view>
        <view class="visitor-call-phone-content__bottom">
          <button class="visitor-call-phone-content__btn" @tap="handleCallPhone">拨打</button>
        </view>
      </view>
    </ky-popup>
  </view>
</template>

<script lang="ts" setup>
import Taro, { useDidShow, useRouter } from '@tarojs/taro'
import { ref } from 'vue'
import { getVisitVirtualPhone, getVisitStat, getVisitList } from '@/packages/idcard/api/index'
import { useUserInfo } from '@/public/hooks'
import { isLogined, isPc, isWxPcAppletEnv } from '@/public/utils'
import { VisitItem } from './types'
import PhoneInput from './components/phone-input/index.vue'
import { reportVisitorData, trackEvent } from '../home/report'

const { userInfo } = useUserInfo()
const router = useRouter()
const { salesId } = router.params

const noVisitHead = 'https://ic-img.ky-express.com/netc/20251013_78879_!!1760321600222_176_176.png'

const visitor = ref(0)
const newVisitor = ref(0)
const visits = ref(0)
const newVisits = ref(0)
const shareCount = ref(0)
const page = ref(1)
const visitorList = ref<VisitItem[]>([])

const show = ref(false)
const isEdit = ref(false)
const phone = ref('')
const isError = ref(false)
const phoneNumber = ref('')

const loading = ref(false)
const finished = ref(false)

const numberFormat = (value) => {
  return value.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1,')
}

const handleClickOverlay = () => {
  show.value = false
  isEdit.value = false
}

const formatPhone = (phoneNum) => {
  const cleaned = phoneNum.toString().replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/)
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]}`
  }
  return phoneNum
}

const formatName = (name) => {
  return name.length > 11 ? name.slice(0, 11) + '...' : name
}

const handleEditPhone = () => {
  isEdit.value = true
}

const handlePhoneBlur = (e) => {
  const phoneNum = e.detail.value.replace(/\s/g, '')
  const phoneRegex = /^1(3[0-9]|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/
  if (!phoneRegex.test(phoneNum)) {
    isError.value = true
  } else {
    isError.value = false
  }
}

const handlePhoneChange = (val) => {
  console.log('handlePhoneChange', val)
  phone.value = val
}

const handlePhonePopupShow = (phoneNum) => {
  isError.value = false
  phone.value = userInfo.value.phone
  phoneNumber.value = phoneNum
  show.value = true
  trackEvent('clk_business_card_data_phone', '拨打电话', {
    page_name: 'page_business_card_data',
    sales_id: salesId,
  })
}

const handleCallPhone = async () => {
  try {
    if (isPc || isWxPcAppletEnv) {
      Taro.showToast({
        title: '该设备暂不支持该操作',
        icon: 'none',
      })
      return
    }
    const phoneRegex = /^1(3[0-9]|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/
    if (!phoneRegex.test(phone.value)) {
      isError.value = true
      return
    } else {
      isError.value = false
    }
    const res = await getVisitVirtualPhone({
      salesPhone: phone.value,
      visitPhone: phoneNumber.value,
    })
    console.log('res', res)
    Taro.makePhoneCall({ phoneNumber: res.data.virtualMobile || phoneNumber.value })
  } catch (error) {
    console.log('error', error)
    Taro.makePhoneCall({ phoneNumber: phoneNumber.value })
  }
}

const queryVisitStat = async () => {
  const res = await getVisitStat({
    salesId: salesId,
  })
  console.log('res', res)
  visitor.value = res.data.visitUserCnt.totalCnt
  visits.value = res.data.visitCnt.totalCnt
  shareCount.value = res.data.shareCnt.totalCnt
  newVisitor.value = res.data.visitUserCnt.addCnt
  newVisits.value = res.data.visitCnt.addCnt
}

const queryVisitList = async () => {
  try {
    loading.value = true
    const res = await getVisitList({
      salesId: salesId,
      page: page.value,
      size: 10,
    })
    console.log('res', res)
    visitorList.value.push(...res.data)
    loading.value = false
    if (!res || !res.data || !res.data.length || res.data.length < 10) {
      finished.value = true
    }
  } catch (error) {
    console.log('error', error)
    loading.value = false
  }
}

const onScrollToLower = () => {
  if (!finished.value) {
    page.value = page.value + 1
    queryVisitList()
  }
}

const handleLoginClick = () => {
  Taro.navigateTo({ url: '/modules/user/pages/login/index?delta=2' })
}

useDidShow(async () => {
  if (!userInfo.value.phone) {
    return
  }
  queryVisitStat()
  queryVisitList()
  phone.value = userInfo.value.phone
  reportVisitorData(salesId)
})
</script>

<style lang="scss">
@import './index.scss';
</style>
