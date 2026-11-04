/**
 * CRM 摇奖活动配置
 */

// 图片资源
export const wining_prize = 'https://ic-img.ky-express.com/default/20240530_89362790740_!!1717075559490_590_183.png'
export const not_wining_prize = 'https://ic-img.ky-express.com/default/20240530_93962790725_!!1717075340595_590_183.png'
export const activity_ended = 'https://ic-img.ky-express.com/default/20240530_65062790726_!!1717074852183_590_183.png'

export const congratulation_text = 'https://ic-img.ky-express.com/default/20240530_416279075_!!1717075035487_565_128.png'
export const recieve_btn = 'https://ic-img.ky-express.com/default/20240530_48662790738_!!1717075377236_480_154.png'
export const sorry_text = 'https://ic-img.ky-express.com/default/20240530_97362790773_!!1717075415344_347_128.png'
export const leave_btn = 'https://ic-img.ky-express.com/default/20250929_26285_!!1759135907963_480_154.png'

export const kye_logo_white = 'https://ic-img.ky-express.com/default/20240530_49562790766_!!1717075213623_132_32.png'
export const draw_lottery_btn = 'https://ic-img.ky-express.com/default/20240530_54862790781_!!1717075116513_696_226.png'
export const draw_lottery_btn_disabled = 'https://ic-img.ky-express.com/default/20240530_3462790764_!!1717075158289_348_113.png'
export const icon_close = 'https://ic-img.ky-express.com/default/20240530_40662790774_!!1717075180689_148_144.png'
export const lucky_flower = 'https://ic-img.ky-express.com/default/20240530_5986279070_!!1717075317821_240_240.png'
export const coupon_img = 'https://dre-erp-fe-1257092428.cos.ap-guangzhou.myqcloud.com/crm/crm-marketing/coupon.png'
export const lucky_flower_2 = 'https://ic-img.ky-express.com/default/20240530_45162790719_!!1717075282529_140_140.png'
export const lock_info_btn = 'https://dre-erp-fe-1257092428.cos.ap-guangzhou.myqcloud.com/crm/crm-marketing-open/lotter-new-lock-info.png'
export const get_btn = 'https://dre-erp-fe-1257092428.cos.ap-guangzhou.myqcloud.com/crm/crm-marketing-open/lotter-new-get.png'

export const LOTTERY_ANI_URL = 'https://ic-img.ky-express.com/netc/20240521_34521882348_!!1716272033893_750_1640.png'
export const LOTTERY_ANI_GIF_URL = 'https://ic-img.ky-express.com/default/20240527_61162790715_!!1716790100900_750_1640.gif'
export const LOTTERY_BG_URL = 'https://ic-img.ky-express.com/netc/20240521_83921882324_!!1716272033896_927_1316.png'

export const COUNPON_TAG_10 = 'https://ic-img.ky-express.com/default/20240618_68962790735_!!1718711789947_40_23.svg+xml'
export const COUNPON_TAG_20 = 'https://ic-img.ky-express.com/default/20240618_27862790769_!!1718714056091_40_23.svg+xml'
export const COUNPON_TAG_30 = 'https://ic-img.ky-express.com/default/20240618_87962790731_!!1718714043943_40_23.svg+xml'
export const COUNPON_TAG_40 = 'https://ic-img.ky-express.com/default/20240618_36262790774_!!1718714053553_40_23.svg+xml'

// 中奖状态
export const DRAW_STATUS_WINING = 10 // 中奖
export const DRAW_STATUS_NOT_WINING = 20 // 未中奖

// 活动状态
export const ACTIVITY_STATUS_NOT_START = 20 // 未开始
export const ACTIVITY_STATUS_IN_PROGRESS = 30 // 进行中
export const ACTIVITY_STATUS_ENDED = 40 // 已结束

// 客户填写限制
export const FILLING_LIMIT_NONE = 10 // 无需填写
export const FILLING_LIMIT_CUSTOMER = 20 // 仅客户姓名
export const FILLING_LIMIT_COMPANY = 30 // 仅公司名称
export const FILLING_LIMIT_ADDRESS = 40 // 仅公司地址

export const EMOJI_REG = /[\u{1f3fb}-\u{1f3ff}]/gu

export const CN_EN_NUM_REG = /^[a-zA-Z0-9\u4e00-\u9fa5]+$/

