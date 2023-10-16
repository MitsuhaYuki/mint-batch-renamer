import { Entrance } from './main'
import zhCN from 'antd/locale/zh_CN'
import { App, ConfigProvider } from 'antd'
import { ConsoleContext, consoleInitState, consoleReducer } from '@/context/console'
import { FC, useReducer } from 'react'
import { GlobalContext, IGlobalReducerAction, IGlobalState, globalInitState, globalReducer } from '@/context/global'
import { useConfigLoader } from '@/utils/config'
import { useExternalScriptLoader } from '@/utils/extension'
import { useMount } from 'ahooks'
import './App.scss'
import { useSysConfig } from '@/utils/syscfg'
import { useTauriEvent } from '@/utils/tauri'
import { ConfigContext, configInitState, configReducer } from '@/context/config'

const baseCls = 'app'
const Content: FC = () => {
  // initialize all context
  const [globalState, globalDispatch] = useReducer(globalReducer, globalInitState)
  const [consoleState, consoleDispatch] = useReducer(consoleReducer, consoleInitState)

  // check & load config file
  useConfigLoader(globalState, globalDispatch)
  useExternalScriptLoader(globalState, globalDispatch, consoleState, consoleDispatch)

  // Listen to tauri event
  useTauriEvent(globalState, globalDispatch)

  /* UPDATE - NEW SEASON */
  // initialize config context
  const [configState, configDispatch] = useReducer(configReducer, configInitState)

  // check & load config file
  useSysConfig(configState, configDispatch)

  // hide loading screen
  useMount(() => {
    document.querySelector('#root-loading-screen')?.classList.add('elem-fade-out')
    setTimeout(() => {
      document.querySelector('#root-loading-screen')?.classList.add('elem-hidden')
      window.postMessage({ type: 'STOP_ANIME' })
    }, 500)
  })

  return (
    <ConfigProvider autoInsertSpaceInButton={false} locale={zhCN}>
      <ConfigContext.Provider value={{ state: configState, dispatch: configDispatch }}>
        <GlobalContext.Provider value={{ state: globalState, dispatch: globalDispatch }}>
          <ConsoleContext.Provider value={{ state: consoleState, dispatch: consoleDispatch }}>
            <App className={baseCls}>
              <Entrance />
            </App>
          </ConsoleContext.Provider>
        </GlobalContext.Provider>
      </ConfigContext.Provider>
    </ConfigProvider>
  )
}

Content.defaultProps = {}
Content.displayName = baseCls
export { Content as App }