/** 脚本参数项类型 */
export type IScriptParamItemType = 'string' | 'number' | 'select'

/** 脚本参数项 */
export type IScriptParam = {
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
  type: IScriptParamItemType
  /**
   * 枚举型参数的枚举项
   */
  range?: {
    /** 选项名称 */
    label: string,
    /** 选项值 */
    value: string,
  }[]
  /**
   * 参数默认值
   */
  default?: string | number
  /**
   * 只读
   * @default false
   */
  readonly: boolean
}

/** 脚本实例 */
export type IScriptInstance<ScriptFunc, ScriptArgs> = {
  /**
   * 实例名称
   */
  label: string
  /**
   * 实例ID
   */
  id: string
  /**
   * 实例方法
   */
  func: ScriptFunc
  /**
   * 实例可用参数列表
   */
  params: ScriptArgs[]
}

/** 脚本配置 */
export type IScriptConfig = {
  /**
   * 显示名
   */
  label: string
  /**
   * 索引ID
   */
  id: string
  /**
   * 当前配置所使用的脚本标识
   */
  scriptId: string
  /**
   * 当前配置下的脚本参数列表
   */
  scriptParam?: Record<string, any>
}