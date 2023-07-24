/*
 * Use this file to generate all type of template files in this project
 * In project root folder, run command `node template.js` to generate all templates
 */
import fs from 'fs'

const defaultScriptStatus = {
  created: false,
  deleted: false,
  disabled: true,
  error: false,
  modified: false,
}

/** External filter template */
const tExternalFilter = {
  'demo_contains': {
    label: '包含关键词(Demo)',
    id: 'demo_contains',
    scope: 'fileName',
    params: [{
      name: 'filter_range',
      label: '限定范围',
      tips: '此过滤器只会在限定范围工作',
      type: 'select',
      range: [{
        label: '文件全名',
        value: 'full',
      }, {
        label: '仅限文件名',
        value: 'file',
      }, {
        label: '仅限拓展名',
        value: 'ext',
      }],
      default: 'file'
    }, {
      name: 'contains_text',
      label: '包含',
      type: 'string',
      default: ''
    }],
    func: btoa(encodeURIComponent(((sysArgs, extra) => {
      const DOCUMENT = `
        过滤器接受两个参数, 分别是sysArgs和extra, 其中:
          1. sysArgs:
            内部传入的数据结构, 当过滤器的作用域为“单个文件”时, 该参数的结构为:
              type IFileNameScopeFilterArgs = {
                /** 文件全名 */
                fullName: string
                /** 文件名 */
                fileName: string
                /** 文件扩展名 */
                extName: string
              }
            当过滤器的作用域为“文件列表”时, 该参数的结构为:
              type IFileListScopeFilterArgs = {
                /** 所有文件列表 */
                fileList: {
                  /** 文件全名 */
                  full_name: string
                  /** 文件名 */
                  name: string
                  /** 文件大小 */
                  size: number
                  /** 文件扩展名 */
                  extension: string
                  /** 文件路径 */
                  path: string
                }[]
              }
          2. extra
            外部参数, 类型为Record<string,any>
            在参数列表中定义的参数, 会使用id:value的形式传入extra中, 使用extra.[参数ID]的形式可以访问它
        过滤器的返回值:
          当过滤器的作用域为“单个文件”时, 此函数返回一个boolean值代表是否应该保留此文件
          当过滤器的作用域为“文件列表”时, 此函数返回一个文件列表, 代表应该保留的文件, 注意: 与此同时文件列表的顺序也会被保留, 在此情况下可以用作排序函数使用
        代码示例:
          在当前的过滤器例子中, 作用域为“单个文件”, 参数列表定义了两个参数, 分别是filter_range和contains_text
          以下代码根据filter_range的值决定该过滤文件名的哪些部分, 使用contains_text的值进行匹配
          最终返回一个boolean值告诉程序是否应该保留此文件`
      const filterRange = extra?.filter_range ?? 'file'
      switch (filterRange) {
        case 'file':
          return sysArgs.fileName.includes(extra?.contains_text)
        case 'ext':
          return sysArgs.extName.includes(extra?.contains_text)
        case 'full':
          return sysArgs.fullName.includes(extra?.contains_text)
        default:
          return false
      }
    }).toString())),
    desc: '外部过滤器演示Demo: 如何过滤包含指定关键词的文件',
    status: defaultScriptStatus
  }
}

/** External renamer template */
const tExternalRenamer = {
  'demo_static_char': {
    label: '静态文本(Demo)',
    id: 'demo_static_char',
    scope: 'fileName',
    params: [{
      name: 'filter_range',
      label: '限定范围',
      tips: '此过滤器只会在限定范围工作',
      type: 'select',
      range: [{
        label: '文件全名',
        value: 'full',
      }, {
        label: '仅限文件名',
        value: 'file',
      }, {
        label: '仅限拓展名',
        value: 'ext',
      }],
      default: 'file'
    }, {
      name: 'contains_text',
      label: '包含',
      type: 'string',
      default: ''
    }],
    func: btoa(encodeURIComponent((async (sysArgs, extra) => {
      const DOCUMENT = `
      重命名器接受两个参数, 分别是sysArgs和extra, 其中:
        1. sysArgs:
          内部传入的数据结构, 该参数的结构为:
            type IRenamerArgs = {
              /** 将要重命名的文件 */
              fileItem: IFileItem
              /** 当前重命名操作位于整个操作序列中的index */
              index: number
              /** 总重命名操作数量 */
              total: number
              /** 将要重命名的文件列表 */
              fileList: IFileItem[]
            }
          其中IFileItem的结构为:
            IFileItem {
              /** 文件全名 */
              full_name: string
              /** 文件名 */
              name: string
              /** 文件大小(字节) */
              size: number
              /** 文件拓展名 */
              extension: string
              /** 文件路径 */
              path: string
            }
        2. extra
          外部参数, 类型为Record<string,any>
          在参数列表中定义的参数, 会使用id:value的形式传入extra中, 使用extra.[参数ID]的形式可以访问它
      重命名器的返回值:
        重命名器的返回值恒定为Promise<IFileItemRenamed>, 其中IFileItemRenamed的结构为:
          interface IFileItemRenamed {
            /** 文件全名 */
            full_name: string
            /** 文件名 */
            name: string
            /** 文件大小(字节) */
            size: number
            /** 文件拓展名 */
            extension: string
            /** 文件路径 */
            path: string
            /** 重命名后的文件全名 */
            rename_full_name?: string
            /** 重命名后的文件名 */
            rename_name?: string
            /** 重命名后的文件拓展名 */
            rename_extension?: string
          }
      代码示例:
        在当前的重命名器例子中, 作用域为“单个文件”, 参数列表定义了两个参数, 分别是filter_range和contains_text
        以下代码根据filter_range的值决定该过滤文件名的哪些部分, 使用contains_text的值进行匹配
        最终返回一个boolean值告诉程序是否应该保留此文件`
      let curName = `${sysArgs.fileItem.rename_name ?? sysArgs.fileItem.name}`
      let curExt = `${sysArgs.fileItem.rename_extension ?? sysArgs.fileItem.extension}`

      const filterRange = extra?.filter_range ?? 'file'
      switch (filterRange) {
        case 'file':
          curName = extra['text_content']
        case 'ext':
          curExt = extra['text_content']
      }

      const curFullName = `${curName}.${curExt}`
      return {
        ...sysArgs.fileItem,
        rename_full_name: curFullName,
        rename_name: curName,
        rename_extension: curExt,
      }
    }).toString())),
    desc: '外部过滤器演示Demo: 如何过滤包含指定关键词的文件',
    status: defaultScriptStatus
  }
}

// Register all templates you want to generate
const templates = [{
  name: 'ext_filter',
  data: tExternalFilter
}, {
  name: 'ext_renamer',
  data: tExternalRenamer
}]
// Write all templates to file
templates.forEach((template) => {
  fs.writeFile(`./src/utils/templates/${template.name}.json`, JSON.stringify(template.data, null, 2), (err) => {
    if (err) throw err
    console.log(`Template ${template.name} written to file`)
  })
})
