export interface ItemData {
  title: string
  content: string
  coverImg: string
  subTitle: string
  contentId?: string
}

export interface CardFuncProps {
  isEdit: boolean
  isFirst: boolean
  isLast: boolean
  data: {
    originData: any[]
    data: ItemData[]
    businessCardId: string
    menuId: string
  }
  employeeId: string
  title: string
  isOpen: boolean
}
