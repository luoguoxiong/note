import { Canvas } from '@tarojs/taro'

export interface CropperImageProps {
  /**
   * 文件地址
   */
  imagePath: string
  /**
   * 是否开启debug
   */
  debug?: boolean
  /**
   * 最小剪裁尺寸与原图尺寸的比率，默认0.15，即宽度最小剪裁到原图的0.15宽。
   */
  minBoxWidthRatio?: number
  /**
   * 宽比最小剪裁尺寸与原图尺寸的比率，默认0.15，即高度最小剪裁到原图的0.15高。
   */
  minBoxHeightRatio?: number
  /**
   * 剪裁框初始大小比率。默认值0.6，即剪裁框默认宽度为图片宽度的0.6倍。
   */
  initialBoxWidthRatio?: number
  /**
   * //同initialBoxWidthRatio，当设置aspectRatio时，initialBoxHeightRatio值设置无效。initialBoxHeightRatio值由initialBoxWidthRatio 和 aspectRatio自动计算得到。
   */
  initialBoxHeightRatio?: number
  /**
   * 目标图片的宽高比，默认null，即不限制剪裁宽高比。aspectRatio需大于0
   */
  aspectRatio?: number | null
  /**
   * 目标文件的类型。默认值为jpg，jpg：输出jpg格式图片；png：输出png格式图片
   */
  outputFileType?: 'jpg' | 'png'
  /**
   * 图片质量，范围0-1，默认值为1
   */
  quality?: number

  /**
   * 最大canvas画布宽度
   */
  maxCanvasSize: number
}

export interface CropperImageState {
  // 布局相关
  layoutLeft: number
  layoutTop: number
  layoutWidth: number
  layoutHeight: number

  // 舞台相关
  stageLeft: number
  stageTop: number
  stageWidth: number
  stageHeight: number

  // 裁剪框相关
  boxLeft: number
  boxTop: number
  boxWidth: number
  boxHeight: number

  // 图片相关
  imageWidth: number
  imageHeight: number

  // Canvas 尺寸
  canvasWidth: number
  canvasHeight: number

  // 触摸起始点
  touchStartX: number
  touchStartY: number
  touchStartBoxLeft: number
  touchStartBoxTop: number
  touchStartBoxWidth: number
  touchStartBoxHeight: number
  touchStartDistance: number // 双指缩放起始指间距

  imageStageRatio: number // 图片实际尺寸与剪裁舞台大小的比值，用于尺寸换算。

  // 最小盒子宽度
  minBoxWidth: number
  minBoxHeight: number

  pixelRatio: number // todo设备像素密度//暂不使用//
  hasCrop: boolean
  ctx: CanvasRenderingContext2D | null

  scale: number
}

export interface CanvasContext {
  ctx: CanvasRenderingContext2D
  canvas: Canvas
  dpr: number
  width: number
  height: number
}