// 顶部中奖结果图片
export const RESULT_TIPS_IMG: Record<number, string> = {
  [DRAW_STATUS_WINING]: wining_prize, // 中奖
  [DRAW_STATUS_NOT_WINING]: not_wining_prize, // 未中奖
  [ACTIVITY_STATUS_ENDED]: activity_ended, // 活动已结束
}

// 中奖消息订阅模板ID
export const TEMP_IDS = ['Hz4lsFEpsMvusVwh4TcGUCTsyTy6h3XbE946GZnlYUs']

// 抽奖弹框图片
export const DIALOG_RESULT__IMG: Record<number, { topImg: string; bottomImg: string }> = {
  [DRAW_STATUS_WINING]: {
    topImg: congratulation_text,
    bottomImg: recieve_btn,
  }, // 中奖
  [DRAW_STATUS_NOT_WINING]: {
    topImg: sorry_text,
    bottomImg: leave_btn,
  }, // 未中奖
}

export const USER_INPUT_TEXT: Record<number, string> = {
  [FILLING_LIMIT_CUSTOMER]: '姓名',
  [FILLING_LIMIT_COMPANY]: '公司名称',
  [FILLING_LIMIT_ADDRESS]: '公司地址',
}

// 活动规则
export const getActivityRules = ({ realPushStart, realPushEnd }: { realPushStart?: number; realPushEnd?: number }) => {
  const dateFmt = 'YYYY年MM月DD日'
  const startDateStr = realPushStart ? formatDate(realPushStart, dateFmt) : ''
  const endDateStr = realPushEnd ? formatDate(realPushEnd, dateFmt) : ''
  let rule1 = '1、活动时间以实际时间为准；'
  if (realPushStart && realPushEnd) {
    rule1 = `1、本活动参与时间${startDateStr}至${endDateStr}；`
  } else if (realPushStart) {
    rule1 = `1、本活动参与时间${startDateStr}至活动结束时间以实际时间为准；`
  } else if (realPushEnd) {
    rule1 = `1、本活动开始时间以实际时间为准至${endDateStr}；`
  }

  const boldStyle = {
    fontWeight: 'bold',
  }

  return [
    {
      text: rule1,
      style: boldStyle,
    },
    {
      text: '2、活动奖品类型有跨越速运优惠券、实物奖品，具体以您中奖结果为准；',
    },
    {
      text: '3、您中奖为跨越速运优惠券时，优惠券会自动充值进您所在的跨域速运寄件后台优惠券包中，详情可在跨越速运APP、跨越寄件小程序、跨越速运官网入口查询；',
    },
    {
      text: '4、您中奖为实物奖品时，需在7天内提供您的收件信息至本活动入口，如过期未填写，视为您放弃本活动的领取机会；',
    },
    {
      text: '5、兑换实物奖品不支持退款，如遇奖品发货途中破损或丢失可联系您的专属商务处理；',
    },
    {
      text: '6、对于通过不正当手段（如作弊、扰乱系统、实施网络攻击等）参与活动的客户，跨越速运将有权利禁止其参与活动，并取消其获取的奖品兑换资格，如已兑换的奖品，有权追回；',
      style: boldStyle,
    },
    {
      text: '【特别说明】中奖后您可以在活动入口兑换对应奖品。为便于操作，我们将您注册使用手机作为领取账户，如您是代表您所在的公司进行参与的，您应当向您的公司进行申报。',
      style: boldStyle,
    },
  ]
}

// 简单的日期格式化函数
const formatDate = (timestamp: number, format: string): string => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
}

export const getEnvHost = () => {
  const ENV = process.env.TARO_APP_ENV || ''
  if (ENV.includes('uat')) {
    return 'https://open-h5-uat.ky-express.com'
  } else if (ENV.includes('stg')) {
    return 'https://open-h5-stg.ky-express.com'
  } else {
    return 'https://open-h5.ky-express.com'
  }
}

// 券类型角标图片链接
export const getCouponTagSrc = (type: string | number) => {
  const imageMap: Record<string, string> = {
    '10': COUNPON_TAG_10,
    '20': COUNPON_TAG_20,
    '30': COUNPON_TAG_30,
    '40': COUNPON_TAG_40,
    '50': COUNPON_TAG_20,
  }
  return imageMap[String(type)]
}

