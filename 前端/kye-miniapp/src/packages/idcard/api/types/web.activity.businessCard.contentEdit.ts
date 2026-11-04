/** 注意: 前端无(long类型), 有丢失精度风险*/
interface EditIdcardContentRequest {
  /** 名片Id */
  businessCardId: number | string
  /** 菜单数据 */
  contentList: EditIdcardContentRequestContent[]
  /** cms菜单Id */
  menuId: number
}

/** 注意: 前端无(long类型), 有丢失精度风险*/
interface EditIdcardContentRequestContent {
  /** cms内容Id */
  contentId: number | string
  /** 内容显示开关 */
  showSwitch: boolean
  /** 排序（倒序） */
  sort: number
}
