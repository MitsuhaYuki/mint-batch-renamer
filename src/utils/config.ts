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
    title: '配置文件创建失败!',
    content: '请尝试手动删除config.json后重试!',
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
        Modal.success({
          title: '首次启动准备已完成!',
          content: '这似乎是第一次启动, 已尝试重新创建配置文件, 请关闭本窗口后重新打开!',
          centered: true,
          closable: false,
          footer: null,
        })
        break
      case 'error_fs':
        Modal.error({
          title: '配置文件加载失败!',
          content: '发现文件系统错误, 可能是权限不足或配置文件有错误! 不要在C盘或桌面上运行此程序, 或删除配置文件后再次尝试!',
          centered: true,
          closable: false,
          footer: null,
        })
        break
      case 'error_read':
        const modal = Modal.error({
          title: '配置文件读取错误!',
          content: '配置文件读取错误, 请重置配置文件以继续! 或关闭本窗口, 备份配置文件后重启程序.',
          autoFocusButton: null,
          centered: true,
          closable: false,
          okButtonProps: { danger: true },
          okText: '重置配置文件',
          onOk: async () => await resetConfigWithPrompt(globalDispatch, modal),
        })
        break
    }
  }, [])
}

export { useConfigLoader }