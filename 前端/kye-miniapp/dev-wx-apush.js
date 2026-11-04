/**
 * @Desc: dev:wx:apush 构建包装脚本（Android 推送联调用）
 * @Date: 2026/10/13
 *
 * 构建命令与 dev:wx 完全一致：taro build --type weapp --watch --mode uat
 * 区别是构建期间临时替换以下文件，进程退出（含 Ctrl+C）后自动还原：
 *  1. project.miniapp.json <- project.miniapp.uat.json
 *  2. src/public/appPlugins/constants/index.ts 中「消息推送」插件 ID 使用 wxd42b3c0b319911b2
 *
 * 若构建期间文件被手动修改，退出时不会覆盖，保留修改后的内容。
 */
/* eslint-disable no-undef */
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')

const root = __dirname
const PUSH_ID_ANDROID = 'wxd42b3c0b319911b2'
const TARO_ARGS = ['build', '--type', 'weapp', '--watch', '--mode', 'uat']

const relPath = (abs) => path.relative(root, abs)

// 预先读取全部内容并计算替换结果，任何一步失败都不会修改文件
const targets = [
  {
    abs: path.join(root, 'project.miniapp.json'),
    getSwapped: () => fs.readFileSync(path.join(root, 'project.miniapp.uat.json'), 'utf8'),
  },
  {
    abs: path.join(root, 'src/public/appPlugins/constants/index.ts'),
    getSwapped: (original) =>
      original.replace(
        /^(\s*)'消息推送'\s*=\s*'[^']*'(,)/m,
        `$1'消息推送' = '${PUSH_ID_ANDROID}'$2`
      ),
  },
].map(({ abs, getSwapped }) => {
  const original = fs.readFileSync(abs, 'utf8')
  return { abs, original, swapped: getSwapped(original), changed: false }
})

const pushTarget = targets[1]
if (!new RegExp(`^\\s*'消息推送'\\s*=\\s*'${PUSH_ID_ANDROID}'`, 'm').test(pushTarget.swapped)) {
  console.error(`[apush] ❌ ${relPath(pushTarget.abs)} 中未找到「消息推送」枚举项，已中止`)
  process.exit(1)
}

let restored = false
const restore = () => {
  if (restored) return
  restored = true
  for (const item of targets) {
    if (!item.changed) continue
    let current = null
    try {
      current = fs.readFileSync(item.abs, 'utf8')
    } catch (e) {
      // 文件在构建期间被删除，跳过还原
      continue
    }
    if (current === item.swapped) {
      fs.writeFileSync(item.abs, item.original)
      console.log(`[apush] 已还原 ${relPath(item.abs)}`)
    } else {
      console.warn(`[apush] ⚠️ ${relPath(item.abs)} 在构建期间被修改，为避免覆盖已保留当前内容`)
    }
  }
}

process.on('exit', restore)
// 拦截退出信号不立即退出，等 taro 子进程退出后统一还原文件
process.on('SIGINT', () => {})
process.on('SIGTERM', () => {})

for (const item of targets) {
  if (item.original === item.swapped) continue
  fs.writeFileSync(item.abs, item.swapped)
  item.changed = true
  console.log(`[apush] 已切换 ${relPath(item.abs)}`)
}

// 直接用 node 执行 Taro CLI 入口脚本，避免 Windows 下 .bin/taro（Unix 脚本）无法 spawn 的问题
const taroCli = path.join(root, 'node_modules', '@tarojs', 'cli', 'bin', 'taro')
const child = spawn(process.execPath, [taroCli, ...TARO_ARGS], {
  stdio: 'inherit',
  cwd: root,
})

child.on('error', (err) => {
  console.error('[apush] ❌ 启动 taro 失败:', err.message)
  process.exit(1)
})

child.on('exit', (code) => {
  restore()
  process.exit(code == null ? 0 : code)
})
