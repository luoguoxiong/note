import { ApplicationCodeMap } from '@public/utils/application/constants'
import { useLoginPublicParmas } from '@modules/user/pages/login/components/phone-login/hooks'
import { loginFromType } from '@modules/user/constants'
import { getApplicationFullUrlAsync, getClickId, report_CLK_event } from '@public/utils'
import kyeNavigate from '@public/utils/native/navigate'

/**
 * @Desc: useLoginSwitch
 * @Date: 2025/7/19
 */
export const useLoginSwitchSetting = () => {
  /* 切换登录手机号 */
  const handleChangeLogin = () => {
    report_CLK_event('clk_mine_setting_button', {
      page_code: 'page_mine_seting',
      pageName: '设置页',
      button_name: '切换登录手机号',
    })
    handleChangeLoginH5()
  }

  const handleChangeLoginH5 = () => {
    // 强制关闭心跳检测 - 避免切换账号导致用户失效
    const { areaCode, menuCode } = ApplicationCodeMap['用户-切换登录手机号']
    const { deviceType, deviceCode, systemVersion, version } = useLoginPublicParmas()
    const applicationUrl = getApplicationFullUrlAsync(areaCode, menuCode, {
      deviceType: deviceType,
      deviceCode: deviceCode,
      from: loginFromType,
      xEnvid: 2497, // TODO 泳道配置-待移除
      systemVersion,
      pre_click_id: getClickId(),
      version,
    })

    kyeNavigate.navigateTo({
      url: `/modules/user/pages/changeLogin/index?url=${encodeURIComponent(applicationUrl)}&needLogin=true`,
    })
  }
  // const handleChangeLoginNative = () => {
  //   // TODO 跳转切换原生-不支持验证码
  //   kyeNavigate.navigateTo({
  //     url: '/modules/user/pages/changeLogin/index?needLogin=true',
  //   })
  // }
  return {
    handleChangeLogin,
  }
}
