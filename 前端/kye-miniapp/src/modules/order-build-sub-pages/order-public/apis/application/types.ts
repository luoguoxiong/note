export interface ApplicationListRequestParam {
  shellVersion?: string
  menuCodes?: string
  areaCodes?: string[]
  applicationVersion?: string
  updateTime?: number
  forceCheck?: '0' | '1'
}

interface KeyValuePair {
  [key: string]: any
}

export interface ApplicationListResponseData {
  forceOnlineH5: boolean
  updateTime: number
  vos: KeyValuePair[]
}
