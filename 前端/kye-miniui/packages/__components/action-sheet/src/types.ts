import { PopupProps } from '@packages/__components/popup/src/types'

export type MenuItems = {
  name: string
  subName: string
  color: string
  loading: boolean
  disable: boolean
}
export type ActionSheetProps = PopupProps &
  Partial<{
    /**
     * popup 是否展示
     */
    show: boolean
    /**
     * popup 层级
     */
    zIndex: number
    /**
     * popup 遮罩是否支持点击关闭
     */
    closeOnClickOverlay: boolean
    /*
     * popup-底部安全距离
     * @default true
     * */
    safeAreaInsetBottom: boolean
    /**
     * 底部菜单数组对象
     */
    menuItems: MenuItems[]
    /**
     * 顶部title
     */
    title: string
    description: string
    /**
     * 取消文案
     * @default: 取消
     */
    cancelTxt: string
    /**
     * 设置列表项标题展示使用参数
     */
    optionTag: string
    /**
     * 设置列表项二级标题展示使用参数
     */
    optionSubTag: string
  }>
