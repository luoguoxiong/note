/* eslint-disable complexity */
import { scanQrCode } from '@order-public-sub-public/apis'
import { getQueryObject } from '@order-public-sub-public/utils'

export interface ParserResult {
  page: string
  data?: { waybillNo?: string; companyName?: string; orderNo?: string; type?: string; customerCode?: string }
}

// 矫正解析出来的运单号(线上出来过这种:  KYE6800003046687635\"}})
const matchOrderNumber = (str: string) => {
  try {
    if (!str) {
      return ''
    }
    const match = str.match(/[A-Za-z0-9]+/g)
    return match?.[0] || str
  } catch (error) {
    console.log(error)
    return str
  }
}

// result: { scanResult: 'http://xxx.com?no=123456789' }
/**
 * @description 二维码面单解析
 * @todo 从老仓库COPY过来，槽点很多，抽空优化
 * @param result
 */
export const parser = (result: { scanResult: string }) => {
  return new Promise((resolve, reject) => {
    if (result?.scanResult?.match('http')) {
      const url = result?.scanResult
      const query = getQueryObject(url) || {}
      const orderNumber = matchOrderNumber(query?.no || query?.orderNumber)
      scanQrCode(orderNumber)
        .then((res) => {
          const waybillNo = query?.no
          const { data } = res
          if (!data) return reject({ message: '无法识别数据，请重新扫描' })
          if (waybillNo) {
            if (Number(data.waybillInfo?.statusCode || 0) === 2) {
              resolve({
                page: 'order',
                data: { waybillNo, customerCode: data.waybillInfo?.companyNameNo || '' },
              })
            } else if (Number(data.waybillInfo?.statusCode || 0) === 3) {
              if (
                Number(data.waybillInfo?.waybillStatus || 0) === 80 &&
                Number(data.waybillInfo?.visitorFlag || 0) !== 1
              ) {
                resolve({ page: 'waybillDetail', data: { waybillNo: data.waybillInfo?.waybillNumber } })
              } else {
                resolve({ page: 'waybillRoute', data: { waybillNo: data.waybillInfo?.waybillNumber } })
              }
            } else {
              reject({ message: '无法识别数据，请重新扫描' })
            }
          } else if (query?.orderNumber) {
            if (data.orderInfo?.orderStatus === '70' || data.orderInfo?.orderStatus === '60') {
              resolve({ page: 'batchOrder' })
            } else {
              resolve({ page: 'batchOrder', data: { orderNo: query.orderNumber || '', type: 'scanFillSingle' } })
            }
          } else {
            reject({ message: '无法识别数据，请重新扫描' })
          }
        })
        .catch(() => {
          reject({ message: '无法识别数据，请重新扫描' })
        })
    } else {
      reject({ message: '无法识别数据，请重新扫描' })
    }
  }) as Promise<ParserResult>
}
