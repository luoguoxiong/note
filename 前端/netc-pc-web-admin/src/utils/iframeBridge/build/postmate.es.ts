/**
  postmate - A powerful, simple, promise-based postMessage library
  @version v1.5.2
  @link https://github.com/dollarshaveclub/postmate
  @author Jacob Kelley <jakie8@gmail.com>
  @license MIT
**/
/**
 * The type of messages our frames our sending
 * @type {String}
 */
const messageType = 'application/x-postmate-v1+json'
/**
 * The maximum number of attempts to send a handshake request to the parent
 * @type {Number}
 */

const maxHandshakeRequests = 10
/**
 * iframe load 事件兜底超时(ms)。
 * 多子应用并存场景下 load 事件可能因慢子资源/主线程长任务迟迟不触发,
 * 而子应用页面可见时其 message 监听必已就绪, 超时后不再等待 load, 直接发起握手。
 * @type {Number}
 */
const handshakeLoadTimeout = 3000
/**
 * A unique message ID that is used to ensure responses are sent to the correct requests
 * @type {Number}
 */

let _messageId = 0
/**
 * Increments and returns a message ID
 * @return {Number} A unique ID for a message
 */

const generateNewMessageId = () => (_messageId += 1)
/**
 * Postmate logging function that enables/disables via config
 * @param  {Object} ...args Rest Arguments
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const log = (...args: any[]) => (Postmate.debug ? console.log(...args) : null)

/**
 * Takes a URL and returns the origin
 * @param  {String} url The full URL being requested
 * @return {String}     The URLs origin
 */

const resolveOrigin = (url: string) => {
  const a = document.createElement('a')
  a.href = url
  const protocol = a.protocol.length > 4 ? a.protocol : window.location.protocol
  let host = window.location.host
  if (a.host.length) {
    host = a.port === '80' || a.port === '443' ? a.hostname : a.host
  }
  return a.origin || protocol + '//' + host
}

interface MessageTypes {
  [key: string]: number
}
const messageTypes: MessageTypes = {
  handshake: 1,
  'handshake-reply': 1,
  call: 1,
  emit: 1,
  reply: 1,
  request: 1,
}

/**
 * Ensures that a message is safe to interpret
 * @param  {Object} message The postmate message being sent
 * @param  {String|Boolean} allowedOrigin The whitelisted origin or false to skip origin check
 * @return {Boolean}
 */
const sanitize = (message: MessageEvent, allowedOrigin: string | false) => {
  if (typeof allowedOrigin === 'string' && message.origin !== allowedOrigin) return false
  if (!message.data) return false
  if (typeof message.data === 'object' && !('postmate' in message.data)) return false
  if (message.data.type !== messageType) return false
  if (!messageTypes[message.data.postmate]) return false
  return true
}

/**
 * Takes a model, and searches for a value by the property
 * @param  {Object} model     The dictionary to search against
 * @param  {String} property  A path within a dictionary (i.e. 'window.location.href')
 * @param  {Object} data      Additional information from the get request that is
 *                            passed to functions in the child model
 * @return {Promise}
 */
const resolveValue = (model: Record<string, any>, property: string) => {
  const unwrappedContext = typeof model[property] === 'function' ? model[property]() : model[property]
  return Postmate.Promise.resolve(unwrappedContext)
}

/**
 * Composes an API to be used by the parent
 * @param {Object} info Information on the consumer
 */
class ParentAPI {
  parent: Window
  frame: HTMLIFrameElement
  child: Window
  childOrigin: string
  events: Record<string, (data: any) => void>
  listener: (e: MessageEvent) => void

  constructor(info: { parent: Window; frame: HTMLIFrameElement; child: Window; childOrigin: string }) {
    this.parent = info.parent
    this.frame = info.frame
    this.child = info.child
    this.childOrigin = info.childOrigin
    this.events = {}

    if (process.env.NODE_ENV !== 'production') {
      log('Parent: Registering API')
      log('Parent: Awaiting messages...')
    }

    this.listener = (e: MessageEvent) => {
      if (!sanitize(e, this.childOrigin)) return false

      const _ref = ((e || {}).data || {}).value || {}
      const data = _ref.data
      const name = _ref.name

      if (e.data.postmate === 'emit') {
        if (process.env.NODE_ENV !== 'production') {
          log('Parent: Received event emission: ' + name)
        }

        if (name in this.events) {
          this.events[name].call(this, data)
        }
      }
    }

    this.parent.addEventListener('message', this.listener, false)

    if (process.env.NODE_ENV !== 'production') {
      log('Parent: Awaiting event emissions from Child')
    }
  }

