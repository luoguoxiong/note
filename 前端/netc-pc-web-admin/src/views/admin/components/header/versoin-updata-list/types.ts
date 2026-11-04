/**
 * 版本更新列表类型定义
 * 来源: netc-pc-web/src/views/versoin-updata-list (getHistoryVersionList 出参结构)
 */

/** 版本更新列表行数据(web.version.clientWebVersionManager.getHistoryVersionList) */
export interface VersionRow {
  /** 版本号 */
  versionNo: string
  /** 上线时间(毫秒时间戳) */
  startupTime: string | number
  /** 富文本头 */
  htmlHead?: string
  /** 富文本正文 */
  content?: string
  /** 富文本尾 */
  htmlFooter?: string
  /** 兼容老消息结构字段 */
  messageReadState?: number
  messageSerialNumber?: string
  [key: string]: any
}

/** 版本列表 tab 分类(老项目仅占位, 恒为空对象) */
export interface VersionTabItem {
  label?: string
  value?: string | number
  isHaveNewMessage?: boolean
  unreadCount?: number
  [key: string]: any
}

/** 版本列表分页数据 */
export interface VersionPageData {
  page: number
  pageSize: number
  pageTotal: number
  rowTotal: number
  rows: VersionRow[]
}
