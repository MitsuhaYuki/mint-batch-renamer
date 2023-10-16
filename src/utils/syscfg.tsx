import { ISysConfig, sysConfigTrait } from '@/types/sysconfig'
import { Button, Modal, ModalFuncProps, Space } from 'antd'
import { Fragment, ReactNode, useContext, useEffect } from 'react'
import { CheckCircleFilled, CloseCircleFilled, ExclamationCircleFilled, InfoCircleFilled, LoadingOutlined, QuestionCircleFilled } from '@ant-design/icons'
import { invoke } from '@tauri-apps/api/tauri'
import { exit, relaunch } from '@tauri-apps/api/process'
import { IConfigReducerAction, IConfigState } from '@/context/config'

type SysCfgModalController = {
  destroy: () => void
  update: (configUpdate: ModalFuncProps | ((prevConfig: ModalFuncProps) => ModalFuncProps)) => void
  show: () => void,
  hide: () => void
}

const cfgLoaderConfig = {
  cfgPath: 'syscfg.json',
  waitTime: 250,
  tipsTextStyle: {
    color: '#8c8c8c',
    marginBottom: 0,
    paddingInlineStart: '18px'
  }
}

const icons = {
  loading: <LoadingOutlined />,
  info: <InfoCircleFilled style={{ color: '#1677ff' }} />,
  success: <CheckCircleFilled style={{ color: '#52c41a' }} />,
  error: <CloseCircleFilled style={{ color: '#ff4d4f' }} />,
  warning: <ExclamationCircleFilled style={{ color: '#faad14' }} />,
  confirm: <QuestionCircleFilled style={{ color: '#1677ff' }} />,
}

const wait = async () => {
  await new Promise(resolve => {
    setTimeout(() => resolve(undefined), cfgLoaderConfig.waitTime)
  })
}

const renderTips = (error: string, extra?: string[], override?: string[]): ReactNode[] => {
  let tips: ReactNode[] = []
  // extract error code
  let eCode: any = error.match(/os error \d+/)?.[0]
  eCode = eCode ? Number(eCode.match(/\d+/)?.[0]) : -1
  // generate tips
  switch (eCode) {
    case 2: {
      tips = [
        <div># 没有找到配置文件 (os error 2)</div>
      ]
      break
    }
    case 5: {
      tips = [
        <div># 系统拒绝访问目标路径 (os error 5)</div>,
        <li>请检查配置文件是否被设为"只读"</li>
      ]
      break
    }
    default: {
      tips = [
        <div># 其他错误 <span title={error}>*悬浮以查看*</span></div>,
        <li>请不要将程序放置于C盘及相关目录</li>,
        <li>请检查程序目录内的配置文件是否具有读写权限</li>
      ]
      break
    }
  }
  // add common after-tips
  if (override) tips = [tips[0], ...override.map((v) => <li>{v}</li>)]
  if (extra) tips.push(...extra.map((v) => <li>{v}</li>))
  return tips.map((v, k) => <Fragment key={k}>{v}</Fragment>)
}

const renderContent = (
  msg: string = '请稍后...',
  icon: 'loading' | 'info' | 'success' | 'error' | 'warning' | 'confirm' = 'loading',
  tips?: { error: any, extra?: string[], override?: string[] }
): ReactNode => {
  return (<div>
    {icons[icon]}&nbsp;{msg}
    {tips ? (<ol style={cfgLoaderConfig.tipsTextStyle}>
      {renderTips(`${tips.error}`, tips.extra, tips.override)}
    </ol>) : null}
  </div>)
}

const makeDefaultConfig = (): ISysConfig => {
  let cfg = {} as any
  for (const k in sysConfigTrait) {
    if (sysConfigTrait[k as keyof ISysConfig].required)
      cfg[k] = sysConfigTrait[k as keyof ISysConfig].default
  }
  return cfg
}

const updateConfig = async (
  config: Partial<ISysConfig>,
  modal: SysCfgModalController,
  dispatch: (data: IConfigReducerAction) => void
) => {
  modal.show()
  const cfgVer = config.cfg_ver?.match(/^\d+\.\d+\.\d+$/)?.[0]
  if (cfgVer) {
    modal.update({
      content: renderContent('正在更新配置文件...'),
      footer: null
    })
    await wait()
    const [di, dj, dk] = sysConfigTrait.cfg_ver.default.split('.').map((v: any) => Number(v))
    const [ci, cj, ck] = cfgVer.split('.').map(v => Number(v))
    const defaultConfig: any = makeDefaultConfig()
    let result: any = config
    if (di !== ci) {
      // major config version change, rebuild config
      result = Object.keys(defaultConfig).reduce((prev, cur) => {
        prev[cur] = (config as any)[cur] ?? defaultConfig[cur]
        return prev
      }, defaultConfig)
    } else if (dj !== cj) {
      // minor config version change, merge config
      result = { ...defaultConfig, ...config }
    } else if (dk !== ck) {
      // patch config version change, update config
      // TODO: check which segment has different type and update it
      // TODO: prompt user that some of the config has changed
    }
    result.cfg_ver = sysConfigTrait.cfg_ver.default
    await saveConfig(cfgLoaderConfig.cfgPath, result, modal)
    dispatch({ type: 'u_system', payload: result })
    modal.update({
      content: renderContent('配置文件更新成功', 'success'),
      footer: () => (<Button type='primary' onClick={() => {
        modal.destroy()
      }}>确定</Button>)
    })
  } else {
    modal.update({
      content: renderContent('检查配置文件版本失败', 'error', { error: 'config version mismatch', override: ['请尝试重置配置'] }),
      footer: () => (<Space>
        <Button type='primary' danger onClick={
          () => resetConfig(cfgLoaderConfig.cfgPath, modal, dispatch, true)
        }>重置配置</Button>
        <Button type='primary' onClick={
          () => exit(0)
        }>退出</Button>
      </Space>)
    })
  }
}

