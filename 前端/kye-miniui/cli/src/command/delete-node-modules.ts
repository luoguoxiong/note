const fs = require('fs');
const path = require('path')

const deleteNodeModules = (dirPath: string) => {
  // 获取当前目录下所有文件和文件夹
  const items = fs.readdirSync(dirPath)

  items.forEach((item: string) => {
    const fullPath = path.join(dirPath, item)
    const stat = fs.lstatSync(fullPath)

    if (stat.isDirectory()) {
      if (item === 'node_modules') {
        console.log(`Deleting ${fullPath}`)
        fs.rmdirSync(fullPath, { recursive: true }) // 删除 node_modules 文件夹及其内容
      } else {
        deleteNodeModules(fullPath) // 递归检查子目录
      }
    }
  });
};

// 获取项目根目录
const rootDir = path.resolve(__dirname, '../../../') // 确保此路径指向你的项目根目录

export const doDeleteNodeModules = () => {
  console.log(rootDir)
  deleteNodeModules(rootDir)
  console.log('All node_modules folders have been deleted.')
}
