// copy-h5.js
const fs = require('fs-extra')
const path = require('path')

const from = path.resolve(__dirname, '../../../preview/taro-demo/dist/h5')
const to = path.resolve(__dirname, '../../../docs/.vitepress/dist/h5')

if (fs.existsSync(from)) {
  fs.removeSync(to)
  fs.copySync(from, to)
  console.log('H5 文件已复制到 VitePress public 目录', to)
} else {
  console.warn('H5 目录不存在，跳过复制', from)
}
