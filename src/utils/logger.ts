import { useCallback, useContext } from 'react'
import { ConsoleContext, IConsoleState } from '@/context/console'

function makeRecord (level: 'debug' | 'info' | 'warn' | 'error', content: string) {
  const record: any = { type: 'add', payload: { timestamp: Date.now(), content } }
  switch (level) {
    case 'debug':
      record.payload['level'] = 0
      record.payload['levelText'] = 'DEBUG'
      break
    case 'info':
      record.payload['level'] = 1
      record.payload['levelText'] = 'INFO'
      break
    case 'warn':
      record.payload['level'] = 2
      record.payload['levelText'] = 'WARN'
      break
    case 'error':
      record.payload['level'] = 3
      record.payload['levelText'] = 'ERROR'
      break
    default:
      record.payload['level'] = 9
      record.payload['levelText'] = 'UNKNOWN'
      break
  }
  return record
}

type LoggerFn = (content: string) => any
export interface ILogger {
  debug: LoggerFn
  info: LoggerFn
  warn: LoggerFn
  error: LoggerFn
}

/**
 * Console management hook
 * @param dispatch Console context dispatch function
 * @returns Console management methods
 */
const useLogger = (): {
  logs: IConsoleState
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
  consoleDispatch: (data: any) => void
): {
  logs: IConsoleState
  logger: ILogger
  clear: () => void
} => {
  const debug = useCallback((content: string) => {
    consoleDispatch(makeRecord('debug', content))
  }, [consoleDispatch])

  const info = useCallback((content: string) => {
    consoleDispatch(makeRecord('info', content))
  }, [consoleDispatch])

  const warn = useCallback((content: string) => {
    consoleDispatch(makeRecord('warn', content))
  }, [consoleDispatch])

  const error = useCallback((content: string) => {
    consoleDispatch(makeRecord('error', content))
  }, [consoleDispatch])

  const clear = useCallback(() => {
    consoleDispatch({ type: 'clear' })
  }, [consoleDispatch])

  return {
    logs: consoleState,
    logger: { debug, info, warn, error },
    clear
  }
}

export default useLogger
export { useWrappedLogger }