import { App, Checkbox, Form, Input } from 'antd'
import { FlowConfig } from '@/types/flow'
import { MultiLangProps } from '@/types/mlang'
import { QuickModal, QuickModalInst, QuickModalRef } from '../Base'
import { WithConfigProps, WithRuntimeProps } from '@/types/common'
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { reverseFooter } from '@/utils/common'
import { useMultiLang } from '@/utils/mlang'
import './index.scss'

interface IProps extends MultiLangProps, WithConfigProps, WithRuntimeProps {
}

interface FlowConfigForm extends FlowConfig {
  option: string[]
}

const baseCls = 'modal-flow-update'
const Content = forwardRef<QuickModalRef, IProps>((props, ref) => {
  const { config, runtime } = props
  const { fmlText } = useMultiLang(config.state, baseCls, props.inheritName)
  const { message, modal } = App.useApp()
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const mRef = useRef<QuickModalRef>(null)

  useImperativeHandle(ref, () => ({
    toggle: (v?: boolean) => {
      if (v ?? true) {
        const info = runtime.state.flowInfo ?? {
          name: `TaskConfig${Date.now()}`
        }
        form.setFieldsValue({
          info,
          option: ['config']
        })
      }
      mRef.current?.toggle(v)
    }
  }))

  const onSave = async () => {
    try {
      setLoading(true)
      const res: FlowConfigForm = await form.validateFields()

      const config: FlowConfig = {
        info: res.info,
        flow: { tasks: runtime.state.tasks }
      }

      if (res.option?.includes('config')) {
        config.flow.config = runtime.state.config
      }

      const path = `flow/${config.info.name}.json`
      const exist = await invoke('fs_exists', { path })
      if (exist) {
        // This await is necessary, otherwise the program won't wait for the confirm result
        const confirm = await modal.confirm({
          title: fmlText('ow_cfm_title'),
          content: fmlText('ow_cfm_msg'),
          okText: fmlText('ow_cfm_ok'),
          okButtonProps: { danger: true },
          cancelText: fmlText('common:cancel'),
          footer: reverseFooter
        })
        if (!confirm) return
      }
      await invoke('fs_write_text_file', { path, contents: JSON.stringify(config) })
      runtime.set({ ...runtime.state, flowInfo: config.info })
      message.success(fmlText('flow_save_ok'))
      { (ref as QuickModalInst).current?.toggle(false) }
    } catch (e) {
      message.error(fmlText('flow_save_failed', `${e}`))
    } finally {
      setLoading(() => false)
    }
  }

  return (<QuickModal
    classNames={{ content: `${baseCls}-content`, body: `${baseCls}-body` }}
    closable={false}
    confirmLoading={loading}
    maskClosable={false}
    ref={mRef}
    title={fmlText('title')}
    wrapClassName={baseCls}
    onOk={onSave}
  >
    <Form
      name="saveFlow"
      labelCol={{ span: 5 }}
      form={form}
      autoComplete="off"
    >
      <Form.Item
        label={fmlText('flow_name')}
        name={["info", "name"]}
        rules={[{
          required: true,
          message: fmlText('name_require'),
        }, {
          pattern: /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/,
          message: fmlText('name_pattern')
        }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label={fmlText('flow_desc')}
        name={["info", "desc"]}
      >
        <Input.TextArea autoSize={{ minRows: 4, maxRows: 6 }} maxLength={500} showCount />
      </Form.Item>
      <Form.Item
        label={fmlText('flow_opt')}
        name="option"
      >
        <Checkbox.Group
          options={[{
            label: fmlText('opt_basecfg'),
            value: 'config'
          }]}
        />
      </Form.Item>
    </Form>
  </QuickModal>)
})

Content.defaultProps = {}
Content.displayName = baseCls
export { Content as FlowUpdateModal }
export type { IProps as FlowUpdateModalProps }