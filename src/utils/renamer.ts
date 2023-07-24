import { IExtRenamerInstance, IRenamerInstance } from '@/types/renamer'
import { IScriptConfig } from '@/types/script'

export const sysRenamerList: Record<string, IRenamerInstance> = {
  'idx': {
    label: '序号',
    id: 'idx',
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
  'origin_name': {
    label: '原始文件名',
    id: 'origin_name',
    params: [],
    func: async (sysArgs, extra: any) => {
      const newName = `${sysArgs.fileItem.rename_name ?? ''}${sysArgs.fileItem.name}`
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
  'static_char': {
    label: '静态文本',
    id: 'static_char',
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
    }
  },
  'origin_name_slice': {
    label: '原始文件名(部分)',
    id: 'origin_name_slice',
    params: [{
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
  'regex_match': {
    label: '原始文件名(正则匹配)',
    id: 'regex_match',
    params: [{
      name: 'regex',
      label: '正则表达式',
      tips: '仅需输入正则表达式主体，不需要/字符',
      type: 'string',
      default: '.*',
      readonly: false,
    }],
    func: async (sysArgs, extra: any) => {
      const regex = new RegExp(extra['regex'] ?? '.*')
      const newName = `${sysArgs.fileItem.rename_name ?? ''}${sysArgs.fileItem.name.match(regex)?.join('') ?? ''}`
      const newExt = `${sysArgs.fileItem.rename_extension ?? sysArgs.fileItem.extension}`
      const newFullName = `${newName}.${newExt}`
      return {
        ...sysArgs.fileItem,
        rename_full_name: newFullName,
        rename_name: newName,
        rename_extension: newExt,
      }
    }
  }
}

/**
 * 获取默认重命名脚本配置
 * @param id 当前配置id
 * @returns 默认脚本配置
 */
export const getDefaultRenamer = (id: string): IScriptConfig => ({
  label: sysRenamerList['idx'].label,
  id,
  scriptId: 'idx',
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