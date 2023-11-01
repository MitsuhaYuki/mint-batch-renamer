import { Modal, ModalProps } from 'antd'
import { MultiLangProps } from '@/types/mlang'
import { reverseFooter } from '@/utils/common'
import { useMultiLangWrapped } from '@/utils/mlang'
import { useState, forwardRef, useImperativeHandle, MutableRefObject } from 'react'

type ContentRef = {
  toggle: (visible?: boolean) => void
}

type ContentInst = MutableRefObject<ContentRef>

interface ContentProps extends ModalProps, MultiLangProps {}

const baseCls = 'modal-quick'
const Content = forwardRef<ContentRef, ContentProps>((props, ref) => {
  const [visible, setVisible] = useState(false)
  const { fmlText } = useMultiLangWrapped(baseCls, props.inheritName)

  useImperativeHandle(ref, () => ({
    toggle: toggleModalVisible
  }))

  const toggleModalVisible = (visible?: boolean) => {
    setVisible(s => visible ?? !s)
  }

  return (
    <Modal
      title="Modal"
      open={visible}
      okText={fmlText('common:confirm')}
      cancelText={fmlText('common:cancel')}
      onCancel={() => toggleModalVisible(false)}
      footer={reverseFooter}
      {...props}
    />
  )
})

Content.defaultProps = {}
Content.displayName = baseCls
export { Content as QuickModal }
export type {
  ContentInst as QuickModalInst,
  ContentProps as QuickModalProps,
  ContentRef as QuickModalRef,
}