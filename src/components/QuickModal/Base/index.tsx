import { useState, forwardRef, useImperativeHandle, MutableRefObject, Children, cloneElement, ReactElement } from 'react'
import { Modal, ModalProps } from 'antd'
import { MultiLangProps } from '@/types/mlang'
import { useMultiLangWrapped } from '@/utils/mlang'
import './index.scss'

type ContentRef = {
  toggle: (visible?: boolean) => void
}

type ContentInst = MutableRefObject<ContentRef>

interface ContentProps extends ModalProps, MultiLangProps {}

const baseCls = 'quick-modal'
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
      footer={(i: any) => cloneElement(i, {
        children: Children.toArray(i.props.children).reverse()
      })}
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