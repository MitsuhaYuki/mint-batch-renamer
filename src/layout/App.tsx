import { App, ConfigProvider } from 'antd'
import { ConfigContext, configInitState, configReducer } from '@/context/config'
import { ConsoleContext, consoleInitState, consoleReducer } from '@/context/console'
import { Entrance } from './main'
import { FC, useEffect, useReducer } from 'react'
import { RuntimeContext, runtimeInitState, runtimeReducer } from '@/context/runtime'
import { SysUtilContext, SysUtilInitValue } from '@/context/sysutil'
import { useKeyPress, useMount } from 'ahooks'
import { useMultiLangLoader } from '@/utils/mlang'
import { useSysConfig } from '@/utils/syscfg'
import { useSystemTaskRunner } from '@/utils/runners/common'
import './App.scss'
import { invoke } from '@tauri-apps/api/tauri'

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

  const sysboot = async () => {
    // Disable context menu
    if (process.env.NODE_ENV === 'development') {
      console.log('DevMode: dev only features are enabled.')
    } else {
      document.addEventListener('contextmenu', e => {
        e.preventDefault()
        return false
      }, { capture: true })
      document.addEventListener('selectstart', e => {
        e.preventDefault()
        return false
      }, { capture: true })
    }
    // Wait for resources ready
    await document.fonts.ready
    // Close splashscreen
    setTimeout(() => invoke('close_splashscreen'), 500)
    // Stop loading animation
    document.querySelector('#root-loading-screen')?.classList.add('elem-fade-out')
    setTimeout(() => {
      document.querySelector('#root-loading-screen')?.classList.add('elem-hidden')
      window.postMessage({ type: 'STOP_ANIME' })
    }, 500)
  }

  // check boot up status
  useMount(() => sysboot())

  // disable keyboard shortcut(reserve ctrl + f5 shortcut)
  useKeyPress('f5', e => {
    if (process.env.NODE_ENV !== 'development') {
      e.preventDefault()
      e.stopPropagation()
    }
  }, { exactMatch: true })

  // check system rendering config
  useEffect(() => {
    if (configState.system?.font) {
      if (configState.system.font.enable) {
        const styleEl = document.querySelector('style[aria-label="mint-font-blocker"]')
        styleEl?.remove()
        if (configState.system.font.bolder) {
          if (document.querySelector('style[aria-label="mint-font-bolder"]')) return
          const styleEl = document.createElement('style')
          styleEl.ariaLabel = 'mint-font-bolder'
          styleEl.innerHTML = `
@font-face {
  font-family: "lxgw-wenkai";
  src: url('fonts/LXGWWenKaiLite-Bold.woff2');
  font-weight: 400 600;
}
@font-face {
  font-family: "lxgw-wenkai-mono";
  src: url('fonts/LXGWWenKaiMonoLite-Bold.woff2');
  font-weight: 400 600;
}`
          document.body.appendChild(styleEl)
        } else {
          const styleEl = document.querySelector('style[aria-label="mint-font-bolder"]')
          styleEl?.remove()
        }
      } else {
        if (document.querySelector('style[aria-label="mint-font-blocker"]')) return
        const styleEl = document.createElement('style')
        styleEl.ariaLabel = 'mint-font-blocker'
        styleEl.innerHTML = "* {font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'}"
        document.body.appendChild(styleEl)
      }
    }
  }, [configState.system])

  return (
    <ConfigProvider autoInsertSpaceInButton={false}>
      <SysUtilContext.Provider value={SysUtilInitValue}>
        <ConfigContext.Provider value={{ state: configState, dispatch: configDispatch }}>
          <ConsoleContext.Provider value={{ state: consoleState, dispatch: consoleDispatch }}>
            <RuntimeContext.Provider value={{ state: runtimeState, dispatch: runtimeDispatch }}>
              <App className={baseCls} message={{ duration: 2, maxCount: 3 }}>
                <Entrance />
              </App>
            </RuntimeContext.Provider>
          </ConsoleContext.Provider>
        </ConfigContext.Provider>
      </SysUtilContext.Provider>
    </ConfigProvider>
  )
}

Content.defaultProps = {}
Content.displayName = baseCls
export { Content as App }