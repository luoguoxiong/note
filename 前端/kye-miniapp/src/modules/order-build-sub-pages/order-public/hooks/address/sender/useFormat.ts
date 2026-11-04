// 内容格式化
import { formatMobile } from '@order-public-sub-public/utils'
import { filterEmojis } from '@order-public-sub-public/utils/pattern'

const useFormat = () => {
  // 姓名
  const formatPerson = (value: string): string => {
    /* eslint-disable-next-line */
    return value.replace(filterEmojis, '')?.replace(/[`@#$^&*=|{}。；;'',，、?？《》\\\[\]\<>\/\s]/g, '')
  }

  // 分机号
  const formatExtension = (value: string): string => value.replace(/\D/g, '')

  // 公司简称
  const formatCompanyName = (value: string): string => {
    // eslint-disable-next-line
    // return filterAllSpace(value.replace(filterEmojis, '').replace(/[`@#$^&*=|{}。；;'',，、?？《》\\\[\]\<>\/\s]/g, ''))
    return value.replace(filterEmojis, '').trim()
  }

  return { formatPerson, formatMobile, formatExtension, formatCompanyName }
}

export default useFormat
