import { useCallback, useContext } from 'react'
import { message } from 'antd'
import {
  GlobalContext,
  IGlobalReducerActionType,
  IGlobalState,
  IOptionalGlobalState,
} from '@/context/global'

type IGlobalSetter = (type: Exclude<IGlobalReducerActionType, 'internal'> | IOptionalGlobalState, payload?: any) => void

const useGlobalData = (): {
  globalData: IGlobalState,
  setGlobalData: IGlobalSetter
} => {
  const { state, dispatch } = useContext(GlobalContext)

  const setGlobalData = useCallback((arg1: Exclude<IGlobalReducerActionType, 'internal'> | IOptionalGlobalState, arg2?: IOptionalGlobalState) => {
    if (typeof arg1 === 'string') {
      dispatch({ type: arg1, payload: arg2 })
    } else {
      if (arg2) {
        message.error('setGlobalData: arg2 is not allowed when arg1 is not a string')
      } else {
        dispatch({ type: 'internal', payload: arg1 })
      }
    }
  }, [dispatch])

  return {
    globalData: state,
    setGlobalData,
  }
}

export default useGlobalData
export type {
  IGlobalSetter
}