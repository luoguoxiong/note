/** 管控类型枚举 */
export enum EManagementStyle {
  /** 解除管控：管控结束，恢复正常 */
  Relieve = 0,

  /** 疫情管控：如封控、核酸等防疫相关限制 */
  Epidemic = 10,

  /** 其他管控：未分类或通用类型限制 */
  // Other = 10000,

  /** 限寄管控 */
  Limitation = 80,

  /** 台风管控：受台风天气影响的运输限制 */
  Typhoon = 20,

  /** 雨雪管控：因大雪或暴雨导致的交通受阻 */
  Snow = 30,

  /** 春运管控：春节前后交通高峰期的调度限制 */
  SpringFestival = 60,

  /** 假期管控：如五一、国庆等假期物流限制 */
  Holiday = 50,

  /** 国议管控：特殊政治活动期间的交通限制（如“两会”） */
  NationalMeeting = 70,

  /** 报关管控：与进出口报关相关的物流限制 */
  Customs = 200,

  /** 夜间管控：夜间时段的运输或作业限制 */
  Night = 90,

  /** 汛期管控：因洪涝、暴雨等汛期自然灾害限制运输 */
  Flood = 40,

  /** 控货：对特定货物类型进行限制（如易燃、涉密等） */
  Control = 1010,

  /** 限制发运：限制货物从某地发出，通常是源头限制 */
  LimitSend = 2001,

  /** 限制派送：限制货物最终派送，可能因目的地受控 */
  LimitDeliver = 3001,

  /** 入仓异常：货物入仓过程中的问题或异常情况 */
  Abnormal = 1000,
}

