import React, { Reducer } from 'react'
import { IFileItem } from '@/types/file'
import { defaultConfig, IConfig } from '@/types/config'
import { IExtFilters, IFilters } from '@/types/filter'
import { sysFilterList } from '@/utils/filter'
import { IRenamers } from '@/types/renamer'
import { sysRenamerList } from '@/utils/renamer'

interface IState {
  config: IConfig
  filesOriginal: IFileItem[]
  filesFiltered?: IFileItem[]
  filesRenamed?: IFileItem[]
  loading?: boolean
  sysFilters: IFilters
  sysFiltersExt: IExtFilters
  sysRenamers: IRenamers
  sourceFolders: string[]
  targetFolder: string
}
interface IOptionalState extends Partial<IState> {}

const initState: IState = {
  config: defaultConfig,
  filesOriginal: [],
  // filesFiltered: [],
  // filesRenamed: [],
  sysFilters: sysFilterList,
  sysFiltersExt: {},
  sysRenamers: sysRenamerList,
  sourceFolders: [],
  targetFolder: ''
}

/**
 * Allowed reducer action list
 * @description internal: for internal use only. reset: reset all state to initial state
 * @description naming: c_ for create, r_ for read, u_ for update, d_ for delete, after the prefix is the state name
 */
type IReducerActionType = 'internal'
  | 'u_source'
  | 'd_source'
  | 'u_target'
  | 'd_target'
  | 'u_original_files'
  | 'u_filtered_files'
  | 'u_renamed_files'
  | 'reset'

type IReducerAction = {
  type: IReducerActionType,
  payload?: any
}

const reducer: Reducer<IState, IReducerAction> = (state, action) => {
  if (action.type !== 'internal') {
    switch (action.type) {
      case 'u_source':
        return Object.assign({}, state, { sourceFolders: action.payload, filesFiltered: undefined, filesRenamed: undefined }) // update: no longer need clear original file list here.
      case 'd_source':
        return Object.assign({}, state, { sourceFolders: [], filesOriginal: undefined, filesFiltered: undefined, filesRenamed: undefined })
      case 'u_target':
        return Object.assign({}, state, { targetFolder: action.payload })
      case 'd_target':
        return Object.assign({}, state, { targetFolder: '' })
      case 'u_original_files':
        return Object.assign({}, state, { filesOriginal: action.payload, filesFiltered: undefined, filesRenamed: undefined })
      case 'u_filtered_files':
        return Object.assign({}, state, { filesFiltered: action.payload, filesRenamed: undefined })
      case 'u_renamed_files':
        return Object.assign({}, state, { filesRenamed: action.payload })
      case 'reset':
        return Object.assign({}, initState)
    }
  }
  return Object.assign({}, state, action.payload)
}

const Context = React.createContext<{
  state: IState
  dispatch: (value: any) => void
}>({
  state: initState,
  dispatch: () => ({ error: 'Reducer is not defined' })
})

export {
  Context as GlobalContext,
  reducer as globalReducer,
  initState as globalInitState,
}

export type {
  IState as IGlobalState,
  IOptionalState as IOptionalGlobalState,
  IReducerAction as IGlobalReducerAction,
  IReducerActionType as IGlobalReducerActionType,
}