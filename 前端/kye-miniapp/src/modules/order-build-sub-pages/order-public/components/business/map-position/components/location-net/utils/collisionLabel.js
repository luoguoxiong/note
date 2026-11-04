import throttle from 'lodash/throttle'
// import debounce from 'lodash/debounce'

class CollisionLabel {
  constructor(map) {
    this._labels = {}
    this._visibleLabels = []
    this._map = map
    this.getBeShowLabels = this.getBeShowLabels.bind(this)
    this.update = this.getBeShowLabels
    this._update = throttle(this.getBeShowLabels, 500, {
      leading: true,
    })
  }
  /**
   * 根据groupId 来清空
   */
  clearLabelsByGroupId(groupId = 'default') {
    this._visibleLabels.forEach((item) => {
      item.remove()
    })
    this._visibleLabels = []
    if (groupId && this._labels[groupId]) {
      delete this._labels[groupId]
    } else {
      this._labels = {}
    }
  }
  /**
   * @desc 同一groupId 只显示一组zooms
   * @params labels mapboxs popup 数组
   * @params options.zooms defalut 'auto' 控制显示层级 如'0~4'
   * @params options.groupId defalut '' 将label分组
   */
  addLabels(labels = [], options = {}) {
    options = Object.assign(
      {
        zooms: 'auto',
        groupId: 'defalut',
        sort: 0,
      },
      options
    )
    this._labels[options.groupId] = {
      labels: this._labels[options.groupId] ? this._labels[options.groupId].labels.concat(labels) : labels,
      zooms: options.zooms.includes('~') ? options.zooms.split('~') : 'auto',
    }
    this.getBeShowLabels(true)
  }
  removeLabel(labels = [], options = {}) {
    options = Object.assign(
      {
        zooms: 'auto',
        groupId: 'defalut',
        sort: 0,
      },
      options
    )
    if (this._labels[options.groupId]) {
      const _labels = []
      this._labels[options.groupId].labels.forEach((i) => {
        if (!labels.includes(i)) {
          _labels.push(i)
        }
      })
      this._labels[options.groupId].labels = _labels
    }
    this.getBeShowLabels(true)
  }
  // todo 优先级
  getBeShowLabels() {
    const zoom = this._map.getZoom()
    let labels = []
    Object.values(this._labels).forEach((item) => {
      if (item.zooms === 'auto') {
        labels = labels.concat(item.labels)
      } else if (zoom > item.zooms.zooms[0] && zoom < item.zooms.zooms[1]) {
        labels = labels.concat(item.labels)
      }
    })
    if (labels.length === 0) {
      return
    }
    // labels.sort((a, b) => b.__zIndex - a.__zIndex)
    const bounds = this._map.getBounds()
    const west = bounds.getWest()
    const south = bounds.getSouth()
    const east = bounds.getEast()
    const north = bounds.getNorth()
    // const _oldZoom = this._grid ? this._grid.getZoom() : null
    this._grid = new Grid(this._map)
    const visibleLabels = []
    this._visibleLabels.forEach((item) => {
      item.remove()
    })
    labels = labels.forEach((item) => {
      const lngLat = item.getLngLat().toArray()
      if (lngLat[0] > west && lngLat[0] < east && lngLat[1] > south && lngLat[1] < north) {
        if (!visibleLabels.find((i) => i === item) && this._grid.query(item)) {
          item.addTo(this._map)
          visibleLabels.push(item)
        }
      }
    })
    this._visibleLabels = visibleLabels
  }
}

class Grid {
  constructor(map) {
    this._map = map
    this._zoom = this._map.getZoom()
    this._labels = []
  }
  // 后面可根据marker的位置来判断，先写死为bottom的
  getIndexRange(label) {
    const pos = this._map.project(label.getLngLat())

    const width = label._content.innerText.length * 13 + 24
    // console.log(label)
    const height = 36
    let i1 = Math.floor(pos.x - width / 2)
    let j1 = Math.floor(pos.y)
    let i2 = Math.round(pos.x + width / 2)
    let j2 = Math.round(pos.y + height)
    return {
      minX: i1,
      maxX: i2,
      minY: j1,
      maxY: j2,
    }
  }
  // 先简单写下 看下效果
  /**
   * label 一般会跨越好几格
   * 先按一个字12px来计算 后期再考虑优化
   * 高度按20px 计算
   * @refetor 如果是相同zoom层级说明当前已经显示在地图上的标签已计算过碰撞检测了，只需把在视图内的标签所占网格填充
   */
  query(label) {
    const box = this.getIndexRange(label)
    for (let i = 0; i < this._labels.length; i++) {
      if (overlap(box, this._labels[i])) {
        return false
      }
    }
    this._labels.push(box)
    return true
  }
  getZoom() {
    return this._zoom
  }
}

function overlap(box1, box2) {
  const minx = Math.max(box1.minX, box2.minX)
  const miny = Math.max(box1.minY, box2.minY)
  const maxx = Math.min(box1.maxX, box2.maxX)
  const maxy = Math.min(box1.maxY, box2.maxY)
  if (minx > maxx || miny > maxy) {
    return false
  } else {
    return true
  }
}

export default CollisionLabel
