import { FC, useMemo, useRef } from 'react'
import DevModal, { DevModalRef } from '@/common/DevModal'
import { ScriptBrowser, ScriptBrowserRef } from '@/common/ScriptBrowser'
import SettingsModal, { SettingsModalRef } from '@/common/SettingsModal'
import useGlobalData from '@/utils/hooks/useGlobalData'
import useLogger from '@/utils/logger'
import { Button } from 'antd'
import { CodeOutlined, SettingOutlined } from '@ant-design/icons'
import { useLongPress } from 'ahooks'
import './index.scss'

export type ContentProps = {
  example?: any
}
const baseCls = 'quick-access'
const Content: FC<ContentProps> = (props) => {
  // global data
  const { globalData, setGlobalData } = useGlobalData()
  // logger
  const { logger } = useLogger()
  // settings modal
  const settingsModalRef = useRef<SettingsModalRef>(null)
  // script browser
  const scriptBrowserRef = useRef<ScriptBrowserRef>(null)
  // settings button
  const settingsBtnRef = useRef<any>(null)
  // develop test modal
  const devModalRef = useRef<DevModalRef>(null)

  // dev panel access method
  useLongPress(() => {
    logger.warn('Open dev panel')
    devModalRef.current?.toggle(true)
  }, settingsBtnRef, {
    delay: 1000,
    moveThreshold: { x: 20, y: 20 }
  })

  const quickBtns = useMemo(() => {
    const iconCls = `${baseCls}-bar-icon`
    return [{
      icon: <CodeOutlined className={iconCls} title='Script Browser' />,
      hidden: !(globalData.config.allow_external_filters || globalData.config.allow_external_renamers),
      onClick () { scriptBrowserRef.current?.toggle(true) }
    }, {
      icon: <SettingOutlined className={iconCls} title='Settings' />,
      ref: settingsBtnRef,
      onClick () { settingsModalRef.current?.toggle(true) }
    }]
  }, [globalData.config])

  return (<div className={baseCls}>
    <div className={`${baseCls}-bar`}>{
      quickBtns.map((btn, index) => <Button key={index} shape='circle' type='text' {...btn} />)
    }</div>
    <DevModal ref={devModalRef} />
    <SettingsModal ref={settingsModalRef} />
    <ScriptBrowser
      ref={scriptBrowserRef}
      logger={logger}
      globalData={globalData}
      setGlobalData={setGlobalData}
    />
  </div>)
}

Content.defaultProps = {}
Content.displayName = baseCls
export default Content