
import { usePremium } from './useState'

const { setPremium } = usePremium()
// 返回清空缓存数据

export function resetData() {
  setPremium('')
}
