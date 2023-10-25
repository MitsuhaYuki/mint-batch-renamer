import { useCallback, useContext } from 'react'
import { ConsoleContext, IConsoleReducerAction, IConsoleState } from '@/context/console'
import { ILogItem, ILogLevel, ILogger } from '@/types/console'

function makeRecord (level: ILogLevel, content: string) {
  const record: any = { timestamp: Date.now(), content }
  switch (level) {
    case 'debug':
      record['level'] = 0
      record['levelText'] = 'DEBUG'
      break
    case 'info':
      record['level'] = 1
      record['levelText'] = 'INFO'
      break
    case 'warn':
      record['level'] = 2
      record['levelText'] = 'WARN'
      break
    case 'error':
      record['level'] = 3
      record['levelText'] = 'ERROR'
      break
    default:
      record['level'] = 9
      record['levelText'] = 'UNKNOWN'
      break
  }
  return record
}

/**
 * Console management hook
 * @param dispatch Console context dispatch function
 * @returns Console management methods
 */
const useLogger = (): {
  logs: ILogItem[]
  logger: ILogger
  clear: () => void
} => {
  const { state, dispatch } = useContext(ConsoleContext)
  return useWrappedLogger(state, dispatch)
}

/**
 * Console manual manage hook, if already has console state & dispatch, use this hook.
 * @param consoleState console state
 * @param consoleDispatch console dispatch
 * @returns 
 */
const useWrappedLogger = (
  consoleState: IConsoleState,
  consoleDispatch: (data: IConsoleReducerAction) => void
): {
  logs: ILogItem[]
  logger: ILogger
  clear: () => void
} => {
  const debug = useCallback((content: string) => {
    consoleDispatch({ type: 'c_log', payload: makeRecord('debug', content) })
  }, [consoleDispatch])

  const info = useCallback((content: string) => {
    consoleDispatch({ type: 'c_log', payload: makeRecord('info', content) })
  }, [consoleDispatch])

  const warn = useCallback((content: string) => {
    consoleDispatch({ type: 'c_log', payload: makeRecord('warn', content) })
  }, [consoleDispatch])

  const error = useCallback((content: string) => {
    consoleDispatch({ type: 'c_log', payload: makeRecord('error', content) })
  }, [consoleDispatch])

  const clear = useCallback(() => {
    consoleDispatch({ type: 'd_log' })
  }, [consoleDispatch])

  return {
    logs: consoleState.logs,
    logger: { debug, info, warn, error },
    clear
  }
}

export {
  useLogger,
  useWrappedLogger
}