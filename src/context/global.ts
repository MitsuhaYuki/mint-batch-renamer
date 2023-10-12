import React, { Reducer } from 'react'
import { IExtFilterInstance, IFilterInstance } from '@/types/filter'
import { IExtRenamerInstance, IRenamerInstance } from '@/types/renamer'
import { IFileItem, IFileItemRenamed } from '@/types/file'
import { defaultConfig, IConfig } from '@/types/config'
import { sysFilterList } from '@/utils/filter'
import { sysRenamerList } from '@/utils/renamer'
import { ISysConfig } from '@/types/sysconfig'

interface IState {
  config: IConfig
  filesOriginal: IFileItem[]
  filesFiltered?: IFileItem[]
  filesRenamed?: IFileItemRenamed[]
  loading?: boolean
  sysFilters: Record<string, IFilterInstance>
  sysFiltersExt: Record<string, IExtFilterInstance>
  sysRenamers: Record<string, IRenamerInstance>
  sysRenamersExt: Record<string, IExtRenamerInstance>
  sourceFolders: string[]
  targetFolder: string

  sysConfig?: ISysConfig
}
interface IOptionalState extends Partial<IState> {}

const initState: IState = {
  config: {} as any,
  filesOriginal: [],
  sysFilters: sysFilterList,
  sysFiltersExt: {},
  sysRenamers: sysRenamerList,
  sysRenamersExt: {},
  sourceFolders: [],
  targetFolder: '',
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
  // New Config Mech
  | 'u_config'

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
      // new senorio
      case 'u_config':
        return Object.assign({}, state, { sysConfig: action.payload })
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