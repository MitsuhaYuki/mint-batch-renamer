import { IFileItem } from './file'

/** 过滤器实例配置 */
export type IFilterConfig = {
  /**
   * 过滤项显示名
   */
  label: string
  /**
   * 过滤项ID
   */
  id: string
  /**
   * 使用的过滤器名称
   */
  filterLabel: string
  /**
   * 使用的过滤器ID
   */
  filterId: string
  /**
   * 过滤器调用参数列表
   */
  filterParams?: Record<string, any>
}

/** 过滤器实例配置列表 */
export type IFilterConfigs = IFilterConfig[]

/** 文件名型过滤器系统参数列表 */
export type IFileNameScopeFilterArgs = {
  /** 文件全名 */
  fullName: string
  /** 文件名 */
  fileName: string
  /** 文件扩展名 */
  extName: string
}

/** 文件列表型过滤器系统参数列表 */
export type IFileListScopeFilterArgs = {
  /** 文件列表 */
  fileList: IFileItem[]
}

/** 通用过滤器方法 */
export type IGeneralFilterFunction<T, K = boolean> = (
  sysArgs: T,
  extra?: Record<string, any>
) => K

/** 过滤器拓展参数 */
export type IFilterParam = {
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

/** 通用过滤器 */
export type IGeneralFilter<IScope, IArgs, IResp = boolean> = {
  /**
   * 过滤器显示名
   */
  label: string
  /**
   * 过滤器标识
   */
  id: string
  /**
   * 过滤器作用域
   */
  scope: IScope
  /**
   * 过滤器方法
   */
  func: IGeneralFilterFunction<IArgs, IResp>
  /**
   * 过滤器参数
   */
  params: IFilterParam[]
}

/** 过滤器作用域 */
export enum EFilterScope {
  /** 文件名型过滤器 */
  fileName = 'fileName',
  /** 文件列表型过滤器 */
  fileList = 'fileList',
}

/** 过滤器 */
export type IFilter = |
  IGeneralFilter<EFilterScope.fileName, IFileNameScopeFilterArgs> |
  IGeneralFilter<EFilterScope.fileList, IFileListScopeFilterArgs, IFileItem[]>

/** 过滤器列表 */
export type IFilters = Record<string, IFilter>