//手势
export const VueTouch = class {
  //el 绑定事件的元素  type 事件类型  fun 回调函数
  constructor(
    el,
    type,
    fun = () => {
      console.log('请添加回调')
    }
  ) {
    this.obj = el
    this.touchType = type
    this.vueTouches = {
      x: 0,
      y: 0,
    }
    this.vueMoves = true
    this.vueLeave = true
    this.longTouch = true
    this.vueCallBack = fun
    this.initialize()
  }

  initialize() {
    this.obj.addEventListener(
      'touchstart',
      (e) => {
        this.start(e)
      },
      false
    )

    this.obj.addEventListener(
      'touchend',
      (e) => {
        this.end(e)
      },
      false
    )

    this.obj.addEventListener(
      'touchmove',
      (e) => {
        this.move(e)
      },
      false
    )
  }

  start(e) {
    this.vueMoves = true
    this.vueLeave = true
    this.longTouch = true
    this.vueTouches = {
      x: e.changedTouches[0].pageX,
      y: e.changedTouches[0].pageY,
    }
    this.time = setTimeout(
      function () {
        if (this.vueLeave && this.vueMoves) {
          this.touchType === 'longtap' && this.vueCallBack()
          this.longTouch = false
        }
      }.bind(this),
      1000
    )
  }

  end(e) {
    const disX = e.changedTouches[0].pageX - this.vueTouches.x
    const disY = e.changedTouches[0].pageY - this.vueTouches.y

    clearTimeout(this.time)

    if (Math.abs(disX) > 10 || Math.abs(disY) > 100) {
      this.handleSwipe(disX, disY)
    } else {
      this.handleTap()
    }
  }

  handleSwipe(disX, disY) {
    if (this.touchType === 'swipe') {
      this.vueCallBack()
    }

    if (Math.abs(disX) > Math.abs(disY)) {
      if (disX > 10 && this.touchType === 'swiperight') {
        this.vueCallBack()
      }
      if (disX < -10 && this.touchType === 'swipeleft') {
        this.vueCallBack()
      }
    } else {
      if (disY > 10 && this.touchType === 'swipedown') {
        this.vueCallBack()
      }
      if (disY < -10 && this.touchType === 'swipeup') {
        this.vueCallBack()
      }
    }
  }

  handleTap() {
    if (this.longTouch && this.vueMoves) {
      if (this.touchType === 'tap') {
        this.vueCallBack()
      }
      this.vueLeave = false
    }
  }

  move() {
    this.vueMoves = false
  }
}

export const getDistance = ({ lat1, lng1, lat2, lng2 }) => {
  var radLat1 = (lat1 * Math.PI) / 180.0
  var radLat2 = (lat2 * Math.PI) / 180.0
  var a = radLat1 - radLat2
  var b = (lng1 * Math.PI) / 180.0 - (lng2 * Math.PI) / 180.0
  var s =
    2 *
    Math.asin(
      Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2))
    )
  s = s * 6378.137 // EARTH_RADIUS;
  s = Math.round(s * 10000) / 10 //米
  return s
}

// 创建图片
export const createPositionIocn = ({ map, imgUrl, imgId, coordinates, layout }) => {
  map.loadImage(imgUrl, (error, image) => {
    if (error) throw error
    map.addImage(imgId, image)
    map.addSource(imgId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: coordinates,
            },
          },
        ],
      },
    })
    map.addLayer({
      id: imgId,
      type: 'symbol',
      source: imgId,
      layout: layout,
    })
  })
}
export const distance = (d) => {
  let _distance
  if (d > 1000) {
    _distance = (d / 1000).toFixed(1) + 'km'
  }
  if (d > 100 && d <= 1000) {
    _distance = d.toFixed(0) + 'm'
  }
  if (d < 100) {
    _distance = '100m内'
  }
  return _distance
}

// 修改定位
export const addSource = ({ map, imgId, coordinates }) => {
  map.getSource(imgId).setData({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: coordinates,
        },
      },
    ],
  })
}
// 判断是否Ios
export const androidOrIos = () => {
  let result
  let u = navigator.userAgent
  let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1 //android终端
  // let isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
  if (isAndroid === true) {
    result = 0
  } else {
    result = 1
  }
  return result
}
