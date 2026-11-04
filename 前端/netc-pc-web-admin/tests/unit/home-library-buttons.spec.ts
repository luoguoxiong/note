import { mount } from '@vue/test-utils'
import PreferenceCard from '@/views/home/module/module-recommon-card/components/preference-card.vue'
import TabNav from '@/views/home/module/module-recommon-card/components/tab-nav.vue'
import IndustryCard from '@/views/home/module/module-industry-info/components/industry-card.vue'

// 测试真实按钮实现，避免组件库总入口加载本用例不涉及的表格依赖。
jest.mock('@netc-design-pc/ui', () => ({
  KButton: jest.requireActual('../../node_modules/@netc-design-pc/ui/dist/cjs/components/button/index.js').KButton,
}))

const global = { directives: { 'click-report': () => undefined } }

test('推荐配置按钮加载时阻止重复操作，恢复后只触发一次', async () => {
  const wrapper = mount(PreferenceCard, { props: { isLoading: true }, global })
  expect(wrapper.find('button.k-button').exists()).toBe(true)
  await wrapper.find('button').trigger('click')
  expect(wrapper.emitted('action')).toBeUndefined()
  await wrapper.setProps({ isLoading: false })
  await wrapper.find('button').trigger('click')
  expect(wrapper.emitted('action')).toHaveLength(1)
  wrapper.unmount()
})

test('推荐配置切换按钮保留当前项及变更事件', async () => {
  const wrapper = mount(TabNav, {
    props: {
      tabs: [
        { key: 'a', label: '收货偏好' },
        { key: 'b', label: '寄件模板' },
      ],
      current: 0,
    },
  })
  expect(wrapper.findAll('button.k-button')).toHaveLength(2)
  await wrapper.findAll('button')[1].trigger('click')
  expect(wrapper.emitted('update:current')).toEqual([[1]])
  expect(wrapper.emitted('change')).toEqual([[1]])
  wrapper.unmount()
})

test('行业卡片仍能通过图片区域触发一次业务点击', async () => {
  const item = { title: '3C电子', desc: '', imageUrl: 'test.png', active: 0, menuId: 1675 }
  const wrapper = mount(IndustryCard, { props: { item }, global })
  expect(wrapper.find('button.k-button').exists()).toBe(true)
  await wrapper.find('img').trigger('click')
  expect(wrapper.emitted('click')).toEqual([[item]])
  wrapper.unmount()
})
