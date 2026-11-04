<template>
  <view :class="styles['service-mode']" v-if="showContent()">
    <image :class="styles['service-mode-header']" :src="IMAGES.searchResult" mode="widthFix" />
    <view :class="styles['service-mode-content']">
      <!-- 优惠券横幅 -->
      <view :class="styles['coupon-banner']" v-if="sendCouponResult && sendCouponResult.successCount">
        <view :class="styles['coupon-head']">
          <view :class="[styles['coupon-line'], styles['coupon-line--1']]"></view>
          <view :class="[styles['coupon-line'], styles['coupon-line--2']]"></view>
          <view :class="[styles['coupon-line'], styles['coupon-line--3']]"></view>
          <view :class="styles['coupon-title']">恭喜您！获得{{ sendCouponResult.successCount }}张优惠券</view>
          <view :class="[styles['coupon-line'], styles['coupon-line--3']]"></view>
          <view :class="[styles['coupon-line'], styles['coupon-line--2']]"></view>
          <view :class="[styles['coupon-line'], styles['coupon-line--1']]"></view>
        </view>
        <view :class="styles['coupon-desc']">您可前往【我的-优惠券】查看</view>
      </view>



      <!-- 限取限派提示 -->
      <view :class="styles['limit-block']" v-if="restrictResult?.limitReason">
        <view :class="[styles['pickup'], styles[`pickup--${restrictResult.limitReason}`]]">
          <image :class="styles['limit-icon']" :src="IMAGES.limitIcons[restrictResult.limitReason]" mode="aspectFit" />
          <view :class="styles['limit-text']">{{ restrictResult.noticeMessage }}</view>
        </view>
      </view>

      <!-- 服务方式列表 -->
      <view :class="[styles['service-block'], result.length > 0 && styles['service-block--has-result']]">
        <!-- 表头：查询结果为空时隐藏 -->
         <template  v-if="result.length > 0">
          <view :class="styles['service-content']">
            <view :class="styles['header']">
              <view :class="styles['service-title']" @tap="() => emit('serviceIntro')">
                <text>服务方式</text>
                <image
                  :class="styles['service-icon']"
                  :src="IMAGES.serviceIntro"
                  mode="aspectFit"
                />
              </view>
              <view :class="styles['expected-container']">
                <view :class="styles['expected-btn']" @tap="handleSortTime">
                  <text>预估时效</text>
                  <view :class="[styles['sort-arrow'], sortTimeClass && styles[sortTimeClass]]"></view>
                </view>
                <view v-if="showFeeSort" :class="[styles['expected-btn'], styles['expected-btn--fee']]" @tap="handleSortFee">
                  <text>预估费用</text>
                  <view :class="[styles['sort-arrow'], sortFeeClass && styles[sortFeeClass]]"></view>
                </view>
              </view>
            </view>
          <!-- 列表 -->
            <view :class="styles['list']">
              <view
                v-for="(item, index) in sortedList"
                :key="index"
                :class="[styles['list-item'], item.restrictFlag === '10' ? styles['disabled-item'] : '']"
              >
                <view :class="styles['list-item-content']">
                  <!-- 右上角禁用标签 -->
                  <view :class="styles['invalid-reason']" v-if="item.iconInfo">
                    <image :class="styles['icon-disable']" :src="IMAGES.iconDisable" mode="aspectFit" />
                    <text>{{ item.iconInfo.titleName }}</text>
                  </view>

                  <!-- 左侧信息 -->
                  <view :class="styles['list-item-left']">
                    <view :class="styles['list-item-left-name']">{{ item.serviceTypeName || '' }}</view>
                    <view :class="styles['disable']" v-if="item.restrictFlag === '10' && item.iconInfo">
                      {{ item.iconInfo.message || '' }}
                    </view>
                    <rich-text
                      v-else
                      :class="styles['list-item-left-time']"
                      :nodes="item.descriptionH5Text || ''"
                    />
                  </view>
                  <!-- 新客 -->
                  <image v-if="isNewCustomerNoAuth" :class="styles['new-customer-icon']" :src="IMAGES.newCustomerDiscount" mode="widthFix" />
                  <!-- <template v-if="isNewCustomerNoAuth">
                    <view :class="[styles['list-item-right-fee'], styles['fee-discount']]">
                      <view :class="styles['fee-discount-text']">企业专属折扣</view>
                      <view :class="styles['fee-discount-amount']">
                        <text :class="styles['fee-discount-value']">？？？</text>
                        <text :class="styles['fee-discount-unit']">元</text>
                      </view>
                    </view>
                  </template> -->
                  
                  <template v-else>
                    <!-- 有权限 + 已绑码 → 总费用 + 明细 -->
                    <view :class="styles['list-item-right-fee']" v-if="feePermission && item.restrictFlag !== '10'">
                      <view :class="styles['fee-total']">
                        <!-- <text>总费用</text> -->
                        <text :class="styles['fee-value']">¥{{ formatFee(item.estimateTotalFee) }}</text>
                        <text  v-if="formatFee(item.estimateTotalFee) !== '--'" :class="styles['fee-unit']">起</text>
                      </view>
                      <view :class="styles['fee-detail']" @tap="handleDetail(item)" v-if="formatFee(item.estimateTotalFee) !== '--'">
                        <text>明细</text>
                        <text :class="styles['detail-arrow']">›</text>
                      </view>
                    </view>

                    <!-- 无费用权限 → ¥*** -->
                    <view
                      :class="styles['list-item-right-nofee']"
                      v-if="!feePermission && hasCustomerCode && item.restrictFlag !== '10'"
                    >
                      <text>¥***</text>
                    </view>
                  </template>
                </view>

                <!-- 延迟提示 -->
                <view v-if="item.delayTips && !item.expressTime && item.usableFlag !== '20'" :class="styles['list-item-arrive-tips']">
                  <text>{{ item.delayTips }}</text>
                </view>

                <!-- 违禁品说明 -->
                <view :class="styles['invalid-tips']" v-if="item.iconInfo && item.iconInfo.restrictType === '20'" @tap="handleProhibited">
                  <text :class="styles['invalid-tips-text']">违禁品说明</text><SvgIcon name="tip-blue" />
                </view>
              </view>
            </view>
          </view>
          <!-- 联系商务入口 -->
          <view :class="styles['contact-entry']" v-if="showSendPanel">
            <text :class="styles['contact-text']">预估费用仅供参考，实际以最终费用为准。如有疑问或想了解更多下单优惠，可随时 <text :class="styles['contact-link']" @tap="openContactPopup">联系商务 ＞</text></text>
          </view>
         </template>
        <!-- 不支持地区空状态 -->
        <view :class="styles['empty-state-area']" v-else-if="onlineCustomerInfo?.skipTips">
          <image
            :class="styles['empty-img']"
            :src="IMAGES.emptyArea"
            mode="aspectFit"
          />
          <text :class="styles['empty-desc']">{{ onlineCustomerInfo.skipTips }}</text>
          <ky-button
            :class="styles['empty-btn']"
            type="primary"
            size="normal"
            :text="onlineCustomerInfo.linkText"
            @tap="handleEmptyBtnTap"
          />
        </view>
        <!-- 普通空状态 -->
        <view :class="styles['empty-state']" v-else>
          <image :class="styles['empty-img']" :src="IMAGES.emptyNormal" mode="aspectFit" />
          <text :class="styles['empty-desc']">抱歉，暂无数据。点击【去反馈】告知我们，我们将持续优化！</text>
          <ky-button
            :class="styles['empty-btn']"
            type="primary"
            size="normal"
            text="去反馈"
            @tap="handleFeedback"
          />
        </view>
      </view>
    </view>

  </view>

  <!-- 费用明细弹窗 -->
  <DetailPopup
    ref="detailPopupRef"
    title="费用明细"
    :show-modal="true"
    :footer-section-height="0"
    :estimation-fee="detailPopupProps.estimationFee"
    :on-close="handleCloseDetail"
    :z-index="150"
  />
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import SvgIcon from '@order-global-package-freight-time/components/ui/svg-icon/index.vue'
import KyButton from '@order-global-package-freight-time/components/base/ky-button/index.vue'
import DetailPopup from '@order-global-package-freight-time/components/business/estimated-cost/components/detail-popup/index.vue'
import { useServiceMode } from './hooks/useServiceMode'
import { useFreightTimeStore } from '../../store'
import { IMAGES } from '../../constants/images'
import styles from './index.module.scss'
import type { ServiceType, RestrictResult, OnlineCustomerInfo } from '../../types'
import { useFreightFooter } from '../freight-footer/hooks/useFreightFooter'
const store = useFreightTimeStore()
const detailPopupRef = ref()

