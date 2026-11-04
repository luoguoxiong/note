Component({
  properties: {
    type: { type: String, value: 'text' },
    placeholder: { type: String, value: '' },
    placeholderStyle: { type: String, value: '' },
    disabled: { type: Boolean, value: false },
    focus: { type: Boolean, value: false },
    adjustPosition: { type: Boolean, value: true }, // 值为false,则cursorSpacing冲突
    cursorSpacing: { type: Number, value: 0 },
    holdKeyboard: { type: Boolean, value: false }, // hold-keyboard 用于处理textarea影响聚焦
    autoHeight: { type: Boolean, value: false },
    disableDefaultPadding: { type: Boolean, value: false }, // 	是否去掉 iOS 下的默认内边距
    inputDebounce: {
      type: Number,
      value: 100,
    },
    value: {
      type: String,
      value: '',
      observer(newVal) {
        if (newVal !== this.data.innerValue) {
          this.setData({
            innerValue: newVal,
          })
        }
      },
    },

    maxlength: {
      type: Number,
      value: 140,
      observer(val) {
        if (val === 0) {
          this.setData({
            maxlength: 140,
          })
        }
      },
    },
  },

  data: {
    innerValue: '',
    isFocus: false,
  },

  methods: {
    onInput(e) {
      const value = e.detail.value

      this.setData(
        {
          innerValue: value,
        },
        () => {
          this.triggerEvent('input', e.detail)
        },
      )
    },

    onFocus(e) {
      this.triggerEvent('focus', e.detail)
    },

    onBlur(e) {
      this.triggerEvent('blur', e.detail)
    },

    onConfirm(e) {
      this.triggerEvent('confirm', e.detail)
    },

    onKeyboardHeightChange(e) {
      this.triggerEvent('keyboardHeightChange', e.detail)
    },

    updateCurrentValue(value) {
      this.setData({
        innerValue: value,
      })
    },
  },
})
