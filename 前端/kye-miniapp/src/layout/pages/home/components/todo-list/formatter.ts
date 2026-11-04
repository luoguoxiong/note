import dayjs from 'dayjs'
import { isNil } from 'lodash-es'

export const serviceModeMap = {
  ['0']: '当天达 次日达',
  ['10']: '当天达',
  ['20']: '次日达',
  ['30']: '隔日达',
  ['40']: '陆运件',
  ['50']: '同城次日',
  ['60']: '次晨达',
  ['70']: '同城即日',
  ['80']: '航空件',
  ['90']: '早班件',
  ['100']: '中班件',
  ['110']: '晚班件',
  ['120']: '冷运件',
  ['160']: '省内次日',
  ['170']: '省内即日',
  ['190']: '内部次日',
  ['200']: '内部件',
  ['210']: '空运',
  ['220']: '专运',
  ['240']: '整车运输',
  ['250']: '企业整车',
  ['260']: '同城配送',
  ['270']: '整车运输(危)',
  ['280']: '次晚达',
  ['290']: '内部急件',
  ['300']: '冷链零担',
  ['340']: '次中达',
  ['350']: '隔晨达',
  ['360']: '隔中达',
  ['370']: '陆晨达',
  ['380']: '同城次晨',
  ['390']: '同城次中',
  ['400']: '省内次晨',
  ['410']: '省内次中',
  ['888']: '次晨特惠',
  ['1100']: '特惠快运',
  ['1200']: '特惠普运',
  ['1300']: '特惠航空',
  ['1400']: '特惠同城',
  ['1500']: '特惠省内',
  ['6000']: '国际快递',
  ['6020']: '国际小包',
  ['6030']: '国际空运',
  ['6040']: '国际海运',
  ['6050']: '国际铁运',
  ['6060']: '国际卡航',
  ['6070']: '港澳台专线',
}

export function formmtterServiceMode(value?: number | string) {
  return isNil(value) ? value : serviceModeMap[value] || value
}

export function formatterDateTime(value: dayjs.ConfigType, template = 'YYYY/MM/DD HH:mm') {
  value = /^\d+$/.test(String(value)) ? Number(value) : value

  try {
    const format = dayjs(value)
    if (format.isValid()) {
      return format.format(template)
    }
    return value
  } catch {
    return value
  }
}
