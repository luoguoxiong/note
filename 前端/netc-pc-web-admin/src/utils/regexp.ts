/** 逗号以表示千位 */
const thousandSeparatorRegex = /\B(?=(\d{3})+(?!\d))/g

/**一个或多个逗号或者中文逗号 */
const commaSeparatorRegex = /(，|,|\n|\s)+/g

/**任何空格或换行符 */
const whitespaceOrNewlineRegex = /(\s)/g

/**一个或多个空格或逗号开头的字符串 */
const startWithWhitespaceOrCommaRegex = /^[\s,，]+/

export const createMatcher = (regexp: RegExp) => (string: string) => regexp.test(string)

export const createReplacer = (regexp: RegExp) => (string: string, replacement: string) =>
  string.replace(new RegExp(regexp), replacement)

export const thousandSeparatorReplacer = createReplacer(thousandSeparatorRegex)

export const commaSeparatorReplacer = createReplacer(commaSeparatorRegex)

export const whitespaceOrNewlineReplacer = createReplacer(whitespaceOrNewlineRegex)

export const startWithWhitespaceOrCommaReplacer = createReplacer(startWithWhitespaceOrCommaRegex)
