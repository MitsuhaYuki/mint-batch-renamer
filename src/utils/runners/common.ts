import { FileItem, FileItemExtend } from '@/types/file'
import { IRuntimeReducerAction, IRuntimeState } from '@/context/runtime'
import { MultiFileProcessorCallback, SingleFileProcessorCallback, TaskRunner, TaskRunnerConfig, TaskRunnerSysArg, TaskRunnerType } from '@/types/task'
import { cloneDeep } from 'lodash'
import { filterTaskRunners } from './filter'
import { renameTaskRunners } from './rename'
import { toolsetTaskRunners } from './toolset'
import { useEffect } from 'react'
import { uuid } from '../common'

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