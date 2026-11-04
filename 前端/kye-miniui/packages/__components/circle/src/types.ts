export interface CircleProps {
  /**
   * 圆形的直径
   * @type {number}
   */
  size?: number;

  /**
   * 圆环的宽度
   * @type {number}
   */
  strokeWidth: number;

  /**
   * 进度条的颜色
   * @type {string}
   */
  color?: string;

  /**
   * 背景圆环的颜色
   * @type {string}
   */
  trackColor?: string;

  /**
   * 当前的进度值（范围：0 - 100）
   * @type {number}
   */
  progress?: number;

  /**
   * 动画持续时间（单位：毫秒）
   * @type {number}
   */
  duration?: number;

  /**
   * 是否显示圆环中心的文本
   * @type {boolean}
   */
  showText?: boolean;
}
