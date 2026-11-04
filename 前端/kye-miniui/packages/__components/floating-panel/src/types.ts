import { ExtractPropTypes } from 'vue'

export const floatingPanelProps = {
} as const

export type FloatingPanelProps = ExtractPropTypes<typeof floatingPanelProps>
