/** The configuration file for the program. */
export interface IConfig {
  /**
   * When file count exceeds this limit, a warning will be shown.
   */
  warn_limit: number
  /**
   * The maximum file size allowed to be processed.
   */
  max_limit: number
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
export const defaultConfig: IConfig = {
  warn_limit: 10000,
  max_limit: 50000,
  allow_external_filters: false,
  allow_external_renamers: false
}