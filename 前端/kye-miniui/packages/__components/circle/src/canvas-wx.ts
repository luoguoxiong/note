import { getWindowInfo } from '@tarojs/taro'

// TaroCircleCanvas 的配置接口，定义画布的大小、线宽、轨迹颜色和进度颜色
interface TaroCircleCanvasConfig {
  size: number // 圆形画布的直径
  strokeWidth: number // 圆环线宽
  trackColor: string // 背景圆环的颜色
  color: string // 进度圆环的颜色
}

// TaroCircleCanvas 类，用于封装与圆形画布相关的操作
export class TaroCircleCanvas {
  ctx: CanvasRenderingContext2D // 画布的 2D 上下文，用于绘制内容

  config: TaroCircleCanvasConfig // 画布的配置

  canvas: HTMLCanvasElement // HTMLCanvas 元素

  constructor(canvas: HTMLCanvasElement, config: TaroCircleCanvasConfig) {
    this.canvas = canvas

    // 获取设备的像素比，用于提高绘图清晰度
    const dpr = getWindowInfo().pixelRatio

    // 设置 canvas 的实际分辨率
    canvas.width = config.size * dpr
    canvas.height = config.size * dpr

    // 获取 2D 绘图上下文
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

    this.ctx = ctx

    // 根据像素比缩放上下文
    ctx.scale(dpr, dpr)

    // 保存配置
    this.config = config
  }

  // 绘制背景圆环
  renderTrackCircle(size: number, strokeWidth: number, trackColor: string) {
    const position = size / 2 // 圆心的坐标
    const radius = position - strokeWidth / 2 // 圆环的半径
    this.ctx.strokeStyle = trackColor // 设置圆环颜色
    this.ctx.lineWidth = strokeWidth // 设置线宽
    this.ctx.lineCap = 'round' // 设置线头为圆形
    this.ctx.beginPath() // 开始新路径
    this.ctx.arc(position, position, radius, -Math.PI / 2, 2 * Math.PI, false) // 绘制完整圆环
    this.ctx.stroke() // 渲染路径
  }

  // 绘制进度圆环
  renderProgressCircle(size: number, strokeWidth: number, progress: number, color: string) {
    if (progress === 0) return // 如果进度为 0，直接返回

    const PERIMETER = 2 * Math.PI // 圆的周长
    const BEGIN_ANGLE = -Math.PI / 2 // 起始角度，顶部为起点
    const progressLength = PERIMETER * (progress / 100) // 根据进度计算的角度
    const endAngle = BEGIN_ANGLE + progressLength // 结束角度

    this.ctx.strokeStyle = color // 设置进度圆颜色
    this.ctx.lineWidth = strokeWidth // 设置线宽
    this.ctx.beginPath() // 开始新路径
    this.ctx.arc(size / 2, size / 2, size / 2 - strokeWidth / 2, BEGIN_ANGLE, endAngle) // 绘制圆弧
    this.ctx.stroke() // 渲染路径
  }

  // 清除画布内容
  clearCanvas(size: number) {
    this.ctx.clearRect(0, 0, size, size) // 清除画布的指定区域
  }

  // 主绘制方法，根据传入的进度值绘制背景圆和进度圆
  draw(value: number) {
    const { size, strokeWidth, trackColor, color } = this.config

    // 清空画布
    this.clearCanvas(size)

    // 绘制背景圆环
    this.renderTrackCircle(size, strokeWidth, trackColor)

    // 格式化进度值，限制在 0 到 100 之间
    const formattedValue = Math.min(Math.max(value, 0), 100)

    // 绘制进度圆
    this.renderProgressCircle(size, strokeWidth, formattedValue, color)
  }
}
