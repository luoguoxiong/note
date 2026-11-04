const path = require('path')

module.exports = {
  // set your styleguidist configuration here
  title: 'Default Style Guide',
  components: 'src/components/**/*.vue',
  required: [path.join(__dirname, '')],
  sections: [
    {
      name: '原子组件',
      components: 'src/components/base/**/*.vue',
    },
    {
      name: 'UI组件',
      components: 'src/components/ui/**/*.vue',
    },
    {
      name: '业务组件',
      components: 'src/components/business/**/*.vue',
    },
  ],
  // webpackConfig: {
  //   // custom config goes here
  // },
  exampleMode: 'expand',
}
