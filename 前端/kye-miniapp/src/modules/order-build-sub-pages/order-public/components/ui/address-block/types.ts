export type Info = {
  person?: string
  mobile?: string
  telephone?: string
  fullAddress?: string
  personDataValidate?: string
  mobileDataValidate?: string
  telephoneDataValidate?: string
  addressDataValidate?: string
  companyNameDataValidate?: string
  locationName?: string
  companyName?: string
  province?: string
  city?: string
  county?: string
  detailAddress?: string
}

export interface PropsType {
  iconText?: string
  iconColor?: string
  headerText?: string
  headerPlaceholder?: string
  addressVisible?: boolean
  required?: boolean
  exhibition?: boolean
  locationName?: string
  dataValidate?: string | undefined
  info?: Info
  addressVisibleType: string
  addressEdit: boolean
  switchVisible?: boolean
  disabled?: boolean
}
