export interface EnvItem {
  envId: string
  envName: string
  description: string
  module: string
  resourcePath: string
}

export interface ProductLineItem {
  productLine: string
  envList: EnvItem[]
}
