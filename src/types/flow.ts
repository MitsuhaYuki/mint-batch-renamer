import { TaskRunnerConfig } from './task'

type FlowConfigInfo = {
  name: string
  desc?: string
}

type FlowConfig = {
  info: FlowConfigInfo
  flow: {
    config?: {
      recursive: boolean,
      outputMethod: 'copy' | 'move'
    },
    tasks: TaskRunnerConfig[]
  }
}

export type {
  FlowConfig,
  FlowConfigInfo
}