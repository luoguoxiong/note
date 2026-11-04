/** 菜单角标项（对齐老项目 MenuCorner，netc-pc-web src/store/modules/menus.js） */
export interface CornerItem {
  /** 角标 ID（点击上报用） */
  cornerId: number
  /** 角标编码 */
  code: string
  /** 样式：1-自定义图片；2-数字微标；30-常规红点；40-气泡文案 */
  style: number
  /** 自定义样式图片链接（style=1） */
  pictureLink?: string
  /** 文案内容（style=2 显示数字，style=40 显示文案） */
  content?: string
  /** 关联的菜单 id 列表（真实接口返回 number[]，本地 mock 为 string[]） */
  menuIdList: Array<string | number>
}
