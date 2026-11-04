import { ExtractPropTypes } from 'vue'

export const swiperItemProps = {
} as const

export type SwiperItemProps = ExtractPropTypes<typeof swiperItemProps>
