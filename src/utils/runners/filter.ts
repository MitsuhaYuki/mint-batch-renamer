import { TaskRunner, TaskRunnerSysArg, TaskRunnerType } from '@/types/task'

const filterTaskRunners: Record<string, TaskRunner> = {
  'f_contain_str': {
    id: 'f_contain_str',
    name: {
      'zh-CN': '包含字符串',
      'en-US': 'Contains String',
    },
    desc: {
      'zh-CN': '过滤文件名包含指定字符串的文件.',
      'en-US': 'Filter files which file name contains specified string.',
    },
    type: TaskRunnerType.filter,
    args: [{
      id: 'range',
      name: {
        'zh-CN': '过滤范围',
        'en-US': 'Filter Range',
      },
      desc: {
        'zh-CN': '过滤范围, 可选项: 全名, 文件名, 扩展名.',
        'en-US': 'Filter range, options: Full Name, File Name, Extension.',
      },
      type: 'radio-button',
      options: [{
        label: {
          'zh-CN': '全名',
          'en-US': 'Full Name',
        },
        value: 'all',
      }, {
        label: {
          'zh-CN': '文件名',
          'en-US': 'File Name',
        },
        value: 'name',
      }, {
        label: {
          'zh-CN': '扩展名',
          'en-US': 'Extension',
        },
        value: 'ext',
      }],
      default: 'name',
      readonly: false,
    }, {
      id: 'method',
      name: {
        'zh-CN': '方式',
        'en-US': 'Method',
      },
      desc: {
        'zh-CN': '过滤生效方式, 可选择包含或排除指定字符串',
        'en-US': 'Filter effective method, can choose to include or exclude specified string',
      },
      type: 'radio',
      options: [{
        label: {
          'zh-CN': '包含',
          'en-US': 'Contains',
        },
        value: 'include',
      }, {
        label: {
          'zh-CN': '排除',
          'en-US': 'Exclude',
        },
        value: 'exclude',
      }],
      default: 'include',
      readonly: false,
    }, {
      id: 'str',
      name: {
        'zh-CN': '字符串',
        'en-US': 'String',
      },
      desc: {
        'zh-CN': '指定目标字符串, 可以使用","分隔字符串进行多个字符串匹配, 例如: "png,jpg"',
        'en-US': 'Specified target string, can use "," to split string for multiple string match, e.g. "png,jpg"',
      },
      type: 'string',
      readonly: false,
    }],
    func: (sys: TaskRunnerSysArg, ext: Record<string, any>) => {
      return sys.fileItem(async (split, forward) => {
        const { origin, latest, steps } = split()
        const { range, method, str } = ext
        const sourceText = range === 'all' ? latest.name : range === 'name' ? latest.fileName : latest.fileExt
        const matchText = (str as string).split(',').map(i => i.trim()).filter(i => i)
        const match = matchText.some(i => sourceText.includes(i))
        forward({
          result: latest,
          message: `Filter by '${range}' ${method} '${str}'`,
          next: method === 'include' ? match : !match,
        })
      })
    }
  },
  'f_equal_str': {
    id: 'f_equal_str',
    name: {
      'zh-CN': '等于字符串',
      'en-US': 'Equals String',
    },
    desc: {
      'zh-CN': '过滤文件名等于指定字符串的文件.',
      'en-US': 'Filter files which file name equals specified string.',
    },
    type: TaskRunnerType.filter,
    args: [{
      id: 'range',
      name: {
        'zh-CN': '过滤范围',
        'en-US': 'Filter Range',
      },
      desc: {
        'zh-CN': '过滤范围, 可选项: 全名, 文件名, 扩展名.',
        'en-US': 'Filter range, options: Full Name, File Name, Extension.',
      },
      type: 'radio-button',
      options: [{
        label: {
          'zh-CN': '全名',
          'en-US': 'Full Name',
        },
        value: 'all',
      }, {
        label: {
          'zh-CN': '文件名',
          'en-US': 'File Name',
        },
        value: 'name',
      }, {
        label: {
          'zh-CN': '扩展名',
          'en-US': 'Extension',
        },
        value: 'ext',
      }],
      default: 'name',
      readonly: false,
    }, {
      id: 'method',
      name: {
        'zh-CN': '方式',
        'en-US': 'Method',
      },
      desc: {
        'zh-CN': '过滤生效方式, 可选择等于或不等于指定字符串',
        'en-US': 'Filter effective method, can choose to equal or not equal specified string',
      },
      type: 'radio',
      options: [{
        label: {
          'zh-CN': '等于',
          'en-US': 'Equals',
        },
        value: 'equal',
      }, {
        label: {
          'zh-CN': '不等于',
          'en-US': 'Not Equals',
        },
        value: 'unequal',
      }],
      default: 'equal',
      readonly: false,
    }, {
      id: 'str',
      name: {
        'zh-CN': '字符串',
        'en-US': 'String',
      },
      desc: {
        'zh-CN': '指定目标字符串, 可以使用","分隔字符串进行多个字符串匹配, 例如: "png,jpg"',
        'en-US': 'Specified target string, can use "," to split string for multiple string match, e.g. "png,jpg"',
      },
      type: 'string',
      readonly: false,
    }],
    func: (sys: TaskRunnerSysArg, ext: Record<string, any>) => {
      return sys.fileItem(async (split, forward) => {
        const { origin, latest, steps } = split()
        const { range, method, str } = ext
        const sourceText = range === 'all' ? latest.name : range === 'name' ? latest.fileName : latest.fileExt
        const matchText = (str as string).split(',').map(i => i.trim()).filter(i => i)
        const match = matchText.some(i => sourceText === i)
        forward({
          result: latest,
          message: `Filter by '${range}' ${method} '${str}'`,
          next: method === 'equal' ? match : !match,
        })
      })
    }
  },
  /* 模式匹配（正则、剪切等）字符串并依据匹配结果排序 */
}

export {
  filterTaskRunners
}