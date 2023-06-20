import React, { Reducer } from 'react'

interface IOutputItem {
  level: 0 | 1 | 2 | 3
  levelText: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'
  timestamp: number
  content: string
}
type IState = IOutputItem[]
type IOptionalState = Partial<IState>

const initState: IState = [
  {
    level: 1,
    levelText: 'INFO',
    timestamp: Date.now(),
    content: 'Console ready.',
  }
]

interface IReducerAction { type: string; payload: IOutputItem }

const reducer: Reducer<IState, IReducerAction> = (state, action) => {
  switch (action.type) {
    case 'add':
      return [action.payload, ...state]
    case 'clear':
      return [...initState]
    default:
      return [{
        level: 3,
        levelText: 'ERROR',
        timestamp: Date.now(),
        content: 'Reducer is not defined.',
      }, ...state]
  }
}

const Context = React.createContext<{
  state: IState
  dispatch: (value: any) => void
}>({
  state: initState,
  dispatch: () => ({ error: 'Reducer is not defined' })
})

export {
  Context as ConsoleContext,
  reducer as consoleReducer,
  initState as consoleInitState,
}

export type {
  IState as IConsoleState,
  IOptionalState as IOptionalConsoleState,
  IReducerAction as IConsoleReducerAction
}