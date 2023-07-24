import { EFilterScope, IExtFilterInstance, IFilterInstance } from '@/types/filter'
import { IScriptConfig } from '@/types/script'
import { cloneDeep } from 'lodash'

/**
 * 过滤器作用域选项列表
 */
export const filterScopeOptions = [{
  label: '单个文件',
  value: EFilterScope.fileName
}, {
  label: '所有文件',
  value: EFilterScope.fileList
}]

/** 默认过滤器列表 */
export const sysFilterList: Record<string, IFilterInstance> = {
  'contains': {
    label: '包含关键词',
    id: 'contains',
    scope: EFilterScope.fileName,
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
      default: 'file',
      readonly: false,
    }, {
      name: 'contains_text',
      label: '包含',
      type: 'string',
      default: '',
      readonly: false,
    }],
    func: (sysArgs, extra: any) => {
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
    }
  },
  'equals': {
    label: '等于关键词',
    id: 'equals',
    scope: EFilterScope.fileName,
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
      default: 'file',
      readonly: false,
    }, {
      name: 'equals_text',
      label: '等于',
      type: 'string',
      default: '',
      readonly: false,
    }],
    func: (sysArgs, extra: any) => {
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
    }
  }
}

/** 默认过滤器 */
export const getDefaultFilter = (id: string): IScriptConfig => cloneDeep({
  label: sysFilterList['contains'].label,
  id,
  scriptId: 'contains',
})

export const getFilters = (sysFilters: Record<string, IFilterInstance>, extFilters: Record<string, IExtFilterInstance>): Record<string, IFilterInstance> => {
  const enabledExtFilters = Object.keys(extFilters).reduce((prev, i) => {
    if (!extFilters[i].status.disabled) {
      prev[i] = extFilters[i]
    }
    return prev
  }, {} as Record<string, IFilterInstance>)
  return Object.assign({}, sysFilters, enabledExtFilters)
}