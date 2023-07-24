import { IFileItem, IFileItemRenamed } from './file'
import { IScriptParam, IScriptParamItemType } from './script'

/** 重命名器系统参数列表 */
export type IRenamerArgs = {
  /** 将要重命名的文件 */
  fileItem: IFileItemRenamed
  /** 当前重命名操作位于整个操作序列中的index */
  index: number
  /** 总重命名操作数量 */
  total: number
  /** 将要重命名的文件列表 */
  fileList: IFileItem[]
}

/** 重命名器方法 */
export type IRenamerFunction = (
  /** 系统参数 */
  sysArgs: IRenamerArgs,
  /** 附加参数 */
  extra?: Record<string, any>
) => Promise<IFileItemRenamed>

export type IRenamerInstance = {
  /** 重命名器显示名 */
  label: string
  /** 重命名器标识 */
  id: string
  /** 重命名器方法 */
  func: IRenamerFunction
  /** 重命名器参数 */
  params: IScriptParam[]
}

/** --- 外部重命名器相关定义 --- */

/** 从外部加载的重命名器 */
export interface IExtRenamerInstance extends IRenamerInstance {
  /** 功能描述 */
  desc: string
  /** 重命名加载状态 */
  error: boolean
  /** 重命名状态(脚本编辑器使用的字段) */
  status: {
    /** 脚本被创建 */
    created: boolean
    /** 脚本被删除 */
    deleted: boolean
    /** 脚本被禁用 */
    disabled: boolean
    /** 该脚本存在加载错误 */
    error: boolean
    /** 脚本被修改 */
    modified: boolean
  }
}

/** 外部重命名器(From file) */
export type IExtFilterRaw = Omit<IExtRenamerInstance, 'error' | 'modified'> & {
  /**
   * 重命名器方法(Override)
   */
  func: string
}
