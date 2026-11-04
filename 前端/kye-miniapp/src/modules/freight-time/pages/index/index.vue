<template>
  <div class="h-full height-100" id="order-page" @tap="handlePageClick">
    <div class="freight-time-page-container">
      <scroll-view
        :scrollWithAnimation="true"
        scrollAnimationDuration="200"
        class="freight-time-content"
        :scroll-y="true"
        :enhanced="true"
        :scroll-into-view="scrollTarget"
        id="freightTimeContentScroll"
        @scroll="handleScroll"
      >
        <div class="freight-time-container">
          <div class="block">
            <div class="row">
              <SendAndReceive />
            </div>
          </div>
          <div class="block">
            <div class="row">
              <GoodsTime></GoodsTime>
              <ProductName />
              <view class="freight-time-product-info-tip font-level4" v-if="hasFrightFeeAuth"
                >推荐您填写重量、体积，预估运费更准确</view
              >
              <ProductSpecWeight />
              <ProductSpecVolume @switchChange="onChangeSwitchVolume" />
              <ProductSize v-if="switchVolumeValue" />
              <div class="illustrate">
                <div class="illustrate-wrap font-level4" @click="handleClickTips">
                  <div>规格/托寄物/增值服务说明</div>
                  <img class="icon-item" :src="base64Icon.问号" />
                </div>
              </div>
              <!-- 包装服务 -->
              <PackageService v-if="customerCode" :hasFrightFeeAuth="hasFrightFeeAuth" />
            </div>
          </div>
        </div>

        <!-- 重置 & 查询 -->
        <div class="clear__info">
          <div class="clear" @tap="handleReset">
            <image class="clear-icon" :src="IMAGES.reset" mode="aspectFit" />
            <span>重置</span>
          </div>
          <ky-button
            class="search-btn"
            type="primary"
            size="large"
            :text="'查询'"
            :loading="store.getQueryLoading"
            :loading-type="'primary'"
            @tap="handleSearch(captchaRef)"
          />
          <view
            class="search-badge"
            v-if="store.serviceFeeCoupon && store.getShowSearchBtnBadge"
            id="exp_freight_coupon_v1"
            v-exposure
            :exposure-report="{
              eventCode: 'exp_freight_coupon_v1'
            }"
          >
            查时效领优惠券
          </view>
        </div>
        <!-- 服务方式查询结果 -->
        <view id="service-mode-area">
          <ServiceMode
            :result="store.getQueryResult"
            :freight-status="store.getBindCustomerStatus"
            :send-coupon-result="store.getSendCouponResult"
            :restrict-result="store.getRestrictResult"
            :online-customer-info="store.getOnlineCustomerInfo"
            @service-intro="handleServiceIntro"
          />
        </view>

        <!-- 底部占位（给 Footer 留空间） -->
        <view class="footer-placeholder" v-if="store.getQueryResult.length > 0"></view>
      </scroll-view>

      <!-- 底部 Footer -->
      <FreightFooter v-if="store.getQueryResult.length > 0" @refresh="handleSearch(captchaRef)" />

      <!-- 验证码弹窗 -->
      <Captcha
        ref="captchaRef"
        :userCheck="false"
        :appId="captchaAppId"
        @getCode="onCaptchaGetCode"
        @handleClose="onCaptchaClose"
      />
    </div>
    <!-- 气泡 -->
    <PopoverEffect :visible="true" />

    <!-- 联系商务弹窗 -->
    <ContactBusiness v-model:show="store.showContactPopup" :phone="userInfo?.phone || '95324'" role-name="商务" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import Taro, { useDidShow, useUnload } from '@tarojs/taro'
