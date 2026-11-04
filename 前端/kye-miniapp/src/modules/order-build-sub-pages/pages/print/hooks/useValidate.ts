import { localCheckResult } from '@order-public-sub-public/types'
import { isWxAppletAndroid, isWxAppletI0S } from '@order-public-sub-public/utils/device'
import useEffect from '@order-public-sub-public/validate'
import { computed } from 'vue'
import { labelPermission, parentChildrenPermission, bubbleVisible } from './state'
import { printerFormType, VisibleAuth } from './type'
import { isWxAppAndroidEnv, isWxAppIosEnv } from '@/public/utils'

// 包括校验和页面显示样式逻辑
// eslint-disable-next-line max-lines-per-function
export const useValidate = (printerForm: printerFormType, isBatch: boolean) => {
  let platformType = 'android'
  if (isWxAppletAndroid) {
    platformType = 'android-wechat'
  }
  if (isWxAppletI0S) {
    platformType = 'ios-wechat'
  }
  if (isWxAppAndroidEnv) {
    platformType = 'android'
  }
  if (isWxAppIosEnv) {
    platformType = 'ios'
  }

  const { effectBubble } = useEffect()
  const validateElement = document.getElementById('printerPageX') as HTMLElement
  // 打印机校验
  const printerValidate = () => {
    const validateResultN: localCheckResult[] = [
      {
        passed: false,
        key: 'printerForm.printer',
        // content: '请选择打印机',
        // bubbleConfig: {
        //   appendTo: validateElement,
        //   offset: [0, 16],
        //   placement: 'top-start',
        // },
      },
    ]
    const validateResultY: localCheckResult[] = [
      {
        passed: true,
        key: 'printerForm.printer',
        content: '',
        bubbleConfig: {
          appendTo: validateElement,
          offset: [0, 16],
          placement: 'top-start',
        },
      },
    ]
    if (printerForm.printer && printerForm.printer.name) {
      return validateResultY
    } else {
      return validateResultN
    }
  }
  // 面单类型校验
  const templateListValidate = () => {
    const validateResultN: localCheckResult[] = [
      {
        passed: false,
        key: 'printerForm.templateList',
        content: '请选择面单类型',
        bubbleConfig: {
          appendTo: validateElement,
          offset: [0, 16],
          placement: 'top-start',
        },
      },
    ]
    const validateResultY: localCheckResult[] = [
      {
        passed: true,
        key: 'printerForm.templateList',
        content: '',
        bubbleConfig: {
          appendTo: validateElement,
          offset: [0, 16],
          placement: 'top-start',
        },
      },
    ]
    if (printerForm.templateList && printerForm.templateList.length) {
      return validateResultY
    } else {
      return validateResultN
    }
  }

  const checkText = (text: string) => {
    const count = Number(printerForm.count)
    const str = text.replace(/，/g, ',')
    const arr = str.split(',')
    const list = [] as string[]
    const flag = arr.some((x) => {
      if (x) {
        if (x.indexOf('-') !== -1) {
          const arr2 = x.split('-')
          if (arr2.length === 2) {
            if (!arr2[0] || !arr2[1]) {
              return true
            } else if (parseInt(arr2[0]) >= parseInt(arr2[1])) {
              return true
            } else {
              list.push(arr2[0])
              list.push(arr2[1])
            }
          } else {
            return true
          }
        } else {
          list.push(x)
        }
      } else {
        return true
      }
      return false
    })
    console.log('pageSize', text, flag, list)
    if (list.some((x) => Number(x) > count || Number(x) < 1)) {
      return true
    }
    return flag
  }
  const pageValidateResult = (passed: boolean, content: string) => {
    const validateResult: localCheckResult[] = [
      {
        passed,
        key: 'printerForm.pageSize',
        content,
        bubbleConfig: {
          appendTo: validateElement,
          offset: [0, 16],
          placement: 'top-start',
        },
      },
    ]
    return validateResult
  }
  // 面单页码校验
  const pageSizeValidate = () => {
    const pageSize = printerForm.pageSize
    const printName = printerForm?.printer?.name
    if (pageSize) {
      if (checkText(pageSize)) {
        printName && (bubbleVisible.value = true)
        return pageValidateResult(false, ``)
      } else {
        return pageValidateResult(true, '')
      }
    } else {
      printName && (bubbleVisible.value = true)
      return pageValidateResult(false, ``)
    }
  }
  // 校验总入口
  const usePrinterValidate = async (isValidatePrint = true) => {
    let validateResult: localCheckResult[] = []
    if (isValidatePrint) {
      validateResult = validateResult.concat(printerValidate())
    }
    validateResult = validateResult.concat(templateListValidate())
    if (pageSizeVisible.value) {
      validateResult = validateResult.concat(pageSizeValidate())
    }
    // 触发副作用
    try {
      await effectBubble(validateResult)
    } catch (error) {
      console.log(error)
    }
    if (validateResult.every((v) => v.passed)) {
      return true
    } else {
      return false
    }
  }

  // 判断是否选择的是随货联、一联二面随货联
  const printGoodsAllyVisible = computed(() => {
    const templateKeys = ['4', '10'] // 随货联合一联二面随货联
    const templateItem = printerForm.templateList.find((v) => templateKeys.includes(v.type))
    return !!templateItem
  })

  const printLabelVisible = computed(() => {
    // 判断是否勾选子母单
    const isCheckChildFlag = printerForm.stubChildData.some((v) => v.type === '8') // 子母单
    if (isCheckChildFlag) {
      // 如果取消勾选子母单，需要充值标签的勾选
      printerForm.tagList = []
    }

    return !!tagAndCountVisible.value && printGoodsAllyVisible.value && !isCheckChildFlag
  })

  // 打印标签和打印件数是否显示
  const tagAndCountVisible = computed(() => {
    const templateFlag = printGoodsAllyVisible.value
    const templateItem = printerForm.tagList.find((v) => v.type + '' === '11') // 若为小标签*2
    if (!(!!templateFlag && labelPermission.value === VisibleAuth.全部展示)) {
      // printerForm.tagList = [] // TODO:这里有死循环,自身改自身依赖 和 mdlistVisible 也产生了死循环(如果有业务上的bug自己想办法处理,不要在这改数据)
    }
    return (!!templateFlag || !!templateItem) && labelPermission.value === VisibleAuth.全部展示
  })

  // 判断是否有标签权限
  const hasLabelAuth = computed(() => {
    return labelPermission.value === VisibleAuth.全部展示
  })

  // 面单范围是否显示
  const mdlistVisible = computed(() => {
    const tagKeys = ['10', '20'] // 大标签、小标签*3
    const bol = printerForm.tagList.some((v) => tagKeys.includes(v.type)) && !isBatch
    const templateItem = printerForm.tagList.find((v) => v.type + '' === '11')

    const isShowMdList = Number(printerForm.count) > 1 && (bol || templateItem?.type + '' === '11')
    // if (Number(printerForm.count) > 1 && isShowMdList) {
    //   printerForm.mdList = [
    //     {
    //       type: 'big',
    //       typeName: '全部面单',
    //       typeNameDes: '',
    //     },
    //   ]
    // }
    return isShowMdList
  })
  // 面单页码是否显示
  const pageSizeVisible = computed(() => {
    const pageSizeFlag = printerForm.mdList.find((v) => v.typeName === '面单页码')
    const is = !!pageSizeFlag

    if (!is) {
      printerForm.pageSize = ''
    }

    return is
  })
  // 子母单是否显示
  const isMotherVisible = computed(() => {
    // const templateFlag = printerForm.templateList.find((v) => v.typeName !== '寄方存根')
    // parentChildrenPermission  全为 20时不展示打印子母单 ,  labelPermission  全为 20   &&  parentChildrenPermission   有 10 时 展示子母单
    // 翻译一下
    // parentChildrenPermission 为10 展示打印子母单
    // parentChildrenPermission 为20 不展示打印子母单
    // parentChildrenPermission 为30 时，labelPermission 为 20 时展示打印子母单
    return printGoodsAllyVisible.value && hasMotherAuth.value
  })

  const hasMotherAuth = computed(() => {
    return (
      parentChildrenPermission.value === VisibleAuth.全部展示 ||
      (parentChildrenPermission.value === VisibleAuth.部分展示 && labelPermission.value === VisibleAuth.全部隐藏)
    )
  })
  return {
    printGoodsAllyVisible,
    printLabelVisible,
    tagAndCountVisible,
    mdlistVisible,
    pageSizeVisible,
    usePrinterValidate,
    hasMotherAuth,
    hasLabelAuth,
    isMotherVisible,
    platformType,
  }
}
