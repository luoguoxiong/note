export interface columnsType {
  text: string
  value: string
  children?: columnsType[]
}

export interface ReactiveType {
  show: boolean
  keyword: string
  selectedValues: string[]
  searchResultList: { districtName: string }[]
  hotCityNameList: { title: string; id: string; provinceId: string }[]
  columns: { districtID: string; districtName: string }[][]
}

export interface SelectSearchItem {
  province?: string
  city?: string
  county?: string
  districtName?: string
}
