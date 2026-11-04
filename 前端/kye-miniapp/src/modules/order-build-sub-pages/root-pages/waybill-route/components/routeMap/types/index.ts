// Marker 传入参数
export interface IMarkerOption {
  id?: number
  latitude: number
  longitude: number
  label: string
  title: string
  bgColor: string
}

export interface IIconLayout {
  params: {
    bgColor: string
  }
  src: string
}

export interface ICustomCallout {
  type: number
  canShowOnTap: boolean
  layout: {
    params: {
      label: string
      title: string
      bgColor: string
    }
    src: string
  }
  layoutBubble: {
    style: string
    bgColor: string
    borderRadius: number
    padding: number
  }
  isShow: number
}

export interface IMarker {
  iconPath?: string
  id: number | undefined
  latitude: number
  longitude: number
  width: number
  height: number
  iconLayout?: IIconLayout
  customCallout?: ICustomCallout
}

export interface IPoints {
  latitude: number
  longitude: number
}

export interface IPolyline {
  points: IPoints[]
  color?: string
  width?: number
  dottedLine?: boolean
  arrowLine?: boolean
  arrowIconPath?: string
  borderColor?: string
  borderWidth?: number
}
