import type { FilterReport, MiniPlatform } from './types'

const PREFIX = '[taro-debug-page]'

/** 输出一个分组的路径列表 */
const printGroup = (title: string, items: string[], empty = '无'): void => {
  console.log(`${PREFIX} ${title}`)
  if (items.length === 0) {
    console.log(`${PREFIX}   ${empty}`)
    return
  }
  items.forEach((item) => console.log(`${PREFIX}   - ${item}`))
}

/** 输出过滤后的错误（不生成配置） */
export const printFilterError = (message: string): void => {
  console.error(`${PREFIX} 过滤已中止：${message}`)
}

/**
 * 按目标页面、自动保留页面、保留模块、关联路由、裁剪分包、动态风险分组输出报告
 */
export const printReport = (platform: MiniPlatform, report: FilterReport): void => {
  console.log(`${PREFIX} 已启用 ${platform} 按需调试，本次构建仅注册以下页面`)
  printGroup('目标页面:', report.targetPages)
  printGroup('自动保留页面:', report.keptPages)
  printGroup('保留模块(首页依赖):', report.keptModuleRoots)
  printGroup('静态关联跳转页面(请按需补充到 --debug-pages):', report.routePages)
  printGroup('已裁剪分包:', report.removedPackages)
  printGroup('动态风险:', report.warnings, '无')
}
