<template>
  <div class="electron-test-page">
    <!-- 左侧导航 -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <span class="logo-icon">E</span>
        <span class="logo-text">Electron 壳测试</span>
      </div>
      <div class="env-info">
        <div class="env-badge" :class="{ active: isClientMode }">
          {{ isClientMode ? '壳环境' : '浏览器环境' }}
        </div>
        <div class="env-type" v-if="isClientMode">壳类型: {{ clientFrameTypeName }}</div>
      </div>
      <nav class="sidebar-nav">
        <div
          v-for="item in navList"
          :key="item.id"
          class="nav-item"
          :class="{ active: activeSection === item.id }"
          @click="scrollTo(item.id)"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </div>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <header class="content-header">
        <h1 class="page-title">Electron 壳能力测试</h1>
        <p class="page-desc">测试与客户端壳交互的所有能力方法</p>
      </header>

      <div class="demo-wrapper">
        <!-- 壳类型判断 -->
        <section id="client-mode" class="demo-section">
          <h2 class="section-title">壳类型判断</h2>
          <p class="section-desc">判断当前运行环境的壳类型</p>
          <div class="section-block">
            <div class="block-content">
              <el-button @click="testIsClientMode">isClientMode</el-button>
              <el-button @click="testIsOldClientMode">isOldClientMode</el-button>
              <el-button @click="testIsElectronClientMode">isElectronClientMode</el-button>
              <el-button @click="testIsKuaShenClientMode">isKuaShenClientMode</el-button>
              <el-button @click="testGetClientFrameType">getClientFrameType</el-button>
              <el-button @click="testIsNativeOffline">is_native_offline</el-button>
            </div>
            <div class="result-area" v-if="results.clientMode">
              <pre>{{ JSON.stringify(results.clientMode, null, 2) }}</pre>
            </div>
          </div>
        </section>

        <!-- 窗体操作 -->
        <section id="window" class="demo-section">
          <h2 class="section-title">窗体操作</h2>
          <p class="section-desc">控制窗口的各种操作</p>
          <div class="section-block">
            <div class="block-content">
              <el-button @click="testWinGetState">win.getState</el-button>
              <el-button @click="testWinMinimize">win.minimize</el-button>
              <el-button @click="testWinMaximize">win.maximize</el-button>
              <el-button @click="testWinResume">win.resume</el-button>
              <el-button @click="testWinClose" type="danger">win.close</el-button>
              <el-button @click="testWinSizable">win.sizable</el-button>
              <el-button @click="testWinNoSizable">win.noSizable</el-button>
            </div>
            <div class="result-area" v-if="results.window">
              <pre>{{ JSON.stringify(results.window, null, 2) }}</pre>
            </div>
          </div>
        </section>

        <!-- 缓存操作 -->
        <section id="cache" class="demo-section">
          <h2 class="section-title">缓存操作</h2>
          <p class="section-desc">获取和设置壳缓存</p>
          <div class="section-block">
            <div class="block-content">
              <div class="input-group">
                <el-input v-model="cacheKey" placeholder="缓存Key" style="width: 200px; margin-right: 10px"></el-input>
                <el-input
                  v-model="cacheValue"
                  placeholder="缓存Value"
                  style="width: 200px; margin-right: 10px"
                ></el-input>
              </div>
              <el-button type="primary" @click="testSetCacheInfo">setCacheInfo</el-button>
              <el-button @click="testGetCacheInfo">getCacheInfo</el-button>
            </div>
            <div class="result-area" v-if="results.cache">
              <pre>{{ JSON.stringify(results.cache, null, 2) }}</pre>
            </div>
          </div>
        </section>

        <!-- 打印相关 -->
        <section id="print" class="demo-section">
          <h2 class="section-title">打印相关</h2>
          <p class="section-desc">获取打印机列表和打印操作</p>
          <div class="section-block">
            <div class="block-content">
              <el-button @click="testGetPrinterList">getPrinterList</el-button>
              <el-button @click="testStartKYEPrinter" type="primary">startKYEPrinter</el-button>
            </div>
            <div class="result-area" v-if="results.print">
              <pre>{{ JSON.stringify(results.print, null, 2) }}</pre>
            </div>
          </div>
        </section>

        <!-- 文件操作 -->
        <section id="file" class="demo-section">
          <h2 class="section-title">文件操作</h2>
          <p class="section-desc">文件选择、下载、Excel 读取等</p>
          <div class="section-block">
            <div class="block-content">
              <el-button @click="testSelectFileToBase64">selectFileToBase64</el-button>
              <el-button @click="testExportTable">exportTable</el-button>
            </div>
            <div class="result-area" v-if="results.file">
              <pre>{{ JSON.stringify(results.file, null, 2) }}</pre>
            </div>
          </div>
        </section>

        <!-- 版本与系统信息 -->
        <section id="version" class="demo-section">
          <h2 class="section-title">版本与系统信息</h2>
          <p class="section-desc">获取壳版本、系统信息等</p>
          <div class="section-block">
            <div class="block-content">
              <el-button @click="testGetVersion">getVersion</el-button>
              <el-button @click="testIsNewVersion">isNewVersion</el-button>
              <el-button @click="testGetMachineId">getMachineId</el-button>
              <el-button @click="testGetSystemInfo">getSystemInfo</el-button>
              <el-button @click="testEnvironment">environment</el-button>
            </div>
            <div class="result-area" v-if="results.version">
              <pre>{{ JSON.stringify(results.version, null, 2) }}</pre>
            </div>
          </div>
        </section>

        <!-- 代理相关 -->
        <section id="proxy" class="demo-section">
          <h2 class="section-title">代理相关</h2>
          <p class="section-desc">获取和设置网络代理</p>
          <div class="section-block">
            <div class="block-content">
              <el-button @click="testGetProxyInfo">getProxyInfo</el-button>
              <el-button @click="testTestProxy">testProxy</el-button>
            </div>
            <div class="result-area" v-if="results.proxy">
              <pre>{{ JSON.stringify(results.proxy, null, 2) }}</pre>
            </div>
          </div>
        </section>

        <!-- 页面操作 -->
        <section id="page" class="demo-section">
          <h2 class="section-title">页面操作</h2>
          <p class="section-desc">刷新页面、清除缓存等</p>
          <div class="section-block">
            <div class="block-content">
              <el-button @click="testReload">reload</el-button>
              <el-button @click="testReloadCurrentPage">reloadCurrentPage</el-button>
              <el-button @click="testClearCache">clearCache</el-button>
            </div>
            <div class="result-area" v-if="results.page">
              <pre>{{ JSON.stringify(results.page, null, 2) }}</pre>
            </div>
          </div>
        </section>

        <!-- 窗口控制 -->
        <section id="window-control" class="demo-section">
          <h2 class="section-title">窗口控制</h2>
          <p class="section-desc">拖动、右键菜单、聚焦等</p>
          <div class="section-block">
            <div class="block-content">
              <el-button @click="testWindowMove">windowMove</el-button>
              <el-button @click="testMainWindowFocus">mainWindowFocus</el-button>
              <el-button @click="testMainWindowBlur">mainWindowBlur</el-button>
            </div>
            <div class="result-area" v-if="results.windowControl">
              <pre>{{ JSON.stringify(results.windowControl, null, 2) }}</pre>
            </div>
          </div>
        </section>

        <!-- 缩放（跨声 3.0） -->
        <section id="zoom" class="demo-section">
          <h2 class="section-title">缩放（跨声 3.0）</h2>
          <p class="section-desc">控制页面缩放比例</p>
          <div class="section-block">
            <div class="block-content">
              <el-button @click="testSwitchZoom('add')">switchZoom(add)</el-button>
              <el-button @click="testSwitchZoom('decrease')">switchZoom(decrease)</el-button>
              <el-button @click="testGetZoom">getZoom</el-button>
            </div>
            <div class="result-area" v-if="results.zoom">
              <pre>{{ JSON.stringify(results.zoom, null, 2) }}</pre>
            </div>
          </div>
        </section>

        <!-- 截图（跨声 3.0） -->
        <section id="capture" class="demo-section">
          <h2 class="section-title">截图（跨声 3.0）</h2>
          <p class="section-desc">调用壳的截图功能</p>
          <div class="section-block">
            <div class="block-content">
              <el-button type="primary" @click="testStartCaptureWnd">startCaptureWnd</el-button>
            </div>
            <div class="result-area" v-if="results.capture">
              <pre>{{ JSON.stringify(results.capture, null, 2) }}</pre>
            </div>
          </div>
        </section>

        <!-- 剪贴板 -->
        <section id="clipboard" class="demo-section">
          <h2 class="section-title">剪贴板</h2>
          <p class="section-desc">获取剪贴板内容和图片</p>
          <div class="section-block">
            <div class="block-content">
              <el-button @click="testGetClipboardContent">getClipboardContent</el-button>
              <el-button @click="testGetClipboardImageFile">getClipboardImageFile</el-button>
            </div>
            <div class="result-area" v-if="results.clipboard">
              <pre>{{ JSON.stringify(results.clipboard, null, 2) }}</pre>
            </div>
          </div>
        </section>

        <!-- 链接 -->
        <section id="url" class="demo-section">
          <h2 class="section-title">链接</h2>
          <p class="section-desc">打开浏览器链接</p>
          <div class="section-block">
            <div class="block-content">
              <el-input v-model="testUrl" placeholder="请输入链接" style="width: 300px; margin-right: 10px"></el-input>
              <el-button @click="testNativeOpenUrl">nativeOpenUrl</el-button>
              <el-button @click="testNativeBrowserOpenUrl">nativeBrowserOpenUrl</el-button>
            </div>
            <div class="result-area" v-if="results.url">
              <pre>{{ JSON.stringify(results.url, null, 2) }}</pre>
            </div>
          </div>
        </section>

        <!-- 开发工具 -->
        <section id="devtools" class="demo-section">
          <h2 class="section-title">开发工具</h2>
          <p class="section-desc">打开开发者工具等调试功能</p>
          <div class="section-block">
            <div class="block-content">
              <el-button type="warning" @click="testOpenDevTools">openDevTools</el-button>
            </div>
            <div class="result-area" v-if="results.devtools">
              <pre>{{ JSON.stringify(results.devtools, null, 2) }}</pre>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { native } from '@kye-netc/micro-native'

