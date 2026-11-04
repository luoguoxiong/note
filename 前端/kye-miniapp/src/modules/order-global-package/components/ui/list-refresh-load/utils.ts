/**
 * 加载图标计算
 * @param distance number
 * @return number
 */
export const rate = (distance: number): number => {
  if (!distance || distance < 40) {
    return 0
  }
  return distance >= 80 ? 100 : ((distance - 40) / 40) * 100
}

/**
 * 获取不同加载的图标
 * @param type string
 * @returns string
 */
export const img = (type: string): string => {
  switch (type) {
    case 'load-img':
      return 'https://ic-img.ky-express.com/netc/20250619_9431_!!1750315304962_120_120.gif'
    case 'finish-img':
      return 'https://ic-img.ky-express.com/netc/20250619_92791_!!1750315340945_120_120.gif'
    case 'load-icon':
      return 'https://ic-img.ky-express.com/netc/20250619_80997_!!1750313700109_80_80.png'
    default:
      return ''
  }
}
