import { useCallback, useContext, useState } from 'react'
import { Context, IOptionalState, IReducerActionType, IState } from '@/context/global'
import { message } from 'antd'

const useGlobalData = (): {
  globalData: IState,
  setGlobalData: (type: Exclude<IReducerActionType, 'internal'> | IOptionalState, payload?: any) => void
} => {
  const { state, dispatch } = useContext(Context)

  const setGlobalData = useCallback((arg1: Exclude<IReducerActionType, 'internal'> | IOptionalState, arg2?: IOptionalState) => {
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