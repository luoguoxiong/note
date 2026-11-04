import Taro from '@tarojs/taro'
const CANVAS_WIDTH = 558
const CANVAS_HEIGHT = 428
const BACKGROUND_IMG_MAP = {
  10: 'https://ic-img.ky-express.com/netc/20250917_80372_!!1758111628956_1116_840.png',
  20: 'https://ic-img.ky-express.com/netc/20250917_52084_!!1758111633245_1116_840.png',
  30: 'https://ic-img.ky-express.com/netc/20250917_90588_!!1758111636811_1116_840.png',
}

const useCanvas = () => {
  let backgroundTargetImg

  // 计算文本是否超过最大字符长度，超长则添加省略号
  const truncateText = (text, maxLength, ctx) => {
    let truncatedText = text
    const width = ctx.measureText(text).width

    if (width > maxLength) {
      let low = 0,
        high = text.length
      while (low <= high) {
        const mid = Math.floor((low + high) / 2)
        truncatedText = text.substring(0, mid) + '...'
        if (ctx.measureText(truncatedText).width <= maxLength) {
          low = mid + 1
        } else {
          high = mid - 1
        }
      }
      truncatedText = text.substring(0, high) + '...'
    }

    return truncatedText
  }

  // 绘制文本并应用省略号
  const drawTextWithEllipsis = (ctx, text, x, y, maxLength) => {
    const truncatedText = truncateText(text, maxLength, ctx)
    ctx.fillText(truncatedText, x, y)
  }

  // 创建画布上下文
  const createContext = (type = 0) => {
    return new Promise((resolve) => {
      const query = Taro.createSelectorQuery()
      query
        .select('#idcardCanvas2')
        .fields({ node: true, size: true })
        .exec((res) => {
          const canvas = res[0].node
          const ctx = canvas.getContext('2d')
          const dpr = Taro.getSystemInfoSync().pixelRatio
          const width = res[0].width * dpr
          const height = res[0].height * dpr
          canvas.width = res[0].width * dpr
          if (type === 0) {
            canvas.height = (430 / CANVAS_HEIGHT) * height
          } else if (type === 1) {
            canvas.height = (460 / CANVAS_HEIGHT) * height
          } else if (type === 10) {
            canvas.height = (490 / CANVAS_HEIGHT) * height
          } else if (type === 11) {
            canvas.height = (530 / CANVAS_HEIGHT) * height
          }
          ctx.scale(dpr, dpr)
          resolve({ ctx, canvas, dpr, width: width, height: height })
        })
    })
  }

  // 获取图片信息
  const getImageInfo = (canvas, url) => {
    return new Promise((resolve) => {
      const img = canvas.createImage()
      img.src = url
      img.onload = () => resolve(img)
    })
  }

  // 计算宽度百分比
  const getWidthPercentDpr = (cur, canvasDesign, dpr) => (cur === 0 ? 0 : ((cur / CANVAS_WIDTH) * canvasDesign) / dpr)

  // 计算高度百分比
  const getHeightPercentDpr = (cur, canvasDesign, dpr) => (cur === 0 ? 0 : ((cur / CANVAS_HEIGHT) * canvasDesign) / dpr)

  // 绘制图片
  const drawImage = async (ctxInfo, imgUrl, x, y, w, h) => {
    const { ctx, canvas, dpr, width, height } = ctxInfo
    const img = await getImageInfo(canvas, imgUrl)
    ctx.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      getWidthPercentDpr(x, width, dpr),
      getHeightPercentDpr(y, height, dpr),
      getWidthPercentDpr(w, width, dpr),
      getHeightPercentDpr(h, height, dpr),
    )
  }

  // 绘制文本
  const drawText = (ctxInfo, textColor, font, text, x, y, measureText, ellipsis = true) => {
    const { ctx, dpr, width, height } = ctxInfo
    ctx.fillStyle = textColor || '#fff'
    ctx.font = `${font}px bold normal PingFangSC, PingFangSC-Medium `
    const metrics = ctx.measureText(measureText)
    if (ellipsis) {
      drawTextWithEllipsis(
        ctx,
        text,
        getWidthPercentDpr(x, width, dpr),
        Number(font) + getHeightPercentDpr(y, height, dpr),
        metrics.width,
      )
    } else {
      ctx.fillText(text, x, y)
    }
    return metrics.width
  }

  // 创建最大长度字符串
  const createMaxLenStr = (len) => '最'.repeat(len)

  // 绘制居中文本
  const drawCenterText = (ctxInfo, textColor, font, text, measureText, y) => {
    const { ctx, width, height, dpr } = ctxInfo
    ctx.fillStyle = textColor || '#fff'
    ctx.font = `${font}px bold normal PingFangSC, PingFangSC-Medium `
    const textWidth = ctx.measureText(text).width
    const maxWidth = ctx.measureText(measureText).width
    const realWidth = Math.min(textWidth, maxWidth)
    const x = (width / dpr - realWidth) / 2
    const truncatedText = truncateText(text, realWidth, ctx)
    ctx.fillText(truncatedText, x, Number(font) + getHeightPercentDpr(y, height, dpr))
  }

  const drawTwoCenteredTexts = (ctxInfo, textColor1, font1, text1, textColor2, font2, text2, measureText, y) => {
    const { ctx, width, height, dpr } = ctxInfo

    // 测量两个文本的宽度
    ctx.font = `${font1}px bold normal PingFangSC, PingFangSC-Medium`
    const text1Width = ctx.measureText(text1).width

    ctx.font = `${font2}px bold normal PingFangSC, PingFangSC-Medium`
    const text2Width = ctx.measureText(text2).width

    // 总宽度和最大宽度
    const totalWidth = text1Width + text2Width
    const maxWidth = ctx.measureText(measureText).width

    let finalText1 = text1
    let finalText2 = text2
    let finalWidth1 = text1Width
    let finalWidth2 = text2Width

    // 如果总宽度超出限制，进行截断
    if (totalWidth > maxWidth) {
      // 按原始宽度比例分配空间
      const ratio1 = text1Width / totalWidth
      const availableWidth = maxWidth - 40 // 预留一些空间给省略号

      const widthForText1 = availableWidth * ratio1
      const widthForText2 = availableWidth * (1 - ratio1)

      // 截断文本
      finalText1 = truncateText(text1, widthForText1, ctx)
      finalText2 = truncateText(text2, widthForText2, ctx)

      // 重新测量截断后的宽度
      ctx.font = `${font1}px bold normal PingFangSC, PingFangSC-Medium`
      finalWidth1 = ctx.measureText(finalText1).width

      ctx.font = `${font2}px bold normal PingFangSC, PingFangSC-Medium`
      finalWidth2 = ctx.measureText(finalText2).width
    }

    // 居中计算
    const totalFinalWidth = finalWidth1 + finalWidth2
    const startX = (width / dpr - totalFinalWidth) / 2

    // 底部对齐（使用相同的y坐标）
    const baseline = Number(font1) + getHeightPercentDpr(y, height, dpr)

    // 绘制第一个文本
    ctx.fillStyle = textColor1 || '#fff'
    ctx.font = `${font1}px bold normal PingFangSC, PingFangSC-Medium`
    ctx.fillText(finalText1, startX, baseline)

    // 绘制第二个文本（与第一个文本底部对齐）
    ctx.fillStyle = textColor2 || '#fff'
    ctx.font = `${font2}px bold normal PingFangSC, PingFangSC-Medium`
    ctx.fillText(finalText2, startX + finalWidth1, baseline)
  }

  const drawBaseInfoText1 = (ctxInfo, targetObj) => {
    const len1 = targetObj.employeeName.length
    console.log('🚀 ~ drawBaseInfoText1 ~ len1:', len1)
    const len2 = targetObj.situation.length
    console.log('🚀 ~ drawBaseInfoText1 ~ len2:', len2)
    if (len1 > 9) {
      const line2 = targetObj.employeeName.slice(9)
      drawText(ctxInfo, '#fff', '20', targetObj.employeeName.slice(0, 9), 13, 38, createMaxLenStr(9), false)
      const len = drawText(ctxInfo, '#fff', '20', line2, 13, 63, createMaxLenStr(line2.length), false)
      drawText(ctxInfo, '#fff', '16', '/ ' + targetObj.situation, len + 16, 63, createMaxLenStr(len2), false)
      drawText(ctxInfo, '#fff', '12', targetObj.companyName, 24, 136, createMaxLenStr(13))
    } else if (len1 + len2 > 9) {
      const line1 = targetObj.situation.slice(0, 9 - len1)
      const len = drawText(ctxInfo, '#fff', '20', targetObj.employeeName, 13, 38, createMaxLenStr(len1), false)
      drawText(ctxInfo, '#fff', '16', '/ ' + line1, len + 24, 38, createMaxLenStr(line1.length), false)
      drawText(ctxInfo, '#fff', '16', targetObj.situation.slice(9 - len1), 13, 63, createMaxLenStr(9 - len1), false)
      drawText(ctxInfo, '#fff', '12', targetObj.companyName, 24, 136, createMaxLenStr(13))
    } else {
      const len = drawText(ctxInfo, '#fff', '20', targetObj.employeeName, 13, 50, createMaxLenStr(len1), false)
      drawText(ctxInfo, '#fff', '16', '/ ' + targetObj.situation, len + 24, 52, createMaxLenStr(len2), false)
      drawText(ctxInfo, '#fff', '12', targetObj.companyName, 24, 116, createMaxLenStr(13))
    }
  }

  const drawBaseInfoText2 = (ctxInfo, targetObj) => {
    const len1 = targetObj.employeeName.length
    const len2 = targetObj.situation.length
    if (len1 > 9) {
      const line2 = targetObj.employeeName.slice(9)
      drawText(ctxInfo, '#fff', '20', targetObj.employeeName.slice(0, 9), 78, 38, createMaxLenStr(9), false)
      const len = drawText(ctxInfo, '#fff', '20', line2, 78, 63, createMaxLenStr(line2.length), false)
      drawText(ctxInfo, '#fff', '16', '/ ' + targetObj.situation, len + 87, 63, createMaxLenStr(len2), false)
      drawText(ctxInfo, '#fff', '12', targetObj.companyName, 147, 136, createMaxLenStr(13))
    } else if (len1 + len2 > 9) {
      const line1 = targetObj.situation.slice(0, 9 - len1)
      const len = drawText(ctxInfo, '#fff', '20', targetObj.employeeName, 78, 38, createMaxLenStr(len1), false)
      drawText(ctxInfo, '#fff', '16', '/ ' + line1, len + 87, 38, createMaxLenStr(line1.length), false)
      drawText(ctxInfo, '#fff', '16', targetObj.situation.slice(9 - len1), 78, 63, createMaxLenStr(9 - len1), false)
      drawText(ctxInfo, '#fff', '12', targetObj.companyName, 147, 136, createMaxLenStr(13))
    } else {
      const len = drawText(ctxInfo, '#fff', '20', targetObj.employeeName, 78, 50, createMaxLenStr(len1), false)
      // 源代码
      // drawText(ctxInfo, '#fff', '16', '/ ' + targetObj.situation, len + 87, 52, createMaxLenStr(len2), false)
      drawText(ctxInfo, '#fff', '16', '/ ' + targetObj.situation, len + 82, 52, createMaxLenStr(len2), false)
      drawText(ctxInfo, '#fff', '12', targetObj.companyName, 147, 116, createMaxLenStr(13))
    }
  }

  const drawBottom = (ctxInfo, x, y) => {
    const { ctx, width, height, dpr } = ctxInfo
    const actualWidth = width / dpr
    const rectHeight = 190
    const gradient = ctx.createLinearGradient(x, y, x + CANVAS_WIDTH, y)
    gradient.addColorStop(0, '#F2EFFE')
    gradient.addColorStop(0.5, '#FFFFFF')
    gradient.addColorStop(1, '#F2EFFE')
    ctx.fillStyle = gradient
    ctx.fillRect(x, getHeightPercentDpr(y, height, dpr), actualWidth, getHeightPercentDpr(rectHeight, height, dpr))
  }

  // 模式1
  const mode1 = async (targetObj) => {
    let type = +targetObj.showEmail + +targetObj.showAddress * 10 + 0
    const ctxInfo = await createContext(type)
    const { canvas } = ctxInfo
    let bgHeight = 240
    if (type === 1) {
      bgHeight = 270
    } else if (type === 10) {
      bgHeight = 300
    } else if (type === 11) {
      bgHeight = 340
    }
    await drawImage(ctxInfo, backgroundTargetImg, 0, 0, CANVAS_WIDTH, bgHeight)
    await drawImage(ctxInfo, targetObj.avatar, 406, 38, 128, 128)
    drawBaseInfoText1(ctxInfo, targetObj)
    // await drawImage(ctxInfo, 'https://ic-img.ky-express.com/netc/20250303_66970395121_!!1740969311150_212_40.png', 24, 190, 123, 25)
    await drawImage(ctxInfo, targetObj.realnameIcon, 24, 190, 22, 23)
    drawText(ctxInfo, '#fff', '10', '跨越速运认证', 55, 190, createMaxLenStr(6))
    // 将设计坐标转为 CSS 像素后再绘制，避免图片遮挡文字
    const { ctx: ctx1, width: w1, dpr: dpr1 } = ctxInfo
    const textWidthCss = ctx1.measureText('跨越速运认证').width
    const textWidthDesign = Math.ceil((textWidthCss * CANVAS_WIDTH) / (w1 / dpr1))
    const zaizhiX = 55 + textWidthDesign + 10
    await drawImage(ctxInfo, targetObj.zaizhi, zaizhiX, 190, 60, 25)
    await drawImage(ctxInfo, targetObj.shiming, zaizhiX + 60 + 8, 190, 70, 25)
    if (type === 1) {
      await drawImage(ctxInfo, targetObj.emailIcon, 24, 232, 22, 17)
      drawText(ctxInfo, '#fff', '10', targetObj.email, 55, 230, createMaxLenStr(25))
    } else if (type === 10) {
      await drawImage(ctxInfo, targetObj.addressIcon, 24, 230, 20, 25)
      drawText(ctxInfo, '#fff', '10', targetObj.address.slice(0, 25), 55, 230, createMaxLenStr(25))
      drawText(ctxInfo, '#fff', '10', targetObj.address.slice(25), 55, 255, createMaxLenStr(25))
    } else if (type === 11) {
      await drawImage(ctxInfo, targetObj.emailIcon, 24, 232, 22, 17)
      drawText(ctxInfo, '#fff', '10', targetObj.email, 55, 230, createMaxLenStr(25))
      await drawImage(ctxInfo, targetObj.addressIcon, 24, 270, 20, 25)
      drawText(ctxInfo, '#fff', '10', targetObj.address.slice(0, 25), 55, 270, createMaxLenStr(25))
      drawText(ctxInfo, '#fff', '10', targetObj.address.slice(25), 55, 295, createMaxLenStr(25))
    }
    drawBottom(ctxInfo, 0, bgHeight)
    drawText(ctxInfo, '#24262B', '12', '长按识别二维码，查看更多', 24, bgHeight + 65, createMaxLenStr(13))
    drawText(ctxInfo, '#24262B', '12', '名片信息', 24, bgHeight + 90, createMaxLenStr(13))
    await drawImage(ctxInfo, targetObj.qrCode, 394, bgHeight + 20, 140, 140)
    return canvas
  }

  // 模式2
  const mode2 = async (targetObj) => {
    let type = +targetObj.showEmail + +targetObj.showAddress * 10 + 0
    const ctxInfo = await createContext(type)
    const { canvas, ctx, width, dpr, height } = ctxInfo
    let bgHeight = 240
    if (type === 1) {
      bgHeight = 270
    } else if (type === 10) {
      bgHeight = 300
    } else if (type === 11) {
      bgHeight = 340
    }
    await drawImage(ctxInfo, backgroundTargetImg, 0, 0, CANVAS_WIDTH, bgHeight)
    ctx.save()
    const centerX = getWidthPercentDpr(20 + 50, width, dpr)
    const centerY = getHeightPercentDpr(50 + 50, height, dpr)
    const radius = getWidthPercentDpr(45, width, dpr)
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.closePath()
    ctx.clip()
    await drawImage(ctxInfo, targetObj.avatar, 20, 50, 100, 100)
    ctx.restore()
    // mode2 oppo 机型问题

    // 测试数据
    // targetObj = {
    //   ...targetObj,
    //   employeeName: '玄妙阿',
    //   situation: '销售总经理',
    // }
    // console.log('targetObj >>> ', targetObj)
    console.log('Taro.getSystemInfoSync()?.brand ', Taro.getSystemInfoSync()?.brand, Taro.getSystemInfoSync())

    drawBaseInfoText2(ctxInfo, targetObj)
    await drawImage(ctxInfo, targetObj.realnameIcon, 24, 190, 22, 23)
    drawText(ctxInfo, '#fff', '10', '跨越速运认证', 55, 190, createMaxLenStr(6))
    const textWidthCss2 = ctx.measureText('跨越速运认证').width
    const textWidthDesign2 = Math.ceil((textWidthCss2 * CANVAS_WIDTH) / (width / dpr))
    const zaizhiX2 = 55 + textWidthDesign2 + 10
    await drawImage(ctxInfo, targetObj.zaizhi, zaizhiX2, 190, 60, 25)
    await drawImage(ctxInfo, targetObj.shiming, zaizhiX2 + 60 + 8, 190, 70, 25)

    if (type === 1) {
      await drawImage(ctxInfo, targetObj.emailIcon, 24, 232, 22, 17)
      drawText(ctxInfo, '#fff', '10', targetObj.email, 55, 230, createMaxLenStr(25))
    } else if (type === 10) {
      await drawImage(ctxInfo, targetObj.addressIcon, 24, 230, 20, 25)
      drawText(ctxInfo, '#fff', '10', targetObj.address.slice(0, 25), 55, 230, createMaxLenStr(25))
      drawText(ctxInfo, '#fff', '10', targetObj.address.slice(25), 55, 255, createMaxLenStr(25))
    } else if (type === 11) {
      await drawImage(ctxInfo, targetObj.emailIcon, 24, 232, 22, 17)
      drawText(ctxInfo, '#fff', '10', targetObj.email, 55, 230, createMaxLenStr(25))
      await drawImage(ctxInfo, targetObj.addressIcon, 24, 270, 20, 25)
      drawText(ctxInfo, '#fff', '10', targetObj.address.slice(0, 25), 55, 270, createMaxLenStr(25))
      drawText(ctxInfo, '#fff', '10', targetObj.address.slice(25), 55, 295, createMaxLenStr(25))
    }
    drawBottom(ctxInfo, 0, bgHeight)
    drawText(ctxInfo, '#24262B', '12', '长按识别二维码，查看更多', 24, bgHeight + 65, createMaxLenStr(13))
    drawText(ctxInfo, '#24262B', '12', '名片信息', 24, bgHeight + 90, createMaxLenStr(13))
    await drawImage(ctxInfo, targetObj.qrCode, 394, bgHeight + 20, 140, 140)
    return canvas
  }

  // 模式3
  const mode3 = async (targetObj) => {
    let type = +targetObj.showEmail + +targetObj.showAddress * 10 + 0
    const ctxInfo = await createContext(type)
    const { canvas, ctx, width, height, dpr } = ctxInfo
    let bgHeight = 240
    if (type === 1) {
      bgHeight = 270
    } else if (type === 10) {
      bgHeight = 300
    } else if (type === 11) {
      bgHeight = 340
    }
    await drawImage(ctxInfo, backgroundTargetImg, 0, 0, CANVAS_WIDTH, bgHeight)
    const len1 = targetObj.employeeName.length
    const len2 = targetObj.situation.length
    if (len1 < 9 || len1 + len2 < 12) {
      drawTwoCenteredTexts(
        ctxInfo,
        '#fff',
        '20',
        targetObj.employeeName,
        '#fff',
        '16',
        '/' + targetObj.situation,
        createMaxLenStr(19),
        47,
      )
      drawCenterText(ctxInfo, '#fff', '12', targetObj.companyName, createMaxLenStr(19), 106)
    } else {
      drawCenterText(ctxInfo, '#fff', '20', targetObj.employeeName, createMaxLenStr(19), 28)
      drawCenterText(ctxInfo, '#fff', '16', targetObj.situation, createMaxLenStr(19), 78)
      drawCenterText(ctxInfo, '#fff', '12', targetObj.companyName, createMaxLenStr(19), 126)
    }
    const beginX = getWidthPercentDpr(24, width, dpr)
    const beginY = getHeightPercentDpr(170, height, dpr)
    const endX = getWidthPercentDpr(CANVAS_WIDTH - 24, width, dpr)
    const endY = getHeightPercentDpr(170, height, dpr)
    ctx.save()
    ctx.strokeStyle = '#E6E8ED'
    ctx.beginPath()
    ctx.moveTo(beginX, beginY)
    ctx.lineTo(endX, endY)
    ctx.stroke()
    ctx.restore()
    await drawImage(ctxInfo, targetObj.realnameIcon, 24, 190, 22, 23)
    drawText(ctxInfo, '#fff', '10', '跨越速运认证', 55, 190, createMaxLenStr(6))
    const textWidthCss3 = ctx.measureText('跨越速运认证').width
    const textWidthDesign3 = Math.ceil((textWidthCss3 * CANVAS_WIDTH) / (width / dpr))
    const zaizhiX3 = 55 + textWidthDesign3 + 10
    await drawImage(ctxInfo, targetObj.zaizhi, zaizhiX3, 190, 60, 25)
    await drawImage(ctxInfo, targetObj.shiming, zaizhiX3 + 60 + 8, 190, 70, 25)
    if (type === 1) {
      await drawImage(ctxInfo, targetObj.emailIcon, 24, 232, 22, 17)
      drawText(ctxInfo, '#fff', '10', targetObj.email, 55, 230, createMaxLenStr(25))
    } else if (type === 10) {
      await drawImage(ctxInfo, targetObj.addressIcon, 24, 230, 20, 25)
      drawText(ctxInfo, '#fff', '10', targetObj.address.slice(0, 25), 55, 230, createMaxLenStr(25))
      drawText(ctxInfo, '#fff', '10', targetObj.address.slice(25), 55, 255, createMaxLenStr(25))
    } else if (type === 11) {
      await drawImage(ctxInfo, targetObj.emailIcon, 24, 232, 22, 17)
      drawText(ctxInfo, '#fff', '10', targetObj.email, 55, 230, createMaxLenStr(25))
      await drawImage(ctxInfo, targetObj.addressIcon, 24, 270, 20, 25)
      drawText(ctxInfo, '#fff', '10', targetObj.address.slice(0, 25), 55, 270, createMaxLenStr(25))
      drawText(ctxInfo, '#fff', '10', targetObj.address.slice(25), 55, 295, createMaxLenStr(25))
    }
    drawBottom(ctxInfo, 0, bgHeight)
    drawText(ctxInfo, '#24262B', '12', '长按识别二维码，查看更多', 24, bgHeight + 65, createMaxLenStr(13))
    drawText(ctxInfo, '#24262B', '12', '名片信息', 24, bgHeight + 90, createMaxLenStr(13))
    await drawImage(ctxInfo, targetObj.qrCode, 394, bgHeight + 20, 140, 140)
    return canvas
  }

  // 处理封面创建
  const handleCreateCover = async (targetObj, mode) => {
    switch (mode) {
      case 'mode10':
        return await mode1(targetObj)
      case 'mode20':
        return await mode2(targetObj)
      case 'mode30':
        return await mode3(targetObj)
      default:
        return await mode1(targetObj)
    }
  }

  // 获取图片
  const handleGetImg = async (info) => {
    return new Promise(async (resolve) => {
      const resultInfo = {
        ...info,
        renZhengIcon: 'https://ic-img.ky-express.com/netc/20250205_2166301128_!!1738724662437_68_68.png',
        shiming: 'https://ic-img.ky-express.com/netc/20250225_39266301152_!!1740467111953_102_40.png',
        zaizhi: 'https://ic-img.ky-express.com/netc/20250225_1066301195_!!1740467111956_74_40.png',
        emailIcon: 'https://ic-img.ky-express.com/netc/20250919_8569_!!1758247203390_44_34.png',
        addressIcon: 'https://ic-img.ky-express.com/netc/20250919_74142_!!1758247196255_40_50.png',
        realnameIcon: 'https://ic-img.ky-express.com/netc/20250923_12046_!!1758593107010_56_56.png',
      }

      backgroundTargetImg = BACKGROUND_IMG_MAP[info.themeBackground] || BACKGROUND_IMG_MAP[10]

      const currentMode = `mode${info.themeBackground || 10}`

      const canvas = await handleCreateCover(resultInfo, currentMode)

      Taro.canvasToTempFilePath({
        canvas: canvas,
        x: 0,
        y: 0,
        success: (res) => resolve(res.tempFilePath),
      })
    })
  }

  return { handleGetImg }
}

export default useCanvas
