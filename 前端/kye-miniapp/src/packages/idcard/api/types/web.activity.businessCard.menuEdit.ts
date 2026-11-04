/** 注意: 前端无(long类型), 有丢失精度风险*/
interface MenuEditRequest {
  /** 名片Id */
  businessCardId: number | string
  /** 菜单数据 */
  menuList: MenuEditMenuItem[]
}

/** 注意: 前端无(long类型), 有丢失精度风险*/
interface MenuEditMenuItem {
  /** cms菜单Id */
  menuId: number | string
  /** 菜单显示开关 */
  showSwitch: boolean
  /** 排序（倒序） */
  sort: number
}
