import { forwardRef } from 'react'
import { QuickModal, QuickModalInst, QuickModalRef } from '../QuickModal'
import { Button, Space } from 'antd'

interface IProps {}

const baseCls = 'modal-settings'
const Content = forwardRef<QuickModalRef, IProps>((props, ref) => {
  /**
   * (ref as QuickModalInst)?.current.toggle(false)
   */

  return (<QuickModal
    title='设置'
    ref={ref}
  >
    <Space>
      SettingsModalRemake
    </Space>
  </QuickModal>)
})

Content.defaultProps = {}
Content.displayName = baseCls
export { Content as SettingsModal }
export type { IProps as SettingsModalProps }