const activeSection = ref('client-mode')
const results = ref<Record<string, Record<string, unknown>>>({})
const cacheKey = ref('testKey')
const cacheValue = ref('testValue')
const testUrl = ref('https://www.kuaidi100.com')

const navList = [
  { id: 'client-mode', label: '壳类型判断', icon: '🔍' },
  { id: 'window', label: '窗体操作', icon: '🪟' },
  { id: 'cache', label: '缓存操作', icon: '💾' },
  { id: 'print', label: '打印相关', icon: '🖨️' },
  { id: 'file', label: '文件操作', icon: '📁' },
  { id: 'version', label: '版本信息', icon: '📋' },
  { id: 'proxy', label: '代理相关', icon: '🌐' },
  { id: 'page', label: '页面操作', icon: '📄' },
  { id: 'window-control', label: '窗口控制', icon: '🎮' },
  { id: 'zoom', label: '缩放', icon: '🔍' },
  { id: 'capture', label: '截图', icon: '📸' },
  { id: 'clipboard', label: '剪贴板', icon: '📋' },
  { id: 'url', label: '链接', icon: '🔗' },
  { id: 'devtools', label: '开发工具', icon: '⚙️' },
]

const isClientMode = ref(false)

native.isClientMode().then((res) => (isClientMode.value = res))

