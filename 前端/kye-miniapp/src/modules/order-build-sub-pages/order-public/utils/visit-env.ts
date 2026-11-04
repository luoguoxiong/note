/**
 * 零依赖的环境判断工具
 *
 * 注意：此文件不允许 import 任何其他模块。
 * 原因：utils/index.ts 在模块顶层调用 getVisitEnv() 初始化 $native，
 * 而 env.ts 依赖 auth/reportUmp 又会反向依赖 utils/index，形成循环依赖。
 * 把 getVisitEnv 放在叶子文件中，保证 utils/index 初始化时它一定已定义。
 */

/**
 * @description 获取env
 */
export const getVisitEnv = () => {
  let visitEnv = 'prod'
  const host = window.location.host
  host.replace(/stg.kye|uat.kye/gi, (ele: string): string => {
    switch (ele) {
      case 'stg.kye':
        visitEnv = 'stg'
        break
      case 'uat.kye':
        visitEnv = 'uat'
        break
      default:
        visitEnv = 'prod'
    }
    return visitEnv
  })
  console.log('visitEnv', visitEnv)
  return visitEnv
}
