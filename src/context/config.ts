import { ISysConfig } from '@/types/syscfg'
import { langs, ILanguage } from '@/utils/mlang'
import React, { Reducer, useCallback, useContext } from 'react'

interface IState {
  system?: ISysConfig
  langs: ILanguage
}
interface IOptionalState extends Partial<IState> {}

// State初始值
const initState: IState = {
  langs: langs['zh-CN'],
}

/**
 * Allowed reducer action list
 * @description internal: for internal use only. reset: reset all state to initial state
 * @description naming: c_ for create, r_ for read, u_ for update, d_ for delete, after the prefix is the state name
 */
type IReducerActionType = 'internal'
  | 'u_langs'
  | 'd_langs'
  | 'u_system'
  | 'd_system'
  | 'reset'

interface IReducerAction { type: string; payload?: any }

const reducer: Reducer<IState, IReducerAction> = (state, action) => {
  if (action.type !== 'internal') {
    switch (action.type) {
      case 'u_langs':
        return Object.assign({}, state, { langs: action.payload })
      case 'd_langs': {
        return Object.assign({}, state, { langs: initState.langs })
      }
      case 'u_system':
        return Object.assign({}, state, { system: action.payload })
      case 'd_system': {
        delete state.system
        return Object.assign({}, state)
      }
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
  Context as ConfigContext,
  reducer as configReducer,
  initState as configInitState,
  useWrappedContext as useConfigContext,
}

export type {
  IState as IConfigState,
  ISetter as IConfigSetter,
  IOptionalState as IOptionalConfigState,
  IReducerAction as IConfigReducerAction,
  IReducerActionType as IConfigReducerActionType,
}