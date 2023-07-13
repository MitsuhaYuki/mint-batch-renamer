const defaultExtStatus = {
  created: false,
  deleted: false,
  disabled: true,
  error: false,
  modified: false,
}

const defaultExtFilter = JSON.stringify({
  'ext_contains': {
    label: '包含关键词',
    id: 'ext_contains',
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
    func: btoa(((sysArgs: any, extra: any) => {
      `
      Heads Up!
      `
      console.log('I: running "contains" filter, sysArgs =', sysArgs, 'extra =', extra)
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
    }).toString()),
    desc: '包含关键词',
    status: defaultExtStatus
  },
  'ext_equals': {
    label: '等于关键词',
    id: 'ext_equals',
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
      name: 'equals_text',
      label: '等于',
      type: 'string',
      default: ''
    }],
    func: btoa(((sysArgs: any, extra: any) => {
      console.log('I: running "equals" filter, sysArgs =', sysArgs, 'extra =', extra)
      const filterRange = extra?.filter_range ?? 'file'
      let res = false
      switch (filterRange) {
        case 'file':
          res = sysArgs.fileName === extra?.equals_text
        case 'ext':
          res = sysArgs.extName === extra?.equals_text
        case 'full':
          res = sysArgs.fullName === extra?.equals_text
        default:
          res = false
      }
      console.log('I: message errerrrer', res)
      return res
    }).toString()),
    desc: '等于关键词',
    status: defaultExtStatus
  }
}, null, 2)

const defaultExtRenamer = JSON.stringify({
  'ext_idx': {
    label: '序号',
    id: 'ext_idx',
    params: [],
    func: btoa(((sysArgs: any, extra: any) => {
      const newName = `${sysArgs.fileItem.rename_name ?? ''}${sysArgs.index.toString()}`
      const newExt = `${sysArgs.fileItem.rename_extension ?? sysArgs.fileItem.extension}`
      const newFullName = `${newName}.${newExt}`
      return {
        ...sysArgs.fileItem,
        rename_full_name: newFullName,
        rename_name: newName,
        rename_extension: newExt,
      }
    }).toString()),
    desc: '序号',
    status: defaultExtStatus
  },
  'ext_origin_name': {
    label: '原始文件名',
    id: 'ext_origin_name',
    params: [],
    func: btoa(((sysArgs: any, extra: any) => {
      const newName = `${sysArgs.fileItem.rename_name ?? ''}${sysArgs.fileItem.name}`
      const newExt = `${sysArgs.fileItem.rename_extension ?? sysArgs.fileItem.extension}`
      const newFullName = `${newName}.${newExt}`
      return {
        ...sysArgs.fileItem,
        rename_full_name: newFullName,
        rename_name: newName,
        rename_extension: newExt,
      }
    }).toString()),
    desc: '原始文件名',
    status: defaultExtStatus
  },
  'ext_static_char': {
    label: '静态文本',
    id: 'ext_static_char',
    params: [{
      name: 'text_content',
      label: '文本内容',
      type: 'string',
      default: ''
    }],
    func: btoa(((sysArgs: any, extra: any) => {
      const newName = `${sysArgs.fileItem.rename_name ?? ''}${extra['text_content']}`
      const newExt = `${sysArgs.fileItem.rename_extension ?? sysArgs.fileItem.extension}`
      const newFullName = `${newName}.${newExt}`
      return {
        ...sysArgs.fileItem,
        rename_full_name: newFullName,
        rename_name: newName,
        rename_extension: newExt,
      }
    }).toString()),
    desc: '静态文本',
    status: defaultExtStatus
  },
  'ext_origin_name_slice': {
    label: '原始文件名(部分)',
    id: 'ext_origin_name_slice',
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
    func: btoa(((sysArgs: any, extra: any) => {
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
    }).toString()),
    desc: '原始文件名(部分)',
    status: defaultExtStatus
  },
  'ext_regex_match': {
    label: '原始文件名(正则匹配)',
    id: 'ext_regex_match',
    params: [{
      name: 'regex',
      label: '正则表达式',
      tips: '仅需输入正则表达式主体，不需要/字符',
      type: 'string',
      default: '.*'
    }],
    func: btoa(((sysArgs: any, extra: any) => {
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
    }).toString()),
    desc: '原始文件名(正则匹配)',
    status: defaultExtStatus
  }
}, null, 2)

export {
  defaultExtFilter,
  defaultExtRenamer
}