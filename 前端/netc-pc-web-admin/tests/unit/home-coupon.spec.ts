import { flushPromises, mount } from '@vue/test-utils'
import Coupon from '@/views/home/module/module-coupon/coupon/index.vue'
import type { CouponInfoVO, HomePageActivityVO } from '@/apis/home/types'
import { http } from '@/utils/request/request'
import { locationRouteV2 } from '@/utils/appBridge'

const mockUpdateCouponGetState = jest.fn()
jest.mock('@/utils/request/request', () => ({ http: jest.fn() }))
jest.mock('@/utils/native', () => ({}))
jest.mock('@/utils/appBridge', () => ({ locationRouteV2: { push: jest.fn() }, parentMessageSend: jest.fn() }))
jest.mock('@/hooks', () => ({
  useHomeStore: () => ({ updateCouponGetState: mockUpdateCouponGetState, store: { updateCouponList: jest.fn() } }),
}))
jest.mock('@netc-design-pc/ui', () => ({
  KButton: { props: ['disabled'], template: '<button :disabled="disabled"><slot /></button>' },
}))

beforeEach(() => {
  jest.clearAllMocks()
  window.$umpOtherReport = jest.fn()
  ;(http as jest.Mock).mockResolvedValue({ data: { receiveStatus: 0 } })
})

test.each([
  ['自动发券', [true], undefined, true],
  ['自动券包', [true, true], undefined, true],
  ['主动领券', [false], undefined, false],
  ['混合券包', [true, false], undefined, false],
  ['历史未领取券', [undefined], undefined, false],
  ['已领取券', [false], true, true],
] as const)('%s 的按钮与点击行为一致', async (...args) => {
  const [, grants, isGet, canShip] = args
  const activity: HomePageActivityVO = {
    id: 123,
    code: 'activity',
    isGet,
    couponInfoList: grants.map((isAutoGrant) => ({
      activityId: 123,
      reliefForm: 30,
      amount: 20,
      ticketNumber: 1,
      couponDesc: '优惠券',
      isAutoGrant,
    })) as CouponInfoVO[],
  }
  const wrapper = mount(Coupon, {
    props: { couponInfo: activity },
    global: { stubs: { ElDialog: true, SvgIcon: true } },
  })
  const button = wrapper.find('.coupon-todo-btn')
  expect(button.text()).toBe(canShip ? '立即寄件' : '立即领取')
  await button.trigger('click')
  await flushPromises()
  if (canShip) {
    expect(locationRouteV2.push).toHaveBeenCalledWith({ path: '/admin/delivery', query: { needQuerySave: 'false' } })
    expect(http).not.toHaveBeenCalled()
  } else {
    expect(http).toHaveBeenCalledWith('web.basicBiz.homepage.receiveCoupon', { activityId: 123 })
    expect(mockUpdateCouponGetState).toHaveBeenCalledWith(123, true)
    expect(locationRouteV2.push).not.toHaveBeenCalled()
    await wrapper.setProps({ couponInfo: { ...activity, isGet: true } })
    expect(button.text()).toBe('立即寄件')
  }
  wrapper.unmount()
})
