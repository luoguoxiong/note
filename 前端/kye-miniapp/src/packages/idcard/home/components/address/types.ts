export interface AddressData {
  province: {
    districtName: string
    districtID: string
  }
  city: {
    districtName: string
    districtID: string
  }
  area: {
    districtName: string
    districtID: string
  }
  street: {
    districtName: string
    districtID: string
  }
}

export interface PositionResult {
  province: string
  city: string
  county: string
  town: string
  [key: string]: any
}
