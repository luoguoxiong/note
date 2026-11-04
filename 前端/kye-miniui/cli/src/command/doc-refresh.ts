import * as path from "path"
import * as fs from "fs"
import inquirer, { QuestionCollection } from "inquirer"
import vueDocgenApi from "vue-docgen-api"
import { closeLoading, showLoading } from "../util/loading-utils"
import { g, r } from "../util/log-utils"

const directoryPath = "../packages"
const directoryComponentPath = "../packages/__components"
const list: string[] = []
// 同步读取目录内容
const files = fs.readdirSync(directoryComponentPath)
// 遍历目录中的每个项
files.forEach((file) => {
  // 获取每个项的完整路径
  const filePath = path.join(directoryComponentPath, file)
  // 同步检查该项的状态
  const stats = fs.statSync(filePath)
  // 如果该项是文件夹，则打印出文件夹名称
  if (stats.isDirectory()) {
    // console.log("Directory:", file)
    list.push(file)
  }
})

// 交互提示
const questions: QuestionCollection = [
  {
    type: "list",
    name: "component",
    message: "Choose the component type: ",
    choices: list,
  },
]

const myCustomScriptHandler = () => {
  console.log('myCustomScriptHandler')
}

const renderDoc = async (componentName: string) => {
  showLoading("RenderDoc, please wait...")
  try {
    const componentPath = path.resolve(directoryComponentPath, componentName, `./src/${componentName}.vue`)
    const mdPath = path.resolve("../docs/components", `${componentName}.md`)
    const mdFileContent = fs.readFileSync(mdPath, "utf8")
    const docgen: any = await vueDocgenApi.parse(componentPath)

    console.log(JSON.stringify(docgen))
    console.log(JSON.stringify(docgen.methods))
    // return
    // 提取 props、events 和 methods
    const props = docgen.props || []
    const methods = docgen.methods || []
    const events = docgen.events || []

    // 构建组件 API 的 Markdown 内容
    let componentApiContent = "## 组件 API\n\n"

    // Props 表格
    componentApiContent += "### Attributes\n"
    componentApiContent += "| 参数 | 说明 | 类型 | 可选值 | 默认值 |\n"
    componentApiContent += "| ---- | ---- | ---- | ---- | ---- |\n"
    props.forEach((prop: any) => {
      componentApiContent += `| ${prop.name} `
      componentApiContent += `| ${prop.description || ''} `
      componentApiContent += `| ${prop.type.name || ''} `
      componentApiContent += `| ${(prop.values?.join(', ')) || ['tuple', 'union'].includes(prop.type.name) ? prop.type.elements.map((v: any) => v.name).join(',') : ''} `
      componentApiContent += `| ${(prop.defaultValue && prop.defaultValue.value) || ''} |\n`
    })

    // Methods 表格
    componentApiContent += "\n### Methods\n"
    componentApiContent += "| 方法名 | 说明 | 参数 | 返回值 |\n"
    componentApiContent += "| ---- | ---- | ---- | ---- |\n"
    methods.forEach((method: any) => {
      componentApiContent += `| ${method.name} | ${method.description || ""} | ${method.params?.map((param: { name: any; type: { name: any } }) => `${param.name}: ${param.type.name || "Any"}`).join(", ")} | ${method.returns ? method.returns.type.name || "Any" : ""} |\n`
    })

    // Events 表格
    componentApiContent += "\n### Events\n"
    componentApiContent += "| 事件名 | 说明 | 参数 |\n"
    componentApiContent += "| ---- | ---- | ---- |\n"
    events.forEach((event: any) => {
      const paramsContent = event.tags?.filter((tag: any) => tag.title === 'param').map((tag: any) => `${tag.type?.name || ''} ${tag.description || ''}`).join(", ")
      componentApiContent += `| ${event.name} `
      componentApiContent += `| ${event.description || ''} `
      componentApiContent += `| ${paramsContent || ''} |\n`
    })

    // Slots 插槽（如果有的话）
    if (docgen.slots) {
      componentApiContent += "\n### Slots\n"
      componentApiContent += "| 插槽名 | 说明 |\n"
      componentApiContent += "| ---- | ---- |\n"
      Object.keys(docgen.slots).forEach((slotName) => {
        componentApiContent += `| ${slotName} | ${docgen.slots[slotName].description || ""} |\n`
      })
    }

    // 替换 Markdown 文件中的组件 API 部分
    const markdownContentToReplace = mdFileContent.match(/## 组件 API([\s\S]*)/)
    if (markdownContentToReplace && markdownContentToReplace[0]) {
      const updatedMdContent = mdFileContent.replace(
        markdownContentToReplace[0],
        componentApiContent,
      )

      console.log(mdFileContent)
      // 写入更新后的 Markdown 文件
      fs.writeFileSync(mdPath, updatedMdContent, "utf-8")

      console.log(
        "Markdown file has been updated with component API information.",
      )
    } else {
      console.error(
        'Could not find the "## 组件 API" section in the Markdown file.',
      )
    }

    closeLoading()
    g(`${componentName}: doc refresh done!`)
  } catch (e: any) {
    closeLoading()
    r(e.message)
  }
}

export const docRefresh = () => {
  inquirer.prompt(questions).then(({ component }) => {
    renderDoc(component)
  })
}
