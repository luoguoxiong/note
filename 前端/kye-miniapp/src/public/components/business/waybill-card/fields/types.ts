export interface FieldProps {
  /** 字段标识 */
  code: string
  /** 字段名称 */
  name: string
  /** 运单数据 */
  waybillData: any
  /** 是否内联展示时间状态标签 */
  showTags?: boolean,
  // 当前选中的二级tab
  activeStatusTab: number
}
