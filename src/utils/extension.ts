import filterTemplate from '@/utils/templates/ext_filter.json'
import renamerTemplate from '@/utils/templates/ext_renamer.json'
import { EScriptType } from '@/types/extension'
import { IConsoleState } from '@/context/console'
import { IExtFilterRaw, IExtFilterInstance } from '@/types/filter'
import { IGlobalReducerAction, IGlobalState } from '@/context/global'
import { ILogger, useWrappedLogger } from './logger'
import { invoke } from '@tauri-apps/api/tauri'
import { useAsyncEffect } from 'ahooks'

/**
 * Load external script
 * @param type script type
 * @param logger console logger
 * @param globalDispatch global state setter
 * @returns 
 */
async function loadScript (
  type: EScriptType,
  logger: ILogger,
  globalDispatch: (data: IGlobalReducerAction) => void) {
  const fileName = `ext_${type}.json`
  try {
    const isFileExist = await invoke("is_file_exist", { filePath: fileName })
    if (!isFileExist) {
      await invoke("write_file", { filePath: fileName, content: JSON.stringify(type === EScriptType.Filter ? filterTemplate : renamerTemplate, null, 2) })
      logger.info(`External ${type} ${fileName} not exist, recreating file`)
      return
    }
  } catch (e) {
    logger.error(`Check ${fileName} failed, err=${e}`)
  }
  let rawScript: IExtFilterRaw | any
  try {
    const rawContent: string = await invoke("read_file", { filePath: fileName })
    rawScript = JSON.parse(rawContent)
  } catch (e) {
    logger.error(`Parse ${fileName} failed, err=${e}`)
  }
  if (Object.keys(rawScript).length === 0) {
    logger.info(`No external ${type} found`)
    return
  }
  const finalScript = Object.keys(rawScript).reduce((prev, key) => {
    // FIXME: notice, if script id collusion, the later script need add a random suffix and set disabled!
    // TODO: should use spefic pattern to identify if script is disabled by user or load error
    try {
      const deserializedFunc = new Function('return ' + decodeURIComponent(atob(rawScript[key].func)))()
      prev[key] = {
        ...rawScript[key],
        func: deserializedFunc,
        status: {
          ...rawScript[key].status,
          error: false,
        }
      }
    } catch (e) {
      logger.error(`Deserialize external ${type} ${key} failed, err=${e}`)
      prev[key] = {
        ...rawScript[key],
        func: undefined,
        status: {
          ...rawScript[key].status,
          error: false,
        }
      }
    }
    return prev
  }, {} as Record<string, IExtFilterInstance>)
  logger.info(`Load ${Object.keys(finalScript).length} ${type}(s) complete`)
  globalDispatch({ type: 'internal', payload: { [type === EScriptType.Filter ? 'sysFiltersExt' : 'sysRenamersExt']: finalScript } })
}

/**
 * Config checker, load config if exist, or create default config if not exist
 * @param globalData global state
 * @param globalDispatch global state setter
 */
const useExternalScriptLoader = (
  globalData: IGlobalState,
  globalDispatch: (data: IGlobalReducerAction) => void,
  consoleState: IConsoleState,
  consoleDispatch: (data: any) => void
) => {
  const { logger } = useWrappedLogger(consoleState, consoleDispatch)

  useAsyncEffect(async () => {
    const { config } = globalData
    if (config) {
      if (config.allow_external_filters) {
        logger.info('Loading external filters...')
        loadScript(EScriptType.Filter, logger, globalDispatch)
      }
      if (config.allow_external_renamers) {
        logger.info('Loading external renamers...')
        loadScript(EScriptType.Renamer, logger, globalDispatch)
      }
    }
  }, [globalData.config])
}

export {
  loadScript,
  useExternalScriptLoader
}