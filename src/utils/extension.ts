import { invoke } from '@tauri-apps/api/tauri'
import { IGlobalReducerAction, IGlobalState } from '@/context/global'
import { IConsoleState } from '@/context/console'
import { useAsyncEffect } from 'ahooks'
import { ILogger, useWrappedLogger } from './logger'
import { IExtFilterRaw, IExtFilters } from '@/types/filter'

/**
 * Load external script
 * @param type script type
 * @param logger console logger
 * @param globalDispatch global state setter
 * @returns 
 */
async function loadScript (
  type: 'filter' | 'renamer',
  logger: ILogger,
  globalDispatch: (data: IGlobalReducerAction) => void) {
  const fileName = type === 'filter' ? 'ext_filter.json' : 'ext_renamer.json'
  try {
    const isFileExist = await invoke("is_file_exist", { filePath: fileName })
    if (!isFileExist) {
      await invoke("write_file", { filePath: fileName, content: '{}' })
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
    try {
      const deserializedFunc = new Function('return ' + atob(rawScript[key].func))()
      prev[key] = {
        ...rawScript[key],
        error: false,
        func: deserializedFunc,
      }
    } catch (e) {
      logger.error(`Deserialize external ${type} ${key} failed, err=${e}`)
      prev[key] = {
        ...rawScript[key],
        error: true,
        func: undefined,
      }
    }
    return prev
  }, {} as IExtFilters)
  logger.info(`Load ${Object.keys(finalScript).length} ${type}(s) complete`)
  globalDispatch({ type: 'internal', payload: { sysFiltersExt: finalScript } })
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
        loadScript('filter', logger, globalDispatch)
      }
      if (config.allow_external_renamers) {
        logger.info('Loading external renamers...')
        loadScript('renamer', logger, globalDispatch)
      }
    }
  }, [globalData.config])
}

export { useExternalScriptLoader }