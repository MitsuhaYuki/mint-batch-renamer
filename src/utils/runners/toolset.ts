import { TaskRunner, TaskRunnerSysArg, TaskRunnerType } from '@/types/task'

const toolsetTaskRunners: Record<string, TaskRunner> = {
  't_output': {
    id: 't_output',
    name: {
      'zh-CN': '输出文件',
      'en-US': 'Output File',
    },
    desc: {
      'zh-CN': '将当前步骤的所有可用文件输出到指定路径.',
      'en-US': 'Output all available files of current step to specified path.',
    },
    type: TaskRunnerType.toolset,
    args: [{
      id: 'output_path',
      name: {
        'zh-CN': '输出路径',
        'en-US': 'Output Path',
      },
      desc: {
        'zh-CN': '文件输出的目标路径.',
        'en-US': 'Target path of output.',
      },
      type: 'path-folder',
      readonly: false,
      default: 'none'
    }],
    func: (sys: TaskRunnerSysArg, ext: Record<string, any>) => {
      return sys.fileItem(async (split, forward) => {
        const { origin, latest, steps } = split()
        const { output_path } = ext
        forward({
          result: latest,
          message: `Output to ${output_path}`,
          to: ext.output_path,
          next: false,
        })
      })
    }
  },
  't_activate': {
    id: 't_activate',
    name: {
      'zh-CN': '激活文件',
      'en-US': 'Activate Files',
    },
    desc: {
      'zh-CN': '批量激活流程失败的文件, 使其可以重新被后续序列处理',
      'en-US': '',
    },
    type: TaskRunnerType.toolset,
    args: [{
      id: 'range',
      name: {
        'zh-CN': '文件范围',
        'en-US': '',
      },
      desc: {
        'zh-CN': '要激活处理的文件范围, 默认"仅流程校验失败"会让当前所有无输出结果且流程校验失败的文件激活下一步流转',
        'en-US': '',
      },
      type: 'radio-button',
      options: [{
        label: {
          'zh-CN': '仅流程校验失败',
          'en-US': ' ',
        },
        value: 'failed'
      }, {
        label: {
          'zh-CN': '所有文件',
          'en-US': ' ',
        },
        value: 'all'
      }],
      default: 'failed',
      readonly: false,
    }],
    func: (sys: TaskRunnerSysArg, ext: Record<string, any>) => {
      const { range } = ext
      return sys.fileList(async (list, split, forward) => {
        list.source.forEach((item) => {
          const { origin, latest, steps } = split(item)
          if (steps.length > 0) {
            if (!steps[steps.length - 1].next) {
              if (range === 'failed' && steps[steps.length - 1].to) return
              forward(item, {
                result: latest,
                message: `Activate ${range} file: ${latest.name}`,
                to: steps[steps.length - 1].to,
                next: true,
              })
            }
          }
        })
      })
    }
  }
}

export {
  toolsetTaskRunners
}