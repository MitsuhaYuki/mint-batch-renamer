export type IScriptParamItemType = 'string' | 'number' | 'select'

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
   * 参数范围
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
  default: any
  /**
   * 只读
   */
  readonly?: boolean
}