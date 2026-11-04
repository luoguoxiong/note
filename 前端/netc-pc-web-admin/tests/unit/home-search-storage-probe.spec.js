/** @jest-environment node */
const { readFileSync } = require('fs')
const { JSDOM, VirtualConsole } = require('jsdom')

test('traces shared keyword storage without exposing values and restores the original methods', () => {
  const dom = new JSDOM('<iframe src="https://same.example/waybill/"></iframe>', {
    url: 'https://same.example/admin/',
    runScripts: 'outside-only',
    virtualConsole: new VirtualConsole(),
  })
  const parent = dom.window
  const child = parent.document.querySelector('iframe').contentWindow
  const original = parent.Storage.prototype.setItem
  try {
    parent.eval(readFileSync(require.resolve('../../docs/debug-home-search-storage.js'), 'utf8'))
    const probe = parent.__homeSearchStorageProbe
    const key = 'st-searchValue'
    const raw = JSON.stringify({ value: [{ keyword: 'PRIVATE-KEYWORD', keywordType: '30' }] })
    parent.sessionStorage.setItem(key, raw)
    expect(child.sessionStorage.getItem(key)).toBe(raw)
    child.sessionStorage.removeItem(key)
    parent.sessionStorage.setItem(key, raw)
    child.sessionStorage.clear()
    expect(probe.records).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ operation: 'setItem', after: { present: true, count: 1 } }),
        expect.objectContaining({ frame: 'top/iframe[0]', operation: 'getItem' }),
        expect.objectContaining({ operation: 'removeItem', after: { present: false } }),
        expect.objectContaining({ operation: 'clear', before: { present: true, count: 1 } }),
      ])
    )
    expect(JSON.stringify(probe.records)).not.toContain('PRIVATE-KEYWORD')
    const count = probe.records.length
    parent.sessionStorage.setItem('Token', 'PRIVATE-TOKEN')
    parent.localStorage.setItem(key, raw)
    expect(probe.records).toHaveLength(count)
  } finally {
    parent.__homeSearchStorageProbe?.stop()
    expect(parent.Storage.prototype.setItem).toBe(original)
    dom.window.close()
  }
})
