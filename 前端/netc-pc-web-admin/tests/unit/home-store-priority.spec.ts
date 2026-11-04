import { createPinia, setActivePinia } from 'pinia'
import { useHomeStore } from '@/stores/home'
import { TodoTabEnum, SecondPrioritySearchType } from '@/apis/home/types'
import { http } from '@/utils/request/request'

jest.mock('@/utils/request/request', () => ({ http: jest.fn() }))
jest.mock('@/utils/native', () => ({}))
jest.mock('@/utils/reportApp', () => ({ report: jest.fn(), ReportAppTimeEnum: {} }))
// eslint-disable-next-line @typescript-eslint/no-var-requires
const firstMock = require('../../mock/web.basicBiz.newHomepage.getFirstPriorityData')
const FIRST_API = 'web.basicBiz.newHomepage.getFirstPriorityData'
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value))
const response = (data: unknown) => ({ code: 0, msg: 'OK', data })
let first: ReturnType<typeof firstMock.data>

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  setActivePinia(createPinia())
  jest.clearAllMocks()
  first = clone(firstMock.data())
  ;(http as jest.Mock).mockImplementation((method: string, params: { searchType?: string } = {}) => {
    if (method === FIRST_API) return Promise.resolve(params.searchType ? clone(firstMock.data(params)) : first)
    if (method.endsWith('getSecondPriorityData'))
      return Promise.resolve(response({ subscribe: 0, solution: '', userMessageList: [] }))
    if (method.endsWith('getLightApplicationData'))
      return Promise.resolve(
        response({ oldCusomerApplication: [{ menuName: 'old' }], newCusomerApplication: [{ menuName: 'new' }] })
      )
    return Promise.reject(new Error(`Unexpected API: ${method}`))
  })
})

test('待办刷新只读取待办数据，不覆盖客户身份、权益和展示开关', async () => {
  const store = useHomeStore()
  await store.getHomeModuleData()
  const oldUser = store.oldUser
  const coupons = clone(store.couponData)
  first.data.oldUser = 0
  first.data.showPayment = false
  first.data.showPayAuth = false
  first.data.showAuth = false
  first.data.showWaybill = false
  await store.getPendingItems()
  expect(http).toHaveBeenLastCalledWith(FIRST_API, {})
  expect(store.oldUser).toBe(oldUser)
  expect(store.couponData).toEqual(coupons)
  expect([store.showPayment, store.showPayAuth, store.showAuth, store.showWaybill]).toEqual([true, true, true, true])
  expect(store.isLoadFail).toBe(false)
})

test('统计刷新只请求 searchType=10，保留待办权益等其他数据', async () => {
  const store = useHomeStore()
  await store.getHomeModuleData()
  const pending = clone(store.pendingItems)
  const coupons = clone(store.couponData)
  ;(http as jest.Mock).mockResolvedValueOnce(
    response({ showLogistics: false, businessOverview: [], logisticsOverview: null })
  )
  await store.refreshOverview()
  expect(http).toHaveBeenLastCalledWith(FIRST_API, { searchType: '10' })
  expect(store.showLogistics).toBe(true)
  expect(store.businessOverview).toEqual([])
  expect(store.logisticsOverview).toBeUndefined()
  expect(store.pendingItems).toEqual(pending)
  expect(store.couponData).toEqual(coupons)
  expect(store.businessLoading).toBe(false)
})

test.each([
  [TodoTabEnum.PAYMENT, '20', 'paymentVO'],
  [TodoTabEnum.PAY_AUTH, '30', 'payAuthList'],
  [TodoTabEnum.AUTH_APPROVAL, '40', 'authApprovalList'],
  [TodoTabEnum.WAYBILL_APPROVAL, '50', 'wayBillApprovalList'],
])('待办分类 %s 使用对应 searchType，只替换目标数据', async (tab, searchType, field) => {
  const store = useHomeStore()
  await store.getHomeModuleData()
  const before = clone(store.pendingItems)
  ;(http as jest.Mock).mockResolvedValueOnce(response({ pendingItems: null }))
  await store.updatePaddingItmesTab(tab as TodoTabEnum)
  expect(http).toHaveBeenLastCalledWith(FIRST_API, { searchType })
  const after = store.pendingItems as unknown as Record<string, unknown>
  expect(after[field]).toBeNull()
  for (const key of ['paymentVO', 'payAuthList', 'authApprovalList', 'wayBillApprovalList']) {
    if (key !== field) expect(after[key]).toEqual((before as unknown as Record<string, unknown>)[key])
  }
  expect(store.pendingItems?.locateTo).toBe(tab)
  expect(store.oldUser).toBe(first.data.oldUser)
})

