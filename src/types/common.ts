import { IConfigSetter, IConfigState } from '@/context/config'
import { ILogItem, ILogger } from './console'
import { IRuntimeSetter, IRuntimeState } from '@/context/runtime'

interface WithConfigProps {
  config: {
    state: IConfigState
    set: IConfigSetter
  }
}

interface WithConsoleProps {
  con: {
    logs: ILogItem[]
    logger: ILogger
  }
}

interface WithRuntimeProps {
  runtime: {
    state: IRuntimeState
    set: IRuntimeSetter
  }
}

export type {
  WithConfigProps,
  WithConsoleProps,
  WithRuntimeProps
}