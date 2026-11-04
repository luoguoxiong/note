export const loadScripts = (sdkUrl) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = sdkUrl
    script.async = true
    script.onload = () => resolve({})
    script.onerror = reject
    document.head.appendChild(script)
  })
}
