import { AddressTypeStr } from '@order-public-sub-public/constants'
import { filterAllSpace } from '@order-public-sub-public/utils'
import type { CompleteAddressInfo, CompleteAddressParams } from '@order-public-sub-public/apis/address/types'

/** 校正弹窗区分寄/收方 */
export type AddressCorrectionSide = 'sender' | 'receive'

/**
 * 构造 completeAddress 入参所需的地址源数据
 * 收件需要电话三字段，寄件不需要
 */
export interface CompleteAddressSource {
  province?: string | null
  city?: string | null
  county?: string | null
  detailAddress?: string | null
  telephone?: string | null
  mobile?: string | null
  extension?: string | null
}

/**
 * @description 构造完善地址接口的地址信息（sender/receive 节点）
 * 收件自动带上 telephone/mobile/extension，寄件只传地址字段
 */
export const buildCompleteAddressInfo = (
  side: AddressCorrectionSide,
  source: CompleteAddressSource,
): CompleteAddressInfo => {
  // 完整地址 = 省 + 市 + 区 + 详细地址（与下单页/地址簿列表 fullAddress 拼接规则一致）
  const fullAddress = `${source.province ?? ''}${source.city ?? ''}${source.county ?? ''}${source.detailAddress ?? ''}`
  const info: CompleteAddressInfo = {
    fullAddress: fullAddress || null,
    province: source.province ?? null,
    city: source.city ?? null,
    county: source.county ?? null,
    detailAddress: source.detailAddress ?? null,
  }
  if (side === 'receive') {
    info.telephone = source.telephone ? filterAllSpace(source.telephone) : null
    info.mobile = source.mobile ? filterAllSpace(source.mobile) : null
    info.extension = source.extension ? filterAllSpace(source.extension) : null
  }
  return info
}

/**
 * @description 构造完善地址接口入参
 * @param side        寄件/收件
 * @param sceneType   场景类型（CompleteAddressSceneType：下单/地址簿）
 * @param source      地址源数据
 * @param addressId   地址 id（编辑/列表传，新增不传）
 */
export const buildCompleteAddressParams = (options: {
  side: AddressCorrectionSide
  sceneType: string
  source: CompleteAddressSource
  addressId?: string
}): CompleteAddressParams => {
  const { side, sceneType, source, addressId = '' } = options
  const addressType = side === 'sender' ? AddressTypeStr.SENDER : AddressTypeStr.RECEIVE
  return {
    addressType,
    sceneType,
    addressId,
    [side]: buildCompleteAddressInfo(side, source),
  } as CompleteAddressParams
}
