<template>
  <view
    class="company-info"
    id="company-info-exp"
    v-exposure
    :exposure-report="{
      eventCode: 'exp_homepage_company_profile_v1',
      otherParams: {
        page_code: 'page_homepage_v1',
        region_code: 'company_profile',
        event_name: '移动端新版首页_公司简介_菜单入口曝光',
        region_name: '公司简介',
      },
    }"
  >
    <view class="company-info-title">公司简介</view>
    <view
      :class="{
        'rich-wrap': true,
        open: isOpen,
      }"
    >
      <view class="rich-content">
        <rich-text :nodes="content" :key="netwrok.randowKey"></rich-text>
      </view>
      <view class="rich-open" @click="handleOpen">
        {{ isOpen ? '收起' : '展开' }}
        <network-image
          :class="`arrow ${isOpen ? 'rotate' : ''}`"
          src="https://ic-img.ky-express.com/netc/20250308_1970395176_!!1741400314949_56_56.png"
        ></network-image>
      </view>
    </view>
  </view>
</template>
<script lang="ts" setup>
import { computed, ref, toRefs } from 'vue'
import './index.scss'
import { useHomeStore } from '../../store'
import { useNetworkStore } from '@/store/useNetworkStore'
import { reportCompanyProfileClick } from '../../report'
import { useExposureReport } from '@/public/hooks/useExposureReport'

useExposureReport(['company-info-exp'])

const netwrok = useNetworkStore()
const homeStore = useHomeStore()

const { data } = toRefs(homeStore)

const content = computed(() => data.value.companyInfo?.content)

const isOpen = ref(false)

const handleOpen = () => {
  reportCompanyProfileClick({
    access_name: isOpen.value ? '收起' : '展开',
  })
  isOpen.value = !isOpen.value
}
</script>
