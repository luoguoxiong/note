<template>
  <view>
    <view class="bottom-btn-warp">
      <template v-if="!isSales">
        <view class="button-wrap">
          <template v-if="!isOldCustomerResource || isInnerEmpoee">
            <ky-button class="contact-phone-call" @tap="handleShippingInquiry">寄件咨询</ky-button>
          </template>
          <view v-if="isOldCustomerResource" class="contact-phone-call__btn-warp">
            <ky-button @tap="showShare" class="contact-phone-call contact-phone-call-item form-btn-plain"
              >分享</ky-button
            >
            <ky-button class="contact-phone-call contact-phone-call-item" @tap="handleOrderClick">去下单</ky-button>
          </view>
        </view>
      </template>
      <template v-if="isSales">
        <view class="button-wrap">
          <template v-if="isEdit">
            <view class="contact-phone-call__btn-warp">
              <ky-button @tap="onCancel" class="contact-phone-call contact-phone-call-item form-btn-plain"
                >取消</ky-button
              >
              <ky-button @tap="onSubmit" class="contact-phone-call contact-phone-call-item">保存</ky-button>
            </view>
          </template>
          <template v-if="!isEdit">
            <view class="contact-phone-call__btn-warp">
              <view class="visitor-data__btn-warp" @tap="onVisitor">
                <view v-if="hasNewVisData" class="visitor-data__point"></view>
                <Image
                  class="visitor-data__img"
                  src="https://ic-img.ky-express.com/netc/20251111_49662_!!1762843110368_80_80.png"
                ></Image>
                <text className="visitor-data__text">访客数据</text>
              </view>
              <ky-button
                @tap="onEdit"
                class="contact-phone-call contact-phone-call-item form-btn-plain contact-phone-call-item2"
                >编辑</ky-button
              >
              <ky-button @tap="showShare" class="contact-phone-call contact-phone-call-item contact-phone-call-item2"
                >分享</ky-button
              >
            </view>
          </template>
        </view>
      </template>
    </view>

    <!-- 寄件咨询弹窗 -->
    <ky-popup
      safe-area-inset-bottom
      position="bottom"
      :is-border-radius="true"
      :show="show"
      @tap-overlay="handleClickOverlay"
    >
      <view class="address-content">
        <view class="title-wrap">
          <view class="big-title">寄件咨询</view>
          <view class="sub-title">为了更好的为您提供服务，请填写以下信息，我将优先与您联系，为您服务</view>
        </view>

        <view class="form-content">
          <!-- 手机号码 -->
          <view class="form-item form-item-phone-bg">
            <view class="form-item__label">
              <text>手机号码</text>
            </view>
            <view class="form-item__content">
              <ky-input
                type="text"
                placeholder-class="holder"
                class="form-item__input form-item__input-rightText disabled"
                disabled
                v-model="currentPhoneInStorageTemp"
              />
            </view>
          </view>

          <!-- 公司名称 -->
          <view class="form-item">
            <view class="form-item__label">
              <text>公司名称</text>
              <image
                class="require-img"
                src="https://ic-img.ky-express.com/netc/20250207_4066301157_!!1738899886935_80_48.png"
              />
            </view>
            <view class="form-item__content">
              <ky-input
                type="text"
                class="form-item__input form-item__input-rightText"
                placeholder-class="holder"
                placeholder="请输入"
                v-model="companyName"
                :cursor-spacing="50"
                @focus="() => handleFocus('companyName')"
              />
            </view>
          </view>

          <!-- 公司地址 -->
          <Address ref="addressRef" @confirm-cb="addrSelectCb" @tap-position="getLocation" />
        </view>

        <view class="form-btn-warp">
          <view class="form-btn plain" @tap="handleClance">取消</view>
          <view class="form-btn" @tap="handleConfirm">提交</view>
        </view>
      </view>
    </ky-popup>

    <!-- 去下单弹窗 -->
    <ky-popup
      safe-area-inset-bottom
      position="bottom"
      :is-border-radius="true"
      :show="orderPupupShow"
      @tap-overlay="handleClickOrderOverlay"
    >
      <view class="bottomBtn-popup-content idcard-order-popup-content">
        <!-- 老客 -->
        <template v-if="!isNewFlag">
          <view class="content-warp oldcustomer-content-warp">
            <view class="title">
              <view class="title-left-text">温馨提示</view>
              <image
                class="title-right-icon"
                src="https://ic-img.ky-express.com/netc/20250207_64566301144_!!1738913256622_64_64.png"
                @tap="handleClickCloseOrderPopup"
              />
            </view>

            <view class="ctx">
              <image
                class="ctx-img"
                src="https://ic-img.ky-express.com/netc/20250207_99666301196_!!1738914033457_1372_656.png"
              />
            </view>

            <view class="order-btn-warp">
              <ky-button class="form-btn" @tap="handleOrderClick">去下单</ky-button>
            </view>
          </view>
        </template>
        <!-- 新客 -->
        <template v-if="isNewFlag">
          <view class="content-warp newcustomer-content-warp">
            <view class="title">
              <view class="title-left-text">企业微信</view>
              <image
                class="title-right-icon"
                src="https://ic-img.ky-express.com/netc/20250207_64566301144_!!1738913256622_64_64.png"
                @tap="handleClickCloseOrderPopup"
              />
            </view>

            <template v-if="wechatImg && !isPC">
              <view class="contact-shangwu">
                <view class="shangwu-text">长按将二维码保存到本地</view>
                <Image class="shangwu-img" :show-menu-by-longpress="true" :src="wechatImg || defaultWechatImg" />
              </view>
            </template>
            <template v-if="wechatImg && isPC">
              <view class="contact-shangwu" @tap="handleDownLoadWechatImg">
                <view class="shangwu-text">点击下方二维码将二维码保存到本地</view>
                <image class="shangwu-img" :src="wechatImg || defaultWechatImg" />
              </view>
            </template>
          </view>
        </template>
      </view>
    </ky-popup>

    <!-- 分享弹窗 -->
    <ky-popup
      safe-area-inset-bottom
      position="bottom"
      :is-border-radius="true"
      :show="shareShow"
      @tap-overlay="handleClickShareShow"
      class="idcard-bottom-btn__share-qrcodePopup"
    >
      <view class="share-qrcode" @tap="handleShareQrcode"> 生成二维码分享 </view>
      <ky-button class="share-button" @tap="handleShareButton" open-type="share"> 分享 </ky-button>
      <view class="share-qrcode cancle-button" @tap="handleShareQrcodeCancel"> 取消 </view>
    </ky-popup>

    <!-- 分享二维码弹窗 -->
    <ky-popup
      safe-area-inset-bottom
      position="center"
      :is-border-radius="true"
      :show="shareQrcodeShow"
      class="idcard-bottom-btn__qrcodePopup"
    >
      <QrcodeContentPopup
        :shareQrcodeShow="shareQrcodeShow"
        :isSales="isSales"
        :baseInfo="baseInfo"
        :qrCode="qrCode"
        :isShowSaveBtn="isShowSaveBtn"
        @saveQrcode="saveQrcode"
        @cancelShare="handleCancelShare"
      />
    </ky-popup>
  </view>
