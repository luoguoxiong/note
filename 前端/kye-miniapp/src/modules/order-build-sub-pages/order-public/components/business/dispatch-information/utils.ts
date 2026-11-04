//表单的formatter
import { lineFilter, specialFilter, wareHouse } from '@order-public-sub-public/utils/pattern'

export const valueFormatter = (value: string, type: string) => {
  switch (type) {
    case 'appointWareHouse':
      value = value.replace(specialFilter, '').replace(wareHouse, '').replace(lineFilter, ',')
      break
    case 'appointNumber':
      value = value.replace(/[^0-9a-zA-Z,，-]/gi, '').replace('，', ',')
      break
    case 'purchaseNumber':
      // value = value.replace(numberRule, '').replace('，', ',')
      value = value.replace(/[^0-9a-zA-Z,，]/gi, '').replace('，', ',')
  }
  return value
}
export const valueFormatterAll = (value: string, type: string) => {
  if (typeof value !== 'string') return ''
  let newValue = value
  for (let i = 0; i < value.length; i++) {
    newValue = valueFormatter(newValue, type)
  }
  return newValue
}
