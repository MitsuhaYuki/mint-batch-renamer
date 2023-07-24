export interface IFileItem {
  /** 文件全名 */
  full_name: string
  /** 文件名 */
  name: string
  /** 文件大小(字节) */
  size: number
  /** 文件拓展名 */
  extension: string
  /** 文件路径 */
  path: string
}

export interface IFileItemRenamed extends IFileItem {
  /** 重命名后的文件全名 */
  rename_full_name?: string
  /** 重命名后的文件名 */
  rename_name?: string
  /** 重命名后的文件拓展名 */
  rename_extension?: string
}