</template>

<script setup lang="ts">
import { saveCustomer } from '@/packages/idcard/api/index'
import { isPC } from '@/packages/idcard/utils/idcard-device'
import { useUserInfo } from '@/public/hooks'

import Taro from '@tarojs/taro'
import { computed, onMounted, ref, watch } from 'vue'
import { saveRemoteImage } from '../../../utils/saveImage'
import Address from '../address/index.vue'
import { trackEvent, trackPageView } from './report'
import type { BottomBtnProps } from './types'

import QrcodeContentPopup from './components/qrcode-content-popup/index.vue'

import useCanvas from '../../hook/usecardcanvas'

import { uuid } from '@/public/utils'
import { getCurrentChannel, getSourceID } from '@/packages/idcard/idcard-report'
const { userInfo } = useUserInfo()
const { handleGetImg } = useCanvas()

const currentPhoneInStorageTemp = ref(userInfo.value?.phone)

const isLogin = computed(() => !!userInfo.value?.phone)

const props = withDefaults(defineProps<BottomBtnProps>(), {
  baseInfo: () => ({
    qrCode: '',
    canSubmitCustomerResource: false,
    innerEmployInfo: false,
  }),
  code: '',
  innerEmployInfo: () => ({}),
  isInnerEmployee: false,
  hasNewVisData: false,
})