import ProductName from '@freight-time/components/product-name/index.vue'
import GoodsTime from '@freight-time/components/goods-time/index.vue'
import ProductSpecWeight from '@freight-time/components/product-spec-weight/index.vue'
import ProductSpecVolume from '@freight-time/components/product-spec-volume/index.vue'
import ProductSize from '@freight-time/components/product-size/index.vue'
import PackageService from '@freight-time/components/pacakge-service/index.vue'
import SendAndReceive from '@freight-time/components/sendAndReceive/index.vue'
import ServiceMode from '@freight-time/components/service-mode/index.vue'
import FreightFooter from '@freight-time/components/freight-footer/index.vue'
import KyButton from '@order-global-package-freight-time/components/base/ky-button/index.vue'
import Captcha from '@/public/components/base/captcha/index.vue'
import { IMAGES } from '@freight-time/constants/images'
import { base64Icon } from '@public/constants/index'
import { useFreightTimeStore } from '@freight-time/store'
import { useFreightTimeQuery } from '@freight-time/pages/index/hooks/useFreightTimeQuery'
import { useNewCustomerActivity } from '@freight-time/pages/index/hooks/useNewCustomerActivity'
import PopoverEffect from '@order-global-package-freight-time/components/business/popover-effect/index.vue'
import ContactBusiness from '@/public/components/business/contact-business/index.vue'
import { onRefGlobalDataCustomerCodeChange, offRefGlobalDataCustomerCodeChange } from '@public/storage'
import { useUserInfo } from '@public/hooks/useUserInfo'
import { closeValidateKey } from '@freight-time/components/product-name/useGoodsTypeValidate'
import { useUserGlobalStore } from '@/store/user'
import { hasFrightFeeAuth, getFreightTimePermission } from '@freight-time/hooks/useAuth'
import { reportOther, reportPv } from '@freight-time/report'
import { debounce } from 'lodash-es'
import useExposureReport from '@freight-time/hooks/useExposureReport'
useExposureReport(['exp_freight_coupon_v1'])
const globalUserStore = useUserGlobalStore()

const customerCode = computed(() => globalUserStore.customerCode)

// 运费时效验证码 appId（与 netc-h5-order-old 一致）
// eslint-disable-next-line no-undef
const captchaAppId = process.env.TARO_APP_ENV === 'prod' ? '197940182' : '190150443'

const store = useFreightTimeStore()
const { userInfo } = useUserInfo()
const captchaRef = ref<InstanceType<typeof Captcha>>()
const { fetchNewCustomerActivity } = useNewCustomerActivity()

/** 查询结果滚动定位：查询完成后结果区域自动滚动到顶部 */
const scrollTarget = ref('')
const { handleSearch, handleReset, onCaptchaGetCode, onCaptchaClose } = useFreightTimeQuery(() => {
  scrollTarget.value = ''
  nextTick(() => {
    scrollTarget.value = 'service-mode-area'
  })
})

/**
 * 客户编码变化回调（与 netc-h5-order-old 的 bindCodeRefreshPage 逻辑一致）
 * 绑码完成后：重新查询 + 刷新新客活动
 */

const onCustomerCodeChanged = () => {
  handleSearch(captchaRef.value)
  // fetchNewCustomerActivity(true)
}

onMounted(() => {
  getFreightTimePermission()
  // 如果用户是直接打开运费时效的情况，由于全局获取用户信息会导致onCustomerCodeChanged触发,所以需要保证事件绑定在全局获取用户信息完成后
  setTimeout(() => {
  // 判断当前页面是否是在modules/freight-time/pages/index/index.vue中
  const currentPages = Taro.getCurrentPages()
  const isFreightTimeQueryPage = currentPages.some((item) => item.route === 'modules/freight-time/pages/index/index')
  if (isFreightTimeQueryPage) {
    onRefGlobalDataCustomerCodeChange(onCustomerCodeChanged)
  }
  }, 1000)

  reportPv('page_freight_query')
})

onUnmounted(() => {
  offRefGlobalDataCustomerCodeChange(onCustomerCodeChanged)
})

useDidShow(() => {
  fetchNewCustomerActivity()
})

const toScrollReport = debounce(() => {
  reportOther('other_freight_query_perception')
}, 300)

const handleScroll = (e) => {
  try {
    if (e.detail.scrollTop > 50) {
      toScrollReport()
    }
  } catch (error) {
    console.log(error)
  }
}

const switchVolumeValue = ref(false)
/**
 * 页面点击事件统一处理入口
 * 未来需要新增页面级点击行为时，在此追加即可
 */
const handlePageClick = () => {
  closeValidateKey()
}
const onChangeSwitchVolume = (val: boolean) => {
  switchVolumeValue.value = val
  if (!val) {
    // 清空尺寸数据
    store.setPreWaybillGoodsSizeList([
      {
        width: '',
        height: '',
        length: '',
        count: 1,
        singleWeight: '',
      },
    ])
    // 清空体积数据
    store.setVolumeSize(0)
  }
}

const handleClickTips = () => {
  Taro.navigateTo({
    url: '/modules/order-build-sub-pages/pages/order-service-introduction/index',
  })
}

const handleServiceIntro = () => {
  Taro.navigateTo({
    url: '/modules/order-build-sub-pages/pages/order-service-introduction/index',
  })
}

useUnload(() => {
  handleReset()
})
</script>

<style lang="scss">
@import '@order-global-package-freight-time/styles/index.scss';
@import '@order-global-package-freight-time/styles/common.scss';
@import '@order-global-package-freight-time/styles/ky-cell.scss';
@import './index.scss';

.height-100 {
  height: 100vh;
}
</style>
