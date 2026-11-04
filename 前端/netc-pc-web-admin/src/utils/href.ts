export const extractVersion = (url: string) => {
  const pattern = /netc-pc-web-admin\/(\d+\.\d+\.\d+)/
  const match = url?.match(pattern)
  return match ? match[1] : null
}
