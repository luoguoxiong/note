import { RichTextProps } from '@tarojs/components'
import TSpace = RichTextProps.TSpace

export type TextOverflowOption = 'clip' | 'fade' | 'ellipsis' | 'visible'

export type TextSize = '1' | '2' | '3' | '4' | '5'

export type TextProps = {
  // 文本是否可选
  selectable?: boolean
  // 文本是否可选 - 微信
  userSelect?: boolean
  // WebView 特有属性 - 显示连续空格
  space?: keyof TSpace
  // WebView 特有属性 - 是否解码
  decode?: boolean
  numberOfLines?: number
  //文本溢出处理
  overflow?: string
  //限制文本最大行数
  maxLines?: number
  // 自定义属性大小
  size?: TextSize
  // 文本类型
  type?: 'title' | 'main'
}

// todo css 字体大小调整variable
// H5 单独引入多行省略
