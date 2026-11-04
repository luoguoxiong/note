export const enableTouchPolyfill = () => {
  if (process.env.TARO_ENV === 'h5') {
    const script = document.createElement('script')
    script.src = 'https://fastly.jsdelivr.net/npm/@vant/touch-emulator'
    script.async = true
    document.head.appendChild(script)
  }
}
