// demo-loader.ts
interface DemoItem {
  name: string
  loader: () => Promise<any>
}

let demoComponents: DemoItem[] = []

if (process.env.TARO_ENV === 'h5') {
  const modules = import.meta.glob('@/docs/demos/**/*.vue')

  demoComponents = Object.keys(modules).map((path) => {
    const name = path
      .replace(/^\/src\/docs\/demos\//, '')
      .replace(/\//g, '-')
      .replace(/\.vue$/, '')

    return {
      name,
      loader: modules[path], // 直接给 defineAsyncComponent 使用
    }
  })
}

export default demoComponents
