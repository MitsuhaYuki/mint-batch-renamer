import { IExtRenamerInstance, IRenamerInstance } from '@/types/renamer'
import { IScriptConfig } from '@/types/script'

export const sysRenamerList: Record<string, IRenamerInstance> = {
  'serial': {
    label: '序号',
    id: 'serial',
    params: [],
    func: async (sysArgs, extra: any) => {
      const newName = `${sysArgs.fileItem.rename_name ?? ''}${sysArgs.index.toString()}`
      const newExt = `${sysArgs.fileItem.rename_extension ?? sysArgs.fileItem.extension}`
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
      name: 'filter_range',
      label: '限定范围',
      tips: '此过滤器只会在限定范围工作',
      type: 'select',
      range: [{
        label: '仅限文件名',
        value: 'file',
      }, {
        label: '仅限拓展名',
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
      let curName = `${sysArgs.fileItem.rename_name ?? sysArgs.fileItem.name}`
      let curExt = `${sysArgs.fileItem.rename_extension ?? sysArgs.fileItem.extension}`

      const filterRange = extra?.filter_range ?? 'file'
      switch (filterRange) {
        case 'file':
          curName = extra['text_content']
          break
        case 'ext':
          curExt = extra['text_content']
          break
      }

      const curFullName = `${curName}.${curExt}`
      return {
        ...sysArgs.fileItem,
        rename_full_name: curFullName,
        rename_name: curName,
        rename_extension: curExt,
      }
    }
  },
  'replace': {
    label: '替换',
    id: 'replace',
    params: [{
      name: 'stage',
      label: '使用',
      type: 'select',
      range: [{
        label: '原始文件名(替换指定字符后追加)',
        value: 'origin',
      }, {
        label: '当前文件名(替换指定字符)',
        value: 'cur',
      }],
      default: 'cur',
      readonly: true,
    }, {
      name: 'method',
      label: '替换方式',
      type: 'select',
      range: [{
        label: '文本',
        value: 'text',
      }, {
        label: '正则表达式',
        value: 'regex',
      }],
      default: 'text',
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
      // let fileName = ''
      // if (extra['stage'] === 'origin') {
      //   fileName = sysArgs.fileItem.name.replace(extra['source'], extra['replace_to'])
      // } else {
      //   fileName = sysArgs.fileItem.rename_name?.replace(extra['source'], extra['replace_to']) ?? ''
      // }
      // const newFullName = `${fileName}.${sysArgs.fileItem.extension}`
      // return {
      //   ...sysArgs.fileItem,
      //   rename_full_name: newFullName,
      //   rename_name: fileName,
      //   rename_extension: sysArgs.fileItem.extension,
      // }
      const fileName = extra['stage'] === 'origin' ? sysArgs.fileItem.name : sysArgs.fileItem.rename_name ?? ''
      let newFileName = ''
      switch (extra['method']) {
        case 'text': {
          newFileName = fileName.replace(extra['source'], extra['replace_to'])
          break
        }
        case 'regex': {
          const regex = new RegExp(extra['source'] ?? '.*')
          newFileName = fileName.replace(regex, extra['replace_to'])
          break
        }
        default: {
          break
        }
      }
      return {
        ...sysArgs.fileItem,
        rename_full_name: `${newFileName}.${sysArgs.fileItem.extension}`,
        rename_name: newFileName,
        rename_extension: sysArgs.fileItem.extension,
      }
    }
  },
  'slice': {
    label: '切片',
    id: 'slice',
    params: [{
      name: 'method',
      label: '方式',
      type: 'select',
      range: [{
        label: '范围',
        value: 'origin',
      }, {
        label: '当前文件名',
        value: 'cur',
      }],
      default: 'cur',
      readonly: true,
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
      const startIndex = extra['slice_start'] ?? 0
      const endIndex = extra['slice_end'] ?? 0
      const newName = `${sysArgs.fileItem.rename_name ?? ''}${sysArgs.fileItem.name.slice(startIndex, endIndex)}`
      const newExt = `${sysArgs.fileItem.rename_extension ?? sysArgs.fileItem.extension}`
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