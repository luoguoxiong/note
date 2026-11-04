<template>
  <view
    class="light-app"
    id="light-app-exp"
    v-exposure
    :exposure-report="{
      eventCode: 'exp_homepage_functional_area_v1',
      otherParams: {
        page_code: 'page_homepage_v1',
        region_code: 'functional_area',
        event_name: '移动端新版首页_金刚区_曝光',
        region_name: '金刚区',
        access_name: showList.map((item) => item.menuName).join('、'),
        customer_name: '老客',
      },
    }"
  >
    <LightAppItem
      v-for="(item, index) in showList"
      :key="item.menuCode"
      :index="index"
      :menuIcon="item.menuIcon"
      :menuName="item.menuName"
      :menuBackground="item.menuBackground"
      :badgeType="getBadgeType(item)"
      :guideText="item.guideText"
      :text="item.smallIconContent"
      :tag="item.smallIcon"
      :guideKey="item.guideKey"
      @open="() => onClick(item)"
    />
  </view>
</template>

<script setup>
import LightAppItem from './item.vue'
import { useHomeStore } from '../../store'
import { computed } from 'vue'
import './index.scss'
import { navigateWithParams } from '../../hooks'
import { ApplicationCodeMap } from '@/public/utils/application/constants'
import { useApplication } from '@/public/utils/application/useApplication'
import { debounce } from 'lodash-es'
import { isH5FSEnv, report_CLK_event } from '@/public/utils'
import { useExposureReport } from '@/public/hooks/useExposureReport'

const { navigateApplicationExtra } = useApplication()

useExposureReport(['light-app-exp'])

defineOptions({ name: 'light-app' })

const toSettingPage = () => {
  navigateWithParams(ApplicationCodeMap['首页轻应用编辑'])
}

const homeStore = useHomeStore()

const lightAppData = computed(() => {
  return homeStore.data.lightAppData || []
})

const showList = computed(() => [
  ...(lightAppData.value || []),
  ...(!isH5FSEnv
    ? [
        {
          menuIcon: 'https://ic-img.ky-express.com/netc/20250705_7370_!!1751697674171_96_96.png',
          menuName: '全部功能',
          menuCode: 'all',
          guideText: ['自定义菜单功能上线啦！', '查寄助手、客户支持、帮助反馈类菜单按需调整~'].join('\n'),
          guideKey: 'light-app-guide-flag',
          onClick: () => toSettingPage(),
        },
      ]
    : []),
])

const getBadgeType = (item) => {
  if (item.smallIconType === 10 || item.smallIconType === 0) {
    return 'tag'
  }
  if (item.smallIconType === 20) {
    return 'text'
  }
  return undefined
}

const onClick = debounce((item) => {
  if (item.onClick) {
    return item.onClick(item)
  } else {
    report_CLK_event('clk_homepage_functional_area_button_v1', {
      page_code: 'page_homepage_v1',
      event_code: 'clk_homepage_functional_area_button_v1',
      region_name: '金刚区',
      region_code: 'functional_area',
      event_name: '查看客户端首页-金刚区菜单入口_点击',
      customer_name: '老客',
      access_name: item.menuName,
    })
    navigateApplicationExtra(item, {}, function (app) {
      homeStore.updateHomeOneApplication(app)
    })
  }
}, 100)
</script>
