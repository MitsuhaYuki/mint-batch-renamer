import { GlobalContext, IGlobalReducerAction, IGlobalState } from '@/context/global'
import { ISysConfig, defaultSysConfig } from '@/types/sysconfig'
import { Button, Modal, ModalFuncProps, Space } from 'antd'
import { Fragment, ReactNode, useContext, useEffect } from 'react'
import { CheckCircleFilled, CloseCircleFilled, ExclamationCircleFilled, InfoCircleFilled, LoadingOutlined, QuestionCircleFilled } from '@ant-design/icons'
import { invoke } from '@tauri-apps/api/tauri'
import { exit, relaunch } from '@tauri-apps/api/process'

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

/**
 * render error tips, with basic error code description.
 * @param error error text reported by tauri or backend
 * @param extra extra tips
 * @returns final tips, rendered as ReactNode[]
 */
const renderTips = (error: string, extra?: string[]): ReactNode[] => {
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
  if (extra) tips.push(...extra.map((v) => <li>{v}</li>))
  return tips.map((v, k) => <Fragment key={k}>{v}</Fragment>)
}

/**
 * render sysConfig modal content
 * @param msg main status message
 * @param icon status icon
 * @param tips error tips
 * @returns modal content
 */
const renderContent = (
  msg: string = '请稍后...',
  icon: 'loading' | 'info' | 'success' | 'error' | 'warning' | 'confirm' = 'loading',
  tips?: { error: any, extra?: string[] }
): ReactNode => {
  return (<div>
    {icons[icon]}&nbsp;{msg}
    {tips ? (<ol style={cfgLoaderConfig.tipsTextStyle}>
      {renderTips(`${tips.error}`, tips.extra)}
    </ol>) : null}
  </div>)
}

/**
 * load config file
 * @param cfgPath config file path
 * @param modal status modal controller
 * @param globalDispatch global dispatch
 * @param noModal no modal flag
 */
const loadConfig = async (
  cfgPath: string,
  modal: SysCfgModalController,
  globalDispatch: (data: IGlobalReducerAction) => void,
  noModal: boolean = false
) => {
  try {
    const cfgJson = JSON.parse(await invoke('fs_read_text_file', { path: cfgPath }))
    //FIXME: 此处需要加入配置文件升级检查
    if (noModal) {
      globalDispatch({ type: 'u_config', payload: cfgJson })
      modal.destroy()
    } else {
      modal.show()
      modal.update({
        content: renderContent('配置文件更新成功', 'success'),
        footer: () => (<Button type='primary' onClick={() => {
          globalDispatch({ type: 'u_config', payload: cfgJson })
          modal.destroy()
        }}>确定</Button>)
      })
    }
  } catch (e) {
    console.log('I: SysConfig load failed,', e)
    modal.show()
    modal.update({
      content: renderContent('读取配置文件失败', 'error', { error: `${e}`, extra: ['如果您不知道如何解决这个问题, 请尝试重置配置'] }),
      footer: () => (<Space>
        <Button type='primary' danger onClick={
          () => resetConfig(cfgPath, modal, globalDispatch, true)
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

/**
 * reset config file
 * @param cfgPath config file path
 * @param modal status modal controller
 * @param globalDispatch global dispatch
 * @param hardReset hard reset flag, set true to delete config file before reset
 */
const resetConfig = async (
  cfgPath: string,
  modal: SysCfgModalController,
  globalDispatch: (data: IGlobalReducerAction) => void,
  hardReset: boolean = false
) => {
  modal.update({
    content: renderContent('正在重置配置文件...'),
    footer: null
  })
  setTimeout(async () => {
    try {
      if (hardReset && (await invoke('fs_exists', { path: cfgPath }))) await invoke('fs_remove_file', { path: cfgPath })
      await invoke('fs_write_text_file', { path: cfgPath, contents: JSON.stringify(defaultSysConfig, undefined, 2) })
      modal.update({
        content: renderContent('配置文件重置成功!', 'success'),
        footer: null
      })
      setTimeout(() => { loadConfig(cfgPath, modal, globalDispatch) }, cfgLoaderConfig.waitTime)
    } catch (e) {
      console.log('I: SysConfig reset failed,', e)
      modal.update({
        content: renderContent('重置配置文件失败', 'error', { error: `${e}`, extra: ['请尝试删除程序目录下的配置文件后重试'] }),
        footer: () => (<Button type='primary' onClick={() => exit(0)}>退出</Button>)
      })
    }
  }, cfgLoaderConfig.waitTime)
}

/**
 * make sysConfig status indicator modal
 * @param open is modal default open
 * @returns modal controller
 */
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

/**
 * useSysConfig: sysConfig management hook
 * @param globalData global state
 * @param globalDispatch global dispatch
 * @returns sysConfig & setSysConfig
 */
const useSysConfig = (
  globalData: IGlobalState,
  globalDispatch: (data: IGlobalReducerAction) => void
): {
  sysConfig: ISysConfig,
  setSysConfig: (config: ISysConfig) => void
} => {
  // load config
  useEffect(() => {
    if (!globalData.sysConfig) {
      const cfgPath = 'syscfg.json'
      const modal = makeSysConfigModal()
      loadConfig(cfgPath, modal, globalDispatch, true)
    }
  }, [globalData])
  // return sysConfig & setSysConfig
  return {
    sysConfig: globalData.sysConfig || defaultSysConfig,
    setSysConfig: (config: ISysConfig) => {
      globalDispatch!({ type: 'u_config', payload: config })
    }
  }
}

export {
  loadConfig,
  // saveConfig,
  makeSysConfigModal,
  resetConfig,
  useSysConfig,
}
export type {
  SysCfgModalController
}