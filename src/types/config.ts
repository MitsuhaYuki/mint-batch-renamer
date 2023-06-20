export interface IConfig {
  /**
   * The maximum file size allowed to be processed.
   */
  max_file_limit: number
  /**
   * Whether to allow external filters to be used.
   */
  allow_external_filters: boolean
  /**
   * Whether to allow external renamers to be used.
   */
  allow_external_renamers: boolean
}

export const defaultConfig: IConfig = {
  max_file_limit: 5000,
  allow_external_filters: false,
  allow_external_renamers: false
}