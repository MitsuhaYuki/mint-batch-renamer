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
  }
}

export {
  toolsetTaskRunners
}