// @ts-nocheck

/**
 * @Desc: register-native-components
 * @Date: 2025/11/20
 */

import fs from 'fs'
import path from 'path'
import { RegisterComponentOptions } from './types'

// 组件库原生组件目录（构建产物路径）
const nativeComponentsRoot = path.resolve(process.cwd(), './node_modules/@kye-netc/kye-miniui/packages/__native')

// 递归拷贝目录或文件
function copyDirectory(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) {
    console.warn(`⚠️ 源目录不存在: ${srcDir}`)
    return
  }

  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true })
  const entries = fs.readdirSync(srcDir, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name)
    const destPath = path.join(destDir, entry.name)

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath) // 递归拷贝子目录
    } else {
      fs.copyFileSync(srcPath, destPath) // 拷贝文件
    }
  }
}

// 注册原生组件
export function registerNativeComponents({ projectRoot = '', dest, components = [] }: RegisterComponentOptions) {
  const destRoot = dest || path.resolve(projectRoot, 'dist/weapp/native-components')

  // 始终拷贝 utils
  const utilsSrc = path.join(nativeComponentsRoot, 'utils')
  const utilsDest = path.join(destRoot, 'utils')
  copyDirectory(utilsSrc, utilsDest)
  console.log(`[原生组件] ✅ Registered utils folder`)

  // 拷贝指定组件
  for (const name of components) {
    const src = path.join(nativeComponentsRoot, name)
    const dest = path.join(destRoot, name)

    if (!fs.existsSync(src)) {
      console.warn(`⚠️ 未找到组件: ${name} (${src})`)
      continue
    }

    copyDirectory(src, dest)
    console.log(`[原生组件] ✅ Registered native component: ${name}`)
    // console.log(`原生组件] ✅ Registered native component: ${name} (${src} → ${dest})`)
  }
}

export default { registerNativeComponents }
