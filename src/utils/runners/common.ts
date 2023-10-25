import { FileItem, FileItemExtend } from '@/types/file'
import { IRuntimeReducerAction, IRuntimeState } from '@/context/runtime'
import { TaskResult, TaskRunner, TaskRunnerConfig, TaskRunnerScope, TaskRunnerSysArg, TaskRunnerType, TaskRunnerUtils } from '@/types/task'
import { cloneDeep } from 'lodash'
import { filterTaskRunners } from './filter'
import { useEffect } from 'react'
import { uuid } from '../common'
import { utilTaskRunners } from './util'

const TaskRunnerScopeOptions = [{
  label: '单个文件',
  value: TaskRunnerScope.fileItem
}, {
  label: '所有文件',
  value: TaskRunnerScope.fileList
}]

const defaultTaskRunners: Record<string, TaskRunner> = {
  'default': {
    id: 'default',
    name: {
      'zh-CN': '默认',
      'en-US': 'Default',
    },
    type: TaskRunnerType.untouch,
    scope: TaskRunnerScope.fileItem,
    args: [],
    func: (sys: TaskRunnerSysArg<FileItemExtend>) => {
      const { originFile, latestFile, steps } = sys.utils.split()
      return sys.utils.forward({
        result: latestFile,
        message: 'Passthrough default runner',
        next: true,
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
        ...defaultTaskRunners,
        ...utilTaskRunners,
        ...filterTaskRunners
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

const makeTaskRunnerUtils = (fileItem: FileItemExtend, runner: TaskRunner): TaskRunnerUtils => {
  const split = () => {
    const { steps, ...originFile } = fileItem
    if (steps.length > 0) {
      const latestFile = steps[steps.length - 1].result
      return { originFile, latestFile, steps }
    } else {
      return { originFile, latestFile: cloneDeep(originFile), steps }
    }
  }
  const forward = (
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
  return {
    split,
    forward
  }
}

export {
  TaskRunnerScopeOptions,
  useSystemTaskRunner,
  makeDefaultTask,
  makeTaskRunnerUtils,
}