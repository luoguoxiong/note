import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import HomeAbout from '@/views/home/module/module-home-about/index.vue'
import { useHomeStore } from '@/stores/home'
import { http } from '@/utils/request/request'

jest.mock('@/utils/request/request', () => ({ http: jest.fn() }))
jest.mock('@netc-design-pc/ui', () => ({ KButton: {}, KIcon: {} }))
jest.mock('@netc-design-pc/icons', () => ({ CloseGrey: {} }))
jest.mock('@/utils/native', () => ({}))
jest.mock('@/utils/reportApp', () => ({ report: jest.fn(), ReportAppTimeEnum: {} }))
jest.mock('vue-router', () => ({ useRouter: () => ({ push: jest.fn() }) }))
// eslint-disable-next-line @typescript-eslint/no-var-requires
const firstMock = require('../../mock/web.basicBiz.newHomepage.getFirstPriorityData')

test('renders profile videos, opens their URLs and hides the module without video data', async () => {
  localStorage.clear()
  sessionStorage.clear()
  setActivePinia(createPinia())
  const first = firstMock.data()
  const profile = [1, 2, 3].map((id) => ({
    title: `video-${id}`,
    subTitle: '',
    videoCover: `https://example.com/${id}.png`,
    videoUrl: `https://example.com/${id}.mp4`,
  }))
  const second: { data: { profile?: typeof profile } } = { data: { profile } }
  ;(http as jest.Mock).mockImplementation((method: string) =>
    Promise.resolve(
      JSON.parse(
        JSON.stringify(
          method.endsWith('getFirstPriorityData')
            ? first
            : method.endsWith('getSecondPriorityData')
            ? second
            : { data: {} }
        )
      )
    )
  )
  const store = useHomeStore()
  await store.getHomeModuleData()
  const wrapper = mount(HomeAbout, {
    global: {
      stubs: { More: true, FullscreenIframe: true },
      directives: { 'exposure-report': {}, 'click-report': {} },
    },
  })
  expect(wrapper.findAll('.brand-card')).toHaveLength(3)
  expect(wrapper.findAll('.card-image').map((item) => item.attributes('src'))).toEqual(
    profile.map((item) => item.videoCover)
  )
  await wrapper.findAll('.brand-card')[2].trigger('click')
  expect(wrapper.findComponent({ name: 'FullscreenIframe' }).attributes('src')).toBe(profile[2].videoUrl)
  second.data.profile = undefined
  await store.getHomeModuleData()
  await flushPromises()
  expect(wrapper.find('#home-page-about').exists()).toBe(false)
  wrapper.unmount()
})
