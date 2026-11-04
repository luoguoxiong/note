import { IMarkerOption } from '../types'

// 阿里小程序部分
export default function useAlipayUtils() {
  // 寄收点位、状态点位
  const SendReceiveMarker = (options: IMarkerOption) => {
    const { label, title, bgColor } = options
    return {
      iconLayout: {
        params: {
          bgColor: '#8365F6',
        },
        src: '/mapLayout/marker_icon.xml',
      },
      customCallout: {
        type: 2,
        canShowOnTap: true,
        layout: {
          params: {
            // label: '寄',
            // title: '待揽件',
            // bgColor: '#8365F6',
            label,
            title,
            bgColor,
          },
          src: '/mapLayout/marker_customcallout.xml',
        },
        layoutBubble: {
          style: 'bubble',
          bgColor: '#ffffff',
          borderRadius: 10,
          padding: 0,
        },
        isShow: 1,
      },
    }
  }

  return {
    SendReceiveMarker,
  }
}
