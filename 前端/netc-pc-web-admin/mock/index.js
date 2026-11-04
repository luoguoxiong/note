const chalk = require('chalk')
const path = require('path')
const tryRequire = require('try-require')

console.log(chalk.cyan(`Mock已启用, 请参考mock目录内使用说明`))

module.exports = function (app) {
  app.post('/router/rest', (req, res, next) => {
    const isUseMock = path.join(__dirname, `./isUseMock.js`)
    const isUseMockPath = tryRequire.resolve(isUseMock)
    delete require.cache[isUseMockPath]
    const isOpenMock = require(isUseMockPath)
    if (!isOpenMock) {
      next()
      return
    }
    const method = req.headers.method
    const mockPath = path.join(__dirname, `./${method}.js`)
    try {
      const maybePath = tryRequire.resolve(mockPath)
      if (maybePath) {
        delete require.cache[maybePath]
        const data = require(maybePath)
        if (data && data.enable) {
          console.log(chalk.cyan(`Mock: ${method}`))
          // data 为函数时，接收请求体，支持按入参返回不同数据
          if (typeof data.data === 'function') {
            let body = ''
            req.on('data', (chunk) => {
              body += chunk
            })
            req.on('end', () => {
              try {
                const reqBody = body ? JSON.parse(body) : {}
                res.json(data.data(reqBody, req))
              } catch (e) {
                console.error('[Mock]: ', e)
                next()
              }
            })
          } else {
            res.json(data.data)
          }
        } else {
          next()
        }
      } else {
        next()
      }
    } catch (e) {
      console.error('[Mock]: ', e)
      next()
    }
  })
}
