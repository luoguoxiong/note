export interface StatusItem {
  icon: string // 图标
  mainTitle: JSX.Element // 主标题
  subTitle: JSX.Element | string // 副标题
  tips: string //右上角文案
  iconUrl: string // icon全路径https
}

export interface FooterConfigItem {
  text: string
  type: any
  action: () => void
  iconName?: string
}

export interface FooterConfig {
  left: {
    text: string
    type: any
    action: () => void
  }
  right: {
    text: string
    type: any
    action: () => void
  }
}

export interface ShareWaybill {
  waybillNumber: string // 单号
  showShareGuide: boolean // 猪尾巴指引
}
