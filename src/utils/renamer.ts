import { IRenamerConfig, IRenamers } from '@/types/renamer'

export const sysRenamerList: IRenamers = {
  'idx': {
    label: '序号',
    id: 'idx',
    params: [],
    func: (sysArgs, extra: any) => {
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
    func: (sysArgs, extra: any) => {
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
      name: 'text_content',
      label: '文本内容',
      type: 'string',
      default: ''
    }],
    func: (sysArgs, extra: any) => {
      const newName = `${sysArgs.fileItem.rename_name ?? ''}${extra['text_content']}`
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
  'origin_name_slice': {
    label: '原始文件名(部分)',
    id: 'origin_name_slice',
    params: [{
      name: 'slice_start',
      label: '开始截取于',
      type: 'number',
      default: 0
    }, {
      name: 'slice_end',
      label: '结束截取于',
      type: 'number',
      default: 0
    }],
    func: (sysArgs, extra: any) => {
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
    id: 'origin_name_slice',
    params: [{
      name: 'regex',
      label: '正则表达式',
      tips: '仅需输入正则表达式主体，不需要/字符',
      type: 'string',
      default: '.*'
    }],
    func: (sysArgs, extra: any) => {
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

export const getDefaultRenamer = (id: string): IRenamerConfig => ({
  label: sysRenamerList['idx'].label,
  id,
  renamerLabel: sysRenamerList['idx'].label,
  renamerId: 'idx',
})