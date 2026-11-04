export type EmptyType = 'error' | 'network' | 'search' | 'list' | 'address' | 'coupon'

export type EmptyProps = Partial<{
  type: EmptyType
  imageSize: number | string
  description: string
}>
