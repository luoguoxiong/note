import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { nextTick, onMounted, reactive } from 'vue'
import Admin from '@/views/admin/index.vue'

const mockHomeStore = reactive({ isFetching: true })
const mockUserStore = reactive({ isInitialized: false })

jest.mock('@/stores/home', () => ({ useHomeStore: () => mockHomeStore }))
jest.mock('@/stores/user', () => ({ useUserStore: () => mockUserStore }))
jest.mock('@/utils/iframeBridge/originalMessage', () => ({ originalIframeMessageHandle: jest.fn() }))
jest.mock('@/views/admin/hooks/useRoutePrefetch', () => ({
  useRoutePrefetch: () => ({ renderComponentsArr: [], iframePaths: [], closeIframe: jest.fn() }),
}))
jest.mock('@/views/admin/components/header/index.vue', () => ({ template: '<div />' }))
jest.mock('@/views/admin/components/menu/index.vue', () => ({ template: '<div />' }))
jest.mock('@/views/admin/components/tabs/index.vue', () => ({ template: '<div />' }))
jest.mock('@/views/admin/components/user-info/index.vue', () => ({ template: '<div />' }))
jest.mock('@/views/admin/components/customer-code/index.vue', () => ({ template: '<div />' }))
jest.mock('@/views/admin/components/dept/index.vue', () => ({ template: '<div />' }))

test('page-wrap 统一等待用户和首页接口，隐藏内容期间仍挂载页面，其他路由不受影响', async () => {
  const startRequest = jest.fn()
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/admin/home',
        component: {
          setup() {
            onMounted(startRequest)
          },
          template: '<div class="home-content">首页内容</div>',
        },
      },
      { path: '/admin/other', component: { template: '<div class="other-content">其他页面</div>' } },
    ],
  })
  await router.push('/admin/home')
  const wrapper = mount(Admin, { global: { plugins: [router] } })
  expect(startRequest).toHaveBeenCalledTimes(1)
  expect(wrapper.findAll('.first-loading')).toHaveLength(1)
  expect(wrapper.find('#page-content').isVisible()).toBe(false)

  mockHomeStore.isFetching = false
  await nextTick()
  expect(wrapper.find('.page-loading').exists()).toBe(true)
  expect(wrapper.find('#page-content').isVisible()).toBe(false)

  mockUserStore.isInitialized = true
  await nextTick()
  expect(wrapper.find('.page-loading').exists()).toBe(false)
  expect(wrapper.find('.home-content').isVisible()).toBe(true)

  mockHomeStore.isFetching = true
  await router.push('/admin/other')
  expect(wrapper.find('.page-loading').exists()).toBe(false)
  expect(wrapper.find('.other-content').isVisible()).toBe(true)
  wrapper.unmount()
})
