import { EmptyTypeEnum } from '@order-public-sub-public/constants'

/**
 * @description 缺省页类型
 */
export interface EmptyProps {
  type: EmptyTypeEnum
  customConfig?: {
    image: string
    description: string
  }
}

export interface EmptyConfig {
  image: string
  description: string
}
