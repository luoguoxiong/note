import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Industry from '@/views/home/module/module-industry-info/index.vue'
import { useHomeStore } from '@/stores/home'

jest.mock('@/utils/request/request', () => ({ http: jest.fn() }))
jest.mock('@/utils/native', () => ({}))
jest.mock('@/utils/reportApp', () => ({ report: jest.fn(), ReportAppTimeEnum: {} }))
jest.mock('vue-router', () => ({ useRouter: () => ({ push: jest.fn() }) }))
jest.mock('@netc-design-pc/ui', () => ({ KButton: {} }))
// eslint-disable-next-line @typescript-eslint/no-var-requires
const secondMock = require('../../mock/web.basicBiz.newHomepage.getSecondPriorityData')

test('封面空值按 menuId 使用原 Mock 图片，接口图片优先且不补出缺失行业', () => {
  localStorage.clear()
  setActivePinia(createPinia())
  const store = useHomeStore()
  const originals = JSON.parse(secondMock.data.data.solutionCmsConfig)
  const emptyCovers = ['', null, undefined, '   ', '', null]
  store.industryInfo = originals
    .map((item: Record<string, unknown>, index: number) => ({
      ...item,
      coverImg: emptyCovers[index],
    }))
    .reverse()
  store.industryInfo.push({ title: '未知行业', menuId: 9999, coverImg: '' })
  store.industryInfo.push({ title: '接口封面', menuId: 1675, coverImg: 'https://example.com/cover.png' })
  const wrapper = mount(Industry, {
    global: { stubs: { IndustryCard: true }, directives: { 'exposure-report': {} } },
  })
  const cards = wrapper.findAllComponents({ name: 'IndustryCard' })
  expect(cards).toHaveLength(originals.length + 1)
  expect(cards.map((card) => card.props('item').imageUrl)).toEqual([
    ...originals.map((item: { coverImg: string }) => item.coverImg).reverse(),
    'https://example.com/cover.png',
  ])
  wrapper.unmount()
})
