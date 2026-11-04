/**
 * @description 取派管控不同状态的图标TODO
 */
export const PickerLimitMap = {
  10: {
    iconUrl: 'https://ic-img.ky-express.com/netc/20250619_4185_!!1750307145896_150_150.png',
  },
  20: {
    iconUrl: 'https://ic-img.ky-express.com/netc/20250619_62988_!!1750307149712_150_150.png',
  },
  30: {
    iconUrl: 'https://ic-img.ky-express.com/netc/20250619_14319_!!1750307153281_150_150.png',
  },
  40: {
    iconUrl: 'https://ic-img.ky-express.com/netc/20250619_25043_!!1750307156944_150_150.png',
  },
  50: {
    iconUrl: 'https://ic-img.ky-express.com/netc/20250619_51315_!!1750307161989_150_150.png',
  },
  60: {
    iconUrl: 'https://ic-img.ky-express.com/netc/20250619_61312_!!1750307165462_150_150.png',
  },
  70: {
    iconUrl: 'https://ic-img.ky-express.com/netc/20250619_1989_!!1750307169394_150_150.png',
  },
  80: {
    iconUrl: 'https://ic-img.ky-express.com/netc/20250619_16295_!!1750307172821_300_300.png',
  },
  90: {
    iconUrl: 'https://ic-img.ky-express.com/netc/20250619_92796_!!1750307177167_150_150.png',
  },
  110: {
    iconUrl: 'https://ic-img.ky-express.com/netc/20240311_463189572_!!1710124340163_150_150.png',
  },
  4001: {
    iconUrl: 'https://ic-img.ky-express.com/netc/20250619_4450_!!1750307185109_300_300.png',
  },
  200: {
    iconUrl: 'https://ic-img.ky-express.com/netc/20250619_98143_!!1750307180802_150_150.png',
  },
}
/**
 * @description 管控状态
 */
export enum LimitResult {
  '确认' = '10',
  '拒绝' = '20',
  '取消' = '30',
}

/**
 * @description 管控和校验
 */
export enum validateType {
  '管控' = 'limit',
  '校验' = 'access',
}

/**
 * @description effectBubble的常量值
 */
export enum effectBubbleConstants {
  '气泡顶部最小距离' = 50,
}
/**
 * @description tippy的主题
 */
export enum tippyTheme {
  'warning' = 'light-border',
  'info' = 'info',
}
