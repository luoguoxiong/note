import { DefaultTheme, defineConfig } from 'vitepress'
import { componentPreview, containerPreview } from '@vitepress-demo-preview/plugin'
import { localComponentPreview } from './theme/plugin'
import { components } from '../components'
import path, { resolve } from 'path'

const nav: DefaultTheme.NavItem[] = [
  { text: '指南', link: '/guide/' },
  { text: '组件', link: '/components/button' },
]

const sidebar: DefaultTheme.Sidebar = {
  '/guide': [
    {
      text: '指南',
      items: [
        { text: '组件库介绍', link: '/guide/' },
        { text: '快速开始', link: '/guide/quickstart' },
        { text: '更新日志', link: '/guide/changelog' },
        { text: '问题反馈', link: '/guide/qa' },
      ],
    },
  ],
  '/components': [
    {
      items: [...components],
    },
  ],
}

export default defineConfig({
  title: '浏览器标题',
  description: '浏览器描述',
  lang: 'cn-ZH',
  base: '/',
  lastUpdated: true,
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  themeConfig: {
    siteTitle: 'kye-miniui',
    logo: 'https://ic-img.ky-express.com/kye-miniapp/user/kye-logo.png',
    outline: 3,
    socialLinks: [],
    search: {
      provider: 'local',
    },
    nav,
    sidebar,
  },
  markdown: {
    theme: {
      light: 'vitesse-light',
      dark: 'vitesse-dark',
    },
    lineNumbers: true,
    config(md) {
      md.use(componentPreview)
      md.use(containerPreview)
      md.use(localComponentPreview)
    },
  },
  vite: {
    build: {
      assetsDir: 'assets',
    },
    resolve: {
      alias: {
        '@lib': path.resolve(__dirname, '../../lib'),
      },
    },
    // 仅用于dev
    publicDir: process.env.NODE_ENV === 'production' ? 'public' : resolve(__dirname, '../../preview/taro-demo/dist/h5'),
  },
})
