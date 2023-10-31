import { App, Checkbox, Form, Input } from 'antd'
import { Children, cloneElement, forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { FlowConfig } from '@/types/flow'
import { MultiLangProps } from '@/types/mlang'
import { QuickModal, QuickModalInst, QuickModalRef } from '../Base'
import { WithConfigProps, WithRuntimeProps } from '@/types/common'
import { invoke } from '@tauri-apps/api/tauri'
import { useMultiLang } from '@/utils/mlang'
import './index.scss'

interface IProps extends MultiLangProps, WithConfigProps, WithRuntimeProps {
}

interface FlowConfigForm extends FlowConfig {
  option: string[]
}

const baseCls = 'modal-flow-manage'
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
          title: '提示',
          content: '该流程已存在，是否覆盖？',
          okText: '覆盖',
          okButtonProps: {
            danger: true
          },
          cancelText: '取消',
          footer: (i: any) => cloneElement(i, {
            children: Children.toArray(i.props.children).reverse()
          })
        })
        if (!confirm) return
      }
      await invoke('fs_write_text_file', { path, contents: JSON.stringify(config) })
      runtime.set({ ...runtime.state, flowInfo: config.info })
      message.success('保存流程成功')
      { (ref as QuickModalInst).current?.toggle(false) }
    } catch (e) {
      message.error(`保存流程失败: ${e}`)
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
    title={'保存流程'}
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
        label="流程名"
        name={["info", "name"]}
        rules={[{
          required: true,
          message: '必须输入流程名',
        }, {
          pattern: /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/,
          message: '流程名称只能由中文、英文、数字和 _ 构成'
        }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="流程描述"
        name={["info", "desc"]}
      >
        <Input.TextArea autoSize={{ minRows: 4, maxRows: 6 }} maxLength={500} showCount />
      </Form.Item>
      <Form.Item
        label="导出选项"
        name="option"
      >
        <Checkbox.Group
          options={[{
            label: '包含基础设置',
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