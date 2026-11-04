import { Interceptor } from '@packages/utils/src/interceptor'

export type KyNavbarPlatform = 'wx' | 'alipay' | 'h5'

export interface KyNavBarProps {
  /**
   * 顶部中间title
   */
  title?: string
  /**
   * 自定义导航高度 (暂未使用)
   * @default
   */
  height?: string
  /**
   * 左侧文案
   */
  leftText?: string
  /**
   * 右侧文案
   */
  rightText?: string
  /**
   * 是否显示下边框
   */
  border?: boolean
  /**
   * 导航栏层级z-index
   */
  zIndex?: number
  /**
   * 固定在顶部时，是否在标签位置生成一个等高的占位元素
   * @default: true
   */
  placeholder?: boolean
  /**
   * 默认开启环境-支付宝/微信
   * @default ['wx', 'alipay']
   */
  showPlatList?: KyNavbarPlatform[]
  /**
   * 首页链接-用于返回按钮无上一页情况
   */
  backPath?: string
  /**
   * 返回前逻辑(支持boolean + promise)
   */
  beforeBack: Interceptor | undefined
  /**
   * 是否显示左侧箭头
   * 注：支付宝箭头始终展示 (支付宝无效,始终展示：见https://opendocs.alipay.com/mini/07535r?pathHash=a54e002c)
   * @dfault: true
   */
  leftArrow?: boolean
  /**
   * 左侧箭头图标自定义（支付宝不支持）
   */
  leftArrowIcon?: string
}