  get(property: string) {
    return new Postmate.Promise((resolve: (value: any) => void) => {
      // Extract data from response and kill listeners
      const uid = generateNewMessageId()

      const transact = (e: MessageEvent) => {
        if (e.data.uid === uid && e.data.postmate === 'reply') {
          this.parent.removeEventListener('message', transact, false)
          resolve(e.data.value)
        }
      }

      // Prepare for response from Child...
      this.parent.addEventListener('message', transact, false)
      // Then ask child for information
      this.child.postMessage(
        {
          postmate: 'request',
          type: messageType,
          property: property,
          uid: uid,
        },
        this.childOrigin as any
      )
    })
  }

  call(property: string, data: any) {
    // Send information to the child
    this.child.postMessage(
      {
        postmate: 'call',
        type: messageType,
        property: property,
        data: data,
      },
      this.childOrigin as any
    )
  }

  on(eventName: string, callback: (data: any) => void) {
    this.events[eventName] = callback
  }

  destroy() {
    if (process.env.NODE_ENV !== 'production') {
      log('Parent: Destroying Postmate instance')
    }
    window.removeEventListener('message', this.listener, false)
    this.frame.parentNode?.removeChild(this.frame)
  }
}

/**
 * Composes an API to be used by the child
 * @param {Object} info Information on the consumer
 */
class ChildAPI {
  model: Record<string, any>
  parent: Window
  parentOrigin: string
  child: Window

  constructor(info: { model: Record<string, any>; parent: Window; parentOrigin: string; child: Window }) {
    this.model = info.model
    this.parent = info.parent
    this.parentOrigin = info.parentOrigin
    this.child = info.child

    if (process.env.NODE_ENV !== 'production') {
      log('Child: Registering API')
      log('Child: Awaiting messages...')
    }

    this.child.addEventListener('message', (e: MessageEvent) => {
      if (!sanitize(e, this.parentOrigin)) return

      if (process.env.NODE_ENV !== 'production') {
        log('Child: Received request', e.data)
      }

      const property = e.data.property
      const uid = e.data.uid
      const data = e.data.data

      if (e.data.postmate === 'call') {
        if (property in this.model && typeof this.model[property] === 'function') {
          this.model[property](data)
        }
        return
      }

      // Reply to Parent
      resolveValue(this.model, property).then((value: any) =>
        (e.source as Window).postMessage(
          {
            property: property,
            postmate: 'reply',
            type: messageType,
            uid: uid,
            value: value,
          } as any,
          e.origin
        )
      )
    })
  }

  emit(name: string, data?: any) {
    if (process.env.NODE_ENV !== 'production') {
      log('Child: Emitting Event "' + name + '"', data)
    }
    this.parent.postMessage(
      {
        postmate: 'emit',
        type: messageType,
        value: {
          name: name,
          data: data,
        },
      } as any,
      this.parentOrigin
    )
  }
}

/**
 * The entry point of the Parent.
 * @type {Class}
 */
class Postmate {
  static debug = false
  static Promise: PromiseConstructor = (window ? window.Promise : Promise) as PromiseConstructor
  static Model: any

  parent: Window
  frame: HTMLIFrameElement
  child: Window
  model: Record<string, any>

  /**
   * Sets options related to the Parent
   * @param {Object} object The element to inject the frame into, and the url
   * @return {Promise}
   */
  constructor({
    container = document.body,
    model,
    url,
    name,
    classListArray = [],
  }: {
    container?: HTMLElement
    model?: Record<string, any>
    url: string
    name?: string
    classListArray?: string[]
  }) {
    this.parent = window
    this.frame = document.createElement('iframe')
    this.frame.name = name || ''
    this.frame.classList.add(...classListArray)
    container?.appendChild(this.frame)
    this.child = (this.frame.contentWindow || (this.frame.contentDocument as any)?.parentWindow) as Window
    this.model = model || {}
    return this.sendHandshake(url) as any
  }

