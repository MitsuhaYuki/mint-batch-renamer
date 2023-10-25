import { FileItem, FileItemExtend } from './file'
import { MultiLangField } from './mlang'

enum TaskRunnerScope {
  fileItem = 'fileItem',
  fileList = 'fileList'
}

enum TaskRunnerType {
  untouch = 'untouch',
  filter = 'filter',
  renamer = 'renamer',
  output = 'output',
}

type TaskRunnerUtils = {
  split: () => {
    originFile: FileItem,
    latestFile: FileItem,
    steps: TaskResult[]
  },
  forward: (info: {
    result: FileItem,
    message: string,
    to?: string,
    next: boolean
  }) => FileItemExtend
}

type TaskRunnerSysArg<DataType> = {
  data: DataType
  utils: TaskRunnerUtils
}

type TaskRunnerExtArgType =
  | 'string'
  | 'number'
  | 'folder_selector'
// | 'boolean'
// | 'select'
// | 'multi-select'
// | 'file'
// | 'folder'

// FIXME: 需要增加标识用于导出时识别某些参数是否应该被导出，例如输出路径之类的关键参数不应被导出
type TaskRunnerExtArg = {
  /** field name, equals to field id */
  id: string
  /** field label */
  name: MultiLangField
  // /** Form Item Tips */
  // tips?: string
  // /** Form Item Extra */
  // extra?: string
  /** param type */
  type: TaskRunnerExtArgType
  /** field options, when field is selective component, this will pass to 'option' props */
  options?: any
  default?: any
  readonly?: boolean
}

type TaskRunnerFunc<DataType, RespType = DataType> = (
  sys: TaskRunnerSysArg<DataType>,
  ext: Record<string, any>
) => RespType

type TaskRunnerScoped<TaskRunnerScope, DataType, RespType = DataType> = {
  id: string
  name: MultiLangField
  type: TaskRunnerType
  scope: TaskRunnerScope
  // 这里放的是参数信息
  args: TaskRunnerExtArg[]
  func: TaskRunnerFunc<DataType, RespType>
}

type TaskRunner =
  | TaskRunnerScoped<TaskRunnerScope.fileItem, FileItemExtend>
  | TaskRunnerScoped<TaskRunnerScope.fileList, FileItemExtend[]>

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
  TaskRunnerScope,
}
export type {
  TaskResult,
  TaskRunnerSysArg,
  TaskRunnerExtArg,
  TaskRunner,
  TaskRunnerConfig,
  TaskRunnerUtils,
}