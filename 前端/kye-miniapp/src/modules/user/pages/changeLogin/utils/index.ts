/**
 * @Desc: index
 * @Date: 2025/7/8
 */
import { FROM_MODE } from '../constants'
type FromModeKey = keyof typeof FROM_MODE
/* 获取端中文标识 */
export function getFromName(mode: FromModeKey) {
  if (!mode) {
    return ''
  }
  return FROM_MODE[mode]
}
