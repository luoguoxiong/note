import { ExtractPropTypes } from 'vue'

export const timepickerProps = {
} as const

export type TimepickerProps = ExtractPropTypes<typeof timepickerProps>