  /**
   * Begins the handshake strategy
   * @param  {String} url The URL to send a handshake request to
   * @return {Promise}     Promise that resolves when the handshake is complete
   */
  sendHandshake(url: string) {
    const childOrigin = resolveOrigin(url)
    let attempt = 0
    let responseInterval: ReturnType<typeof setInterval>
    let loadWatchdog: ReturnType<typeof setTimeout>
    // 握手只允许启动一次(onload 与 load 兜底看门狗可能先后触发)
    let handshakeStarted = false

    return new Postmate.Promise((resolve: (value: any) => void) => {
      const reply = (e: MessageEvent) => {
        if (!sanitize(e, childOrigin)) return false

        if (e.data.postmate === 'handshake-reply') {
          clearInterval(responseInterval)
          clearTimeout(loadWatchdog)

          if (process.env.NODE_ENV !== 'production') {
            log('Parent: Received handshake reply from Child')
          }

          this.parent.removeEventListener('message', reply, false)
          ;(this as any).childOrigin = e.origin

          if (process.env.NODE_ENV !== 'production') {
            log('Parent: Saving Child origin', (this as any).childOrigin)
          }

          return resolve(new ParentAPI(this as any))
        }

        // Might need to remove since parent might be receiving different messages
        // from different hosts
        if (process.env.NODE_ENV !== 'production') {
          log('Parent: Invalid handshake reply')
        }
        console.warn('Failed handshake ignore reject', (this as any).childOrigin)
        // return reject('Failed handshake');
      }

      this.parent.addEventListener('message', reply, false)

      const doSend = () => {
        attempt += 1

        if (process.env.NODE_ENV !== 'production') {
          log('Parent: Sending handshake attempt ' + attempt, {
            childOrigin: childOrigin,
          })
        }

        this.child.postMessage(
          {
            postmate: 'handshake',
            type: messageType,
            model: this.model,
          } as any,
          childOrigin
        )

        if (attempt === maxHandshakeRequests) {
          clearInterval(responseInterval)
        }
      }

      const startHandshake = () => {
        if (handshakeStarted) return
        handshakeStarted = true
        clearTimeout(loadWatchdog)
        doSend()
        responseInterval = setInterval(doSend, 500)
      }

      const loaded = () => {
        startHandshake()
      }

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if ((this.frame as any).attachEvent) {
        ;(this.frame as any).attachEvent('onload', loaded)
      } else {
        this.frame.onload = loaded
      }

      if (process.env.NODE_ENV !== 'production') {
        log('Parent: Loading frame', {
          url: url,
        })
      }

      this.frame.src = url

      // 兜底: load 事件长时间未触发时(多子应用并存、慢子资源/主线程长任务),
      // 不再等待 load——子应用页面可见时其 message 监听已就绪, 直接发起握手。
      loadWatchdog = setTimeout(() => {
        console.warn('[postmate] iframe onload timeout, start handshake by watchdog', url)
        startHandshake()
      }, handshakeLoadTimeout)
    })
  }
}

/**
 * The entry point of the Child
 * @type {Class}
 */
Postmate.Model = class Model {
  child: Window
  model: Record<string, any>
  parent: Window
  parentOrigin?: string

  /**
   * Initializes the child, model, parent, and responds to the Parents handshake
   * @param {Object} model Hash of values, functions, or promises
   * @return {Promise}       The Promise that resolves when the handshake has been received
   */
  constructor(model: Record<string, any>) {
    this.child = window
    this.model = model
    this.parent = this.child.parent
    return this.sendHandshakeReply() as any
  }

  /**
   * Responds to a handshake initiated by the Parent
   * @return {Promise} Resolves an object that exposes an API for the Child
   */
  sendHandshakeReply() {
    return new Postmate.Promise((resolve: (value: any) => void) => {
      const shake = (e: MessageEvent) => {
        if (!e.data.postmate) {
          return
        }

        if (e.data.postmate === 'handshake') {
          if (process.env.NODE_ENV !== 'production') {
            log('Child: Received handshake from Parent')
          }

          this.child.removeEventListener('message', shake, false)

          if (process.env.NODE_ENV !== 'production') {
            log('Child: Sending handshake reply to Parent')
          }

          ;(e.source as Window)?.postMessage(
            {
              postmate: 'handshake-reply',
              type: messageType,
            } as any,
            { targetOrigin: e.origin }
          )
          this.parentOrigin = e.origin

          // Extend model with the one provided by the parent
          const defaults = e.data.model

          if (defaults) {
            Object.keys(defaults).forEach((key) => {
              this.model[key] = defaults[key]
            })

            if (process.env.NODE_ENV !== 'production') {
              log('Child: Inherited and extended model from Parent')
            }
          }

          if (process.env.NODE_ENV !== 'production') {
            log('Child: Saving Parent origin', this.parentOrigin)
          }

          return resolve(new ChildAPI(this as any))
        }
        console.warn('Handshake Reply Failed ignore reject', (this as any).child?.frames?.frameElement)
        // return reject('Handshake Reply Failed');
      }

      this.child.addEventListener('message', shake, false)
    })
  }
}

export default Postmate
