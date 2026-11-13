<template>
  <div class="sandbox-test">
    <h3>Proxy 沙箱隔离测试</h3>
    <p class="desc">验证子应用代码内的 window 读写是否被沙箱代理拦截</p>

    <!-- 沙箱状态 -->
    <div class="status-bar" :class="sandboxActive ? 'on' : 'off'">
      <span class="dot"></span>
      <span v-if="sandboxActive"
        >沙箱已激活(运行于微前端环境,window === 代理 proxy)</span
      >
      <span v-else
        >沙箱未激活(独立运行模式,window === 真实 window,以下测试将失败)</span
      >
    </div>

    <!-- 1. 写隔离 -->
    <section class="test-card">
      <div class="test-card__head">
        <span class="badge" :class="writeIsolation.pass ? 'pass' : 'fail'">
          {{
            writeIsolation.pass == null
              ? '未执行'
              : writeIsolation.pass
              ? '通过'
              : '失败'
          }}
        </span>
        <h4>1. 写隔离:window 写入不污染真实 window</h4>
      </div>
      <p class="test-card__desc">
        子应用执行 <code>window.__sub1SandboxVar__ = 'written-by-sub1'</code>,
        经 Proxy <code>set</code> 拦截后写入 fakeWindow;真实 window
        不应出现该属性。
      </p>
      <table class="kv">
        <tr>
          <td>window(代理) 读取</td>
          <td>{{ writeIsolation.proxyValue ?? '(未写入)' }}</td>
        </tr>
        <tr>
          <td>真实 window 读取</td>
          <td>{{ writeIsolation.realValue ?? 'undefined' }}</td>
        </tr>
      </table>
      <button class="btn" @click="runWriteTest">执行写隔离测试</button>
    </section>

    <!-- 2. 读取透传 -->
    <section class="test-card">
      <div class="test-card__head">
        <span class="badge" :class="readFallthrough.pass ? 'pass' : 'fail'">
          {{
            readFallthrough.pass == null
              ? '未执行'
              : readFallthrough.pass
              ? '通过'
              : '失败'
          }}
        </span>
        <h4>2. 读取透传:fakeWindow 无此属性时回退真实 window</h4>
      </div>
      <p class="test-card__desc">
        <code>window.document</code> / <code>window.navigator</code> 不在
        fakeWindow, Proxy <code>get</code> 拦截后透传真实 window 的对应属性。
      </p>
      <table class="kv">
        <tr>
          <td>window.document === 真实 document</td>
          <td>{{ readFallthrough.docSame }}</td>
        </tr>
        <tr>
          <td>window.navigator.userAgent</td>
          <td class="ua">{{ readFallthrough.ua || '-' }}</td>
        </tr>
      </table>
      <button class="btn" @click="runReadTest">执行透传测试</button>
    </section>

    <!-- 3. 副作用追踪 -->
    <section class="test-card">
      <div class="test-card__head">
        <span class="badge" :class="sideEffect.running ? 'pass' : 'idle'">
          {{ sideEffect.running ? '运行中' : '已停止' }}
        </span>
        <h4>3. 副作用追踪:setInterval / addEventListener 被沙箱接管</h4>
      </div>
      <p class="test-card__desc">
        通过 <code>window.setInterval</code> 启动的定时器与
        <code>window.addEventListener('resize')</code> 被 Proxy
        拦截并记录到沙箱实例。
        离开子应用命名空间(导航到主应用/其他子应用)时,路由 afterEach 触发
        <code>sandbox.deactivate()</code> 统一清理。
      </p>
      <table class="kv">
        <tr>
          <td>定时器计数(每秒 +1)</td>
          <td>{{ sideEffect.tickCount }}</td>
        </tr>
        <tr>
          <td>resize 事件计数</td>
          <td>{{ sideEffect.resizeCount }}</td>
        </tr>
      </table>
      <div class="btn-row">
        <button class="btn" @click="toggleTimer">
          {{ sideEffect.running ? '停止定时器' : '启动定时器' }}
        </button>
        <button class="btn btn--ghost" @click="checkLeak">
          检查真实 window 是否泄漏
        </button>
      </div>
      <p
        v-if="sideEffect.leakMsg"
        class="leak-msg"
        :class="sideEffect.leakOk ? 'pass-text' : 'fail-text'"
      >
        {{ sideEffect.leakMsg }}
      </p>
    </section>

    <p class="tip">
      提示:导航离开 <code>/user/*</code>(如点击"订单数据")后,路由守卫会调用
      <code>unmount</code> +
      <code>sandbox.deactivate()</code>,上述定时器与事件监听将被统一清理;
      再返回本页可观察到计数从 0 重新开始,且真实 window 上无
      <code>__sub1SandboxVar__</code> 残留。
    </p>
  </div>
</template>

<script setup>
import { reactive, onMounted, onBeforeUnmount } from 'vue';

// 本视图是懒加载异步 chunk。若 chunk 沙箱化生效(ProxySandbox 拦截 <script> 加载并
// 改走 execInSandbox),则此处 window === 代理 proxy;否则 === 真实 window(独立运行)。
// 用 Function('return window')() 取真实 window 做对比(其作用域在真实全局,绕过沙箱形参)。
const realWindow = Function('return window')();
const sandboxActive = window !== realWindow;

const writeIsolation = reactive({
  pass: null,
  proxyValue: null,
  realValue: null,
});
const readFallthrough = reactive({ pass: null, docSame: null, ua: null });
const sideEffect = reactive({
  running: false,
  tickCount: 0,
  resizeCount: 0,
  leakMsg: '',
  leakOk: false,
});

let timerId = null;
const onResize = () => {
  sideEffect.resizeCount++;
};

// 1. 写隔离:window 写入经 Proxy set 拦截落到 fakeWindow,真实 window 不受影响
const runWriteTest = () => {
  window.__sub1SandboxVar__ = 'written-by-sub1';
  writeIsolation.proxyValue = window.__sub1SandboxVar__;
  writeIsolation.realValue = realWindow.__sub1SandboxVar__;
  writeIsolation.pass =
    writeIsolation.proxyValue === 'written-by-sub1' &&
    writeIsolation.realValue === undefined;
};

// 2. 读取透传:fakeWindow 上没有的属性(get 拦截)回退到真实 window
const runReadTest = () => {
  const doc = window.document;
  const ua = window.navigator.userAgent;
  readFallthrough.docSame = doc === realWindow.document;
  readFallthrough.ua = ua;
  readFallthrough.pass =
    readFallthrough.docSame && !!ua && ua === realWindow.navigator.userAgent;
};

// 3. 副作用追踪:window.setInterval / addEventListener 经 Proxy 拦截,id 被沙箱记录
const startTimer = () => {
  if (sideEffect.running) return;
  sideEffect.running = true;
  sideEffect.tickCount = 0;
  sideEffect.resizeCount = 0;
  timerId = window.setInterval(() => {
    sideEffect.tickCount++;
    console.log(1111);
  }, 1000);
  window.addEventListener('resize', onResize);
};
const stopTimer = () => {
  if (timerId != null) {
    window.clearInterval(timerId);
    timerId = null;
  }
  window.removeEventListener('resize', onResize);
  sideEffect.running = false;
};
const toggleTimer = () => {
  sideEffect.running ? stopTimer() : startTimer();
};

// 检查真实 window 是否被污染(跨子应用隔离的关键)
const checkLeak = () => {
  const leaked = realWindow.__sub1SandboxVar__ !== undefined;
  sideEffect.leakOk = !leaked;
  sideEffect.leakMsg = leaked
    ? '检测到泄漏:真实 window 上存在 __sub1SandboxVar__(沙箱未隔离)'
    : '无泄漏:真实 window 上不存在 __sub1SandboxVar__(写隔离生效,不会污染其他子应用)';
};

onMounted(() => {
  runWriteTest();
  runReadTest();
  startTimer();
});

onBeforeUnmount(() => {
  // 组件卸载时主动清理;路由级 sandbox.deactivate() 会再兜底一次(_cleanup 清所有追踪项)
  // stopTimer();
});
</script>

<style scoped>
.sandbox-test h3 {
  color: #333;
  font-size: 22px;
  margin-bottom: 8px;
}

.sandbox-test .desc {
  color: #666;
  margin-bottom: 20px;
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: 500;
}

.status-bar.on {
  background: #d4edda;
  color: #155724;
}

.status-bar.off {
  background: #fff3cd;
  color: #856404;
}

.status-bar .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: currentColor;
}

.test-card {
  background: white;
  padding: 20px 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.test-card__head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.test-card__head h4 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.test-card__desc {
  color: #666;
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 14px;
}

.test-card__desc code {
  background: #f1f1f1;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  color: #d63384;
}

.badge {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.badge.pass {
  background: #d4edda;
  color: #155724;
}

.badge.fail {
  background: #f8d7da;
  color: #721c24;
}

.badge.idle {
  background: #e2e3e5;
  color: #6c757d;
}

.kv {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 14px;
  font-size: 13px;
}

.kv td {
  padding: 8px 12px;
  border-bottom: 1px solid #f1f1f1;
}

.kv td:first-child {
  color: #888;
  width: 45%;
}

.kv td:last-child {
  color: #333;
  font-weight: 500;
  word-break: break-all;
}

.kv .ua {
  font-size: 11px;
  color: #999;
}

.btn-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border: none;
  padding: 9px 18px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn--ghost {
  background: white;
  color: #f5576c;
  border: 1px solid #f5576c;
}

.leak-msg {
  margin-top: 12px;
  font-size: 13px;
  font-weight: 500;
}

.pass-text {
  color: #155724;
}

.fail-text {
  color: #721c24;
}

.tip {
  background: #f8f9fa;
  border-left: 3px solid #667eea;
  padding: 12px 16px;
  border-radius: 4px;
  font-size: 13px;
  color: #555;
  line-height: 1.7;
}

.tip code {
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  color: #d63384;
}
</style>