test('后返回的其他分类不抢回用户选中项', async () => {
  const store = useHomeStore()
  await store.getHomeModuleData()
  let finish!: (data: unknown) => void
  ;(http as jest.Mock)
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve
        })
    )
    .mockResolvedValueOnce(
      response({ showWaybill: false, pendingItems: { wayBillApprovalList: [], wayBillApprovalCount: 0 } })
    )
  const firstRequest = store.updatePaddingItmesTab(TodoTabEnum.PAY_AUTH)
  await store.updatePaddingItmesTab(TodoTabEnum.WAYBILL_APPROVAL)
  finish(response({ pendingItems: { payAuthList: [], payAuthCount: 0 } }))
  await firstRequest
  expect(store.showPayment).toBe(true)
  expect(store.showWaybill).toBe(true)
  expect(store.pendingItems?.locateTo).toBe(TodoTabEnum.WAYBILL_APPROVAL)
  expect(store.pendingItems?.wayBillApprovalList).toEqual([])
})

test.each([null, undefined])('统计刷新保留原接口对空业务数据的兜底：%s', async (businessOverview) => {
  const store = useHomeStore()
  await store.getHomeModuleData()
  ;(http as jest.Mock).mockResolvedValueOnce(response({ businessOverview }))
  await store.refreshOverview()
  expect(store.businessOverview).toEqual([])
  expect(store.businessLables).toEqual([])
  expect(store.businessLoading).toBe(false)
})

test('整体待办刷新仍通过一级接口，保留历史选中项', async () => {
  const store = useHomeStore()
  await store.getHomeModuleData()
  await store.updatePaddingItmesTab(TodoTabEnum.AUTH_APPROVAL)
  await store.refreshPendingItems()
  expect(http).toHaveBeenLastCalledWith(FIRST_API, {})
  expect(store.pendingItems?.locateTo).toBe(TodoTabEnum.AUTH_APPROVAL)
})

test('loads application campaigns, exclusive coupons and receiving overview separately', async () => {
  const store = useHomeStore()
  expect(store.oldUser).toBeUndefined()
  first.data.oldUser = 0
  await store.getHomeModuleData()
  expect(store.oldUser).toBe(0)
  expect(store.applyCustomerInfo).toEqual(first.data.applyCustomerInfo)
  expect(store.couponData).toEqual(first.data.activityList)
  expect(store.receivingOverview).toEqual(first.data.logisticsOverview.receivingOverviewVO)
  await store.refreshOverview()
  expect(store.receivingOverview).toEqual(first.data.logisticsOverview.receivingOverviewVO)
})

const SECOND_API = 'web.basicBiz.newHomepage.getSecondPriorityData'

test.each([
  ['10', 'shippingTemplate', 'batchImportTemplate'],
  ['20', 'batchImportTemplate', 'shippingTemplate'],
])('模板场景 %s 只刷新对应模板，空结果清除旧数据', async (searchType, field, otherField) => {
  const store = useHomeStore()
  await store.getHomeModuleData()
  const before = clone(store.$state)
  const template =
    field === 'shippingTemplate' ? { default: false, title: '最新模板' } : { default: true, name: '批量模板' }
  ;(http as jest.Mock).mockResolvedValueOnce(response({ [field]: template }))
  await store.refreshTemplate(searchType as SecondPrioritySearchType)
  expect(http).toHaveBeenLastCalledWith(SECOND_API, { searchType })
  expect(store.$state).toEqual({ ...before, [field]: template })
  ;(http as jest.Mock).mockResolvedValueOnce(response({ [field]: null }))
  await store.refreshTemplate(searchType as SecondPrioritySearchType)
  expect(store.$state[field as 'shippingTemplate' | 'batchImportTemplate']).toBeNull()
  expect(store.$state[otherField as 'shippingTemplate' | 'batchImportTemplate']).toEqual(
    before[otherField as 'shippingTemplate' | 'batchImportTemplate']
  )
})
