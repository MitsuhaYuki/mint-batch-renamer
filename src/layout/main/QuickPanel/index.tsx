import SettingsModal, { SettingsModalRef } from '@/components/SettingsModal'
import useGlobalData from '@/utils/hooks/useGlobalData'
import useLogger from '@/utils/logger'
import { Button } from 'antd'
import { CodeOutlined, SettingFilled, SettingOutlined } from '@ant-design/icons'
import { DevModal } from '@/components/DevModal'
import { FC, useMemo, useRef } from 'react'
import { QuickModalRef } from '@/components/QuickModal'
import { ScriptBrowser, ScriptBrowserRef } from '@/components/ScriptBrowser'
import { SettingsModal as SM2 } from '@/components/SettingsModalRemake'
import { useKeyPress } from 'ahooks'
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
  // develop test modal
  const devModalRef = useRef<QuickModalRef>(null)
  // settings modal rename
  const SM2Ref = useRef<QuickModalRef>(null)

  // dev panel access method
  useKeyPress(['ctrl.f12'], () => {
    logger.warn('Open dev panel')
    devModalRef.current?.toggle(true)
  }, {
    exactMatch: true,
  })

  const quickBtns = useMemo(() => {
    const iconCls = `${baseCls}-bar-icon`
    return [{
      icon: <CodeOutlined className={iconCls} title='Script Browser' />,
      hidden: !(globalData.config.allow_external_filters || globalData.config.allow_external_renamers),
      onClick () { scriptBrowserRef.current?.toggle(true) }
    }, {
      icon: <SettingOutlined className={iconCls} title='Settings' />,
      onClick () { settingsModalRef.current?.toggle(true) }
    }, {
      icon: <SettingFilled className={iconCls} title='Settings Remake' />,
      onClick () { SM2Ref.current?.toggle(true) }
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
    <SM2 ref={SM2Ref} />
  </div>)
}

Content.defaultProps = {}
Content.displayName = baseCls
export default Content