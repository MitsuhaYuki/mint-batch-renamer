import useGlobalData from '@/utils/hooks/useGlobalData'
import { Button, ButtonProps } from 'antd'
import { IConfigReducerActionType, useConfigContext } from '@/context/config'
import { IGlobalReducerActionType } from '@/context/global'
import { QuickModal, QuickModalInst, QuickModalRef } from '../QuickModal'
import { forwardRef } from 'react'
import './index.scss'

interface IProps {}

const baseCls = 'modal-dev'
const Content = forwardRef<QuickModalRef, IProps>((props, ref) => {
  const { globalData, setGlobalData } = useGlobalData()
  const [config, setConfig] = useConfigContext()

  /* Config Context Tester */
  const testGlobalData = (type: IGlobalReducerActionType) => {
    switch (type) {
      case 'internal': {
        console.log('I: GlobalData', globalData)
        break
      }
      case 'reset': {
        setGlobalData('reset')
        break
      }
      default:
        console.warn('I: testGlobalData type not found')
        break
    }
  }

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

  /* [Deprecated] Global Data Tester */
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
      case 'reset': {
        setConfig('reset')
        break
      }
      default:
        console.warn('I: testConfigContext type not found')
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
            <DevBtn onClick={() => testConfigContext('reset')}>reset</DevBtn>
          </div>
        </div>
        <div className={`${baseCls}-section`}>
          <div className={`${baseCls}-section-title`}>GlobalData</div>
          <div className={`${baseCls}-section-item`}>
            <DevBtn onClick={() => testGlobalData('internal')}>internal</DevBtn>
            <DevBtn onClick={() => testGlobalData('reset')}>reset</DevBtn>
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