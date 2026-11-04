export const formateDiscount = (discountRate: number) => {
  return ((100 - discountRate) * 0.1).toFixed(1)
}

const couponTextMap = {
  '10': '满减券',
  '20': '折扣券',
  '30': '直减券',
  '40': '满减券',
  '50': '折扣券',
  '60': '折扣券',
}

export const formatCouponType = (type: number | string) => {
  return couponTextMap[type] || '券包'
}
