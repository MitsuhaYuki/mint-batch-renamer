import React, { Reducer, useCallback, useContext } from 'react'
import { ILogItem } from '@/types/console'

type IState = {
  logs: ILogItem[]
}
interface IOptionalState extends Partial<IState> {}

const initState: IState = {
  logs: [{
    level: 1,
    levelText: 'INFO',
    timestamp: Date.now(),
    content: 'Console ready.',
  }]
}

/**
 * Allowed reducer action list
 * @description internal: for internal use only. reset: reset all state to initial state
 * @description naming: c_ for create, r_ for read, u_ for update, d_ for delete, after the prefix is the state name
 */
type IReducerActionType = 'internal'
  | 'c_log'
  | 'd_log'
  | 'reset'

interface IReducerAction { type: string; payload?: any }

const reducer: Reducer<IState, IReducerAction> = (state, action) => {
  if (action.type !== 'internal') {
    switch (action.type) {
      case 'c_log':
        const arr = [action.payload].concat(state.logs)
        return Object.assign({}, state, { logs: arr })
      case 'd_log': {
        return Object.assign({}, state, {
          logs: [{
            level: 1,
            levelText: 'INFO',
            timestamp: Date.now(),
            content: 'Console ready.',
          }]
        })
      }
      // 重置到初始状态
      case 'reset':
        return Object.assign({}, state, { ...initState })
    }
  } else {
    return Object.assign({}, state, action.payload)
  }
  console.error(`ConsoleContext: '${action.type}' is not a valid reducer action!`)
  return state
}

const Context = React.createContext<{
  state: IState
  dispatch: (value: any) => void
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
  Context as ConsoleContext,
  reducer as consoleReducer,
  initState as consoleInitState,
  useWrappedContext as useConsoleContext,
}

export type {
  IState as IConsoleState,
  ISetter as IConsoleSetter,
  IOptionalState as IOptionalConsoleState,
  IReducerAction as IConsoleReducerAction,
  IReducerActionType as IConsoleReducerActionType,
}