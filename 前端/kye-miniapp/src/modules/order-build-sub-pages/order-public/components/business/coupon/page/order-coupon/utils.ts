

export const isViewUnit = (title = '') => {
  return title.includes('¥')
}

export const isViewCouponUnit = (title = '') => {
  return title.includes('折')
}

export const setTitle = (title = '') => {
  if (title.includes('¥')) {
    title = title.slice(1)
  } else if (title.includes('折')) {
    title = title.slice(0, title.length - 1)
  }
  return title
}

export const relieType = (item: Record<string, any>) => {
  const { reliefForm, couponType } = item || {}
  // 戈壁券处理
  if (+couponType === 30 && +reliefForm === 30) {
    // 代金券&直减券
    return '无门槛'
  }
  // 普通券
  let typeDesc = ''
  switch (reliefForm) {
    case 10:
      typeDesc = '减免券'
      break
    case 20:
      typeDesc = '折扣券'
      break
    case 30:
      typeDesc = '直减券'
      break
    case 40:
      typeDesc = '满减券'
      break
    case 50:
      typeDesc = '折扣券'
      break
    case 0:
      typeDesc = '免单券'
      break
  }
  return typeDesc
}
