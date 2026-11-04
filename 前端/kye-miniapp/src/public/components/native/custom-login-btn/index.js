// const { debounce } = require('../utils/common.js')
// let debounceTimer = null

Component({
  properties: {
    loginLoading: { type: Boolean, value: false },
  },
  // data: { innerValue: '', isFocus: false },
  // lifetimes: {
  //   detached() {
  //     // 组件卸载时清理
  //     if (debounceTimer) clearTimeout(debounceTimer)
  //   },
  // },
  methods: {
    onGetPhoneMask() {
      wx.getPhoneMask({
        success: (res) => this.setData({ phoneMask: res }),
        fail: (err) => this.setData({ error: err.errMsg }),
      })
    },
    onHandleLogin(e) {
      this.triggerEvent('load')
      console.log(e, '000')
      this.triggerEvent('login', e.detail)
    },
  },
})
