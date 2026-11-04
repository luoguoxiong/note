const emailIcon = 'https://ic-img.ky-express.com/netc/20250205_2486630116_!!1738724662440_68_68.png'
const addressIcon = 'https://ic-img.ky-express.com/netc/20250205_32266301119_!!1738724662439_68_68.png'
const kyeIcon = 'https://ic-img.ky-express.com/netc/20250303_66970395121_!!1740969311150_212_40.png'

export const MODE1_CONFIG = {
  avatar: { x: 228, y: 24, w: 80, h: 80 },
  name: { x: 24, y: 28, font: 20, maxLen: 5 },
  situation: { x: 146, y: 40, font: 12, maxLen: 9 },
  company: { x: 24, y: 65, font: 9, maxLen: 13 },
  badge: {
    baseY: 86,
    imgs: [
      {
        url: kyeIcon,
        x: 24,
        w: 86,
        h: 16,
      },
      { type: 'zaizhi', x: 118, w: 30, h: 16 },
      { type: 'shiming', x: 156, w: 44, h: 16 },
    ],
  },
  email: {
    icon: { url: emailIcon, w: 16, h: 16 },
    gapY: 20,
    font: 9,
    maxLen: 19,
  },
  address: {
    icon: { url: addressIcon, w: 16, h: 16 },
    gapY: 20,
    font: 9,
    maxCharsPerLine: 24,
  },
  footer: {
    tips: [
      { text: '长按识别二维码，查看更多', x: 24, y: 190, font: 9 },
      { text: '名片信息', x: 24, y: 210, font: 9 },
    ],
    qrCode: { x: 230, y: 170, w: 90, h: 90 },
  },
}

const MODE2_BASE_X = 18
const MODE2_BADGE_GAP = 8

export const MODE2_CONFIG = {
  avatar: { x: 20, y: 24, w: 60, h: 60, radius: 30 }, // 圆头像
  name: { x: 138 - 40, y: 24, font: 20, maxLen: 5 },
  situation: { x: 138 - 40 + 120, y: 34, offset: 8 + MODE2_BADGE_GAP, font: 12, maxLen: 9 },
  company: { x: 138 - 40, y: 65, font: 9, maxLen: 12 },
  badge: {
    baseY: 88,
    imgs: [
      { url: kyeIcon, x: MODE2_BASE_X, w: 86, h: 16 },
      { type: 'zaizhi', x: MODE2_BASE_X + 86 + MODE2_BADGE_GAP, w: 30, h: 16 },
      { type: 'shiming', x: MODE2_BASE_X + 86 + MODE2_BADGE_GAP + 30 + MODE2_BADGE_GAP, w: 44, h: 16 },
    ],
  },
  email: {
    icon: { url: emailIcon, w: 16, h: 16 },
    baseY: 108,
    x: MODE2_BASE_X,
    gapX: 20,
    font: 9,
    maxLen: 19,
  },
  address: {
    icon: { url: addressIcon, w: 16, h: 16 },
    baseY: 126,
    x: MODE2_BASE_X,
    gapX: 20,
    font: 9,
    maxCharsPerLine: 24,
  },
  footer: {
    tips: [
      { text: '长按识别二维码，查看更多', x: 24, y: 190, font: 9 },
      { text: '名片信息', x: 24, y: 210, font: 9 },
    ],
    qrCode: { x: 230, y: 170, w: 90, h: 90 },
  },
}

const BASE_X = 18
const BADGE_GAP = 8

export const MODE3_CONFIG = {
  shortName: {
    nameAndSituation: {
      font1: 20,
      font2: 12,
      y: 24,
      maxLen: 19,
    },
    company: { font: 9, y: 60, maxLen: 19 }, // 72 - 12
    badge: {
      baseY: 84, // 104 - 10
      baseX: BASE_X,
      imgs: [
        { type: 'kyeIcon', url: kyeIcon, x: BASE_X, w: 86, h: 16 },
        { type: 'zaizhi', x: BASE_X + 86 + BADGE_GAP, w: 30, h: 16 },
        { type: 'shiming', x: BASE_X + 86 + BADGE_GAP + 30 + BADGE_GAP, w: 44, h: 16 },
      ],
      gapX: BADGE_GAP,
    },
  },
  longName: {
    name: { font: 20, y: 24, maxLen: 8 },
    situation: { font: 12, y: 66, maxLen: 13 },
    company: { font: 9, y: 94, maxLen: 19 },
    badge: {
      baseY: 103, // 121 - 10 - 8
      baseX: BASE_X,
      imgs: [
        { type: 'kyeIcon', x: BASE_X, w: 86, h: 16 },
        { type: 'zaizhi', x: BASE_X + 86 + BADGE_GAP, w: 30, h: 16 },
        { type: 'shiming', x: BASE_X + 86 + BADGE_GAP + 30 + BADGE_GAP, w: 44, h: 16 },
      ],
      gapX: BADGE_GAP,
    },
  },
  email: {
    icon: { url: emailIcon, w: 16, h: 16 },
    baseY: 112 - 10,
    x: BASE_X,
    gapX: 20,
    font: 9,
    maxLen: 19,
  },
  address: {
    icon: { url: addressIcon, w: 16, h: 16 },
    baseY: 130 - 10,
    x: BASE_X,
    gapX: 20,
    font: 9,
    maxCharsPerLine: 24,
  },
  footer: {
    tips: [
      { text: '长按识别二维码，查看更多', x: 24, y: 190, font: 9 },
      { text: '名片信息', x: 24, y: 210, font: 9 },
    ],
    qrCode: { x: 230, y: 170, w: 90, h: 90 },
  },
}
