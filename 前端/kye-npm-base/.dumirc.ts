import { defineConfig } from 'dumi'

export default defineConfig({
  publicPath: process.env.NODE_ENV === 'production' ? '' : '/',
  runtimePublicPath: {},
  resolve: {
    docDirs: ['packages', 'docs'],
  },
  history: { type: 'hash' },
  themeConfig: {
    name: '跨越互联网',
    nav: [
      { title: '首页', link: '/' },
      { title: 'Native', link: '/native' },
      { title: 'Utils', link: '/utils' },
      { title: 'Plateform', link: '/plateform' },
      { title: 'Cli', link: '/cli' },
      {
        title: 'Taro插件',
        link: '/taro-import-plugin',
        children: [
          { title: 'taro-subpackage-plugin', link: '/taro-subpackage-plugin' },
          { title: 'taro-import-plugin', link: '/taro-import-plugin' },
          { title: 'taro-debug-page', link: '/taro-debug-page' },
        ],
      },
    ],
  },
})
