// 获取同目录下的所有svg文件名
const fs = require('fs')
const path = require('path')

const svgPath = path.join(__dirname, './svg'),
  svgNamesPath = path.join(__dirname, './svgNames.js')

let str = 'export default [\n',
  fileNums = 0

fs.readdir(svgPath, (err, files) => {
  fileNums = files.length
  //组装内容字符串
  for (const f of files) {
    str += `  '${f}',\n`
  }
  str += ']\n'

  // 创建一个缓冲区，存放要写入的内容
  const buffer = Buffer.from(str)

  // 打开getSvgNames.js，获取文件描述符fd
  fs.open(svgNamesPath, 'w', (err, fd) => {
    if (err) {
      console.error(err)
      return
    }
    // 将缓冲区中的数据写入到文件中，从缓冲区的第0个字节开始，写入缓冲区的长度，从文件的第0个字节开始
    fs.write(fd, buffer, 0, buffer.length, 0, (err) => {
      if (err) {
        console.error(err)
        return
      }
      // 关闭文件
      fs.close(fd, (err) => {
        if (err) {
          console.error(err)
          return
        }
        console.log('已生成svg名称列表,svg个数为:', fileNums)
      })
    })
  })
})
