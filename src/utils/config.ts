import { invoke } from '@tauri-apps/api/tauri'
import { IGlobalReducerAction, IGlobalState } from '@/context/global'
import { defaultConfig, IConfig } from '@/types/config'
import { Modal, message } from 'antd'
import { useAsyncEffect } from 'ahooks'

/**
 * Load config from disk
 * @param globalDispatch global state setter
 * @returns config load status, ok=success, not_found=config not found, error_fs=error in file system, error_read=error in read file
 */
export async function loadConfig (globalDispatch: (data: IGlobalReducerAction) => void): Promise<'ok' | 'not_found' | 'error_fs' | 'error_read'> {
  let isConfigExist = false
  try {
    isConfigExist = await invoke('is_config_exist')
  } catch (e) {
    return 'error_fs'
  }
  if (isConfigExist) {
    try {
      const config = await invoke('read_config') as IConfig
      if (typeof config !== 'object') return 'error_read' // need to check if config is valid (using default config)
      globalDispatch({ type: 'internal', payload: { config: config, configOk: true } })
      return 'ok'
    } catch (e) {
      return 'error_read'
    }
  }
  return 'not_found'
}

/**
 * write config to disk
 * @param config config content
 * @returns is write config success, ok=success, error_fs=error in file system
 */
export async function saveConfig (config: IConfig): Promise<'ok' | 'error_fs'> {
  try {
    await invoke('write_config', { config })
    return 'ok'
  } catch (e) {
    return 'error_fs'
  }
}

/**
 * reset config to default
 * @param globalDispatch global state setter
 * @returns reset config status, ok=success, error_fs=error in file system
 */
export async function resetConfig (globalDispatch: (data: IGlobalReducerAction) => void): Promise<'ok' | 'error_fs'> {
  const copyConfig = JSON.parse(JSON.stringify(defaultConfig))
  try {
    await invoke("write_config", { config: copyConfig })
    globalDispatch({ type: 'internal', payload: { config: copyConfig, configOk: true } })
    return 'ok'
  } catch (e) {
    return 'error_fs'
  }
}

/**
 * Reset config with prompt
 * @param globalDispatch global state setter
 * @param modal which modal will be destroyed, undefined if no modal
 */
const resetConfigWithPrompt = async (globalDispatch: (data: IGlobalReducerAction) => void, modal?: any) => {
  if (modal) modal.destroy()
  const resetConfigStatus = await resetConfig(globalDispatch)
  if (resetConfigStatus === 'ok') {
    message.success('已重新创建配置文件!')
    return
  }
  Modal.error({
    title: 'Failed to create config!',
    content: 'Please try delete config.json and retry open.',
    centered: true,
    closable: false,
    footer: null,
  })
}

/**
 * Config checker, load config if exist, or create default config if not exist
 * @param globalData global state
 * @param globalDispatch global state setter
 */
const useConfigLoader = (
  globalData: IGlobalState,
  globalDispatch: (data: IGlobalReducerAction) => void,
) => {
  useAsyncEffect(async () => {
    Modal.destroyAll()
    const loadConfigStatus = await loadConfig(globalDispatch)
    switch (loadConfigStatus) {
      case 'ok':
        return
      case 'not_found':
        resetConfigWithPrompt(globalDispatch)
      case 'error_fs':
        Modal.error({
          title: 'Failed to load config!',
          content: 'Please try delete config.json and retry open.',
          centered: true,
          closable: false,
          footer: null,
        })
        break
      case 'error_read':
        const modal = Modal.error({
          title: 'Read config file failed!',
          content: 'Please reset config file to continue! Or close this window, backup config file and restart.',
          autoFocusButton: null,
          centered: true,
          closable: false,
          okButtonProps: { danger: true },
          okText: 'Reset config',
          onOk: async () => await resetConfigWithPrompt(globalDispatch, modal),
        })
        break
    }
  }, [])
}

export { useConfigLoader }