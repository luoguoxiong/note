// 在首页顶层窗口的 DevTools Console 中执行，再复现搜索；开启 Preserve log 保留刷新前日志。
// 只记录 st-searchValue 的存在状态、条数和调用栈，不输出关键词或 token。
;(() => {
  window.__homeSearchStorageProbe?.stop()
  const key = 'st-searchValue'
  const records = []
  const cleanup = []
  const patched = new WeakSet()
  const frames = new WeakSet()
  const summarize = (raw) => {
    if (raw === null) return { present: false }
    try {
      const data = JSON.parse(raw)
      return { present: true, count: Array.isArray(data?.value) ? data.value.length : null }
    } catch {
      return { present: true, invalidJSON: true }
    }
  }
  const record = (entry) => {
    records.push({ time: Date.now(), ...entry })
    console.info('[DEBUG-home-search-storage]', records[records.length - 1])
  }
  const hook = (owner, frame) => {
    try {
      if (owner.location.origin !== window.location.origin) {
        record({ frame, operation: 'different-origin', origin: owner.location.origin })
        return
      }
      const storage = owner.sessionStorage
      const proto = owner.Storage.prototype
      if (patched.has(proto)) return
      patched.add(proto)
      const getItem = proto.getItem
      const snapshot = () => {
        try {
          return summarize(getItem.call(storage, key))
        } catch (error) {
          return { error: error.name }
        }
      }
      record({ frame, operation: 'attached', origin: owner.location.origin, state: snapshot() })
      for (const operation of ['getItem', 'setItem', 'removeItem', 'clear']) {
        const original = Object.getOwnPropertyDescriptor(proto, operation)
        Object.defineProperty(proto, operation, {
          ...original,
          value(...args) {
            if (this !== storage || (operation !== 'clear' && args[0] !== key)) {
              return original.value.apply(this, args)
            }
            const before = snapshot()
            const stack = new Error().stack.replace(/(https?:\/\/[^\s?#)]+)[?#][^\s)]*/g, '$1')
            try {
              const result = original.value.apply(this, args)
              record({ frame, operation, before, after: snapshot(), stack })
              return result
            } catch (error) {
              record({ frame, operation, before, error: error.name, stack })
              throw error
            }
          },
        })
        cleanup.push(() => Object.defineProperty(proto, operation, original))
      }
      const observeFrames = () => {
        owner.document.querySelectorAll('iframe').forEach((iframe, index) => {
          if (frames.has(iframe)) return
          frames.add(iframe)
          const attach = () => hook(iframe.contentWindow, `${frame}/iframe[${index}]`)
          attach()
          // shortcut: 初始读取可能早于 load 钩子；需追踪首次读取时，在子应用启动处设断点。
          iframe.addEventListener('load', attach)
          cleanup.push(() => iframe.removeEventListener('load', attach))
        })
      }
      observeFrames()
      const observer = new owner.MutationObserver(observeFrames)
      observer.observe(owner.document.documentElement, { childList: true, subtree: true })
      cleanup.push(() => observer.disconnect())
    } catch (error) {
      record({ frame, operation: 'cannot-attach', error: error.name })
    }
  }
  const onStorage = (event) => {
    if (event.storageArea === window.sessionStorage && (event.key === key || event.key === null)) {
      record({
        operation: event.key === null ? 'storage-event:clear' : 'storage-event:change',
        source: new URL(event.url).origin + new URL(event.url).pathname,
        before: event.key === null ? undefined : summarize(event.oldValue),
        after: summarize(event.newValue),
      })
    }
  }
  window.addEventListener('storage', onStorage)
  cleanup.push(() => window.removeEventListener('storage', onStorage))
  window.__homeSearchStorageProbe = {
    records,
    stop() {
      cleanup.reverse().forEach((restore) => restore())
      delete window.__homeSearchStorageProbe
    },
  }
  hook(window, 'top')
})()
