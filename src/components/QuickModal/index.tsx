import { useState, forwardRef, useImperativeHandle, MutableRefObject } from 'react'
import { Modal, ModalProps } from 'antd'
import './index.scss'

type ContentRef = {
  toggle: (visible?: boolean) => void
}

type ContentInst = MutableRefObject<ContentRef>

interface ContentProps extends ModalProps {}

const baseCls = 'quick-modal'
const Content = forwardRef<ContentRef, ContentProps>((props, ref) => {
  const [visible, setVisible] = useState(false)

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
      okText='确定'
      cancelText='取消'
      onCancel={() => toggleModalVisible(false)}
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