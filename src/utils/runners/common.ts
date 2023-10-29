import { FileItem, FileItemExtend } from '@/types/file'
import { IRuntimeReducerAction, IRuntimeState } from '@/context/runtime'
import { MultiFileProcessorCallback, SingleFileProcessorCallback, TaskRunner, TaskRunnerConfig, TaskRunnerSysArg, TaskRunnerType } from '@/types/task'
import { cloneDeep } from 'lodash'
import { filterTaskRunners } from './filter'
import { renameTaskRunners } from './rename'
import { toolsetTaskRunners } from './toolset'
import { useEffect } from 'react'
import { uuid } from '../common'

const devOptions = [{
  label: {
    'zh-CN': '选项 1',
    'en-US': 'Option 1',
  },
  value: 'full',
}, {
  label: {
    'zh-CN': '选项 2',
    'en-US': 'Option 2',
  },
  value: 'file',
}, {
  label: {
    'zh-CN': '选项 3',
    'en-US': 'Option 3',
  },
  value: 'ext',
}]

const sysTaskRunners: Record<string, TaskRunner> = {
  'default': {
    id: 'default',
    name: {
      'zh-CN': '默认',
      'en-US': 'Default',
    },
    desc: {
      'zh-CN': '默认任务执行器, 不会对文件进行任何操作.',
      'en-US': 'Default task runner, will not do anything to file.',
    },
    type: TaskRunnerType.untouch,
    args: [],
    func: (sys: TaskRunnerSysArg) => {
      return sys.fileItem(async (split, forward) => {
        const { origin, latest, steps } = split()
        forward({
          result: latest,
          message: 'Default task runner.',
          next: true,
        })
      })
    }
  },
  'sys_dev_test': {
    id: 'sys_dev_test',
    name: {
      'zh-CN': '开发测试',
      'en-US': 'Dev Test',
    },
    type: TaskRunnerType.untouch,
    args: [
      {
        id: 'path-folder',
        name: {
          'zh-CN': '测试路径文件夹',
          'en-US': 'Test Path Folder',
        },
        type: 'path-folder',
        readonly: false,
      },
      {
        id: 'string',
        name: {
          'zh-CN': '测试字符串',
          'en-US': 'Test String',
        },
        type: 'string',
        default: 'dev_test_default_value',
        readonly: false,
      },
      {
        id: 'number',
        name: {
          'zh-CN': '测试数字',
          'en-US': 'Test Number',
        },
        type: 'number',
        readonly: false,
      },
      {
        id: 'checkbox',
        name: {
          'zh-CN': '测试多选框',
          'en-US': 'Test Checkbox',
        },
        type: 'checkbox',
        options: devOptions,
        readonly: false,
      },
      {
        id: 'radio',
        name: {
          'zh-CN': '测试单选',
          'en-US': 'Test Radio',
        },
        type: 'radio',
        options: devOptions,
        readonly: false,
      },
      {
        id: 'radio-button',
        name: {
          'zh-CN': '测试单选按钮',
          'en-US': 'Test Radio Button',
        },
        type: 'radio-button',
        options: devOptions,
        readonly: false,
      },
      {
        id: 'segmented',
        name: {
          'zh-CN': '测试分段控制器',
          'en-US': 'Test Segmented',
        },
        type: 'segmented',
        options: devOptions,
        readonly: false,
      },
      {
        id: 'select',
        name: {
          'zh-CN': '测试选择器',
          'en-US': 'Test Select',
        },
        type: 'select',
        options: devOptions,
        readonly: false,
      },
      {
        id: 'switch',
        name: {
          'zh-CN': '测试开关',
          'en-US': 'Test Switch',
        },
        type: 'switch',
        default: true,
        readonly: false,
      }
    ],
    func: (sys: TaskRunnerSysArg, ext: Record<string, any>) => {
      return sys.fileItem(async (split, forward) => {
        const { origin, latest, steps } = split()
        console.log('I: 开发测试:', JSON.stringify(ext))
        forward({
          result: latest,
          message: `开发测试: ${JSON.stringify(ext)}`,
          next: true,
        })
      })
    }
  }
}

const useSystemTaskRunner = (
  state: IRuntimeState,
  dispatch: (_: IRuntimeReducerAction) => void
) => {
  useEffect(() => {
    if (Object.keys(state.runners).length === 0) {
      const allRunners = {
        ...sysTaskRunners,
        ...filterTaskRunners,
        ...renameTaskRunners,
        ...toolsetTaskRunners,
      }
      dispatch({
        type: 'internal',
        payload: { runners: allRunners }
      })
    }
  }, [state.runners])
}

const makeDefaultTask = (name: string): TaskRunnerConfig => {
  return cloneDeep({
    id: uuid(),
    name,
    args: {},
    runner: 'default'
  })
}

// class ClassWithParamInitializer {
//   constructor(public readonly param: number) {}
// }

const makeTaskRunnerSysArg = (
  source: FileItemExtend[],
  runner: TaskRunner
): TaskRunnerSysArg => {
  const split = (fileItem: FileItemExtend) => {
    const { steps, ...origin } = fileItem
    if (steps.length > 0) {
      const latest = steps[steps.length - 1].result
      return { origin, latest, steps }
    } else {
      return { origin, latest: cloneDeep(origin), steps }
    }
  }

  const forward = (
    fileItem: FileItemExtend,
    info: {
      result: FileItem,
      message: string,
      to?: string,
      next: boolean
    }
  ) => {
    const newStep = {
      runner: runner.id,
      action: runner.type,
      result: info.result,
      message: info.message,
      to: info.to,
      next: info.next,
    }
    fileItem.steps.push(newStep)
    return fileItem
  }

  const fileItemProcess = async (
    callback: SingleFileProcessorCallback
  ) => {
    const result: FileItemExtend[] = []
    for (const fileItem of source) {
      // only run callback when fileItem is origin or last step is allow next process.
      if (fileItem.steps.length === 0 || fileItem.steps[fileItem.steps.length - 1].next === true) {
        await callback(split.bind(null, fileItem), forward.bind(null, fileItem))
      }
      result.push(fileItem)
    }
    return result
  }

  const fileListProcess = async (
    callback: MultiFileProcessorCallback
  ) => {
    const list = {
      source: source,
      latest: source.filter(i => i.steps.length === 0 || i.steps[i.steps.length - 1].next === true),
    }
    await callback(list, split, forward)
    return source.slice()
  }

  return {
    fileItem: fileItemProcess,
    fileList: fileListProcess,
    utils: {
      split,
      forward
    }
  }
}

export {
  useSystemTaskRunner,
  makeDefaultTask,
  makeTaskRunnerSysArg,
}