const defaultWechatImg = 'https://ic-img.ky-express.com/netc/20250206_90166301118_!!1738842674316_364_356.png'

const show = ref(false)
const orderPupupShow = ref(false)
const shareShow = ref(false)
const shareQrcodeShow = ref(false)
const companyName = ref('')
const isNewFlag = ref(false)
const wechatImg = ref(props.baseInfo.qrCode)
const isOldCustomerResource = ref(props.baseInfo.canSubmitCustomerResource)

const addressObj = ref<{
  province?: string
  provinceId?: string
  city?: string
  cityId?: string
  district?: string
  districtId?: string
  street?: string
  streetId?: string
  address?: string
}>({})

const emits = defineEmits(['cancel', 'edit', 'submit', 'visitor'])

const isInnerEmpoee = computed(() => props.isInnerEmployee)

const handleClickOverlay = () => {
  show.value = false
}

const handleShippingInquiry = () => {
  try {
    trackEvent('clk_page_business_card_homepage_seek_advice_from', '寄件咨询', {
      sales_id: props.baseInfo.hrUserId,
    })

    const { userInfo } = useUserInfo()

    const userInfoVal = userInfo.value?.phone

    console.log('userInfoVal ', userInfoVal)

    if (!isLogin.value) {
      return Taro.navigateTo({ url: '/modules/user/pages/login/index' })
    }
    if (isInnerEmpoee.value) {
      Taro.showToast({
        title: '内部员工不可操作',
        icon: 'none',
      })
      return
    }
    show.value = true
  } catch (error) {
    console.log('寄件咨询 错误', error)
  }
}

const addrSelectCb = (data: any) => {
  addressObj.value = {
    province: data.province.districtName,
    provinceId: data.province.districtID,
    city: data.city.districtName,
    cityId: data.city.districtID,
    district: data.area.districtName,
    districtId: data.area.districtID,
    street: data.street.districtName,
    streetId: data.street.districtID,
  }
}

const handleFocus = (key: string) => {
  if (key === 'companyName') {
    trackEvent('clk_page_business_card_homepage_enter_company_name', '输入公司名称', {
      sales_id: props.baseInfo.hrUserId,
    })
  }
}

const handleConfirm = async () => {
  trackEvent('clk_page_business_card_homepage_sure', '确定提交', {
    sales_id: props.baseInfo.hrUserId,
  })

  try {
    if (!companyName.value) {
      Taro.showToast({
        title: '请输入公司名称',
        icon: 'none',
        duration: 2000,
      })
      return
    }
    if (!addressObj.value || !addressObj.value.provinceId || !addressObj.value.cityId) {
      Taro.showToast({
        title: '请选择公司地址',
        icon: 'none',
        duration: 2000,
      })
      return
    }

    const params = {
      code: props.code,
      mobile: currentPhoneInStorageTemp.value,
      companyName: companyName.value,
      ...addressObj.value,
      county: addressObj.value.district,
      countyId: addressObj.value.districtId,
      town: addressObj.value.street,
      townId: addressObj.value.streetId,
      address: addressObj.value.address || '',
    }

    const { data: res } = await saveCustomer(params)
    show.value = false

    const oldCustomerFlag = res.oldCustomerFlag === '10'
    if (res.qrCode || oldCustomerFlag) {
      orderPupupShow.value = true
    }
    isNewFlag.value = !oldCustomerFlag
    isOldCustomerResource.value = true

    Taro.showToast({
      title: '提交成功，销售将尽快与您联系',
      icon: 'none',
      duration: 2000,
    })
  } catch (error) {
    console.log('error 新老客判断 错误 ', error)
    Taro.showToast({
      title: error.msg || '提交失败',
      icon: 'none',
      duration: 2000,
    })
  }
}