const saveConfig = async (
  cfgPath: string,
  config: ISysConfig,
  modal: SysCfgModalController
) => {
  modal.show()
  modal.update({
    content: renderContent('正在保存配置文件...'),
    footer: null
  })
  await wait()
  try {
    if (await invoke('fs_exists', { path: cfgPath })) await invoke('fs_remove_file', { path: cfgPath })
    await invoke('fs_write_text_file', { path: cfgPath, contents: JSON.stringify(config, undefined, 2) })
    modal.update({
      content: renderContent('配置文件保存成功!', 'success'),
      footer: null
    })
    await wait()
  } catch (e) {
    console.log('I: SysConfig save failed,', e)
    modal.update({
      content: renderContent('配置文件保存失败', 'error', { error: `${e}`, extra: ['请尝试删除程序目录下的配置文件后重试'] }),
      footer: () => (<Button type='primary' onClick={() => exit(0)}>退出</Button>)
    })
  }
}

const loadConfig = async (
  modal: SysCfgModalController,
  dispatch: (data: IConfigReducerAction) => void,
) => {
  try {
    const cfgJson = JSON.parse(await invoke('fs_read_text_file', { path: cfgLoaderConfig.cfgPath }))
    if (cfgJson.cfg_ver !== sysConfigTrait.cfg_ver.default) {
      modal.show()
      modal.update({
        content: renderContent('发现配置文件更新...'),
        footer: null
      })
      await wait()
      updateConfig(cfgJson, modal, dispatch)
    } else {
      dispatch({ type: 'u_system', payload: cfgJson })
      modal.destroy()
    }
  } catch (e) {
    console.log('I: SysConfig load failed,', e)
    modal.show()
    modal.update({
      content: renderContent('读取配置文件失败', 'error', { error: `${e}`, extra: ['如果您不知道如何解决这个问题, 请尝试重置配置'] }),
      footer: () => (<Space>
        <Button type='primary' danger onClick={
          () => resetConfig(cfgLoaderConfig.cfgPath, modal, dispatch, true)
        }>重置配置</Button>
        {/* <Button type='primary' onClick={
          () => relaunch()
        }>重新启动</Button> */}
        <Button type='primary' onClick={
          () => exit(0)
        }>退出</Button>
      </Space>)
    })
  }
}

const resetConfig = async (
  cfgPath: string,
  modal: SysCfgModalController,
  dispatch: (data: IConfigReducerAction) => void,
  hardReset: boolean = false
) => {
  modal.show()
  modal.update({
    content: renderContent('正在重置配置文件...'),
    footer: null
  })
  await wait()
  try {
    if (hardReset && (await invoke('fs_exists', { path: cfgPath }))) await invoke('fs_remove_file', { path: cfgPath })
    await invoke('fs_write_text_file', { path: cfgPath, contents: JSON.stringify(makeDefaultConfig(), undefined, 2) })
    modal.update({
      content: renderContent('配置文件重置成功!', 'success'),
      footer: null
    })
    await wait()
    loadConfig(modal, dispatch)
  } catch (e) {
    console.log('I: SysConfig reset failed,', e)
    modal.update({
      content: renderContent('重置配置文件失败', 'error', { error: `${e}`, extra: ['请尝试删除程序目录下的配置文件后重试'] }),
      footer: () => (<Button type='primary' onClick={() => exit(0)}>退出</Button>)
    })
  }
}

const makeSysConfigModal = (open: boolean = false): SysCfgModalController => {
  const modal = Modal.info({
    centered: true,
    closable: false,
    content: renderContent('正在准备...'),
    footer: null,
    keyboard: false,
    maskClosable: false,
    title: '配置文件更新',
    zIndex: open ? undefined : -1
  }) as SysCfgModalController
  modal.show = () => {
    modal.update({ zIndex: undefined })
  }
  modal.hide = () => {
    modal.update({ zIndex: -1 })
  }
  return modal
}

const useSysConfig = (
  configState: IConfigState,
  configDispatch: (data: IConfigReducerAction) => void
): {
  setSysConfig: (config: ISysConfig) => void
} => {
  // load config
  useEffect(() => {
    if (!configState.system) {
      const modal = makeSysConfigModal()
      loadConfig(modal, configDispatch)
    }
  }, [configState])
  // return sysConfig setter
  return {
    setSysConfig: (config: ISysConfig) => {
      configDispatch({ type: 'u_system', payload: config })
    }
  }
}

export {
  loadConfig,
  // saveConfig,
  makeDefaultConfig,
  makeSysConfigModal,
  resetConfig,
  useSysConfig,
}
export type {
  SysCfgModalController
}