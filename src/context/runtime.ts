import { FileItemExtend } from '@/types/file'
import { TaskRunner, TaskRunnerConfig } from '@/types/task'
import React, { Reducer, useCallback, useContext } from 'react'

interface IState {
  source: string[]
  config: {
    recursive: boolean,
    outputMethod: 'copy' | 'move'
  }
  sync: {
    refresh: number
    action: number
  }
  fileList: FileItemExtend[]
  tasks: TaskRunnerConfig[]
  runners: Record<string, TaskRunner>
}
interface IOptionalState extends Partial<IState> {}

// State初始值
const initState: IState = {
  source: [],
  config: {
    recursive: true,
    outputMethod: 'copy'
  },
  sync: {
    refresh: 0,
    action: 0
  },
  fileList: [],
  tasks: [],
  runners: {},
}

/**
 * Allowed reducer action list
 * @description internal: for internal use only. reset: reset all state to initial state
 * @description naming: c_ for create, r_ for read, u_ for update, d_ for delete, after the prefix is the state name
 */
type IReducerActionType = 'internal'
  | 'c_source'
  | 'u_source'
  | 'd_source'
  | 'u_config_partial'
  | 'c_tasks'
  | 'u_tasks_one'
  | 'u_tasks_all'
  | 'd_tasks_one'
  | 'd_tasks_all'
  | 'u_file_list'
  | 'sig_refresh'
  | 'sig_action'
  | 'reset'

interface IReducerAction { type: string; payload?: any }

const reducer: Reducer<IState, IReducerAction> = (state, action) => {
  if (action.type !== 'internal') {
    switch (action.type) {
      case 'c_source':
        return Object.assign({}, state, {
          source: [...state.source, action.payload],
          sync: { refresh: state.sync.refresh, action: Date.now() }
        })
      case 'u_source':
        return Object.assign({}, state, {
          source: [...action.payload],
          sync: { refresh: state.sync.refresh, action: Date.now() }
        })
      case 'd_source': {
        return Object.assign({}, state, {
          source: [],
          sync: { refresh: state.sync.refresh, action: Date.now() }
        })
      }
      case 'u_config_partial':
        return Object.assign({}, state, {
          config: {
            ...state.config,
            ...action.payload
          }
        })
      /** TASK */
      case 'c_tasks':
        return Object.assign({}, state, { tasks: [...state.tasks, action.payload] })
      case 'u_tasks_one':
        return Object.assign({}, state, {
          tasks: state.tasks.map(task => {
            if (task.id === action.payload.id) {
              return action.payload
            } else {
              return task
            }
          })
        })
      case 'u_tasks_all':
        return Object.assign({}, state, { tasks: [...action.payload] })
      case 'd_tasks_one':
        return Object.assign({}, state, {
          tasks: state.tasks.filter(task => task.id !== action.payload.id)
        })
      case 'd_tasks_all':
        return Object.assign({}, state, { tasks: [] })
      /** FILE LIST */
      case 'u_file_list':
        return Object.assign({}, state, {
          fileList: [...action.payload],
          sync: { refresh: Date.now(), action: state.sync.action }
        })
      // 信号
      case 'sig_refresh':
        return Object.assign({}, state, {
          sync: { refresh: Date.now(), action: state.sync.action }
        })
      case 'sig_action':
        return Object.assign({}, state, {
          sync: { refresh: state.sync.refresh, action: Date.now() }
        })
      // 重置到初始状态
      case 'reset':
        return Object.assign({}, state, { ...initState })
    }
  } else {
    return Object.assign({}, state, action.payload)
  }
  console.error(`ConfigContext: '${action.type}' is not a valid reducer action!`)
  return state
}

const Context = React.createContext<{
  state: IState
  dispatch: (_: IReducerAction) => void
}>({
  state: initState,
  dispatch: () => ({ error: 'Reducer is not defined' })
})

// wrap current context to provide a simple use method
type ISetter = (type: Exclude<IReducerActionType, 'internal'> | IOptionalState, payload?: any) => void

const useWrappedContext = (): [
  state: IState,
  setState: ISetter
] => {
  const { state, dispatch } = useContext(Context)

  const setState = useCallback((arg1: Exclude<IReducerActionType, 'internal'> | IOptionalState, arg2?: IOptionalState) => {
    if (typeof arg1 === 'string') {
      dispatch({ type: arg1, payload: arg2 })
    } else {
      if (arg2) {
        console.error('ConfigContext: arg2 is not allowed when arg1 is not a valid reducer action type')
      } else {
        dispatch({ type: 'internal', payload: arg1 })
      }
    }
  }, [dispatch])

  return [
    state,
    setState,
  ]
}

export {
  Context as RuntimeContext,
  reducer as runtimeReducer,
  initState as runtimeInitState,
  useWrappedContext as useRuntimeContext,
}

export type {
  IState as IRuntimeState,
  ISetter as IRuntimeSetter,
  IOptionalState as IOptionalRuntimeState,
  IReducerAction as IRuntimeReducerAction,
  IReducerActionType as IRuntimeReducerActionType,
}