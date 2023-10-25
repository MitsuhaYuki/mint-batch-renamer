import { langs } from '@/utils/mlang'

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
  lang: keyof typeof langs
  limit: {
    max: number
    warn: number
  }
  follow_step_name: boolean
}

export interface ISysConfigTrait extends Record<keyof ISysConfig, {
  name: string
  type: string
  default: any
  required: boolean
}> {}

export const sysConfigTrait: ISysConfigTrait = {
  cfg_ver: {
    name: 'cfg_ver',
    type: 'string',
    default: '0.0.0',
    required: true,
  },
  lang: {
    name: 'lang',
    type: 'enum',
    default: 'zh-CN',
    required: true,
  },
  limit: {
    name: 'limit',
    type: 'object',
    default: {
      max: 100000,
      warn: 30000,
    },
    required: true,
  },
  follow_step_name: {
    name: 'follow_step_name',
    type: 'boolean',
    default: true,
    required: true,
  },
}