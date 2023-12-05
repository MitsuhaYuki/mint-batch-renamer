import { TaskRunner, TaskRunnerSysArg, TaskRunnerType } from '@/types/task'

const sortorTaskRunners: Record<string, TaskRunner> = {
  /* 模式匹配（正则、剪切等）字符串并依据匹配结果排序 */
  's_patt': {
    id: 's_patt',
    name: {
      'zh-CN': '包含字符串',
      'en-US': 'Contains String',
    },
    desc: {
      'zh-CN': '过滤文件名包含指定字符串的文件.',
      'en-US': 'Filter files which file name contains specified string.',
    },
    type: TaskRunnerType.sortor,
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
}

export {
  sortorTaskRunners
}