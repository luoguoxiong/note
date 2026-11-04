import axios from 'axios'

const appKey = '50243'
const CancelToken = axios.CancelToken

// const LIMIT_REQUEST = [
//   'map.bsm.mapOverview.findAll',
//   'map.aggregation.mapOverview.findRightByPage'
// ]
const HTTP_PENDING = {}

export const post = (url, params = {}, options = {}) => {
  const http = window.ksui.default && window.ksui.default.http
  if (HTTP_PENDING[url]) {
    HTTP_PENDING[url]()
  }
  return http(url, options.appKey || appKey, params, {
    cancelToken: new CancelToken((c) => {
      HTTP_PENDING[url] = c
    }),
  })
}
