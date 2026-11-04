export interface VisitItem {
  shareWay: string
  tip: string
  visitChannel: string
  visitCnt: number
  visitHead: string
  visitName: string
  visitPhone: string
  visitTime: string
}

export interface VisitStatItm {
  addCnt: number
  totalCnt: number
}

export interface VisitStat {
  shareCnt: VisitStatItm
  visitCnt: VisitStatItm
  visitUserCnt: VisitStatItm
}

export interface VisitCallPhone {
  virtualMobile: string
}
