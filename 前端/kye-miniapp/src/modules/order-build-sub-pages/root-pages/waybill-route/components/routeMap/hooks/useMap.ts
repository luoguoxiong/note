// 通用配置部分
import { ref } from 'vue'
import { IMarker, IPolyline, IMarkerOption } from '../types'
import useAlipayUtils from './useAlipayUtils'

const markers = ref<IMarker[]>([]) // 覆盖物数据
const polyline = ref<IPolyline[]>([]) // 设置线路数据

const config = useAlipayUtils()

export default function useMap() {
  // 设置寄收点位覆盖物
  const addSendReceiveMarker = (options: IMarkerOption) => {
    const { latitude, longitude, id } = options
    const markerData = {
      id,
      latitude,
      longitude,
      width: 50,
      height: 50,
      config,
      ...config.SendReceiveMarker(options),
    }
    markers.value.push(markerData)

    console.log('markers.value:', markers.value)
  }

  // 设置线路
  const addPolyline = (options: IPolyline) => {
    polyline.value?.push(options)

    console.log('polyline.value:', polyline.value)
  }

  return {
    markers,
    addSendReceiveMarker,
    polyline,
    addPolyline,
  }
}
