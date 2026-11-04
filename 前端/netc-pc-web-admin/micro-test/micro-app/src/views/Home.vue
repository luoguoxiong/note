<template>
  <div class="comm-demo">
    <h2>跨应用通信测试</h2>
    <p class="desc">测试 <code>@kye-netc/micro-native</code> 的 RPC 调用与事件广播能力</p>

    <!-- 1. 运行模式 -->
    <section class="card">
      <div class="card-header">
        <span class="card-icon">1</span>
        <h3>运行模式</h3>
      </div>
      <div class="card-body">
        <span :class="['mode-tag', mode]">{{ modeLabel }}</span>
        <p class="hint">当前运行环境自动检测：standalone / iframe / micro-app /micro-module</p>
      </div>
    </section>

    <!-- 2. RPC 调用测试 -->
    <section class="card">
      <div class="card-header">
        <span class="card-icon">2</span>
        <h3>RPC 方法调用</h3>
      </div>
      <div class="card-body">
        <p class="hint">通过 Proxy 代理调用主应用注册的方法（getToken / getUserInfo）</p>
        <div class="rpc-list">
          <div class="rpc-item">
            <label>getToken</label>
            <div class="rpc-row">
              <button @click="callGetToken" :disabled="calling">调用 getToken</button>
            </div>
            <div v-if="tokenResult !== null" :class="['result', tokenResult instanceof Error ? 'error' : 'success']">
              →
              {{ tokenResult instanceof Error ? tokenResult.message : tokenResult }}
            </div>
          </div>
          <div class="rpc-item">
            <label>getUserInfo</label>
            <div class="rpc-row">
              <button @click="callGetUserInfo" :disabled="calling">调用 getUserInfo</button>
            </div>
            <div
              v-if="userInfoResult !== null"
              :class="['result', userInfoResult instanceof Error ? 'error' : 'success']"
            >
              →
              {{
                typeof userInfoResult === 'object'
                  ? JSON.stringify(userInfoResult)
                  : userInfoResult instanceof Error
                  ? userInfoResult.message
                  : userInfoResult
              }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. 事件监听测试 -->
    <section class="card">
      <div class="card-header">
        <span class="card-icon">3</span>
        <h3>事件监听</h3>
      </div>
      <div class="card-body">
        <p class="hint">主应用每隔 1s 广播 <code>router-change</code> 事件</p>
        <div class="event-log" ref="logRef">
          <div v-if="events.length === 0" class="log-empty">暂无事件，点击「开始监听」接收事件</div>
          <div v-for="(evt, i) in events" :key="i" class="log-item">
            <span class="log-time">{{ evt.time }}</span>
            <span class="log-data">{{ JSON.stringify(evt.data) }}</span>
          </div>
        </div>
        <div class="event-controls">
          <button v-if="!isListening" @click="startListening" class="primary">开始监听</button>
          <button v-else @click="stopListening" class="danger">停止监听</button>
          <button @click="clearEvents" class="secondary">清空日志</button>
          <span v-if="isListening" class="status-badge listening">监听中</span>
          <span v-else class="status-badge stopped">已停止</span>
        </div>
      </div>
    </section>

    <!-- 4. 已注册方法 -->
    <section class="card">
      <div class="card-header">
        <span class="card-icon">4</span>
        <h3>已注册的方法</h3>
      </div>
      <div class="card-body">
        <button @click="refreshMethods" class="secondary">刷新</button>
        <pre class="methods-pre">{{ methodsText }}</pre>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount, onMounted, nextTick, computed } from 'vue'
import native from '@kye-netc/micro-native'

const MODE_LABELS = {
  standalone: '独立运行',
  iframe: 'Iframe 模式',
  'micro-app': 'Micro-App 模式',
  'micro-module': 'Micro-Module 模式',
}

// ======== 1. 运行模式 ========
const mode = ref('standalone')
const modeLabel = computed(() => MODE_LABELS[mode.value] || mode.value)

// ======== 2. RPC 调用 ========
const calling = ref(false)
const tokenResult = ref(null)
const userInfoResult = ref(null)

async function callGetToken() {
  calling.value = true
  tokenResult.value = null
  try {
    const res = await native.getToken('hello-token')
    tokenResult.value = res
  } catch (e) {
    tokenResult.value = e
  } finally {
    calling.value = false
  }
}

async function callGetUserInfo() {
  calling.value = true
  userInfoResult.value = null
  try {
    const res = await native.getUserInfo({ id: 1 })
    userInfoResult.value = res
  } catch (e) {
    userInfoResult.value = e
  } finally {
    calling.value = false
  }
}

