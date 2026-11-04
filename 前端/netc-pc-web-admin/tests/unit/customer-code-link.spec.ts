import { createPinia, setActivePinia } from 'pinia'
import { useHomeStore } from '@/stores/home'
import { useLinkTo } from '@/hooks/useLinkTo'
import { http } from '@/utils/request/request'
import { locationRouteV2 } from '@/utils/appBridge'

jest.mock('@/utils/request/request', () => ({ http: jest.fn() }))
jest.mock('@/utils/native', () => ({}))
jest.mock('@/utils/reportApp', () => ({ report: jest.fn(), ReportAppTimeEnum: {} }))
jest.mock('@/utils/appBridge', () => ({ locationRouteV2: { push: jest.fn() } }))
jest.mock('@/reportUmp', () => ({ baseReportInstance: { get: () => 'test-click' } }))

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  setActivePinia(createPinia())
  jest.clearAllMocks()
  window.$umpOtherReport = jest.fn()
})

test.each([
  [0, '1'],
  [1, '0'],
])('maps oldUser=%s to isNew=%s after loading identity', async (oldUser, isNew) => {
  ;(http as jest.Mock).mockResolvedValueOnce({ data: { oldUser } })
  await useLinkTo().linkToApplyCustomerCode({ activityId: 5001, couponCount: 0 })
  expect(http).toHaveBeenCalledWith('web.basicBiz.newHomepage.getFirstPriorityData', {})
  expect(locationRouteV2.push).toHaveBeenCalledWith(
    expect.objectContaining({
      query: expect.objectContaining({ isNew, activityId: '5001', couponCount: '0' }),
    })
  )
})

test('uses loaded identity without another request', async () => {
  useHomeStore().oldUser = 1
  await useLinkTo().linkToApplyCustomerCode()
  expect(http).not.toHaveBeenCalled()
  expect(locationRouteV2.push).toHaveBeenCalledWith(
    expect.objectContaining({
      query: expect.objectContaining({ isNew: '0' }),
    })
  )
})

test('does not navigate when identity lookup fails', async () => {
  ;(http as jest.Mock).mockRejectedValueOnce(new Error('network'))
  await useLinkTo().linkToApplyCustomerCode()
  expect(locationRouteV2.push).not.toHaveBeenCalled()
})
