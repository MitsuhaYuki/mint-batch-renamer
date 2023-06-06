import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import useGlobalData from '@/utils/hooks/useGlobalData'
import { Form, InputNumber, Modal, message } from 'antd'
import { saveConfig } from '@/utils/config'
import './index.scss'

type ContentRef = {
  toggle: (visible?: boolean) => void
}

type ContentProps = {
  exampleprop?: any
}

export type {
  ContentRef as SettingsModalRef,
  ContentProps as SettingsModalProps
}

const baseCls = 'settings-modal'
const Content = forwardRef<ContentRef, ContentProps>((props, ref) => {
  const { globalData, setGlobalData } = useGlobalData()
  // modal visible status
  const [visible, setVisible] = useState(false)
  // is confirm button loading
  const [confirmLoading, setConfirmLoading] = useState(false)
  // config form instance
  const [form] = Form.useForm()

  useImperativeHandle(ref, () => ({
    toggle: toggleModalVisible
  }))

  const toggleModalVisible = (visible?: boolean) => {
    setVisible(s => visible ?? !s)
  }

  const handleOk = async () => {
    setConfirmLoading(true)
    Modal.confirm({
      title: '注意',
      content: '确认保存设置?',
      autoFocusButton: null,
      focusTriggerAfterClose: false,
      onCancel () {
        setConfirmLoading(false)
      },
      onOk: async () => {
        const currentConfig = form.getFieldsValue()
        const saveConfigStatus = await saveConfig(currentConfig)
        if (saveConfigStatus === 'ok') {
          setGlobalData({ config: currentConfig })
          setConfirmLoading(false)
          setVisible(false)
        } else {
          message.error(`保存失败(${saveConfigStatus})`, 5)
          // logger.error(`Save config failed: ${saveConfigStatus}`)
          setConfirmLoading(false)
        }
      }
    })
  }

  const handleCancel = () => {
    // if has changed settings, prompt user to confirm ignore changes
    // reload content from globalData
    console.log('I: message')
    setVisible(false)
  }

  // life cycle
  useEffect(() => {
    if (visible) {
      form.setFieldsValue(globalData.config)
    }
  }, [visible])

  return (
    <Modal
      title='设置'
      confirmLoading={confirmLoading}
      closable={false}
      focusTriggerAfterClose={false}
      maskClosable={false}
      okText='保存设置'
      open={visible}
      width={640}
      wrapClassName={baseCls}
      onCancel={handleCancel}
      onOk={handleOk}
    >
      <div className={`${baseCls}-content`}>
        <Form
          form={form}
          autoComplete="off"
        >
          <Form.Item
            label="最大处理文件数"
            name="max_file_limit"
            tooltip="设置最大处理文件数，过大可能导致系统无响应。"
            rules={[{ required: true, message: '请输入此项!' }]}
          >
            <InputNumber controls={false} min={2000} step={100} />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  )
})

Content.defaultProps = {}
Content.displayName = baseCls
export default Content