const handleClance = () => {
  trackEvent('clk_page_business_card_homepage_cancel', '取消提交', {
    sales_id: props.baseInfo.hrUserId,
  })
  companyName.value = ''
  show.value = false
}

const handleClickOrderOverlay = () => {
  orderPupupShow.value = false
}

const handleOrderClick = () => {
  trackEvent('clk_page_business_card_homepage_sending_packages', '去下单', {
    sales_id: props.baseInfo.hrUserId,
  })
  orderPupupShow.value = false
  Taro.navigateTo({
    url: '/modules/order-build/pages/order/index',
  })
}

const handleClickCloseOrderPopup = () => {
  orderPupupShow.value = false
}

const getLocation = (resultAddree: any) => {
  addressObj.value = {
    province: resultAddree.province,
    provinceId: resultAddree.provinceId,
    city: resultAddree.city,
    cityId: resultAddree.cityId,
    district: resultAddree.county,
    districtId: resultAddree.countyId,
    street: resultAddree.town,
    streetId: resultAddree.townId,
    address: resultAddree.detail,
  }
}

const initData = () => {
  wechatImg.value = props.baseInfo.qrCode
  isOldCustomerResource.value = !props.baseInfo.canSubmitCustomerResource
}

const showShare = () => {
  if (!props.isSales && isOldCustomerResource.value) {
    trackEvent('clk_page_business_card_homepage_share_friends', '分享', {
      sales_id: props.baseInfo.hrUserId,
    })
  } else {
    trackEvent('clk_business_card_preview_share', '分享', {
      employee_id: props.baseInfo.hrUserId,
      sales_id: props.baseInfo.hrUserId,
    })
  }
  shareShow.value = true
  trackPageView('page_business_card_share', {
    employee_id: props.baseInfo.hrUserId,
    sales_id: props.baseInfo.hrUserId,
  })
}

const isShowSaveBtn = ref(false)
const saveQrcode = async (qrcodeType) => {
  console.log('🚀 ~ saveQrcode ~ qrcodeType:', qrcodeType)
  try {
    const work_id = uuid()
    const source_id = getSourceID()
    if (props.isSales) {
      let eventCode = ''
      if (qrcodeType === '名片样式') {
        eventCode = 'clk_business_card_share_card_save'
      } else {
        eventCode = 'clk_business_card_share_qr_code_save'
      }

      trackEvent(eventCode, '保存图片', {
        channel: getCurrentChannel(),
        page_name: 'page_business_card_share',
        employee_id: props.baseInfo.hrUserId,
        work_id,
        source_id,
        sales_id: props.baseInfo.hrUserId,
      })
    } else {
      let eventCode = ''
      if (qrcodeType === '名片样式') {
        eventCode = 'clk_business_card_homepage_card_save'
      } else {
        eventCode = 'clk_business_card_homepage_qr_code_save'
      }

      trackEvent(eventCode, '保存图片', {
        channel: getCurrentChannel(),
        page_name: 'page_business_card_homepage',
        employee_id: props.baseInfo.hrUserId,
        work_id,
        source_id,
        sales_id: props.baseInfo.hrUserId,
      })
    }
  } catch (error) {
    console.log('保存图片', error)
  }

  if (isShowSaveBtn.value) return

  isShowSaveBtn.value = true

  if (qrcodeType === '名片样式') {
    console.log(props.baseInfo)
    const resImg: string = await handleGetImg(props.baseInfo)
    Taro.saveImageToPhotosAlbum({
      filePath: resImg,
      success: () => {
        Taro.showToast({
          title: '保存成功',
          icon: 'none',
          duration: 2000,
        })
        setShareShow(false)
        setQrcodeShow(false)
        isShowSaveBtn.value = false
      },
      fail: (saveErr) => {
        if (saveErr && saveErr.errMsg.includes('auth')) {
          Taro.showToast({
            title: '请开启相册权限后再试',
            icon: 'none',
            duration: 2000,
          })
        }
        isShowSaveBtn.value = false
      },
    })
    return
  }

  Taro.downloadFile({
    url: props.qrCode,
    success: (res) => {
      Taro.saveImageToPhotosAlbum({
        filePath: res.tempFilePath,
        success: () => {
          Taro.showToast({
            title: '保存成功',
            icon: 'none',
            duration: 2000,
          })
          shareShow.value = false
          shareQrcodeShow.value = false
          isShowSaveBtn.value = false
        },
        fail: (saveErr) => {
          if (saveErr?.errMsg?.includes('auth')) {
            Taro.showToast({
              title: '请开启相册权限后再试',
              icon: 'none',
              duration: 2000,
            })
          }
          isShowSaveBtn.value = false
        },
      })
    },
    fail: (err) => {
      console.error('下载文件失败:', err)
      isShowSaveBtn.value = false
    },
  })
}

