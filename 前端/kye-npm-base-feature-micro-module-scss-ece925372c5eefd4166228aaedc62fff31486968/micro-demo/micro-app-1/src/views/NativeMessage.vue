<template>
  <div class="comm-demo">
    <h2>跨应用消息通信</h2>
    <p class="desc">
      演示 <code>@kye-netc/micro-native</code> 的 <code>sendMessageTo</code> 与
      <code>onMessage</code> 消息通信能力
    </p>

    <!-- 1. 运行模式 -->
    <section class="card">
      <div class="card-header">
        <span class="card-icon">1</span>
        <h3>运行模式</h3>
      </div>
      <div class="card-body">
        <span :class="['mode-tag', mode]">{{ modeLabel }}</span>
        <p class="hint">
          当前运行环境自动检测：standalone / iframe / micro-app / micro-module
        </p>
      </div>
    </section>

    <!-- 2. 发送消息 -->
    <section class="card">
      <div class="card-header">
        <span class="card-icon">2</span>
        <h3>发送消息</h3>
      </div>
      <div class="card-body">
        <p class="hint">
          通过
          <code>native.sendMessageTo(appName, data)</code> 向指定子应用发送消息
        </p>
        <div class="send-area">
          <div class="form-row">
            <label>目标应用</label>
            <select v-model="targetApp">
              <option value="micro-app">micro-app</option>
              <option value="iframe">iframe</option>
              <option value="micro-module">micro-module</option>
              <option value="main-app">main-app</option>
            </select>
          </div>
          <div class="form-row">
            <label>消息内容</label>
            <input
              v-model="messageText"
              placeholder="输入要发送的消息"
              @keyup.enter="sendMessage"
            />
          </div>
          <button @click="sendMessage" class="primary" :disabled="sending">
            发送消息
          </button>
          <span v-if="sendResult" :class="['send-status', sendResult.type]">
            {{ sendResult.text }}
          </span>
        </div>
      </div>
    </section>

    <!-- 3. onMessage 接收消息 -->
    <section class="card">
      <div class="card-header">
        <span class="card-icon">3</span>
        <h3>接收消息（onMessage）</h3>
      </div>
      <div class="card-body">
        <p class="hint">
          通过 <code>native.onMessage()</code> 监听推送给当前应用（<strong>{{
            currentAppName
          }}</strong
          >）的消息
        </p>
        <div class="event-log" ref="logRef">
          <div v-if="receivedMessages.length === 0" class="log-empty">
            暂无消息，在上方发送消息试试
          </div>
          <div v-for="(msg, i) in receivedMessages" :key="i" class="log-item">
            <span class="log-time">{{ msg.time }}</span>
            <span class="log-tag from">← {{ msg.fromApp }}</span>
            <span class="log-data">{{ msg.data }}</span>
          </div>
        </div>
        <div class="event-controls">
          <span v-if="isListening" class="status-badge listening">监听中</span>
          <span v-else class="status-badge stopped">未监听</span>
          <button @click="clearMessages" class="secondary">清空日志</button>
        </div>
      </div>
    </section>

    <!-- 4. 已注册的方法 -->
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
  standalone: 'standalone 模式',
  iframe: 'Iframe 模式',
  'micro-app': 'Micro-App 模式',
  'micro-module': 'micro-module 模式',
}

// ======== 1. 运行模式 ========
const mode = ref('standalone')
const modeLabel = computed(() => MODE_LABELS[mode.value] || mode.value)
const currentAppName = ref('')

// ======== 2. 发送消息 ========
const targetApp = ref('user')
const messageText = ref('')
const sending = ref(false)
const sendResult = ref(null)

async function sendMessage() {
  if (!messageText.value.trim()) return
  sending.value = true
  sendResult.value = null
  try {
    await native.sendMessageTo(targetApp.value, { data: messageText.value })
    sendResult.value = {
      type: 'success',
      text: `→ 已发送给 ${targetApp.value}`,
    }
    messageText.value = ''
  } catch (e) {
    sendResult.value = { type: 'error', text: `发送失败: ${e.message}` }
  } finally {
    sending.value = false
  }
}

// ======== 3. 接收消息 ========
const isListening = ref(false)
const receivedMessages = ref([])
const logRef = ref(null)
let unsubscribe = null

onMounted(() => {
  mode.value = native.getMode()
  currentAppName.value = native.getAppName()
  refreshMethods()

  // 自动开始监听推送给 main-app 的消息
  unsubscribe = native.onMessage(({ fromApp, data }) => {
    const now = new Date()
    const time =
      now.toLocaleTimeString('zh-CN', { hour12: false }) +
      '.' +
      String(now.getMilliseconds()).padStart(3, '0')
    receivedMessages.value.push({
      time,
      fromApp,
      data: typeof data === 'string' ? data : JSON.stringify(data),
    })
    if (receivedMessages.value.length > 100) receivedMessages.value.shift()
    nextTick(() => {
      if (logRef.value) logRef.value.scrollTop = logRef.value.scrollHeight
    })
  })
  isListening.value = true
})

onBeforeUnmount(() => {
  if (unsubscribe) {
    unsubscribe()
    unsubscribe = null
  }
})

function clearMessages() {
  receivedMessages.value = []
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
.mode-tag.micro-module {
  background: #cce5ff;
  color: #004085;
}

/* Send Area */
.send-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-row label {
  font-size: 13px;
  font-weight: 500;
  color: #555;
  min-width: 72px;
  flex-shrink: 0;
}

.form-row select,
.form-row input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
  background: #fff;
}

.form-row select:focus,
.form-row input:focus {
  border-color: #667eea;
}

.send-area button.primary {
  align-self: flex-start;
  padding: 8px 24px;
  border: none;
  border-radius: 6px;
  background: #667eea;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
}

.send-area button.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-status {
  font-size: 13px;
  padding: 4px 10px;
  border-radius: 4px;
}

.send-status.success {
  background: #f0fdf4;
  color: #166534;
}

.send-status.error {
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
.log-tag.from {
  color: #89b4fa;
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
