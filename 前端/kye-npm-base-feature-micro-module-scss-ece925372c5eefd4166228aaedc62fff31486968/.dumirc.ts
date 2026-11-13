import { defineConfig } from 'dumi';

export default defineConfig({
  publicPath: process.env.NODE_ENV === 'production' ? '' : '/',
  runtimePublicPath: {},
  resolve:{
    docDirs:['packages', "docs"],
  },
  history: {type:"hash"},
  themeConfig: {
    name: '跨越互联网',
    nav: [
      { title: '首页', link: '/' },
      { title: 'Native', link: '/native' }, 
      { title: 'Utils', link: '/utils' }, 
      { title: 'Plateform', link: '/plateform' },
      { title: 'Cli', link: '/cli' },
      { title: '微前端', children: [
        { title: 'micro-module', link: '/micro-module' },
        { title: 'micro-native', link: '/micro-native' },
      ] },
      { title: 'Taro插件', link: '/taro-import-plugin',children:[
          { title: 'taro-subpackage-plugin', link: '/taro-subpackage-plugin' },
          { title: 'taro-import-plugin', link: '/taro-import-plugin' },
      ] },
    ],
  },
});
