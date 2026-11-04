<template>
  <ky-container v-bind="pageOptions" class="about-kye-container">
    <ContactBusiness v-model:show="popupVisible" :phone="userInfo?.phone" />
    <view class="about-kye-page">
      <ky-tab
        ref="tabRef"
        v-if="tabs.length"
        :class="{
          'web-scrollbar': isH5Pc,
        }"
        :tabs="tabs"
        v-model="activeTab"
      ></ky-tab>
      <scroll-view :scroll-y="true" class="about-kye__scroll-view">
        <image mode="aspectFill" class="about-kye__cover-image" :src="cms[activeTab]?.coverImg || ''" />
        <view class="about-kye__content">
          <rich-text :nodes="vwToRem(cms[activeTab]?.content || '')"></rich-text>
        </view>
      </scroll-view>
      <view v-if="isLogin && isNew" class="about-kye__footer">
        <ky-button class="about-kye__footer-button" plain type="primary" size="large" @click="handleBindCode">
          去绑码
        </ky-button>
        <ky-button class="about-kye__footer-button" size="large" type="primary" @click="handleContactBusiness">
          {{ hasSale ? '联系商务' : '申请专属商务' }}
        </ky-button>
      </view>
    </view>
  </ky-container>
</template>

<script lang="ts" setup>
import ContactBusiness from '@/public/components/business/contact-business/index.vue'
import { navigateWithParams } from '@/layout/pages/home/hooks'
import { useLogin, useUserInfo } from '@/public/hooks'
import { ApplicationCodeMap } from '@/public/utils/application/constants'
import Taro, { useDidShow, useLoad, useRouter } from '@tarojs/taro'
import { computed, onMounted, ref } from 'vue'
import * as Apis from '@/layout/pages/home/apis/index'
import { config } from '@/layout/pages/home/config'
import './index.scss'
import { useAutoLogin } from '@/public/utils/user/useAutoLogin'
import { vwToRem, isH5Pc } from '@/public/utils'

defineOptions({ name: 'about-kye-index' })

const router = useRouter()
const { autoLoginHook } = useAutoLogin()

const activeTab = ref<number>(0)
const tabRef = ref()

const pageOptions = ref({
  navBarOptions: { showPlatList: ['wx'], title: '跨越速运' },
  scrollOptions: {
    scrollViewPlatList: [],
  },
})

useLoad((params) => {
  activeTab.value = Number(params.activeTab) || 0
  tabRef.value?.updateUnderline?.(activeTab.value)
})

type CMSContent = Array<{
  title: string
  menuId?: number
  templateCode?: string
  link?: string
  sort?: string | number
  timeStamp?: string | number
  bannerImg: string
  coverImg: string
  content: string
  subTitle: string
}>

const cms = ref<CMSContent>([])

const tabs = computed(() =>
  cms.value.map((i, index) => ({
    label: i.title,
    id: index,
    badgeCount: 0,
  })),
)

const popupVisible = ref<boolean>(false)
const { userInfo } = useUserInfo()
const { isLogin } = useLogin()
const isNew = ref(false)
const hasSale = ref(false)

const getStatusByApi = async () => {
  try {
    const res = (await autoLoginHook()) as any
    isNew.value = `${res.isOldCustomer}` === `${0}`
  } finally {
    if (isLogin.value) {
      const { data } = await Apis.getHomepageTask({ channel: config.channelCode })
      hasSale.value = data?.userLabel?.bindSalesFlag === '10'
    } else {
      isNew.value = false
      hasSale.value = false
    }
  }
}
useDidShow(async () => {
  if (router.params?.isNew && router.params?.hasSale) {
    isNew.value = 1 === +router.params?.isNew
    hasSale.value = 1 === +router.params?.hasSale
  } else {
    getStatusByApi()
  }
})

onMounted(async () => {
  const instance = Taro.getCurrentInstance()
  const preloadData = instance?.preloadData?.aboutKyeData

  if (preloadData) {
    cms.value = preloadData
    return
  }

  const { data } = await Apis.getCMSConfigJson({})
  const configs = data?.configs || []

  for (const item of configs) {
    const { cmsContent, moduleCode } = item
    if (!cmsContent) continue
    if (moduleCode !== 'business_intro') continue

    try {
      cms.value = JSON.parse(cmsContent)
    } catch (err) {
      console.error('Failed to parse cmsContent:', err)
    }
  }
})

const handleBindCode = () => {
  const { areaCode, menuCode } = ApplicationCodeMap['绑码组件']
  navigateWithParams(
    {
      areaCode,
      menuCode,
    },
    { express_type: '了解跨越' },
  )
}

const handleContactBusiness = () => {
  if (hasSale.value) {
    popupVisible.value = true
  } else {
    navigateWithParams(ApplicationCodeMap['首页-申请专属商务'], { express_type: '了解跨越' })
  }
}
</script>
