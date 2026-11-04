/**
 * 卡片配置版本号（get/save/switch 统一使用）
 * 新增字段类需求时由后端 initStandardConfig 落新版本标准配置，此处同步升级
 */
export const CARD_CONFIG_VERSION = 'payModeVersion'

/** 卡片配置相关图片资源 */
export const WAYBILL_CONFIG_IMAGES = {
  warning: 'https://ic-img.ky-express.com/netc/20260702_36428_!!1782998042182_48_48.png',
  arrow: 'https://ic-img.ky-express.com/netc/20260702_17767_!!1782998035076_48_48.png',
  statusArrow: 'https://ic-img.ky-express.com/netc/20260703_4459_!!1783047050277_52_52.png',
  plus: 'https://ic-img.ky-express.com/netc/20260703_47698_!!1783070688215_56_56.png',
  close: 'https://ic-img.ky-express.com/netc/20260721_40759_!!1784626105635_64_64.png',
  edit: 'https://ic-img.ky-express.com/netc/20260706_62791_!!1783319602671_56_56.png',
  sort: 'https://ic-img.ky-express.com/netc/20260706_7997_!!1783324959255_56_56.png',
  reload: 'https://ic-img.ky-express.com/netc/20260707_16214_!!1783413388959_56_56.png',
  receiveService: 'https://ic-img.ky-express.com/netc/20260708_6154_!!1783502755504_176_68.png',
  search: 'https://ic-img.ky-express.com/netc/20260708_79425_!!1783511784978_48_48.png',
  guide: 'https://ic-img.ky-express.com/netc/20260708_13678_!!1783501470946_1125_12852.webp',
  unsort:'https://ic-img.ky-express.com/netc/20260713_49510_!!1783930551365_56_56.png',
  tips: 'https://ic-img.ky-express.com/netc/20260727_17076_!!1785150513129_44_44.png'
}

/**
 * 运单状态枚举（值为后端状态码，卡片配置用）
 * 数值与 waybill-search-header/constant.ts 的 EWaybillStatus 保持同步，
 * 两者通过数值桥接（waybill-search/index.vue 中 getConfigByStatus(displayStatus)）。
 */
export enum WAYBILL_CONFIG_STATUS {
  /** 待揽件 */
  WAIT_PICKUP = 20,
  /** 待签收 */
  WAIT_SIGN = 30,
  /** 已签收 */
  SIGNED = 40,
  /** 全部（聚合视图，后端返回默认配置，配置页暂不支持个性化） */
  ALL = 100,
}

/** 运单状态 - 文案映射 */
export const WAYBILL_CONFIG_STATUS_LABELS: Record<WAYBILL_CONFIG_STATUS, string> = {
  [WAYBILL_CONFIG_STATUS.WAIT_PICKUP]: '待揽件',
  [WAYBILL_CONFIG_STATUS.WAIT_SIGN]: '待签收',
  [WAYBILL_CONFIG_STATUS.SIGNED]: '已签收',
  [WAYBILL_CONFIG_STATUS.ALL]: '全部',
}

/** 配置页模式：add 新增 / edit 编辑 */
export enum ConfigMode {
  ADD = 'add',
  EDIT = 'edit',
}
