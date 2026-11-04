import dayjs from 'dayjs'

export const phoneEncrypted = (phone: string) => {
  if (!phone) {
    return
  }
  return phone.replace(/^(\d{3})(\d{4})(\d{4})/, '$1****$3') || ''
}

export const formatTime = (date: string | number, format = 'YYYY/MM/DD HH:mm') => {
  if (!date) return '--'
  return dayjs(Number(date)).format(format)
}

export const formatAmount = (amount?: number | string) => {
  if (amount === null || amount === undefined) return amount

  const num = Number(amount)
  if (isNaN(num)) return amount

  const fixed = num.toFixed(2)

  const [intPart, decimalPart] = fixed.split('.')

  const intWithComma = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return `${intWithComma}.${decimalPart}`
}
