import { TaskResult } from './task'

type FileItem = {
  /* Basic Information */
  // 文件全名
  name: string
  // 路径
  path: string

  /* Extra Information */
  // 文件名
  fileName: string
  // 拓展名
  fileExt: string
  // 大小
  size: number
}

interface FileItemExtend extends FileItem {
  /* 流转过程 */
  steps: TaskResult[]
}

export type {
  FileItem,
  FileItemExtend
}