export interface IConfig {
  /**
   * The maximum file size allowed to be processed.
   */
  max_file_limit: number
}

export const defaultConfig: IConfig = {
  max_file_limit: 5000,
}