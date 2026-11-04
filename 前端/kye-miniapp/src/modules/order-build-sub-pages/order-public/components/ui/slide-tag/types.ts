export interface SlideTagDetail {
  tagCode?: string
  tagName: string
  tagType?: string
  strategyId?: string
  waybillLogId: string
  type?: number
}

export interface SlideTagProps {
  tagList: SlideTagDetail[]
  tagWords?: number
  warp?: boolean
  type?: string
  clearable?: boolean
  showScrollBar?: boolean
}
