import { STATUS } from '@order-public-sub-public/constants'
import { deleteFile, fileUpload, httpFileAngle } from '@order-public-sub-public/apis'
// import { showKyDialog } from '@order-public-sub-public/validate/effect/effectDialog'

import { showToast } from '@order-global-package-order-sub/hooks/useShowToast'
import { fileType } from '@order-public-sub-public/apis/pickup/type'
import { UploadFile } from '@order-public-sub-public/components/business/added-service/types'
import { uuid } from '@order-public-sub-public/utils/index'

interface queryType {
  bizId: string
  bizCode: string
  orderNo: string
}

const IMAGE_TYPE = ['jpg', 'png', 'jpeg', 'image']

// eslint-disable-next-line max-lines-per-function
const useUpload = () => {
  //选择文件后
  const uploadAngle = async (list: UploadFile[]) => {
    try {
      const promiseAll: any[] = []
      for (let i = 0; i < list.length; i++) {
        const v = list[i]
        if (v.type === 'file' && !IMAGE_TYPE.includes(v.suffix)) return
        v.request_id = uuid()
        const params = {
          // file: binary,
          biz_id: 'kye5000554561',
          request_id: uuid(),
          from_type: 'ic',
          fileName: v.name,
          path: v.path,
          originalName: v.name,
          name: v.name,
        }
        console.log('fileList05', params)
        promiseAll.push(
          ((v) => {
            try {
              httpFileAngle(params).then((res) => {
                console.log('fileList055', res)
                if (res.code === 0 && res.data) {
                  v.angle_reg_type = res.data.angle_reg_type
                }
              })
            } catch (error) {
              console.log('eeeeeee', error)
            }
          })(v),
        )
      }
      return Promise.all(promiseAll)
    } catch (error) {
      console.error('fileList02error', error)
    }
  }
  //上传文件
  const upload = async (query: queryType, list: fileType[]) => {
    try {
      const promiseAll: any[] = []
      const { bizId, bizCode, orderNo } = query
      if (bizId && bizCode && orderNo) {
        list.forEach((v) => {
          if (![STATUS.WAIT, STATUS.FAIL].includes(Number(v.status))) return
          v.status = STATUS.UPLOADING
          const params = {
            bizCode, //
            bizId, //运单号
            type: v.type,
            file: v.file,
            base64: v.base64,
            fileName: v.file?.name,
            fileType: v.file?.type,
            preview: false, // 取货资料新增标识
          }
          promiseAll.push(
            (async (v) => {
              try {
                const { data } = (await fileUpload(params)) as any
                const returnItem = (data.data || []).find((v: any) => v.lastOperate === 1) || {}
                const firstUrl = returnItem?.url
                const id = returnItem?.id
                if (firstUrl) {
                  v.status = STATUS.SUCCESS
                  v.url = firstUrl
                  v.id = id
                }
              } catch (error) {
                showToast('文件上传失败，请检查后继续')
                v.status = STATUS.FAIL
                return Promise.reject(error)
              }
            })(v),
          )
        })
      } else {
        showToast('缺少参数')
        return Promise.reject(query)
      }
      return Promise.all(promiseAll)
    } catch (error) {
      console.log('error', error)
    }
  }
  //删除本地文件
  const deleteFileFun = async (file: fileType, list: fileType[]) => {
    const { id, url } = file
    const index = list.findIndex((i) => i.id === file.id)
    if (index === -1 || !id) {
      return
    }
    try {
      if (url && url?.indexOf('http') !== -1) {
        file.status = STATUS.DELETING
      }
      list.splice(index, 1)
    } catch (e) {
      console.error(e)
    }
  }
  //删除文件中心文件
  const deleteFileFunAsync = async (list: fileType[]) => {
    try {
      const idList = list.map((v) => {
        return v.id
      })
      if (idList.length) {
        await deleteFile({
          idList,
        })
      }
    } catch (e) {
      console.error(e)
    }
  }
  return {
    upload,
    uploadAngle,
    deleteFileFun,
    deleteFileFunAsync,
  }
}
export default useUpload
