import { getRealtimeCorner } from '@/public/apis/application'
import { getEnvConfig } from '@/public/constants'
import { useGetAreaLightApp } from '@/public/hooks/useGetAreaLightApp'
import { useThrottleFetchLightApp } from '@/public/hooks/useThrottleFetchLightApp'
import { getToken } from '@/public/storage'
import { isAliMiniApp, report_CLK_event } from '@/public/utils'
import { AreaCodePlatMap, menuCodeMap, MenuCodeMap } from '@/public/utils/application/constants'
import { useApplication } from '@/public/utils/application/useApplication'
// import { openIntegralCenterHome } from '@modules/crm-marketing/utils/openIntegralHome'
import { computed, ref } from 'vue'
import { useRoleFlags } from '../../home/hooks'
import { useLogin } from '@/public/hooks'

const MINEPAGEEARES = [
  AreaCodePlatMap['我的-营销区一'],
  AreaCodePlatMap['我的-营销区二'],
  AreaCodePlatMap['我的-查寄助手'],
  AreaCodePlatMap['我的-常用功能新'],
  AreaCodePlatMap['我的-帮助反馈'],
]

export const useLightApp = () => {
  const useLightApp = () => {
    const getApps = (areaName: string) => useGetAreaLightApp(AreaCodePlatMap[areaName])

    return {
      lightApps: getApps('我的-查寄助手'),
      lightApps2: getApps('我的-常用功能新'),
      lightApps3: getApps('我的-帮助反馈'),
      lightApps4: getApps('我的-营销区二'),
      lightApps5: getApps('我的-营销区一'),
    }
  }

  const { isLogin } = useLogin()

  const { lightApps, lightApps2, lightApps3, lightApps4, lightApps5 } = useLightApp()

  const { activityParams } = useRoleFlags()

  const filteAlipayNoLoginApp = (apps) => {
    if (isAliMiniApp && !isLogin.value) {
      const filterMenuCode = ['M5401', 'M5405', 'M5427', 'M5417', 'M5413']
      return apps.filter((item) => !filterMenuCode.includes(item.menuCode))
    }
    return apps
  }

  const lightApp = computed(() => {
    const { isApp } = getEnvConfig()

    const alwaysUsed = isApp
      ? lightApps2.lightApps.value.filter(
          (i) =>
            i.menuCode !== MenuCodeMap['面对面签到H5'] &&
            i.menuCode !== MenuCodeMap['面对面签到新'] &&
            i.menuCode !== MenuCodeMap['消息订阅'],
        )
      : lightApps2.lightApps.value

    return [
      { areaName: lightApps.areaName.value, apps: filteAlipayNoLoginApp(lightApps.lightApps.value) },
      { areaName: lightApps2.areaName.value, apps: filteAlipayNoLoginApp(alwaysUsed) },
      { areaName: lightApps3.areaName.value, apps: filteAlipayNoLoginApp(lightApps3.lightApps.value) },
    ].filter((s) => s.apps.length)
  })

  const openLightApp = (applicationItem, areaName = '', jump = true) => {
    const { menuName } = applicationItem
    if (menuName && areaName) {
      if (areaName === 'first') {
        report_CLK_event('clk_home_card_first_button', {
          page_code: 'page_home_mine',
          region_code: 'marketing_area',
          button_name: menuName,
        })
      } else if (areaName === 'second') {
        report_CLK_event('clk_home_card_second_button', {
          page_code: 'page_home_mine',
          region_code: 'martketing_area',
          button_name: menuName,
        })
      } else {
        report_CLK_event('clk_home_function_button', {
          page_code: 'page_home_mine',
          region_code: 'common_functions',
          button_name: menuName,
          menu_name: areaName,
        })
      }
      // report_CLK_event('clk_home_express_card_second_button_v1', {
      //   button_name: menuName,
      // })
    }
    // 我的页营销区「积分」：直接使用联调 H5 地址
    // if (areaName === 'first' && applicationItem.menuName === '积分') {
    //   openIntegralCenterHome()
    //   return
    // }
    console.error('activityParams.value', activityParams.value)
    if (jump) {
      useApplication().navigateApplication(applicationItem, activityParams.value)
    }
  }

  const defaultMoneyMarks = {
    menuBackground: '',
    menuIconContent: '',
    menuIconType: null,
    smallIcon: '',
    smallIconContent: '',
    smallIconType: null,
  }

  const moneyMarks = ref({ ...defaultMoneyMarks })

  const getMoneyMarks = async () => {
    if (MenuCodeMap.我的预存运费 && getToken()) {
      const res = await getRealtimeCorner([MenuCodeMap.我的预存运费])
      const menuInfos = res.data.lightApplicationInfos
      if (menuInfos?.length === 1) {
        const info = menuInfos[0]
        moneyMarks.value = {
          menuBackground: info.menuBackground,
          menuIconContent: info.menuIconContent,
          menuIconType: info.menuIconType,
          smallIcon: info.smallIcon,
          smallIconContent: info.smallIconContent,
          smallIconType: info.smallIconType,
        }
      } else {
        moneyMarks.value = { ...defaultMoneyMarks }
      }
    } else {
      moneyMarks.value = { ...defaultMoneyMarks }
    }
  }

  const { throttleRun, forceRun } = useThrottleFetchLightApp(MINEPAGEEARES)

  const marketAreaLightApp = computed(() => {
    if (!menuCodeMap.我的预存运费) return lightApps5.lightApps.value
    return lightApps5.lightApps.value.map((item) => {
      if (item.menuCode === MenuCodeMap.我的预存运费) {
        return {
          ...item,
          ...moneyMarks.value,
        }
      }
      return item
    })
  })

  const clearMoneyMark = () => {
    moneyMarks.value = { ...defaultMoneyMarks }
  }

  return {
    throttleRun,
    forceRun,
    lightApp,
    openLightApp,
    buyStockLightApp: lightApps4.lightApps,
    marketAreaLightApp: marketAreaLightApp,
    getMoneyMarks,
    clearMoneyMark,
  }
}
