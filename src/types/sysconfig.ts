/** The configuration file for the program. */
export interface ISysConfig {
  /**
   * The version of the configuration file.
   * Version number format is `major.minor.patch` with numbers only.
   * 
   * major: config has remove or change the key name.
   * minor: config add new key.
   * patch: config change the type of key value.
   * 
   * other changes like change the default value or description doesn't need to update the version.
   */
  cfg_ver: string
}

export interface ISysConfigTrait extends Record<keyof ISysConfig, {
  name: string
  type: 'string'
  default: any
  required: boolean
}> {}

export const sysConfigTrait: ISysConfigTrait = {
  cfg_ver: {
    name: 'cfg_ver',
    type: 'string',
    default: '0.0.0',
    required: true,
  }
}