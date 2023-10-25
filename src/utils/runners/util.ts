import { FileItemExtend } from '@/types/file'
import { TaskRunner, TaskRunnerScope, TaskRunnerSysArg, TaskRunnerType } from '@/types/task'

const utilTaskRunners: Record<string, TaskRunner> = {
  'util_output': {
    id: 'util_output',
    name: {
      'zh-CN': '输出文件',
      'en-US': 'Output File',
    },
    type: TaskRunnerType.output,
    scope: TaskRunnerScope.fileItem,
    args: [{
      id: 'output_path',
      name: {
        'zh-CN': '输出路径',
        'en-US': 'Output Path',
      },
      type: 'folder_selector',
      readonly: false,
    }],
    func: (sys: TaskRunnerSysArg<FileItemExtend>, ext: Record<string, any>) => {
      const { originFile, latestFile, steps } = sys.utils.split()
      const { output_path } = ext
      return sys.utils.forward({
        result: latestFile,
        message: `Output to ${output_path}`,
        to: ext.output_path,
        next: false,
      })
    }
  }
}

export {
  utilTaskRunners
}