/** 管控章-图片字典 */
export const STAMP_IMAGE_DIC: Record<EManagementStyle, string> = {
  [EManagementStyle.Relieve]: 'https://ic-img.ky-express.com/netc/20250605_2447283119_!!1749090532031_248_248.png',
  [EManagementStyle.Epidemic]: 'https://ic-img.ky-express.com/netc/20250605_17672831185_!!1749089981883_248_248.png',
  [EManagementStyle.Limitation]: 'https://ic-img.ky-express.com/netc/20250619_51824_!!1750319391280_248_248.png',
  [EManagementStyle.Typhoon]: 'https://ic-img.ky-express.com/netc/20250605_6972831193_!!1749089954229_248_248.png',
  [EManagementStyle.Snow]: 'https://ic-img.ky-express.com/netc/20250605_98372831184_!!1749089945446_248_248.png',
  [EManagementStyle.SpringFestival]: 'https://ic-img.ky-express.com/netc/20250605_81472831195_!!1749089932514_248_248.png',
  [EManagementStyle.Holiday]: 'https://ic-img.ky-express.com/netc/20250605_45572831161_!!1749089908964_248_248.png',
  [EManagementStyle.NationalMeeting]: 'https://ic-img.ky-express.com/netc/20250605_28972831189_!!1749089891526_248_248.png',
  [EManagementStyle.Customs]: 'https://ic-img.ky-express.com/netc/20250605_71872831197_!!1749089878985_248_248.png',
  [EManagementStyle.Night]: 'https://ic-img.ky-express.com/netc/20250605_98672831139_!!1749089863839_248_248.png',
  [EManagementStyle.Flood]: 'https://ic-img.ky-express.com/netc/20250605_81872831145_!!1749089847972_248_248.png',
  [EManagementStyle.Control]: 'https://ic-img.ky-express.com/netc/20250605_43072831110_!!1749093889299_248_248.png',
  [EManagementStyle.LimitSend]: 'https://ic-img.ky-express.com/netc/20250605_85872831142_!!1749093879524_248_248.png',
  [EManagementStyle.LimitDeliver]: 'https://ic-img.ky-express.com/netc/20250605_2997283119_!!1749093870879_248_248.png',
  [EManagementStyle.Abnormal]: 'https://ic-img.ky-express.com/netc/20250605_22572831190_!!1749093855076_248_248.png',
}
/** 管控提示-图片字典 */
export const TIPS_IMAGE_DIC: Partial<Record<EManagementStyle, string>> = {
  [EManagementStyle.Relieve]: 'https://ic-img.ky-express.com/netc/20250605_69972831187_!!1749087603059_100_120.png',
  [EManagementStyle.Epidemic]: 'https://ic-img.ky-express.com/netc/20250605_11372831124_!!1749092556080_100_120.png',
  [EManagementStyle.Limitation]: 'https://ic-img.ky-express.com/netc/20250605_25072831179_!!1749092556077_100_120.png',
  [EManagementStyle.Typhoon]: 'https://ic-img.ky-express.com/netc/20250605_34772831113_!!1749092556075_100_120.png',
  [EManagementStyle.Snow]: 'https://ic-img.ky-express.com/netc/20250605_81472831134_!!1749092556072_100_120.png',
  [EManagementStyle.SpringFestival]: 'https://ic-img.ky-express.com/netc/20250605_68272831116_!!1749092556070_100_120.png',
  [EManagementStyle.Holiday]: 'https://ic-img.ky-express.com/netc/20250605_49072831188_!!1749092556067_100_120.png',
  [EManagementStyle.NationalMeeting]: 'https://ic-img.ky-express.com/netc/20250605_95972831154_!!1749092556065_100_120.png',
  [EManagementStyle.Customs]: 'https://ic-img.ky-express.com/netc/20250605_37372831185_!!1749092556061_100_120.png',
  [EManagementStyle.Night]: 'https://ic-img.ky-express.com/netc/20250605_18472831136_!!1749092556096_100_120.png',
  [EManagementStyle.Flood]: 'https://ic-img.ky-express.com/netc/20250605_24272831171_!!1749092556093_100_120.png',
}
/** 管控提示-class字典 */
export const TIPS_STYLE_DIC: Partial<Record<EManagementStyle, { color: string; background: string }>> = {
  [EManagementStyle.Relieve]: {
    color: '#00AD7C',
    background: 'linear-gradient(270deg, #F0FFF7 0%, #EAFFF4 82%, #CAF6DE 100%)',
  },
  [EManagementStyle.Epidemic]: {
    color: '#F05A05',
    background: 'linear-gradient(270deg, #FFFAF3 0%, #FFF5EC 84%, #FFE5CD 100%)',
  },
  [EManagementStyle.Limitation]: {
    color: '#F05A05',
    background: 'linear-gradient(270deg, #FFFAF3 0%, #FFF5EC 84%, #FFE5CD 100%)',
  },
  [EManagementStyle.Typhoon]: {
    color: '#073385',
    background: 'linear-gradient(270deg, #EEF3FC 0%, #EEF3FC 84%, #D2E3FF 100%)',
  },
  [EManagementStyle.Snow]: {
    color: '#073385',
    background: 'linear-gradient(270deg, #EEF3FC 0%, #EEF3FC 84%, #D2E3FF 100%)',
  },
  [EManagementStyle.SpringFestival]: {
    color: '#F15556',
    background: 'linear-gradient(270deg, #FFF9F7 0%, #FFF7F5 84%, #FFCBCB 100%)',
  },
  [EManagementStyle.Holiday]: {
    color: '#F15556',
    background: 'linear-gradient(270deg, #FFF9F7 0%, #FFF7F5 84%, #FFCBCB 100%)',
  },
  [EManagementStyle.NationalMeeting]: {
    color: '#1236AD',
    background: 'linear-gradient(270deg, #E8F4FF 0%, #E0EFFF 82%, #C4DFFF 100%)',
  },
  [EManagementStyle.Customs]: {
    color: '#5848A8',
    background: 'linear-gradient(270deg, #F6F5FF 0%, #EFECFF 84%, #D3CAFE 100%)',
  },
  [EManagementStyle.Night]: {
    color: '#2D3356',
    background: 'linear-gradient(270deg, #EEF3FC 0%, #E9EBFA 84%, #B6BBDC 100%)',
  },
  [EManagementStyle.Flood]: {
    color: '#00617D',
    background: 'linear-gradient(270deg, #E8FAFF 0%, #E8FAFF 84%, #B9E7F4 100%)',
  },
}
