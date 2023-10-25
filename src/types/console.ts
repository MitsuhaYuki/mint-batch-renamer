interface ILogItem {
  level: 0 | 1 | 2 | 3
  levelText: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'
  timestamp: number
  content: string
}

type ILogLevel = 'debug' | 'info' | 'warn' | 'error'

type LoggerFn = (content: string) => any
interface ILogger {
  debug: LoggerFn
  info: LoggerFn
  warn: LoggerFn
  error: LoggerFn
}

export type {
  ILogItem,
  ILogLevel,
  ILogger
}
