import { ProgressProps } from 'element-plus'

export type KyLoadingProps = {
  visible: boolean // 是否加载
  popperClass?: string // 自定义类名
  modal?: boolean // 是否需要遮罩层
  imgSize?: number // 图片大小
  isGreyIcon?: boolean
  needText?: boolean
  iconType?: 'purple' | 'grey' | 'white' // 加载icon 图标
}

export type carLoadingProps = {
  visible: boolean // 是否加载
  showProgressBar?: boolean // 是否展示进度条
  popperClass?: string // 自定义类名
  modal?: boolean // 是否需要遮罩层
  imgSize?: number // 图片大小
}

export type KyCarLoadingProps = Partial<ProgressProps> & carLoadingProps
