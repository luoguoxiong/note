// const demos = import.meta.glob('@packages/**/*.demo.vue')
/* 所有demo组件目录匹配 */
// export const demos = require.context('@packages/', true, /^\.\/(?!ky-miniui-lib\/)[^.]+.demo.vue$/)
// @ts-ignore
// export const demos = require.context('@doc/demos/input', true, /^\.\/(?!ky-miniui-lib\/)[^.]+.vue$/)
const extractComponent = (filePath: string) => {
  // 去掉 './' 前缀
  const cleanPath = filePath.replace(/^\.\//, '')
  const parts = cleanPath.split('/')
  // 目录名作为组件名
  const dirName = parts.length > 1 ? parts[0] : parts[0]
  // 文件名
  const fileName = parts.pop().replace('.vue', '')

  return {
    name: dirName, // 动态组件名
    fileName, // 组件用例名
  }
}

export const demos = require.context('@doc/demos', true, /^\.\/(?!ky-miniui-lib\/)[^.]+.vue$/)
/* demo组件列表收集 */
export const demoComponents = demos.keys().map((path) => {
  console.log('path.loader', path)
  const name = path // 获取文件夹 + 文件名称作为组件名
  // const name = path.split('/')[1] // 获取文件夹名称作为组件名
  return {
    name,
    componentName: extractComponent(name)?.name,
    component: demos(path).default, // 导入 Vue 组件
  }
})
