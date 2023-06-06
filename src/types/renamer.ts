import { IFileItem } from './file'

export type IRenamerConfig = {
  label: string
  id: string
  renamerLabel: string
  renamerId: string
  renamerParams?: Record<string, any>
}

export type IRenamerArgs = {
  fileItem: IFileItem
  // list details
  index: number
  total: number
  fileList: IFileItem[]
}

export type IRenamerFunction = (
  sysArgs: IRenamerArgs,
  extra?: Record<string, any>
) => IFileItem

/** 过滤器拓展参数 */
export type IRenamerParam = {
  /**
   * 参数名称
   */
  name: string
  /**
   * 参数标签
   */
  label: string
  /**
   * 参数描述
   */
  desc?: string
  /**
   * 参数提示
   */
  tips?: string
  /**
   * 参数类型
   */
  type: 'string' | 'number' | 'select'
  /**
   * 参数范围
   */
  range?: any[]
  /**
   * 参数默认值
   */
  default: any
  /**
   * 只读
   */
  readonly?: boolean
}

export type IRenamer = {
  /**
   * 过滤器显示名
   */
  label: string
  /**
   * 过滤器标识
   */
  id: string
  /**
   * 过滤器方法
   */
  func: IRenamerFunction
  /**
   * 过滤器参数
   */
  params: IRenamerParam[]
}

export type IRenamers = Record<string, IRenamer>