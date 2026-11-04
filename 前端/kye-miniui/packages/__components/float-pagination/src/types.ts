export type FloatPaginationProps = Partial<{
  /**
   * 当前页数，使用 v-model 双向绑定
   * @default 1
   */
  modelValue: number
  /**
   * 最小页数
   * @default 1
   */
  min: number
  /**
   * 最大页数
   * @default 1
   */
  max: number
  /**
   * 上一页文案
   * @default 上一票
   */
  prevText: string
  /**
   * 下一页文案
   * @default 下一票
   */
  nextText: string
  /**
   * 是否禁用
   */
  disabled: boolean
  /**
   * 靠边位置，left 左靠边，right 右靠边
   * @default 'left'
   */
  placement: 'left' | 'right'
}>
