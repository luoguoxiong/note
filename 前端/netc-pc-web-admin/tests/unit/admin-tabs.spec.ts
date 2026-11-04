import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import Tabs from '@/views/admin/components/tabs/index.vue'

jest.mock('@/stores/lightapp', () => ({
  useLightAppStore: () => ({ init: jest.fn().mockResolvedValue(undefined), lightAppList: [], menusList: [] }),
}))

const createTestRouter = () =>
  createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/admin/home', component: { template: '<div />' }, meta: { name: '首页' } },
      {
        path: '/admin/home/industry',
        component: { template: '<div />' },
        meta: { name: '行业解决方案', tabParentPath: '/admin/home' },
      },
      { path: '/admin/other', component: { template: '<div />' }, meta: { name: '其他页面' } },
    ],
  })

test('直接进入详情只创建首页页签，点击首页返回首页，关闭后离开详情', async () => {
  const router = createTestRouter()
  await router.push('/admin/home/industry')
  const wrapper = mount(Tabs, { props: { iframePaths: [], closeIframe: jest.fn() }, global: { plugins: [router] } })
  await flushPromises()
  expect(wrapper.findAll('.tab-item')).toHaveLength(1)
  expect(wrapper.find('.tab-item.active .tab-label').text()).toBe('首页')
  await wrapper.find('.tab-item').trigger('click')
  await flushPromises()
  expect(router.currentRoute.value.path).toBe('/admin/home')
  await router.push('/admin/home/industry')
  await flushPromises()
  expect(wrapper.findAll('.tab-item')).toHaveLength(1)
  await wrapper.find('.tab-close').trigger('click')
  await flushPromises()
  expect(router.currentRoute.value.path).toBe('/admin/home')
  wrapper.unmount()
})

test('其他页面独立打开，详情中关闭首页页签后切换到其他页面', async () => {
  const router = createTestRouter()
  await router.push('/admin/other')
  const closeIframe = jest.fn()
  const wrapper = mount(Tabs, { props: { iframePaths: [], closeIframe }, global: { plugins: [router] } })
  await flushPromises()
  expect(wrapper.find('.tab-item.active .tab-label').text()).toBe('其他页面')
  await router.push('/admin/home/industry')
  await flushPromises()
  expect(wrapper.findAll('.tab-label').map((item) => item.text())).toEqual(['其他页面', '首页'])
  await wrapper.find('.tab-item.active .tab-close').trigger('click')
  await flushPromises()
  expect(router.currentRoute.value.path).toBe('/admin/other')
  expect(wrapper.find('.tab-item.active .tab-label').text()).toBe('其他页面')
  expect(closeIframe).not.toHaveBeenCalled()
  wrapper.unmount()
})
