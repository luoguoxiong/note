import DefaultTheme from 'vitepress/theme'
import { AntDesignContainer } from '@vitepress-demo-preview/component'
import '@vitepress-demo-preview/component/dist/style.css'
import { EnhanceAppContext } from 'vitepress'
import ElementPlus from 'element-plus'
import { computed, h } from 'vue'
import { useData } from 'vitepress'
import 'element-plus/dist/index.css'
import './style/theme.css'
import DemoIframe from './components/demoIframe.vue'
import ComponentPreview from './components/componentPreview.vue'
import AsidePreview from './components/aside-preview.vue'
import CodeDemoPreview from './components/code-demo-preview.vue'
// import DemoUiLib from "@ky-miniui-lib/ky-miniui-lib";
// import DemoUiLib from "@lib/ky-miniui-lib.es.js";

export default {
  ...DefaultTheme,
  async enhanceApp(ctx: EnhanceAppContext) {
    ctx.app.use(ElementPlus)
    ctx.app.component('demo-preview', AntDesignContainer)
    ctx.app.component('DemoPreview', CodeDemoPreview)
    ctx.app.component('demo-iframe', DemoIframe)
    ctx.app.component('component-preview', ComponentPreview)
  },
  // 🔥 替换默认 Layout
  Layout: (props) => {
    const Layout = DefaultTheme.Layout
    const { page } = useData()
    const showAsideBottom = computed(() => {
      if (!page.value?.filePath) return false
      // components 目录下的页面显示
      return page.value.filePath.startsWith('components/')
    })
    return h(Layout, props, {
      'aside-top': () => {
        if (showAsideBottom.value) {
          return h('div', { class: 'custom-aside-before' }, '')
        } else {
          return null
        }
      },
      'aside-bottom': () => h(AsidePreview),
      // h('div', { class: 'custom-after' }, '📢 底部广告位'),
    })
  },
}
