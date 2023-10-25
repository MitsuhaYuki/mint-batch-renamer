import { App, ConfigProvider } from 'antd'
import { ConfigContext, configInitState, configReducer } from '@/context/config'
import { ConsoleContext, consoleInitState, consoleReducer } from '@/context/console'
import { Entrance } from './main'
import { FC, useReducer } from 'react'
import { RuntimeContext, runtimeInitState, runtimeReducer } from '@/context/runtime'
import { useMount } from 'ahooks'
import { useMultiLangLoader } from '@/utils/mlang'
import { useSysConfig } from '@/utils/syscfg'
import { useSystemTaskRunner } from '@/utils/runners/common'
import './App.scss'

const baseCls = 'app'
const Content: FC = () => {
  // initialize config context
  const [configState, configDispatch] = useReducer(configReducer, configInitState)
  const [consoleState, consoleDispatch] = useReducer(consoleReducer, consoleInitState)
  const [runtimeState, runtimeDispatch] = useReducer(runtimeReducer, runtimeInitState)

  // check & load essential data
  useSysConfig(configState, configDispatch)
  useMultiLangLoader(configState, configDispatch)
  useSystemTaskRunner(runtimeState, runtimeDispatch)

  // hide loading screen
  useMount(() => {
    setTimeout(() => {
      document.querySelector('#root-loading-screen')?.classList.add('elem-fade-out')
      setTimeout(() => {
        document.querySelector('#root-loading-screen')?.classList.add('elem-hidden')
        window.postMessage({ type: 'STOP_ANIME' })
      }, 500)
    }, 100)
  })

  return (
    <ConfigProvider autoInsertSpaceInButton={false}>
      <ConfigContext.Provider value={{ state: configState, dispatch: configDispatch }}>
        <ConsoleContext.Provider value={{ state: consoleState, dispatch: consoleDispatch }}>
          <RuntimeContext.Provider value={{ state: runtimeState, dispatch: runtimeDispatch }}>
            <App className={baseCls}>
              <Entrance />
            </App>
          </RuntimeContext.Provider>
        </ConsoleContext.Provider>
      </ConfigContext.Provider>
    </ConfigProvider>
  )
}

Content.defaultProps = {}
Content.displayName = baseCls
export { Content as App }