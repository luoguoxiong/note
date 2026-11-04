import { KyNavbarPlatform, KyNavBarProps } from '@packages/__components/navbar/src/types'
import { NetworkWeakType } from './hooks/useNetWorkHook'

export type KyContainerProps = Partial<{
  // 顶部导航配置
  navBarOptions: KyNavBarProps
  scrollOptions: {
    // 开启scroll-view的平台,支持按端配置
    scrollViewPlatList: KyNavbarPlatform[]
  }
  // 埋点配置
  reportOptions?: Partial<{
    // 页面pv曝光（缺）
    pageCode: string
    // 自定义onErrorCaptured
    errorCaptured: () => void
  }>
  // 分享配置(小程序)
  toolOptions: {
    /**
     * 是否隐藏转发按钮(微信)、支付宝隐藏分享
     * @default 默认关闭
     */
    isHideShareMenu?: boolean
    title?: string
    path?: string
  }
  /* 错误检测 */
  errorCheck?: Partial<{
    // 监听弱网状态变化事件 (触发时机:有网》无网，无网》有网, 初始化无网)
    onNetworkWeakChange: (e: NetworkWeakType) => void
  }>
  // /* 登录配置 */
  // loginOptions?: {
  //   needLogin: boolean
  // }
}>
