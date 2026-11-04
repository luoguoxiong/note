import { http } from '@order-public-sub-public/utils/request'
import { EncryptSettingResponse } from './types'
import { getSource } from '@order-public-sub-public/configs'

/**
 * @description
 * @param params
 * @returns
 */
export const getEncryptSetting = async () => {
  const source = await getSource()
  return http<EncryptSettingResponse>('web.client.encrypt.querySetting', { source: source })
}

/**
 * @description
 * @param params
 * @returns
 */
export const updateEncryptSetting = (params: {
  clientType: number
  fields: { fieldColumn: string; encryptType: number | string }[]
}) => {
  return http('web.client.encrypt.updateSetting', params)
}
