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
      id: 'str',
      name: {
        'zh-CN': '包含',
        'en-US': 'Contains',
      },
      desc: {
        'zh-CN': '包含指定字符串, 可以使用","分隔字符串进行多个字符串匹配, 例如: "png,jpg"',
        'en-US': 'Contains specified string, can use "," to split string for multiple string match, e.g. "png,jpg"',
      },
      type: 'string',
      readonly: false,
    }],
    func: (sys: TaskRunnerSysArg, ext: Record<string, any>) => {
      return sys.fileItem(async (split, forward) => {
        const { origin, latest, steps } = split()
        const { range, str } = ext
        const sourceText = range === 'all' ? latest.name : range === 'name' ? latest.fileName : latest.fileExt
        const matchText = (str as string).split(',').map(i => i.trim()).filter(i => i)
        forward({
          result: latest,
          message: `Filter by '${range}' contains '${str}'`,
          next: matchText.some(i => sourceText.includes(i)),
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
      id: 'str',
      name: {
        'zh-CN': '等于',
        'en-US': 'Equals',
      },
      desc: {
        'zh-CN': '等于指定字符串, 可以使用","分隔字符串进行多个字符串匹配, 例如: "png,jpg"',
        'en-US': 'Equals specified string, can use "," to split string for multiple string match, e.g. "png,jpg"',
      },
      type: 'string',
      readonly: false,
    }],
    func: (sys: TaskRunnerSysArg, ext: Record<string, any>) => {
      return sys.fileItem(async (split, forward) => {
        const { origin, latest, steps } = split()
        const { range, str } = ext
        const sourceText = range === 'all' ? latest.name : range === 'name' ? latest.fileName : latest.fileExt
        const matchText = (str as string).split(',').map(i => i.trim()).filter(i => i)
        forward({
          result: latest,
          message: `Filter by '${range}' equals '${str}'`,
          next: matchText.some(i => sourceText === i),
        })
      })
    }
  },
  /* 模式匹配（正则、剪切等）字符串并依据匹配结果排序 */
}

export {
  filterTaskRunners
}