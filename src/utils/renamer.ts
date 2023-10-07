import { IExtRenamerInstance, IRenamerInstance } from '@/types/renamer'
import { IScriptConfig } from '@/types/script'

export const sysRenamerList: Record<string, IRenamerInstance> = {
  'serial': {
    label: '序号',
    id: 'serial',
    params: [{
      name: 'apply_to',
      label: '作用于',
      tips: '将结果作用于文件名或拓展名',
      type: 'select',
      range: [{
        label: '文件名',
        value: 'file',
      }, {
        label: '拓展名',
        value: 'ext',
      }],
      default: 'file',
      readonly: false,
    }, {
      name: 'start_at',
      label: '起始于',
      tips: '序号开始值',
      type: 'number',
      default: 1,
      readonly: false,
    }, {
      name: 'fill_blank',
      label: '填充位',
      tips: '默认填充位数, 如设置为2则当序号为1时输出01',
      type: 'number',
      default: 0,
      readonly: false,
    }],
    func: async (sysArgs, extra: any) => {
      let curIdx = sysArgs.index + extra['start_at']

      if (extra.fill_blank) {
        if (`${curIdx}`.length < extra.fill_blank) {
          const fill = extra.fill_blank - `${curIdx}`.length
          let fillStr = ''
          for (let i = 0; i < fill; i++) {
            fillStr += '0'
          }
          curIdx = `${fillStr}${curIdx}`
        }
      }

      let newName = `${sysArgs.fileItem.rename_name ?? sysArgs.fileItem.name}`
      let newExt = `${sysArgs.fileItem.rename_extension ?? sysArgs.fileItem.extension}`
      if (extra['apply_to'] === 'file') {
        newName = `${newName}${curIdx}`
      } else {
        newExt = `${newExt}${curIdx}`
      }
      const newFullName = `${newName}.${newExt}`
      return {
        ...sysArgs.fileItem,
        rename_full_name: newFullName,
        rename_name: newName,
        rename_extension: newExt,
      }
    }
  },
  'static': {
    label: '静态文本',
    id: 'static',
    params: [{
      name: 'apply_to',
      label: '作用于',
      tips: '将结果作用于文件名或拓展名',
      type: 'select',
      range: [{
        label: '文件名',
        value: 'file',
      }, {
        label: '拓展名',
        value: 'ext',
      }],
      default: 'file',
      readonly: false,
    }, {
      name: 'text_content',
      label: '文本内容',
      type: 'string',
      default: '',
      readonly: false,
    }],
    func: async (sysArgs, extra: any) => {
      let newName = `${sysArgs.fileItem.rename_name ?? sysArgs.fileItem.name}`
      let newExt = `${sysArgs.fileItem.rename_extension ?? sysArgs.fileItem.extension}`
      if (extra['apply_to'] === 'file') {
        newName = `${newName}${extra['text_content']}`
      } else {
        newExt = `${newExt}${extra['text_content']}`
      }
      const newFullName = `${newName}.${newExt}`
      return {
        ...sysArgs.fileItem,
        rename_full_name: newFullName,
        rename_name: newName,
        rename_extension: newExt,
      }
    }
  },
  'replace': {
    label: '替换',
    id: 'replace',
    params: [{
      name: 'apply_to',
      label: '作用于',
      tips: '将结果作用于文件名或拓展名',
      type: 'select',
      range: [{
        label: '文件名',
        value: 'file',
      }, {
        label: '拓展名',
        value: 'ext',
      }],
      default: 'file',
      readonly: false,
    }, {
      name: 'apply_from',
      label: '使用',
      type: 'select',
      range: [{
        label: '原始文件名',
        value: 'raw_name',
      }, {
        label: '当前文件名',
        value: 'cur_name',
      }, {
        label: '原始拓展名',
        value: 'raw_ext',
      }, {
        label: '当前拓展名',
        value: 'cur_ext',
      }],
      default: 'cur_name',
      readonly: false,
    }, {
      name: 'method',
      label: '替换方式',
      type: 'select',
      range: [{
        label: '文本',
        value: 'text',
      }, {
        label: '正则表达式(默认)',
        value: 'regex',
      }, {
        label: '正则表达式(全局)',
        value: 'regex_g',
      }],
      default: 'text',
      readonly: false,
    }, {
      name: 'use',
      label: '作用方式',
      type: 'select',
      range: [{
        label: '追加',
        value: 'append',
      }, {
        label: '替换',
        value: 'replace',
      }],
      default: 'append',
      readonly: false,
    }, {
      name: 'source',
      label: '源',
      type: 'string',
      readonly: false,
    }, {
      name: 'replace_to',
      label: '替换为',
      type: 'string',
      readonly: false,
    }],
    func: async (sysArgs, extra: any) => {
      let textStore = ''
      switch (extra['apply_from']) {
        case 'raw_name':
          textStore = sysArgs.fileItem.name
          break
        case 'cur_name':
          textStore = sysArgs.fileItem.rename_name ?? ''
          break
        case 'raw_ext':
          textStore = sysArgs.fileItem.extension
          break
        case 'cur_ext':
          textStore = sysArgs.fileItem.rename_extension ?? ''
          break
        default:
          break
      }
      switch (extra['method']) {
        case 'text': {
          textStore = textStore.replace(extra['source'], extra['replace_to'])
          break
        }
        case 'regex': {
          const regex = new RegExp(extra['source'] ?? '.*')
          textStore = textStore.replace(regex, extra['replace_to'])
          break
        }
        case 'regex_g': {
          const regex = new RegExp(extra['source'] ?? '.*', 'g')
          textStore = textStore.replace(regex, extra['replace_to'])
          break
        }
        default:
          break
      }
      let newName = `${sysArgs.fileItem.rename_name ?? sysArgs.fileItem.name}`
      let newExt = `${sysArgs.fileItem.rename_extension ?? sysArgs.fileItem.extension}`
      if (extra['apply_to'] === 'file') {
        newName = extra['use'] === 'append' ? `${newName}${textStore}` : textStore
      } else {
        newExt = extra['use'] === 'append' ? `${newExt}${textStore}` : textStore
      }
      const newFullName = `${newName}.${newExt}`
      return {
        ...sysArgs.fileItem,
        rename_full_name: newFullName,
        rename_name: newName,
        rename_extension: newExt,
      }
    }
  },
  'slice': {
    label: '切片',
    id: 'slice',
    params: [{
      name: 'apply_to',
      label: '作用于',
      tips: '将结果作用于文件名或拓展名',
      type: 'select',
      range: [{
        label: '文件名',
        value: 'file',
      }, {
        label: '拓展名',
        value: 'ext',
      }],
      default: 'file',
      readonly: false,
    }, {
      name: 'use',
      label: '作用方式',
      type: 'select',
      range: [{
        label: '追加',
        value: 'append',
      }, {
        label: '替换',
        value: 'replace',
      }],
      default: 'append',
      readonly: false,
    }, {
      name: 'slice_start',
      label: '开始截取于',
      type: 'number',
      default: 0,
      readonly: false,
    }, {
      name: 'slice_end',
      label: '结束截取于',
      type: 'number',
      default: 0,
      readonly: false,
    }],
    func: async (sysArgs, extra: any) => {
      let textStore = ''
      const startIndex = extra['slice_start'] ?? 0
      const endIndex = extra['slice_end'] ?? 0
      textStore = (sysArgs.fileItem.rename_full_name ?? sysArgs.fileItem.full_name).slice(startIndex, endIndex)
      let newName = `${sysArgs.fileItem.rename_name ?? sysArgs.fileItem.name}`
      let newExt = `${sysArgs.fileItem.rename_extension ?? sysArgs.fileItem.extension}`
      if (extra['apply_to'] === 'file') {
        newName = extra['use'] === 'append' ? `${newName}${textStore}` : textStore
      } else {
        newExt = extra['use'] === 'append' ? `${newExt}${textStore}` : textStore
      }
      const newFullName = `${newName}.${newExt}`
      return {
        ...sysArgs.fileItem,
        rename_full_name: newFullName,
        rename_name: newName,
        rename_extension: newExt,
      }
    }
  },
  'empty': {
    label: '清空',
    id: 'empty',
    params: [{
      name: 'apply_to',
      label: '作用于',
      tips: '将结果作用于文件名或拓展名',
      type: 'select',
      range: [{
        label: '文件名',
        value: 'file',
      }, {
        label: '拓展名',
        value: 'ext',
      }],
      default: 'file',
      readonly: false,
    }],
    func: async (sysArgs, extra: any) => {
      let newName = `${sysArgs.fileItem.rename_name ?? sysArgs.fileItem.name}`
      let newExt = `${sysArgs.fileItem.rename_extension ?? sysArgs.fileItem.extension}`
      if (extra['apply_to'] === 'file') {
        newName = ''
      } else {
        newExt = ''
      }
      const newFullName = `${newName}.${newExt}`
      return {
        ...sysArgs.fileItem,
        rename_full_name: newFullName,
        rename_name: newName,
        rename_extension: newExt,
      }
    }
  },
}

/**
 * 获取默认重命名脚本配置
 * @param id 当前配置id
 * @returns 默认脚本配置
 */
export const getDefaultRenamer = (id: string): IScriptConfig => ({
  label: sysRenamerList['serial'].label,
  id,
  scriptId: 'serial',
})

/**
 * 获取所有可用重命名脚本
 * @param sysFilters 系统过滤器
 * @param extFilters 外部过滤器
 * @returns 
 */
export const getRenamers = (sysFilters: Record<string, IRenamerInstance>, extFilters: Record<string, IExtRenamerInstance>): Record<string, IRenamerInstance> => {
  const enabledExtFilters = Object.keys(extFilters).reduce((prev, i) => {
    if (!extFilters[i].status.disabled) {
      prev[i] = extFilters[i]
    }
    return prev
  }, {} as Record<string, IRenamerInstance>)
  return Object.assign({}, sysFilters, enabledExtFilters)
}