import { IFileItem } from './file'
import { IScriptInstance, IScriptParam, IScriptParamItemType } from './script'

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
export type IFilterFunction<T, K = boolean> = (
  sysArgs: T,
  extra?: Record<string, any>
) => K

/** 通用过滤器 */
export interface ICommonFilterInstance<IScope, IArgs, IResp = boolean> extends Omit<IScriptInstance<IFilterFunction<IArgs, IResp>, IScriptParam>, 'func'> {
  /**
   * 过滤器作用域
   */
  scope: IScope
  /**
   * 过滤器方法
   */
  func: IFilterFunction<IArgs, IResp>
}

/** 过滤器作用域 */
export enum EFilterScope {
  /** 文件名型过滤器 */
  fileName = 'fileName',
  /** 文件列表型过滤器 */
  fileList = 'fileList',
}

/** 过滤器 */
export type IFilterInstance = |
  ICommonFilterInstance<EFilterScope.fileName, IFileNameScopeFilterArgs> |
  ICommonFilterInstance<EFilterScope.fileList, IFileListScopeFilterArgs, IFileItem[]>

/** --- 外部过滤器相关定义 --- */

/** 从外部加载的过滤器 */
export interface ICommonExtFilterInstance<IScope, IArgs, IResp = boolean> extends ICommonFilterInstance<IScope, IArgs, IResp> {
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
export type IExtFilterInstance = |
  ICommonExtFilterInstance<EFilterScope.fileName, IFileNameScopeFilterArgs> |
  ICommonExtFilterInstance<EFilterScope.fileList, IFileListScopeFilterArgs, IFileItem[]>

/** 外部过滤器(From file) */
export type IExtFilterRaw = Omit<IExtFilterInstance, 'error' | 'modified'> & {
  /**
   * 过滤器作用域(Override)
   */
  scope: EFilterScope
  /**
   * 过滤器方法(Override)
   */
  func: string
}
