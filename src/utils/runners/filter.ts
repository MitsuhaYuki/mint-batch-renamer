import { FileItemExtend } from '@/types/file'
import { TaskRunner, TaskRunnerScope, TaskRunnerSysArg, TaskRunnerType } from '@/types/task'

const filterTaskRunners: Record<string, TaskRunner> = {
  'contains_single': {
    id: 'contains_single',
    name: {
      'zh-CN': '包含字符串',
      'en-US': 'Contains String',
    },
    type: TaskRunnerType.filter,
    scope: TaskRunnerScope.fileItem,
    args: [{
      id: 'str',
      name: {
        'zh-CN': '包含',
        'en-US': 'Contains',
      },
      type: 'string',
      readonly: false,
    }],
    func: (sys: TaskRunnerSysArg<FileItemExtend>, ext: Record<string, any>) => {
      const { originFile, latestFile, steps } = sys.utils.split()
      const { str } = ext
      const result = sys.utils.forward({
        result: latestFile,
        message: `包含字符串: ${str}`,
        next: latestFile.name.includes(str),
      })
      return result
    }
  },
  'dev_test': {
    id: 'dev_test',
    name: {
      'zh-CN': '开发测试',
      'en-US': 'Dev Test',
    },
    type: TaskRunnerType.untouch,
    scope: TaskRunnerScope.fileItem,
    args: [{
      id: 'test_string',
      name: {
        'zh-CN': '测试字符串',
        'en-US': 'Test String',
      },
      type: 'string',
      default: 'test_string_default_value',
      readonly: false,
    }, {
      id: 'test_number',
      name: {
        'zh-CN': '测试数字',
        'en-US': 'Test Number',
      },
      type: 'number',
      default: 1,
      readonly: false,
    }],
    func: (sys: TaskRunnerSysArg<FileItemExtend>, ext: Record<string, any>) => {
      const { originFile, latestFile, steps } = sys.utils.split()
      console.log('I: running "dev_test", sys =', sys, 'ext =', ext)
      return sys.utils.forward({
        result: latestFile,
        message: `开发测试: ${JSON.stringify(ext)}`,
        next: true,
      })
    }
  }
}

export {
  filterTaskRunners
}