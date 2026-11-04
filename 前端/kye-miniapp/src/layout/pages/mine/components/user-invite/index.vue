<template>
  <view class="mine-user-invite mine-user-invite-bg">
    <view class="mine-user-invite-content">
      <view class="mine-user-invite-title">1v1商务为您定制服务方案</view>
      <view class="mine-user-invite-desc-wrap">
        <view class="mine-user-invite-item">7x24小时响应</view>
        <view class="mine-user-invite-item mid-item">企业专属报价</view>
        <view class="mine-user-invite-item">全程管家式服务</view>
      </view>
      <ky-button class="mine-user-invite-btn" type="primary" @click="handleClick">
        <ky-lazy-image
          :delay="1000"
          v-show="hasLeadCaptureActivity"
          :class="['hb-icon', !isIosEnv && 'bottom-0']"
          src="https://ic-img.ky-express.com/netc/20260424_584_!!1777014612413_290_214.png"
          alt=""
        />
        <view
          id="mine-user-invite-btn-exp"
          v-exposure
          :exposure-report="{
            eventCode: 'exp_home_express_service_v1',
            otherParams: {
              page_code: 'page_home_mine',
              region_code: 'top_service',
              region_name: '专属服务',
              event_name: '移动端新版我的页_获取专属服务方案_曝光',
              page_name: '移动端新版我的页',
            },
          }"
        >
          获取专属服务方案
        </view>
        <ky-lazy-image
          :delay="1000"
          class="arrow-icon"
          src="https://ic-img.ky-express.com/netc/20260408_17096_!!1775641449552_14_18.svg+xml"
          alt=""
        />
        <ky-lazy-image
          v-show="hasLeadCaptureActivity"
          class="flag-icon"
          :delay="1000"
          src="https://ic-img.ky-express.com/netc/20260408_45648_!!1775641050779_176_40.svg+xml"
          alt=""
        />
      </ky-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useRoleFlags } from '@/layout/pages/home/hooks/use-role-flags'
import { useApplication } from '@/public/utils/application/useApplication'
import { ApplicationCodeMap } from '@/public/utils/application/constants'
import { report_CLK_event } from '@/public/utils/reportUtil'
import { isIosEnv } from '@/public/utils/device'
import { useExposureReport } from '@/public/hooks/useExposureReport'

import './index.scss'

useExposureReport(['mine-user-invite-btn-exp'])

const { hasLeadCaptureActivity, activityParams } = useRoleFlags()
const { navigateApplicationWithCode } = useApplication()

// 申请专属商务
const handleClick = () => {
  report_CLK_event('clk_home_mine_service_v1', {
    event_code: 'clk_home_mine_service_v1',
    page_code: 'page_home_mine',
    region_code: 'top_service',
    region_name: '专属服务',
    event_name: '移动端新版我的页_获取专属服务方案_点击',
    page_name: '移动端新版我的页',
  })
  navigateApplicationWithCode({
    ...ApplicationCodeMap['首页-申请专属商务'],
    queryParams: {
      express_type: '我的页面',
      sendCouponSource: 30,
      backSence: 10,
      ...activityParams.value,
    },
  })
}
</script>
