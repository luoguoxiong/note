export interface EditTools {
  switch?: boolean
  hasUploadtBtn?: boolean
  uploadBtnDisabled?: boolean
  hasEditBtn?: boolean
  hasMoveBtn?: boolean
}

export interface CardProps {
  title?: string
  isEdit?: boolean
  editTools?: EditTools
  isLoading?: boolean
  isOpen?: boolean
  isFirst?: boolean
  isLast?: boolean
  isEmpty?: boolean
  showTips?: boolean
  showApplayStatus?: boolean
  applyStatus?: string | number
  hiddenWrapPadding?: boolean
}
