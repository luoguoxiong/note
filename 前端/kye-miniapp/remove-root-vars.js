/* eslint-disable no-undef */
module.exports = () => {
  return {
    postcssPlugin: 'remove-root-vars',
    /**
     * @param {import('postcss').Root} root
     */
    Once(root) {
      const varPairs = []

      root.walkAtRules((rule) => {
        // skyline 不支持 @charset 会导致相邻的 @import 规则失效
        if (rule.name === 'charset') {
          rule.remove()
        }
      })
      root.walkRules(':root', (rule) => {
        rule.walkDecls((decl) => {
          varPairs.push({ key: decl.prop, value: decl.value })
        })
        rule.remove()
      })

      root.walkDecls((decl) => {
        varPairs.forEach(({ key, value }) => {
          decl.value = decl.value.replace(new RegExp(`var\\(${key}\\)`, 'g'), `var(${key}, ${value})`)
        })
      })
    },
  }
}

module.exports.postcss = true
