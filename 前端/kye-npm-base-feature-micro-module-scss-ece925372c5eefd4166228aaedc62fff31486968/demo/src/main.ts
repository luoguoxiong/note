import { createApp } from 'vue'
import App from './App.vue'
import './native'
import 'vant/lib/index.css'

export const getQueryObject = (url?: any) => {
  url = url == null ? window.location.href : url
  const search = url.substring(url.lastIndexOf('?') + 1)
  const obj: any = {}
  const reg = /([^?&=]+)=([^?&=]*)/g
  search.replace(reg, (rs: string, $1: string, $2: any) => {
    const name = decodeURIComponent($1)
    let val = decodeURIComponent($2)
    val = String(val)
    obj[name] = val
    return rs
  })
  return obj
}

const initToken = async () => {
  const { token } = getQueryObject()
  window.sessionStorage.setItem('token', token)
}
initToken()
// https://baidu.com?a=1&b=2
createApp(App).mount('#app')
