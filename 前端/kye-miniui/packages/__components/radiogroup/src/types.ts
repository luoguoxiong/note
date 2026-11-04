import { ExtractPropTypes } from 'vue'

export const radiogroupProps = {} as const

export type RadiogroupProps = ExtractPropTypes<typeof radiogroupProps>

export const RADIO_KEY = Symbol('ky-radio')
