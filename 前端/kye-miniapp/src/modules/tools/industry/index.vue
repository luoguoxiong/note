<template>
  <ky-container v-bind="pageOptions" class="about-kye-container">
    <view class="about-kye-page">
      <ky-tab
        ref="tabRef"
        underlineFirstAnimation
        :no-animation="false"
        :dynamicTab="true"
        v-if="tabs.length"
        :class="{
          'web-scrollbar': isH5Pc,
          'about-kye-tab': true,
        }"
        :tabs="tabs"
        v-model="activeTab"
      ></ky-tab>
      <swiper class="about-kye__swiper" :current="activeTab" :duration="300" @change="handleSwiperChange">
        <swiper-item v-for="(item, index) in cms" :key="index">
          <scroll-view :scroll-y="true" class="about-kye__scroll-view">
            <view class="about-kye__content">
              <rich-text :nodes="vwToRem(item.content || '')"></rich-text>
            </view>
          </scroll-view>
        </swiper-item>
      </swiper>
      <FooterBar
        class="about-kye__footer-bar"
        :isLogin="footerBarState.isLogin"
        :isOlderCustomer="footerBarState.isOlderCustomer"
        :hasLeadCapture="footerBarState.hasLeadCapture"
        :hasLeadCaptureActivity="footerBarState.hasLeadCaptureActivity"
        :hasCompanyWx="footerBarState.hasCompanyWx"
        backPage="industry"
        expressType="行业解决方案"
        @login="handleFooterLoginClick"
        @plan="handleFooterPlanClick"
        @contact="handleFooterContactClick"
        @add-qy-wechat="handleFooterBindCodeClick"
      />
    </view>
  </ky-container>
</template>

<script lang="ts" setup>
import FooterBar from '@/modules/tools/components/footer-bar/index.vue'
import { useLoad } from '@tarojs/taro'
import { computed, ref, toRefs, watch } from 'vue'
import './index.scss'
import { vwToRem, isH5Pc } from '@/public/utils'
import { reportIndustrySolutionsCaseTabClick, reportIndustrySolutionsFooterButtonClick } from './report'
import { useHomeStore } from '@/layout/pages/home/store'
import { useLogin } from '@/public/hooks'
import { useRoleFlags } from '@/layout/pages/home/hooks'

defineOptions({ name: 'about-kye-index' })

// ========= 登录状态 =========
const { isLogin } = useLogin()

const homeStore = useHomeStore()

const { isNew, hasLeadCapture, hasLeadCaptureActivity, hasBusinessQrcode } = useRoleFlags()

const { data: preloadData } = toRefs(homeStore)

const activeTab = ref<number>(0)
const tabRef = ref()

const pageOptions = ref({
  navBarOptions: { showPlatList: ['wx'], title: '行业解决方案' },
  scrollOptions: {
    scrollViewPlatList: [],
  },
})

const cms = computed(() => {
  return preloadData.value.industryInfo
})

const tabs = computed(() => {
  return cms.value.map((i, index) => ({
    label: i.title,
    id: index,
    badgeCount: 0,
  }))
})

const hasReportedPageEntry = ref(false)

const getTabNameByIndex = (index: number) => tabs.value[index]?.label || ''

const reportTabClick = (index: number) => {
  const safeIndex = tabs.value[index] ? index : 0
  const tabName = getTabNameByIndex(safeIndex)
  if (!tabName) return false
  reportIndustrySolutionsCaseTabClick(tabName)
  return true
}

const ensureIndustryTabsReady = async () => {
  await homeStore.loadFromStorage()

  if (!tabs.value.length) {
    await homeStore.getCMSConfigJson()
  }
}

const reportPageEntryTab = () => {
  if (hasReportedPageEntry.value) return

  hasReportedPageEntry.value = reportTabClick(activeTab.value)
}

const handleSwiperChange = (e: any) => {
  const current = Number(e.detail?.current ?? 0)
  if (current !== activeTab.value) {
    activeTab.value = current
  }
}

useLoad(async (params) => {
  const nextActiveTab = Number(params.activeTab)
  activeTab.value = Number.isFinite(nextActiveTab) ? nextActiveTab : 0

  await ensureIndustryTabsReady()

  tabRef.value?.updateUnderline?.(activeTab.value)
  reportPageEntryTab()
})

const footerBarState = computed(() => {
  return {
    isLogin: isLogin.value,
    isOlderCustomer: !isNew.value,
    hasLeadCapture: hasLeadCapture.value,
    hasLeadCaptureActivity: hasLeadCaptureActivity.value,
    hasCompanyWx: hasBusinessQrcode.value,
  }
})

const handleFooterLoginClick = () => {
  reportIndustrySolutionsFooterButtonClick('登录/注册')
}

const handleFooterPlanClick = () => {
  reportIndustrySolutionsFooterButtonClick('获取专属服务方案')
}

const handleFooterContactClick = () => {
  reportIndustrySolutionsFooterButtonClick('联系商务')
}

const handleFooterBindCodeClick = () => {
  reportIndustrySolutionsFooterButtonClick('添加企微')
}

watch(activeTab, (newVal, oldVal) => {
  if (!hasReportedPageEntry.value) return
  if (newVal === oldVal) return
  reportTabClick(newVal)
})
</script>