// ======== 3. 事件监听 ========
const isListening = ref(false)
const events = ref([])
const logRef = ref(null)
let handler

function createHandler() {
  return (data) => {
    const now = new Date()
    const time =
      now.toLocaleTimeString('zh-CN', { hour12: false }) + '.' + String(now.getMilliseconds()).padStart(3, '0')
    events.value.push({ time, data })
    if (events.value.length > 100) events.value.shift()
    nextTick(() => {
      if (logRef.value) logRef.value.scrollTop = logRef.value.scrollHeight
    })
  }
}

function startListening() {
  handler = createHandler()
  native.addEventListener('router-change', handler)
  isListening.value = true
}

function stopListening() {
  if (handler) {
    native.removeEventListener('router-change', handler)
    handler = null
  }
  isListening.value = false
}

function clearEvents() {
  events.value = []
}

// ======== 4. 已注册方法 ========
const methodsText = ref('')

async function refreshMethods() {
  const result = native.getRegisteredMethods()
  const names = Array.isArray(result) ? result : await result

  if (names.length === 0) {
    methodsText.value = '（无）'
    return
  }
  methodsText.value = names.join('\n')
}

// ======== 生命周期 ========
onMounted(async () => {
  mode.value = native.getMode()
  await refreshMethods()
})

onBeforeUnmount(() => {
  if (isListening.value) {
    stopListening()
  }
})
</script>

<style scoped>
.comm-demo {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  width: 100%;
}

.comm-demo h2 {
  grid-column: 1 / -1;
  font-size: 22px;
  color: #333;
  margin: 0 0 4px;
}

.desc {
  grid-column: 1 / -1;
  color: #888;
  font-size: 13px;
  margin: 0 0 8px;
}

.desc code {
  background: #f0f0f0;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 12px;
}

.card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  background: #fafafa;
  border-bottom: 1px solid #eee;
}

.card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #667eea;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

.card-header h3 {
  font-size: 15px;
  color: #333;
  margin: 0;
}

.card-body {
  padding: 16px 18px;
}

.hint {
  font-size: 12px;
  color: #999;
  margin-bottom: 12px;
}

/* Mode Tag */
.mode-tag {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
}

.mode-tag.standalone {
  background: #e8e8e8;
  color: #666;
}
.mode-tag.iframe {
  background: #fff3cd;
  color: #856404;
}
.mode-tag.micro-app {
  background: #d4edda;
  color: #155724;
}
.mode-tag.micro-model {
  background: #cce5ff;
  color: #004085;
}

/* RPC */
.rpc-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.rpc-item label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #555;
  margin-bottom: 6px;
}

.rpc-row {
  display: flex;
  gap: 8px;
}

.rpc-row button {
  padding: 8px 18px;
  border: none;
  border-radius: 6px;
  background: #667eea;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}

.rpc-row button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.result {
  margin-top: 6px;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 13px;
  font-family: 'SF Mono', monospace;
  word-break: break-all;
}

.result.success {
  background: #f0fdf4;
  color: #166534;
}

.result.error {
  background: #fef2f2;
  color: #991b1b;
}

/* Event Log */
.event-log {
  max-height: 200px;
  overflow-y: auto;
  background: #1e1e2e;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 12px;
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 12px;
}

.log-empty {
  color: #666;
  text-align: center;
  padding: 20px 0;
}

.log-item {
  display: flex;
  gap: 12px;
  padding: 4px 0;
  border-bottom: 1px solid #2a2a3e;
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  color: #6c6c8a;
  flex-shrink: 0;
}

.log-data {
  color: #a6e3a1;
}

.event-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.event-controls button {
  padding: 6px 14px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
}

.event-controls button.primary {
  background: #667eea;
  color: #fff;
}
.event-controls button.danger {
  background: #ef4444;
  color: #fff;
}
.event-controls button.secondary {
  background: #e8e8e8;
  color: #555;
}

.status-badge {
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 10px;
  font-weight: 500;
}

.status-badge.listening {
  background: #d4edda;
  color: #155724;
}
.status-badge.stopped {
  background: #e8e8e8;
  color: #888;
}

/* Methods */
.methods-pre {
  margin-top: 10px;
  background: #f5f5f5;
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
  font-family: 'SF Mono', monospace;
  color: #333;
  overflow-x: auto;
}

.card-body button.secondary {
  padding: 6px 14px;
  border: none;
  border-radius: 6px;
  background: #e8e8e8;
  color: #555;
  font-size: 13px;
  cursor: pointer;
}
</style>
