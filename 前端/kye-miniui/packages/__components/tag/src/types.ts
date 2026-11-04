export interface TagProps {
  /** 是否显示标签 */
  show?: boolean;
  /** 标签大小（1-5 对应不同的尺寸） */
  size?: string;
  /** 是否为朴素模式（仅边框，无背景色） */
  plain?: boolean;
  /** 标签背景颜色 */
  bgColor?: string;
  /** 标签文本颜色 */
  textColor?: string;
  /** 标签边框颜色（默认为背景色） */
  borderColor?: string;
}
