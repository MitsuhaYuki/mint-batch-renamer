import { Button, ButtonProps } from 'antd'
import { IConfigReducerActionType, useConfigContext } from '@/context/config'
import { IConsoleReducerActionType, useConsoleContext } from '@/context/console'
import { IRuntimeReducerActionType, useRuntimeContext } from '@/context/runtime'
import { QuickModal, QuickModalInst, QuickModalRef } from '../QuickModal'
import { forwardRef } from 'react'
import { useKeyPress } from 'ahooks'
import './index.scss'

interface IProps {}

const baseCls = 'modal-dev'
const Content = forwardRef<QuickModalRef, IProps>((props, ref) => {
  const [config, setConfig] = useConfigContext()
  const [runtime, setRuntime] = useRuntimeContext()
  const [con, setConsole] = useConsoleContext()

  // dev panel access method
  useKeyPress(['ctrl.f10'], () => {
    console.log('I: language is change to', config.system?.lang === 'zh-CN' ? 'en-US' : 'zh-CN')
    setConfig('u_system', {
      ...config.system,
      lang: config.system?.lang === 'zh-CN' ? 'en-US' : 'zh-CN'
    })
  }, {
    exactMatch: true,
  })

  useKeyPress(['ctrl.f11'], () => {
    console.log('I: con', con, 'config', config, 'runtime', runtime)
  }, {
    exactMatch: true,
  })

  /* Quick Modal Tester */
  const testQuickModal = (type: 'hide') => {
    switch (type) {
      case 'hide': {
        (ref as QuickModalInst)?.current.toggle(false)
        break
      }
      default:
        console.warn('I: testQuickModal type not found')
        break
    }
  }

  /* Config Context Tester */
  const testConfigContext = (type: IConfigReducerActionType) => {
    switch (type) {
      case 'internal': {
        console.log('I: ConfigContext', config)
        break
      }
      case 'd_system': {
        setConfig('d_system')
        break
      }
      case 'd_langs': {
        setConfig('d_langs')
        break
      }
      case 'reset': {
        setConfig('reset')
        break
      }
      default:
        console.warn('I: testConfigContext type not found')
        break
    }
  }

  /* Console Context Tester */
  const testConsoleContext = (type: IConsoleReducerActionType) => {
    switch (type) {
      case 'internal': {
        console.log('I: ConsoleContext', con)
        break
      }
      case 'd_log': {
        setConsole('d_log')
        break
      }
      case 'reset': {
        setConsole('reset')
        break
      }
      default:
        console.warn('I: testConfigContext type not found')
        break
    }
  }

  /* Runtime Context Tester */
  const testRuntimeContext = (type: IRuntimeReducerActionType) => {
    switch (type) {
      case 'internal': {
        console.log('I: RuntimeContext', runtime)
        break
      }
      case 'reset': {
        setConsole('reset')
        break
      }
      default:
        console.warn('I: testRuntimeContext type not found')
        break
    }
  }

  const DevBtn = (props: ButtonProps) => <Button type='primary' size='small' ghost {...props} />

  return (
    <QuickModal
      title='Developer Tools'
      focusTriggerAfterClose={false}
      footer={null}
      maskClosable={false}
      width={640}
      wrapClassName={baseCls}
      ref={ref}
    >
      <div className={`${baseCls}-content`}>
        <div className={`${baseCls}-section`}>
          <div className={`${baseCls}-section-title`}>ConfigContext</div>
          <div className={`${baseCls}-section-item`}>
            <DevBtn onClick={() => testConfigContext('internal')}>internal</DevBtn>
            <DevBtn onClick={() => testConfigContext('d_system')}>d_system</DevBtn>
            <DevBtn onClick={() => testConfigContext('d_langs')}>d_langs</DevBtn>
            <DevBtn onClick={() => testConfigContext('reset')}>reset</DevBtn>
          </div>
        </div>
        <div className={`${baseCls}-section`}>
          <div className={`${baseCls}-section-title`}>ConsoleContext</div>
          <div className={`${baseCls}-section-item`}>
            <DevBtn onClick={() => testConsoleContext('internal')}>internal</DevBtn>
            <DevBtn onClick={() => testConsoleContext('d_log')}>d_log</DevBtn>
            <DevBtn onClick={() => testConsoleContext('reset')}>reset</DevBtn>
          </div>
        </div>
        <div className={`${baseCls}-section`}>
          <div className={`${baseCls}-section-title`}>RuntimeContext</div>
          <div className={`${baseCls}-section-item`}>
            <DevBtn onClick={() => testRuntimeContext('internal')}>internal</DevBtn>
            <DevBtn onClick={() => testRuntimeContext('reset')}>reset</DevBtn>
          </div>
        </div>
        <div className={`${baseCls}-section`}>
          <div className={`${baseCls}-section-title`}>QuickModal</div>
          <div className={`${baseCls}-section-item`}>
            <DevBtn onClick={() => testQuickModal('hide')}>hide</DevBtn>
          </div>
        </div>
      </div>
    </QuickModal>
  )
})

Content.defaultProps = {}
Content.displayName = baseCls
export {
  Content as DevModal
}