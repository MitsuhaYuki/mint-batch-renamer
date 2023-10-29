import { FileItem, FileItemExtend } from './file'
import { MultiLangField } from './mlang'

enum TaskRunnerType {
  untouch = 'untouch',
  filter = 'filter',
  renamer = 'renamer',
  toolset = 'toolset',
}

type TaskRunnerUtils = {
}

type SingleFileProcessorCallback = (
  split: () => { readonly origin: FileItem, latest: FileItem, steps: TaskResult[] },
  forward: (
    info: {
      result: FileItem,
      message: string,
      to?: string,
      next: boolean
    }
  ) => void
) => void

type SingleFileProcessor = (callback: SingleFileProcessorCallback) => Promise<FileItemExtend[]>

type MultiFileProcessorCallback = (
  list: { readonly source: FileItemExtend[], latest: FileItemExtend[] },
  split: (fileItem: FileItemExtend) => { readonly origin: FileItem, latest: FileItem, steps: TaskResult[] },
  forward: (
    fileItem: FileItemExtend,
    info: {
      result: FileItem,
      message: string,
      to?: string,
      next: boolean
    }
  ) => void
) => void

type MultiFileProcessor = (callback: MultiFileProcessorCallback) => Promise<FileItemExtend[]>

type TaskRunnerSysArg = {
  /** 单文件处理模式 */
  fileItem: SingleFileProcessor
  /** 列表处理模式 */
  fileList: MultiFileProcessor
  utils?: TaskRunnerUtils
}

type TaskRunnerExtArgType =
  | 'path-folder'
  | 'path-file'
  | 'string'
  | 'number'
  | 'checkbox'
  | 'radio'
  | 'radio-button'
  | 'segmented'
  | 'select'
  | 'switch'

// FIXME: 需要增加标识用于导出时识别某些参数是否应该被导出，例如输出路径之类的关键参数不应被导出
type TaskRunnerExtArg = {
  /** field name, equals to field id */
  id: string
  /** field label */
  name: MultiLangField
  /** field desc */
  desc?: MultiLangField
  /** Form Item Tips */
  tips?: string
  /** Form Item Extra */
  extra?: string
  /** param type */
  type: TaskRunnerExtArgType
  /** field options, when field is selective component, this will pass to 'option' props */
  options?: {
    label: MultiLangField
    value: string
  }[]
  default?: any
  readonly?: boolean
}

type TaskRunnerFunc = (
  sys: TaskRunnerSysArg,
  ext: Record<string, any>
) => Promise<FileItemExtend[]>

type TaskRunner = {
  id: string
  name: MultiLangField
  desc?: MultiLangField
  type: TaskRunnerType
  // 这里放的是参数信息
  args: TaskRunnerExtArg[]
  func: TaskRunnerFunc
}

type TaskRunnerConfig = {
  id: string
  name: string
  // 这里放的是实际的参数值，要读取参数信息的话从runner里面拿
  args: Record<string, any>
  // Runner索引
  runner: string
}

interface TaskResult {
  // 执行器ID
  runner: string
  // 执行动作
  action: TaskRunnerType
  // 影响
  result: FileItem
  // 提示信息
  message: string
  // 文件输出路径(为空且next=false时代表不输出，即文件被过滤)
  to?: string
  // 是否流转下一步
  next: boolean
}

export {
  TaskRunnerType,
}
export type {
  TaskResult,
  TaskRunnerSysArg,
  TaskRunnerExtArg,
  TaskRunner,
  TaskRunnerConfig,
  TaskRunnerUtils,
  SingleFileProcessorCallback,
  MultiFileProcessorCallback
}