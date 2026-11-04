import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, reactive, ref } from 'vue'
import IndustryDetail from '@/views/admin/home/industry/index.vue'
import { getSecondPriorityData } from '@/apis/home'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const secondPriorityMock = require('../../mock/web.basicBiz.newHomepage.getSecondPriorityData')

const mockRoute = reactive({ query: { active: '3' } })
jest.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({
    back: jest.fn(),
    replace: ({ query }: { query: { active: string } }) => {
      mockRoute.query = query
    },
  }),
}))
jest.mock('@/apis/home', () => ({ getSecondPriorityData: jest.fn() }))
jest.mock('@netc-design-pc/ui', () => ({
  KBreadcrumb: { template: '<div />' },
}))

test('直接进入详情和切换标签均展示次优先级接口正文，空正文不使用旧静态内容', async () => {
  ;(getSecondPriorityData as jest.Mock).mockResolvedValue(secondPriorityMock.data)
  const items = JSON.parse(secondPriorityMock.data.data.solution).items
  const scrollContainer = document.createElement('div')
  scrollContainer.id = 'page-content'
  document.body.appendChild(scrollContainer)
  scrollContainer.scrollTop = 800
  const visible = ref(true)
  const host = mount(
    defineComponent({
      components: { IndustryDetail },
      setup: () => ({ visible }),
      template: '<KeepAlive><IndustryDetail v-if="visible" /></KeepAlive>',
    }),
    { global: { stubs: { ElSkeleton: { template: '<div />' } } } }
  )
  const wrapper = host.findComponent(IndustryDetail)
  await flushPromises()
  expect(scrollContainer.scrollTop).toBe(0)
  expect(getSecondPriorityData).toHaveBeenCalledTimes(1)
  expect(wrapper.find('.tab-item.active').text()).toBe(items[2].title)
  const panels = wrapper.findAll<HTMLElement>('.industry-panel')
  expect(panels[2].findAll('.html-content img')).toHaveLength(3)
  const originalImage = panels[2].find('img').element
  const tabs = wrapper.findAll('.tab-item')
  expect(tabs).toHaveLength(items.length)
  for (let index = 0; index < tabs.length; index++) {
    scrollContainer.scrollTop = 800
    await tabs[index].trigger('click')
    await flushPromises()
    expect(scrollContainer.scrollTop).toBe(0)
    expect(mockRoute.query.active).toBe(String(index + 1))
    expect(wrapper.find('.tab-item.active').text()).toBe(items[index].title)
    expect(panels[index].element.style.display).not.toBe('none')
    panels.forEach((panel, panelIndex) => {
      if (panelIndex !== index) expect(panel.element.style.display).toBe('none')
    })
    if (items[index].content) {
      const expected = document.createElement('div')
      expected.innerHTML = items[index].content
      expect(panels[index].find('.html-content').element.innerHTML).toBe(expected.innerHTML)
    } else {
      expect(panels[index].find('.empty-content').text()).toBe('暂无内容')
      expect(panels[index].find('.html-content').exists()).toBe(false)
    }
  }
  await tabs[2].trigger('click')
  await flushPromises()
  expect(panels[2].find('img').element).toBe(originalImage)
  visible.value = false
  await flushPromises()
  scrollContainer.scrollTop = 600
  visible.value = true
  await flushPromises()
  expect(scrollContainer.scrollTop).toBe(0)
  expect(getSecondPriorityData).toHaveBeenCalledTimes(1)
  host.unmount()
  scrollContainer.remove()
})

test('首图解码后才展示，切回不重建；解码失败和纯文字不阻塞正文', async () => {
  mockRoute.query = { active: '1' }
  const items = [
    { title: '图片', content: '<img src="/first.png"><img src="/second.png">' },
    { title: '失败图片', content: '<img src="/failed.png"><p>仍可查看</p>' },
    { title: '纯文字', content: '<p>无需等待</p>' },
  ]
  ;(getSecondPriorityData as jest.Mock).mockResolvedValue({ data: { solution: JSON.stringify({ items }) } })
  let finishDecode!: () => void
  const decode = jest
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finishDecode = resolve
        })
    )
    .mockRejectedValueOnce(new Error('image failed'))
  const originalDecode = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'decode')
  Object.defineProperty(HTMLImageElement.prototype, 'decode', { configurable: true, value: decode })
  const wrapper = mount(IndustryDetail, { global: { stubs: { ElSkeleton: { template: '<div />' } } } })
  try {
    await flushPromises()
    const panels = wrapper.findAll('.industry-panel')
    const content = panels[0].find<HTMLElement>('.html-content')
    expect(panels[0].find('.image-skeleton').exists()).toBe(true)
    expect(content.element.style.display).toBe('none')
    expect(panels[1].find('.image-skeleton').exists()).toBe(false)
    expect(panels[2].find('.image-skeleton').exists()).toBe(false)
    finishDecode()
    await flushPromises()
    expect(content.element.style.display).not.toBe('none')
    expect(panels[0].find('.image-skeleton').exists()).toBe(false)
    const image = content.find('img').element
    const tabs = wrapper.findAll('.tab-item')
    await tabs[1].trigger('click')
    await flushPromises()
    await tabs[0].trigger('click')
    await flushPromises()
    expect(panels[0].find('img').element).toBe(image)
    expect(decode).toHaveBeenCalledTimes(2)
    expect(panels[0].find('.image-skeleton').exists()).toBe(false)
  } finally {
    wrapper.unmount()
    if (originalDecode) Object.defineProperty(HTMLImageElement.prototype, 'decode', originalDecode)
    else Reflect.deleteProperty(HTMLImageElement.prototype, 'decode')
  }
})
