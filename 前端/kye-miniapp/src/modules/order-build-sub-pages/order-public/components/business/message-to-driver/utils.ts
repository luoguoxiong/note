import { DriverHighFrequencyWord } from '@order-public-sub-public/types'
import { ModuleType } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'

/**
 * 给司机捎句话模块是否开启。
 * 必须与下单首页 schema 渲染闸门 findModule + getModuleVisible 完全同源：
 * 直接按模块 key 取模块根，visible 优先、回退 v。
 * 不依赖模块根的 .type 字段——.type 仅在解密后端 schema 时补充（decryptModuleConfig），
 * 静态默认 schema 无该字段；用 moduleConfigData 的 .type 遍历匹配会在初始化/竞态时序下
 * 匹配失败而误判隐藏，导致首页显示、取货页不显示。
 */
export const isMessageToDriverVisible = () => {
  const piniaStore = useStore()
  const moduleRoot = piniaStore.schema.currentSchema?.schema?.module?.[
    ModuleType['给司机捎句话']
  ] as { visible?: boolean; v?: boolean } | undefined
  if (!moduleRoot) return false
  if ('visible' in moduleRoot) return !!moduleRoot.visible
  return !!moduleRoot.v || false
}

/**
 * 当前已提交的捎句话外显内容（取 store 数据）；
 * 模块隐藏或内容为空时返回空串。供下单页/寄件人信息页入口摘要与“已添加”判断使用。
 */
export const getMessageToDriverText = () => {
  const piniaStore = useStore()
  if (!isMessageToDriverVisible()) return ''
  const formData = piniaStore.order.moduleFormData(ModuleType['给司机捎句话'])
  const wordList =
    piniaStore.schema.moduleDimensionData(ModuleType['给司机捎句话'])?.driverHighFrequencyWordList || []
  return formatDriverMessageText(
    formData?.orderRemark,
    formData?.driverHighFrequencyWords,
    wordList,
  )
}

/**
 * 捎句话外显文案拼接
 * 规则：选中高频词（code 数组）在高频词列表中取文案，按 sort 升序，以中文逗号「，」拼接；
 * 手动录入内容 trim 后以「，」接在高频词之后；无高频词时直接取手动录入；两者皆空返回空串。
 */
export const formatDriverMessageText = (
  orderRemark?: string,
  driverHighFrequencyWords?: string[],
  driverHighFrequencyWordList?: DriverHighFrequencyWord[],
) => {
  const wordList =
    driverHighFrequencyWordList
      ?.filter((item) => driverHighFrequencyWords?.includes(item.code))
      ?.sort((a, b) => a.sort - b.sort)
      ?.map((item) => item.value)
      ?.filter(Boolean) || []
  const value = (orderRemark || '').trim()
  if (value) {
    wordList.push(value)
  }
  return wordList.join('，')
}