const props = defineProps<{
  result: ServiceType[]
  freightStatus: string
  sendCouponResult?: Record<string, any>
  restrictResult?: RestrictResult | null
  onlineCustomerInfo?: OnlineCustomerInfo | null
}>()

const emit = defineEmits<{
  (e: 'serviceIntro'): void
}>()

const {
  sortTimeClass,
  sortFeeClass,
  feePermission,
  showFeeSort,
  sortedList,
  formatFee,
  hasCustomerCode,
  handleSortTime,
  handleSortFee,
  handleProhibited,
  handleOnlineService,
  handleFeedback,
  detailItem,
  detailPopupProps,
} = useServiceMode(props)

const {
  showSendPanel,
  isNewCustomerNoAuth,
} = useFreightFooter()
const handleDetail = (item: ServiceType) => {
  detailItem.value = item
  nextTick(() => {
    detailPopupRef.value.show = true
  })
}

const handleCloseDetail = () => {
  detailItem.value = null
}

/** 有结果 或 有客服提示 或 无结果但允许空状态兜底时展示 */
const showContent = () => store.getHasSearched

const openContactPopup = () => {
  store.setShowContactPopup(true)
}

const handleEmptyBtnTap = () => {
  if (props.onlineCustomerInfo?.linkText === '联系商务') {
    openContactPopup()
  } else {
    handleOnlineService(props.onlineCustomerInfo.consultationMessage)
  }
}

</script>