const clientFrameTypeName = ref()
native.getClientFrameType().then((type) => {
  const typeMap: Record<number, string> = {
    1: '旧壳',
    2: 'MiniBlink',
    3: 'CefSharp',
    4: 'WebView2',
    5: 'Electron',
    6: '跨声 3.0',
  }
  clientFrameTypeName.value = type ? typeMap[type] || type : '未知'
})

const scrollTo = (id: string) => {
  activeSection.value = id
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const setResult = (category: string, data: Record<string, unknown>) => {
  results.value[category] = data
}

const wrapTest = async (category: string, fn: () => Promise<unknown>) => {
  try {
    const result = await fn()
    setResult(category, { success: true, data: result })
    ElMessage.success(`${category} 调用成功`)
  } catch (error) {
    setResult(category, { success: false, error: String(error) })
    ElMessage.error(`${category} 调用失败: ${error}`)
  }
}

// 壳类型判断
const testIsClientMode = async () => {
  const result = await native.isClientMode()
  setResult('clientMode', { method: 'isClientMode', result })
}

const testIsOldClientMode = async () => {
  const result = await native.isOldClientMode()
  setResult('clientMode', { method: 'isOldClientMode', result })
}

const testIsElectronClientMode = async () => {
  const result = await native.isElectronClientMode()
  setResult('clientMode', { method: 'isElectronClientMode', result })
}

const testIsKuaShenClientMode = async () => {
  const result = await native.isKuaShenClientMode()
  setResult('clientMode', { method: 'isKuaShenClientMode', result })
}

const testGetClientFrameType = async () => {
  const result = await native.getClientFrameType()
  setResult('clientMode', { method: 'getClientFrameType', result, typeName: clientFrameTypeName.value })
}

const testIsNativeOffline = async () => {
  const result = await native.is_native_offline()
  setResult('clientMode', { method: 'is_native_offline', result })
}

// 窗体操作
const testWinGetState = () => wrapTest('window', () => native.getState())
const testWinMinimize = () => wrapTest('window', () => native.minimize())
const testWinMaximize = () => wrapTest('window', () => native.maximize())
const testWinResume = () => wrapTest('window', () => native.resume())
const testWinClose = () => {
  if (confirm('确定要关闭窗口吗？')) {
    wrapTest('window', () => native.close())
  }
}
const testWinSizable = () => wrapTest('window', () => native.sizable())
const testWinNoSizable = () => wrapTest('window', () => native.noSizable())

// 缓存操作
const testGetCacheInfo = () => wrapTest('cache', () => native.getCacheInfo(cacheKey.value))
const testSetCacheInfo = () => wrapTest('cache', () => native.setCacheInfo(cacheKey.value, cacheValue.value))

// 打印相关
const testGetPrinterList = () => wrapTest('print', () => native.getPrinterList())
const testStartKYEPrinter = () => wrapTest('print', () => native.startKYEPrinter({}))

// 文件操作
const testSelectFileToBase64 = () => wrapTest('file', () => native.selectFileToBase64('*'))
const testExportTable = () => {
  const testData = [
    { name: '张三', age: 25, city: '北京' },
    { name: '李四', age: 30, city: '上海' },
  ]
  wrapTest('file', () => native.exportTable(testData, '测试导出.xlsx'))
}

// 版本与系统信息
const testGetVersion = () => wrapTest('version', () => native.getVersion())
const testIsNewVersion = () => wrapTest('version', () => native.isNewVersion())
const testGetMachineId = () => wrapTest('version', () => native.getMachineId())
const testGetSystemInfo = () => wrapTest('version', () => native.getSystemInfo())
const testEnvironment = () => {
  const result = native.environment()
  setResult('version', { method: 'environment', result })
}

// 代理相关
const testGetProxyInfo = () => wrapTest('proxy', () => native.getProxyInfo())
const testTestProxy = () => wrapTest('proxy', () => native.testProxy({}))

// 页面操作
const testReload = () => {
  if (confirm('确定要刷新页面吗？')) {
    wrapTest('page', () => native.reload())
  }
}
const testReloadCurrentPage = () => {
  if (confirm('确定要刷新页面吗？')) {
    wrapTest('page', () => native.reloadCurrentPage())
  }
}
const testClearCache = () => wrapTest('page', () => native.clearCache())

// 窗口控制
const testWindowMove = () => wrapTest('windowControl', () => native.windowMove({ x: 100, y: 100 }))
const testMainWindowFocus = () => wrapTest('windowControl', () => native.mainWindowFocus({}))
const testMainWindowBlur = () => wrapTest('windowControl', () => native.mainWindowBlur())

// 缩放
const testSwitchZoom = (type: string) => wrapTest('zoom', () => native.switchZoom(type))
const testGetZoom = () => wrapTest('zoom', () => native.getZoom())

// 截图
const testStartCaptureWnd = () => wrapTest('capture', () => native.startCaptureWnd())

// 剪贴板
const testGetClipboardContent = () => wrapTest('clipboard', () => native.getClipboardContent())
const testGetClipboardImageFile = () => wrapTest('clipboard', () => native.getClipboardImageFile())

// 链接
const testNativeOpenUrl = () => wrapTest('url', () => native.nativeOpenUrl(testUrl.value))
const testNativeBrowserOpenUrl = () => {
  native.nativeBrowserOpenUrl(testUrl.value)
  setResult('url', { method: 'nativeBrowserOpenUrl', url: testUrl.value })
}

// 开发工具
const testOpenDevTools = () => wrapTest('devtools', () => native.openDevTools({}))
</script>

<style scoped lang="scss">
.electron-test-page {
  display: flex;
  height: 100%;
  background: #f5f7fa;
}

.sidebar {
  width: 260px;
  background: #fff;
  border-right: 1px solid #e4e7ed;
  overflow-y: auto;
  flex-shrink: 0;

  .sidebar-logo {
    display: flex;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #e4e7ed;

    .logo-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 18px;
      margin-right: 10px;
    }

    .logo-text {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }

  .env-info {
    padding: 15px 20px;
    background: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;

    .env-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      background: #909399;
      color: #fff;

      &.active {
        background: #67c23a;
      }
    }

    .env-type {
      margin-top: 8px;
      font-size: 12px;
      color: #606266;
    }
  }

  .sidebar-nav {
    padding: 10px 0;

    .nav-item {
      padding: 12px 20px;
      cursor: pointer;
      transition: all 0.3s;
      color: #606266;
      font-size: 14px;
      display: flex;
      align-items: center;

      .nav-icon {
        margin-right: 8px;
        font-size: 16px;
      }

      &:hover {
        background: #f5f7fa;
        color: #409eff;
      }

      &.active {
        background: #ecf5ff;
        color: #409eff;
        border-right: 3px solid #409eff;
      }
    }
  }
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;

  .content-header {
    margin-bottom: 30px;
    padding: 30px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    color: #fff;

    .page-title {
      font-size: 28px;
      margin: 0 0 10px 0;
      font-weight: 600;
    }

    .page-desc {
      font-size: 16px;
      opacity: 0.9;
      margin: 0;
    }
  }

  .demo-wrapper {
    .demo-section {
      background: #fff;
      border-radius: 8px;
      padding: 30px;
      margin-bottom: 20px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

      .section-title {
        font-size: 22px;
        color: #303133;
        margin: 0 0 10px 0;
        font-weight: 600;
      }

      .section-desc {
        color: #909399;
        font-size: 14px;
        margin: 0 0 25px 0;
      }

      .section-block {
        margin-bottom: 25px;

        &:last-child {
          margin-bottom: 0;
        }

        .block-content {
          padding: 20px;
          background: #fafafa;
          border-radius: 6px;
          border: 1px solid #ebeef5;
          margin-bottom: 15px;

          .el-button {
            margin: 5px;
          }

          .input-group {
            margin-bottom: 15px;
          }
        }

        .result-area {
          padding: 15px;
          background: #1e1e1e;
          border-radius: 6px;
          max-height: 300px;
          overflow-y: auto;

          pre {
            margin: 0;
            color: #d4d4d4;
            font-size: 13px;
            line-height: 1.6;
          }
        }
      }
    }
  }
}
</style>
