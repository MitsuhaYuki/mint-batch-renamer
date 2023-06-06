import React, { Reducer } from 'react'
import { IFileItem } from '@/types/file'
import { defaultConfig, IConfig } from '@/types/config'
import { IFilters } from '@/types/filter'
import { sysFilterList } from '@/utils/filter'
import { IRenamers } from '@/types/renamer'
import { sysRenamerList } from '@/utils/renamer'

export interface IState {
  config: IConfig
  filesOriginal: IFileItem[]
  filesFiltered: IFileItem[]
  filesRenamed: IFileItem[]
  loading?: boolean
  sysFilters: IFilters
  sysRenamers: IRenamers
  sourceFolders: string[]
  targetFolder: string
}
export interface IOptionalState extends Partial<IState> {}

export const initState: IState = {
  config: defaultConfig,
  filesOriginal: [],
  filesFiltered: [],
  filesRenamed: [],
  sysFilters: sysFilterList,
  sysRenamers: sysRenamerList,
  sourceFolders: [],
  targetFolder: ''
}

/**
 * Allowed reducer action list
 * @description internal: for internal use only. reset: reset all state to initial state
 * @description naming: c_ for create, r_ for read, u_ for update, d_ for delete, after the prefix is the state name
 */
export type IReducerActionType = 'internal'
  | 'u_source'
  | 'd_source'
  | 'u_target'
  | 'd_target'
  | 'u_original_files'
  | 'u_filtered_files'
  | 'u_renamed_files'
  | 'reset'

export type IReducerAction = {
  type: IReducerActionType,
  payload?: any
}

export const reducer: Reducer<IState, IReducerAction> = (state, action) => {
  if (action.type !== 'internal') {
    switch (action.type) {
      case 'u_source':
        return Object.assign({}, state, { sourceFolders: action.payload, filesOriginal: [], filesFiltered: [], filesRenamed: [] })
      case 'd_source':
        return Object.assign({}, state, { sourceFolders: [], filesOriginal: [], filesFiltered: [], filesRenamed: [] })
      case 'u_target':
        return Object.assign({}, state, { targetFolder: action.payload })
      case 'd_target':
        return Object.assign({}, state, { targetFolder: '' })
      case 'u_original_files':
        return Object.assign({}, state, { filesOriginal: action.payload, filesFiltered: [], filesRenamed: [] })
      case 'u_filtered_files':
        return Object.assign({}, state, { filesFiltered: action.payload, filesRenamed: [] })
      case 'u_renamed_files':
        return Object.assign({}, state, { filesRenamed: action.payload })
      case 'reset':
        return Object.assign({}, initState)
    }
  }
  return Object.assign({}, state, action.payload)
}

export const Context = React.createContext<{
  state: IState
  dispatch: (value: any) => void
}>({
  state: initState,
  dispatch: () => ({ error: 'Reducer is not defined' })
})