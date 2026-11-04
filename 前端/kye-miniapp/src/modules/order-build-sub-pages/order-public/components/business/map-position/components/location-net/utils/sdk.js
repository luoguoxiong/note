import { isWxPcApplet } from '@order-public-sub-public/utils/device'

function noop() {
  console.log('1111')
}

function createdScriptNode(cb) {
  let scriptNode = document.createElement('script')
  scriptNode.src = 'https://kydl.kyslb.com/bjmap/sdk/mapbox-gl-min.js?2020'
  if (isWxPcApplet) {
    scriptNode.src = 'https://api.mapbox.com/mapbox-gl-js/v1.13.3/mapbox-gl.js'
  }
  scriptNode.onload = cb
  document.querySelector('head').appendChild(scriptNode)
}
function createdLinkNode() {
  let linkNode = document.createElement('link')
  linkNode.rel = 'stylesheet'
  linkNode.href = 'https://kydl.kyslb.com/bjmap/sdk/mapbox-gl.css'
  document.querySelector('head').appendChild(linkNode)
}

export function initSDK(cb = noop) {
  if (window.mapboxgl) {
    return cb()
  }
  createdLinkNode()
  createdScriptNode(cb)
}

export function loadImages(map, imgList) {
  return Promise.all(
    imgList.map((i) => {
      return new Promise((resolve, reject) => {
        map.loadImage(i.url, (err, img) => {
          if (err) {
            console.log(err, 'err loadImg ' + i.name)
            reject('err loadImg ' + i.name)
          }
          map.addImage(i.name, img)
          resolve()
        })
      })
    }),
  )
}
