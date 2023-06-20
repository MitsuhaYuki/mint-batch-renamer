import MainPage from './main'
import zhCN from 'antd/locale/zh_CN'
import { ConfigProvider } from 'antd'
import { ConsoleContext, consoleInitState, consoleReducer } from '@/context/console'
import { FC, useReducer } from 'react'
import { GlobalContext, globalInitState, globalReducer } from '@/context/global'
import { useConfigLoader } from '@/utils/config'
import { useExternalScriptLoader } from '@/utils/extension'
import { useMount } from 'ahooks'
import './App.scss'

const baseCls = 'app'
const App: FC = () => {
  // initialize all context
  const [globalState, globalDispatch] = useReducer(globalReducer, globalInitState)
  const [consoleState, consoleDispatch] = useReducer(consoleReducer, consoleInitState)

  // check & load config file
  useConfigLoader(globalState, globalDispatch)
  useExternalScriptLoader(globalState, globalDispatch, consoleState, consoleDispatch)

  // hide loading screen
  useMount(() => {
    document.querySelector('#root-loading-screen')?.classList.add('elem-fade-out')
    setTimeout(() => {
      document.querySelector('#root-loading-screen')?.classList.add('elem-hidden')
    }, 500)
  })

  return (
    <ConfigProvider autoInsertSpaceInButton={false} locale={zhCN}>
      <GlobalContext.Provider value={{ state: globalState, dispatch: globalDispatch }}>
        <ConsoleContext.Provider value={{ state: consoleState, dispatch: consoleDispatch }}>
          <div className={baseCls}>
            <MainPage />
          </div>
        </ConsoleContext.Provider>
      </GlobalContext.Provider>
    </ConfigProvider>
  )
}

App.defaultProps = {}
App.displayName = baseCls
export default App