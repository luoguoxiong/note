import { HttpResponse } from '@/public/utils/types'
import { api, WebH5ApiAgreementListIn, WebH5ApiAgreementListOut } from '../../apis/account-logoff'

const cache: Record<string, Promise<HttpResponse<WebH5ApiAgreementListOut>>> = {}

export async function getAgreementContent({ pageCode, agreementCode }: WebH5ApiAgreementListIn) {
  const cacheId = pageCode + agreementCode
  const task = cache[cacheId] || api('web.h5Api.agreement.list', { pageCode, agreementCode })
  cache[cacheId] = task
  const result = await task

  return result.data
}
