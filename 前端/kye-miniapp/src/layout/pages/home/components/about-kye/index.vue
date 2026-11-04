<template>
  <view class="about-kye">
    <view class="about-kye__title">
      <network-image
        class="about-kye__title-image"
        src="https://ic-img.ky-express.com/netc/20250705_7586_!!1751696516206_312_76.png"
      />
      <text class="about-kye__title-sub">科技物流，为业务赋能</text>
    </view>
    <view
      class="about-kye__container"
      id="about-kye-ex"
      v-exposure
      :exposure-report="{
        eventCode: 'exp_homepage_understand_v1',
        otherParams: {
          page_code: 'page_homepage_v1',
          region_code: 'understand_kye',
          event_name: '移动端新版首页_了解跨越_曝光',
          region_name: '了解跨越',
          access_name: aboutKyeData.map((item) => item.title).join('、'),
        },
      }"
    >
      <view
        v-for="(item, index) in aboutKyeData"
        :key="item.title"
        class="about-kye__container-item"
        @click="toDetail(index)"
      >
        <view class="about-kye__bg-inner">
          <PreloadImage
            :src="item.bannerImg"
            :placeholder="placholderPng"
            @load="handleLoad(index)"
            class="about-kye__bg"
          ></PreloadImage>
          <view class="about-kye__container-item__title" v-if="loadImg[index]">{{ item.title }}</view>
          <view class="about-kye__container-item__desc" v-if="loadImg[index]">{{ item.subTitle }}</view>
        </view>
      </view>
    </view>
    <view
      v-if="isLogin && isNew"
      class="about-kye__footer"
      id="about-kye-button-exp"
      v-exposure
      :exposure-report="{
        eventCode: 'exp_homepage_customer_button_v1',
        otherParams: {
          page_code: 'page_homepage_v1',
          region_code: 'understand_kye',
          event_name: '移动端新版首页_新客按钮_曝光',
          region_name: '了解跨越',
          access_name: `去绑码、${hasSale ? '联系商务' : '申请专属商务'}`,
        },
      }"
    >
      <ky-button class="about-kye__footer-button" plain type="primary" size="large" @click="handleBindCode">{{
        bindText
      }}</ky-button>
      <ky-button class="about-kye__footer-button" size="large" type="primary" @click="handleContactBusiness">
        {{ hasSale ? '联系商务' : '申请专属商务' }}
      </ky-button>
    </view>
    <view v-else class="about-kye__footer">
      <ky-button class="about-kye__footer-button" size="large" type="primary" @click="handleLogin">登录/注册</ky-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro from '@tarojs/taro'
import { ApplicationCodeMap } from '../../../../../public/utils/application/constants'
import { useApplication } from '@/public/utils/application/useApplication'
import { useRoleFlags } from '../../hooks'
import PreloadImage from '@/public/components/base/preload-image/index.vue'
import { computed, ref, unref } from 'vue'
import placholderPng from './placholder.png'
import { useHomeStore } from '../../store'
import './index.scss'
import plateform from '@kye-netc/plateform'
import { useExposureReport } from '@/public/hooks/useExposureReport'
import { reportAboutKyeClick, reportCustomerClick, reportToLogin } from '../../report'
import { useUpdateSomeUserInfoV1 } from '@/public/hooks/useUpdateSomeUserInfoV1'

defineOptions({ name: 'about-kye' })

useExposureReport(['about-kye-ex', 'about-kye-button-exp'])
const emits = defineEmits(['show-contact-business'])

const { globalUserStore } = useUpdateSomeUserInfoV1()

const { isLogin, isNew, hasSale } = useRoleFlags()

const { navigateApplicationWithCode } = useApplication()

const loadImg = ref([false, false, false, false])

const handleLoad = (index) => {
  loadImg.value[index] = true
}

const handleBindCode = () => {
  reportCustomerClick('去绑码')
  const { areaCode, menuCode } = ApplicationCodeMap['绑码组件']
  navigateApplicationWithCode({
    areaCode,
    menuCode,
    queryParams: { express_type: '首页' },
  })
}

const toDetail = (index: number) => {
  reportAboutKyeClick(aboutKyeData.value[index].title)
  Taro.preload({ aboutKyeData: unref(store.data.aboutKyeData) })
  Taro.navigateTo({
    url: `/modules/cms-template/pages/about-kye/index?activeTab=${index}&isLogin=${isLogin.value ? 1 : 0}&isNew=${isNew.value ? 1 : 0}&hasSale=${hasSale.value ? 1 : 0}`,
  })
}

const handleLogin = () => {
  reportToLogin()
  Taro.navigateTo({ url: '/modules/user/pages/login/index?delta=2' })
}

const handleContactBusiness = () => {
  reportCustomerClick(hasSale.value ? '联系商务' : '申请专属商务')

  if (!isLogin.value) {
    plateform.makePhoneCall({ phoneNumber: '95324' })
    return
  }

  if (hasSale.value) {
    emits('show-contact-business')
  } else {
    navigateApplicationWithCode({ ...ApplicationCodeMap['首页-申请专属商务'], queryParams: { express_type: '首页' } })
  }
}

const store = useHomeStore()

const bindText = computed(() => {
  const { hasCurBind, bindAuth, existedRelationBind } = globalUserStore.data?.customerInfo || {}
  // 没有当前绑定
  if (!hasCurBind) {
    return bindAuth && existedRelationBind ? '去切换' : '去绑码'
  }
  // 有当前绑定
  return bindAuth || existedRelationBind ? '去切换' : '去更换'
})

const aboutKyeData = computed(() => {
  return (store.data.aboutKyeData || []).slice(0, 4)
})
</script>
