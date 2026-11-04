/**
 * 地址相关 API
 */
import { http } from '@public/utils/request'

class AddressAPI {
  // 缓存机制
  private static cache = new Map<string, any>()

  /**
   * 获取多级子列表
   * @param params.districtLevel - 地区级别 (province/city/area/street)
   * @param params.commonDistrID - 上级地区ID
   */
  static async getMultiLevelSubList(params: { districtLevel?: string; commonDistrID?: string }) {
    // 生成缓存key
    const cacheKey = JSON.stringify(params)

    // 如果缓存中存在，直接返回
    if (this.cache.has(cacheKey)) {
      console.log('使用缓存数据:', cacheKey)
      return this.cache.get(cacheKey)
    }

    // 使用与React版本相同的接口
    const param = {
      id: 1,
      jsonrpc: '2.0',
      params,
      method: 'address.addressBgTerritory.getMultiLevelSubList',
    }
    const data = { method: 'address.addressBgTerritory.getMultiLevelSubList', param: JSON.stringify(param) }

    console.log(data, '=============data================')

    const result = http('gw.foward.api', data, {
      header: {
        method: 'gw.foward.api',
      },
    })

    // 缓存结果
    this.cache.set(cacheKey, result)

    return result
  }

  /**
   * 清空缓存
   */
  static clearCache() {
    this.cache.clear()
  }
}

export default AddressAPI
