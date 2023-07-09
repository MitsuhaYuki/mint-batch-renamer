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
export type ICommonFilterFunction<T, K = boolean> = (
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
export type ICommonFilter<IScope, IArgs, IResp = boolean> = {
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
  func: ICommonFilterFunction<IArgs, IResp>
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
  ICommonFilter<EFilterScope.fileName, IFileNameScopeFilterArgs> |
  ICommonFilter<EFilterScope.fileList, IFileListScopeFilterArgs, IFileItem[]>

/** 过滤器列表 */
export type IFilters = Record<string, IFilter>

/**
 * 第三方过滤器脚本类型定义
 */

/** 从外部加载的过滤器 */
export interface ICommonExtFilter<IScope, IArgs, IResp = boolean> extends ICommonFilter<IScope, IArgs, IResp> {
  /**
   * 功能描述
   */
  desc: string
  /**
   * 过滤器加载状态
   */
  error: boolean
  /**
   * 过滤器状态(脚本编辑器使用的字段)
   */
  status: {
    /**
     * 脚本被创建
     */
    created: boolean
    /**
     * 脚本被删除
     */
    deleted: boolean
    /**
     * 脚本被禁用
     */
    disabled: boolean
    /**
     * 该脚本存在加载错误
     */
    error: boolean
    /**
     * 脚本被修改
     */
    modified: boolean
  }
}

/** 外部过滤器 */
export type IExtFilter = |
  ICommonExtFilter<EFilterScope.fileName, IFileNameScopeFilterArgs> |
  ICommonExtFilter<EFilterScope.fileList, IFileListScopeFilterArgs, IFileItem[]>

/** 外部过滤器(From file) */
export type IExtFilterRaw = Omit<IExtFilter, 'error' | 'modified'> & {
  /**
   * 过滤器作用域(Override)
   */
  scope: EFilterScope
  /**
   * 过滤器方法(Override)
   */
  func: string
}

/** 外部Filter列表 */
export type IExtFilters = Record<string, IExtFilter>