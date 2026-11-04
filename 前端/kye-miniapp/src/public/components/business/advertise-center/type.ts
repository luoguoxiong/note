export interface IGetAdvertisementDetailParam {
  /** 渠道编码，数据字典：eam_advertisement_channel */
  channelCode: string
  /** 页面编码 */
  pageCode: string
  /** appCode */
  appCode?: string
  /** 广告类型集合，数据字典：eam_advertisement_type，10：banner，20：弹窗，30：走马灯，40：开屏页 */
  adTypeList?: string[]
  /** 最后更新时间 yyyy-MM-dd HHmmss */
  latestUpdateTime: string
  /** 操作端口 APPAPPPCPC小程序MINIPROGTAM */
  operatePort?: string
  /** 操作系统 安卓android苹果ios网页pc安装包pcClient */
  operatorSystem?: string
  /** 登录用户手机号,登录时传,未登录不传 */
  loginPhone?: string
}

export interface IAdvertisementBannerDto {
  /** ios图片链接数据 */
  iosLinks: {
    imgRatio1: string
    imgRatio2: string
    imgLink: string
  }[]
  androidLinks: {
    imgRatio1: string
    imgRatio2: string
    imgLink: string
  }[]
  /** 模块路由 */
  modelRoute: string
  /** h5链接 */
  h5Link: string
  /** pc端h5跳转类型：10-打开新窗口加载H5 20-打开内部新tab加载H5 */
  pcH5JumpType: 10 | 20
  /** 页面分组编码 */
  pageGroupCode: string
  /** 跳转方式 0=不跳转；1=h5；2=原生；3=外部小程序；4=调接口 */
  jumpMode: 0 | 1 | 2 | 3 | 4
  /** banner链接 */
  posterLink: string
  /** 按钮下标 */
  buttonIndex: number
  /** 自定义参数 */
  customerParam: string | null
  /** 不再提醒配置 0=不配置；1=配置 */
  noLongerRemind: 0 | 1
  /** 不再提醒天数 */
  noLongerRemindDays: number
  /** 页面配置的自定义参数 */
  urlCustomParam: UrlCustomParam[]
  /** 返回跳转请求参数 */
  customeParam: object
  /** 跑马灯问文案 */
  noticeText: string
  /** 展示类型 */
  showStrategy: number
  customParameters: string
}

export interface IadvertisementNoticeDto {
  posterLink: string
  title: string
  configCloseButton: boolean
  noticeText: string
  jumpMode: number
  modelRoute: string
  customerParam: string | null // 可以根据具体结构替换为对应类型
  apiCode: string
  popupDetail: any // 可以根据具体结构替换为对应类型
  h5Link: string
  pcH5JumpType: number
  pageGroupCode: string
  noLongerRemind: boolean
  noLongerRemindDays: number
  urlCustomParam: UrlCustomParam[]
  customeParam: string // 命名是否为 typo？是否应为 customerParam？
  h5LinkShow: boolean
  customerPosterLink: string
  posterLinkType: number
  showStrategy: number
}

export interface IadvertisementPopupDto {
  posterLink: string
  title: string
  popupDetail: string
  pureText: string
  content: string
  buttonNumber: number
  configCloseButton: string
  customerParam: string | null
  buttonList: PopupButton[]
  readCallBackFlag: number
  readCallBackApiCode: string | null
  eventsReportedFlag: number | null
  eventsReportedApiCode: string | null
  noLongerRemind: number
  noLongerRemindDays: number | null
  customerPosterLink: string
  posterLinkType: number
  pushToStyle: boolean
}

export interface PopupButton {
  buttonText: string
  jumpMode: number
  modelRoute: string | null
  customerParam: string | null
  h5Link: string
  pcH5JumpType: number
  apiCode: string | null
  buttonIndex: number
  pageGroupCode: string
  appletCode: string
  twoConfirmStatus: number
  twoConfirmButtonTextOne: string | null
  twoConfirmButtonTextTwo: string | null
  twoConfirmPopupTitle: string | null
  twoConfirmPopupText: string | null
  urlCustomParam: UrlCustomParam[]
  customeParam: Record<string, any>
  h5LinkShow: string | null
}

export interface UrlCustomParam {
  pram: string
  value: string
}

export interface IadvertisementPageDto {
  iosLinks: ImgLink[]
  androidLinks: ImgLink[]
  modelRoute: string | null
  h5Link?: string
  pcH5JumpType: number
  pageGroupCode: string
  jumpMode: number
  posterLink: string | null
  buttonIndex: number
  customerParam: string | null
  noLongerRemind: number | null
  noLongerRemindDays: number | null
  urlCustomParam: string | null
  customeParam: Record<string, any>
  h5LinkShow: string | null
  customerPosterLink: string | null
  posterLinkType: string | null
  foldPictureLink?: string
  mobileFoldPosterLink: string | null
  mobileCustomerFolderPosterLink: string | null
  advertisementCode: string
  endTime: number
}

export interface ImgLink {
  imgRatio1: string
  imgRatio2: string
  imgLink: string
}
export interface IdetailList {
  advertisementBannerDto: IAdvertisementBannerDto
  advertisementNoticeDto: IadvertisementNoticeDto
  advertisementPopupDto: IadvertisementPopupDto
  advertisementPageDto: IadvertisementPageDto
  advertisementFloatDto: IAdvertisementBannerDto
  advertisementCode: string
  advertisementTitle: string
  /*2 确认后不展示、1 接受后不展示、0 不限制*/
  showStrategy: 0 | 1 | 2
  endTime: number
}

export interface IGetAdvertisementDetail {
  /** 最后更新时间 yyyy-MM-dd HHmmss	st */
  latestUpdateTime: string
  /** 区域样式编码 */
  areaStyleCode: string
  /** banner数据 */
  detailsList: IdetailList[]
  advertisementType: '10' | '20' | '30'
}

export interface IConfirmByUserAdv {
  /** 广告编码 */
  advertisementCodeList?: string[]
  /** 渠道来源 */
  channelSource: string
  /** 事件类型，1-按钮事件，2-关闭事件，3-曝光事件，会持续增加不同场景的触发事件 3-曝光事件 */
  eventType: number
  /** 按钮下标 事件类型为【按钮事件】，则该字段有值 */
  buttonIndex?: number
  /** 自定义参数 */
  customerParam?: object
  /** 勾选不再提醒 0=未勾选；1=已勾选 */
  noLongerRemindFlag?: number
  /** 操作端口 APPAPPPCPC小程序MINIPROGTAM */
  operatePort?: string
  /** 操作系统 安卓android苹果ios网页pc安装包pcClient */
  operatorSystem?: string
}

export interface IReportEventParam {
  /** 广告编码 */
  adCodes: string[]
  /** 1：按钮事件 2：关闭事件 3：曝光事件 4：点击事件 */
  eventType: number
  /** 按钮名称 */
  buttonName?: string
  /** 操作端口 APPAPPPCPC小程序MINIPROGTAM */
  operatePort?: string
  /** 操作系统 安卓android苹果ios网页pc安装包pcClient */
  operatorSystem?: string
}

export type ChannelCode = 'iOS' | 'android' | 'pc' | 'miniprogram' | 'h5' | 'alipay' | 'nativeMini'

export interface RouterInfoChannelReq {
  channelCode: ChannelCode
  appCode: 'KYE_ZFB' | 'KYE_KYSY' | 'KYE_GD' | 'KYE_FS'
}

export interface RouterInfoChannelRes {
  pageName: string
  type: 'h5' | 'native' | 'miniProgram'
  url: string
  customParams: Record<string, any>
}
