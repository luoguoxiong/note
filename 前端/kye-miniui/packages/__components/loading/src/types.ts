import { ComponentSize } from '@packages/types/size'
import { TextSize } from '@packages/__components/text/src/types'

export type KyLoadingProps = {
  // 图标尺寸
  size?: ComponentSize
  // 文字尺寸
  textSize?: TextSize
  // 加载文案颜色
  textColor?: string
  // 是否启用垂直
  vertical?: boolean
  // loading类型
  type?: 'default' | 'kye'
}
