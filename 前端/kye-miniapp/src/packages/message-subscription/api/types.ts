export interface TemplateListRes {
  title: string
  templateId: string
  templateNotice: string
  dataDto: DataDto
  templateCategory: string
}

export interface DataDto {
  param: string
  paramExplain: string
  paramPrefix: string
  paramSuffix: string
}
