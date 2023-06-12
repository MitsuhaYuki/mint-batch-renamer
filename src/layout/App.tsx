import { FC, useReducer } from 'react'
import {
  initState as globalInitState,
  reducer as globalReducer,
  Context as GlobalContext
} from '@/context/global'
import {
  initState as consoleInitState,
  reducer as consoleReducer,
  Context as ConsoleContext
} from '@/context/console'
import { useConfigLoader } from '@/utils/config'
import zhCN from 'antd/locale/zh_CN'
import MainPage from './main'
import './App.scss'
import { ConfigProvider } from 'antd'
import { useMount } from 'ahooks'

const baseCls = 'app'
const App: FC = () => {
  // initialize all context
  const [globalState, globalDispatch] = useReducer(globalReducer, globalInitState)
  const [consoleState, consoleDispatch] = useReducer(consoleReducer, consoleInitState)

  // check & load config file
  useConfigLoader(globalState, globalDispatch)

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