const handleCancelShare = (qrcodeTypeTemp) => {
  try {
    console.log('qrcodeTypeTemp >>> ', qrcodeTypeTemp)
    if (qrcodeTypeTemp === '名片样式') {
      // 名片样式
      trackEvent('clk_business_card_homepage_qr_card_cancel', '取消', {
        employee_id: props.baseInfo.hrUserId,
        sales_id: props.baseInfo.hrUserId,
      })
    } else {
      trackEvent('clk_business_card_homepage_qr_code_save_cancel', '取消', {
        employee_id: props.baseInfo.hrUserId,
        sales_id: props.baseInfo.hrUserId,
      })
    }

    setQrcodeShow(false)
  } catch (error) {
    console.log('error', error)
  }
}

const handleClickShareShow = () => {
  shareShow.value = false
}

const handleDownLoadWechatImg = async () => {
  if (isPC && wechatImg.value) {
    await saveRemoteImage(wechatImg.value)
  }
}

const onCancel = () => {
  emits('cancel')
}

const onEdit = () => {
  emits('edit')
}

const onSubmit = () => {
  emits('submit')
}

const onVisitor = () => {
  emits('visitor')
}

const setQrcodeShow = (val) => {
  shareQrcodeShow.value = val
}

const setShareShow = (val) => {
  shareShow.value = val
}

const handleShareQrcodeCancel = () => {
  try {
    if (props.isSales) {
      trackEvent('clk_business_card_share_cancel', '取消', {
        sales_id: props.baseInfo.hrUserId,
      })
    } else {
      trackEvent('clk_business_card_homepage_cancel', '取消', {
        sales_id: props.baseInfo.hrUserId,
      })
    }
  } catch (error) {
    console.log('取消分享 error ', error)
  }

  setShareShow(false)
}

const handleShareButton = async () => {
  try {
    if (props.isSales) {
      trackEvent('clk_business_card_share_link', '分享链接', {
        sales_id: props.baseInfo.hrUserId,
      })
    } else {
      trackEvent('clk_business_card_homepage_link', '分享链接', {
        sales_id: props.baseInfo.hrUserId,
      })
    }
  } catch (error) {
    console.log('点击埋点 error: ', error)
  }

  setShareShow(false)
}

const handleShareQrcode = () => {
  console.log('点击分享')

  try {
    if (props.isSales) {
      trackEvent('clk_business_card_share_qr_code', '生成二维码分享', {
        employee_id: props.baseInfo.hrUserId,
        sales_id: props.baseInfo.hrUserId,
      })
    } else {
      trackEvent('clk_business_card_homepage_qr_code', '生成二维码分享', {
        employee_id: props.baseInfo.hrUserId,
        sales_id: props.baseInfo.hrUserId,
      })
    }
  } catch (error) {
    console.log('生成二维码分享 埋点报错', error)
  }

  setQrcodeShow(true)
}

watch(
  () => show.value,
  (val) => {
    if (!val) {
      companyName.value = ''
    }
  },
  {
    immediate: true,
  },
)

onMounted(() => {
  initData()
})
</script>

<style lang="scss">
@import './index.scss';
</style>
