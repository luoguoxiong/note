import { createPinia, setActivePinia } from 'pinia'
import { useHomeStore } from '@/stores/home'
import { useUserStore } from '@/stores/user'
import { http } from '@/utils/request/request'

jest.mock('@/utils/request/request', () => ({ http: jest.fn() }))
jest.mock('@/utils/native', () => ({}))
jest.mock('@/utils/reportApp', () => ({ report: jest.fn(), ReportAppTimeEnum: {} }))
// eslint-disable-next-line @typescript-eslint/no-var-requires
const firstMock = require('../../mock/web.basicBiz.newHomepage.getFirstPriorityData')
const FIRST_API = 'web.basicBiz.newHomepage.getFirstPriorityData'
const USER_API = 'web.ssoUser.getUserInfoByPhoneNew'
const response = (data: unknown) => ({ code: 0, msg: 'OK', data })
const currentUser = { phone: 'current-account', customCode: '' }
let first: ReturnType<typeof firstMock.data>

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  sessionStorage.setItem('Token', 'current-session')
  setActivePinia(createPinia())
  jest.clearAllMocks()
  first = firstMock.data()
  ;(http as jest.Mock).mockImplementation((method: string) => {
    if (method === FIRST_API) return Promise.resolve(first)
    if (method === USER_API) return Promise.resolve(response(currentUser))
    if (method.endsWith('getSecondPriorityData')) return Promise.resolve(response({ subscribe: 1 }))
    return Promise.resolve(response({}))
  })
})

const seedOldCache = () => {
  localStorage.setItem('st-homeCache', JSON.stringify({ value: { oldUser: 99 } }))
  localStorage.setItem('st-userInfo$-old-account', JSON.stringify({ value: { phone: 'old-account' } }))
  sessionStorage.setItem('PHONE', 'old-account')
  sessionStorage.setItem('LOGIN_DATA', JSON.stringify({ phone: 'old-account', otherField: 'keep' }))
}

test('登录期间忽略旧缓存，等真实用户接口和首页接口返回后才展示', async () => {
  seedOldCache()
  let finish!: (value: unknown) => void
  const requestUser = new Promise((resolve) => (finish = resolve))
  const originalMock = (http as jest.Mock).getMockImplementation()!
  ;(http as jest.Mock).mockImplementation((method: string) =>
    method === USER_API ? requestUser : originalMock(method)
  )
  const home = useHomeStore()
  const request = home.getHomeModuleData()
  await Promise.resolve()
  expect(home.oldUser).toBeUndefined()
  expect(useUserStore().user).toBeNull()
  expect(home.isFetching).toBe(true)
  expect(sessionStorage.getItem('homeReadyToken')).toBeNull()
  finish(response(currentUser))
  await request
  expect(home.oldUser).toBe(first.data.oldUser)
  expect(home.isFetching).toBe(false)
  expect(useUserStore().user?.phone).toBe(currentUser.phone)
  expect(sessionStorage.getItem('homeReadyToken')).toBe('current-session')
  expect(JSON.parse(localStorage.getItem('st-homeCache')!).value.oldUser).toBe(first.data.oldUser)
  expect(localStorage.getItem('st-userInfo$-current-account')).not.toBeNull()
  expect(JSON.parse(sessionStorage.getItem('LOGIN_DATA')!)).toEqual({ phone: currentUser.phone, otherField: 'keep' })
})

test('同一登录会话刷新复用原来的持久化，后台更新不再 loading', async () => {
  await useHomeStore().getHomeModuleData()
  setActivePinia(createPinia())
  const home = useHomeStore()
  expect(home.oldUser).toBe(first.data.oldUser)
  expect(home.isFetching).toBe(false)
  await useUserStore().init()
  expect(useUserStore().user?.phone).toBe(currentUser.phone)
  const refresh = home.getHomeModuleData()
  expect(home.isFetching).toBe(false)
  await refresh
})

test('切换账号时旧就绪标记和旧手机号不能使旧缓存直接显示', async () => {
  await useHomeStore().getHomeModuleData()
  sessionStorage.setItem('Token', 'another-session')
  setActivePinia(createPinia())
  const home = useHomeStore()
  expect(home.oldUser).toBeUndefined()
  expect(home.isFetching).toBe(true)
  expect(useUserStore().user).toBeNull()
})

test('登录首页接口失败时显示失败状态，不展示旧缓存', async () => {
  seedOldCache()
  ;(http as jest.Mock).mockRejectedValueOnce(new Error('首页请求失败'))
  const home = useHomeStore()
  await home.getHomeModuleData()
  expect(home.isFetching).toBe(false)
  expect(home.isLoadFail).toBe(true)
  expect(home.oldUser).toBeUndefined()
  expect(sessionStorage.getItem('homeReadyToken')).toBeNull()
})

test('登录用户接口失败不展示旧缓存，重试重新请求用户信息', async () => {
  seedOldCache()
  const log = jest.spyOn(console, 'error').mockImplementation(() => undefined)
  const originalMock = (http as jest.Mock).getMockImplementation()!
  let failUser = true
  ;(http as jest.Mock).mockImplementation((method: string) =>
    method === USER_API && failUser ? Promise.reject(new Error('用户请求失败')) : originalMock(method)
  )
  try {
    const home = useHomeStore()
    await home.getHomeModuleData()
    expect(home.isLoadFail).toBe(true)
    expect(home.oldUser).toBeUndefined()
    expect(sessionStorage.getItem('homeReadyToken')).toBeNull()
    failUser = false
    await home.getHomeModuleData()
    expect(home.isLoadFail).toBe(false)
    expect(useUserStore().user?.phone).toBe(currentUser.phone)
    expect(sessionStorage.getItem('homeReadyToken')).toBe('current-session')
  } finally {
    log.mockRestore()
  }
})

test('登录切换后的旧响应不更新首页、不写缓存或就绪标记', async () => {
  let finish!: (value: unknown) => void
  ;(http as jest.Mock).mockImplementationOnce(() => new Promise((resolve) => (finish = resolve)))
  const home = useHomeStore()
  const request = home.getHomeModuleData()
  sessionStorage.setItem('Token', 'another-session')
  finish(first)
  await request
  expect(home.oldUser).toBeUndefined()
  expect(localStorage.getItem('st-homeCache')).toBeNull()
  expect(sessionStorage.getItem('homeReadyToken')).toBeNull()
})
