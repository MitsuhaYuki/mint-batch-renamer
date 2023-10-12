/** The configuration file for the program. */
export interface ISysConfig {
  /**
   * When file count exceeds this limit, a warning will be shown.
   */
  warn_limit: number
  /**
   * The maximum file size allowed to be processed.
   */
  max_limit: number
  /**
   * Whether to recursively read files in subdirectories.
   */
  recursive_read: boolean
  /**
   * The mode of file system operations.
   */
  fsop_mode: 'copy' | 'move'
  /**
   * Whether to allow external filters to be used.
   */
  allow_external_filters: boolean
  /**
   * Whether to allow external renamers to be used.
   */
  allow_external_renamers: boolean
}

/** Default config template */
export const defaultSysConfig: ISysConfig = {
  warn_limit: 10000,
  max_limit: 50000,
  recursive_read: true,
  fsop_mode: 'copy',
  allow_external_filters: false,
  allow_external_renamers: false
}