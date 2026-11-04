// 封装 Hook 函数
import { ref, onBeforeUnmount } from 'vue'
import { initConfig, submitFile } from '@order-public-sub-public/apis/pickup/index'
import { initConfigParams, initConfigResponse } from '@order-public-sub-public/apis/pickup/type'
import { MaterialSource, MaterialTypes } from '@order-public-sub-public/constants'
import { taskQueueWrapper } from '@public/utils/TaskQueueManager'
import { LocationQueryValue } from '@order-public-sub-public/vue-router/index'
import { openWebUpload } from '@/public/native'
import { Any } from '@/public/utils/types'

// 文件初始化接口
// 根据currentBizId获取bizId、bizCode，用于后面文件操作
export function useInitFielConfig() {
  const configData = ref<initConfigResponse>({
    bizId: '',
    materialInitList: [],
  })

  // 执行请求的核心方法
  const getConfig = async (params: initConfigParams) => {
    params = {
      ...params,
      materialSource: params.materialSource || MaterialSource.下单,
    }
    try {
      const { data } = await initConfig(params)
      configData.value = data
      configData.value.materialInitList = data.materialInitList || []
    } catch (err) {
      console.error(err)
      configData.value = { bizId: '', materialInitList: [] }
    }
  }

  const submit = async () => {
    try {
      return submitFile({
        materialList: [{ bizId: configData?.value?.bizId }],
      })
    } catch (error) {
      console.error(error)
    }
  }

  // 根据type获取bizCode
  const getBizCode = (materialType: MaterialTypes) => {
    return configData.value.materialInitList.filter((i) => i.materialType === materialType)?.[0]?.bizCode || ''
  }

  return { configData, getConfig, getBizCode, submit }
}

const taskQueueInstance = taskQueueWrapper.instance

export function useInitMulitFielConfigChild() {
  const { configData, getConfig, getBizCode, submit } = useInitFielConfig()
  const startConfig = async (
    bizId?: string,
    materialSource?: MaterialSource,
    clear?: boolean,
    materialTypes?: MaterialTypes[],
  ) => {
    try {
      if (clear) {
        taskQueueInstance.clearQueue()
      }
      // 队列最后一个数据 { configData, getConfig, getBizCode, submit }
      const { configData: data } = await taskQueueInstance.getLast()
      let _bizId: string
      // 解决往返寄bug#583873 data为对象时返回_bizId为空 导致上传文件失败
      if (data?.value?.bizId) {
        _bizId = data.value.bizId || ''
      } else {
        _bizId = bizId || ''
      }
      // 包裹一层获取config的task
      const task = async () => {
        await getConfig({ currentBizId: _bizId, materialSource, materialTypes })
        // 存储 hook的数据，用于后面submit
        return { configData, getBizCode, submit }
      }
      taskQueueInstance.add(task)
    } catch (error) {
      console.error(error)
    }
  }
  // 外部提交方法，实际参数获取 和 ajax 在hook里。hook数据存于task实例中
  const submitConfig = async (fromPage?: LocationQueryValue) => {
    try {
      const { submit } = await taskQueueInstance.getLast()
      if (!submit) return
      await submit(fromPage)
    } catch (error) {
      console.error(error)
    }
  }

  const removeLast = async () => {
    try {
      taskQueueInstance.removeLast()
    } catch (error) {
      console.error(error)
    }
  }

  const getData = async () => {
    const defaultData = {
      configData: {},
      getBizCode: () => console.log('没有获取到文件初始化数据'),
    }
    try {
      const lastData = await taskQueueInstance.getLast()
      return lastData?.configData ? lastData : defaultData
    } catch (error) {
      console.error(error)
      return defaultData
    }
  }

  // taskQueueManager task实例
  // startConfig： 进入1 2 3级页面的初始化 1级传运单号
  // submitConfig： 点击确认按钮的提交参数
  // removeLast： 弹框消失时候id出栈操作
  return { taskQueueInstance, getData, startConfig, submitConfig, removeLast }
}

/**
 * 上传文件原生pc小程序端要有2种方式进行上传 - 从聊天列表或者从文件系统中上传
 */
export function UploadFromChatOrSystem(componentName: string) {
  let clearWebUpload
  const pcUpload = (inputOptions: Any, bizOptions: Any, limit: number, maxLength: number, source: 'pc' | 'mobile') => {
    return new Promise((resolve, reject) => {
      clearWebUpload = openWebUpload({
        componentName,
        inputOptions,
        bizOptions,
        limit,
        maxLength,
        source,
        callback: ({ type, data }) => {
          if (type === 'from-chat') {
            resolve({ type, data })
          } else {
            if (!data || data.length === 0) {
              reject('')
            }
            resolve({ type, data })
          }
        },
      })
    })
  }
  onBeforeUnmount(() => {
    clearWebUpload && clearWebUpload()
  })

  return {
    pcUpload,
  }
}
