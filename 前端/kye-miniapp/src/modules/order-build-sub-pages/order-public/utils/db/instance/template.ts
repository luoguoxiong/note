import DBFactory from '@order-public-sub-public/utils/db/dbFactory'

import { DBDATABASE } from '@order-public-sub-public/utils/db/constant'
import { LOCAL } from '@order-public-sub-public/constants'

const TableDataStoreName = LOCAL.TEMPLATE_ID_FROM_DEFAULT_CONFIG

interface TemplateData {
  TEMPLATE_ID_FROM_DEFAULT_CONFIG: {
    id: number
  }
}

const TemplateDataDB = (() => {
  const normalTemplateDataDB = {
    getItem: (v: string | any) => {
      console.log(v)
      return null
    },
    setItem: (v: string | any) => console.log(v),
    removeItem: (v: string | any) => console.log(v),
  }
  if (window.indexedDB) {
    try {
      return new DBFactory<TemplateData>(DBDATABASE, TableDataStoreName)
    } catch (e) {
      return normalTemplateDataDB
    }
  }
  return normalTemplateDataDB
})()

export { TemplateDataDB }
