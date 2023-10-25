import { Button, Form, Input, InputNumber, Modal, Radio, Select, Space, Switch } from 'antd'
import { ConfigContext } from '@/context/config'
import { ISysConfig } from '@/types/syscfg'
import { QuickModal, QuickModalInst, QuickModalRef } from '../QuickModal'
import { forwardRef, useContext, useImperativeHandle, useMemo, useRef } from 'react'
import { langs, useMultiLang } from '@/utils/mlang'
import { makeSysConfigModal, saveConfig } from '@/utils/syscfg'
import { useLockFn } from 'ahooks'
import './index.scss'
import { MultiLangProps } from '@/types/mlang'

interface IProps extends MultiLangProps {}

const baseCls = 'modal-settings'
const Content = forwardRef<QuickModalRef, IProps>((props, ref) => {
  const { state, dispatch } = useContext(ConfigContext)
  const { fmlText } = useMultiLang(state, baseCls, props.inheritName)
  const { system } = state
  const titleRef = useRef<HTMLSpanElement>(null)
  const [form] = Form.useForm()
  const mRef = useRef<QuickModalRef>(null)

  const languageOptions = useMemo(() => {
    return Object.entries(langs).map(([key, value]) => ({
      value: key,
      label: value.name
    }))
  }, [])

  useImperativeHandle(ref, () => ({
    toggle: (visible?: boolean) => {
      if (visible) form.setFieldsValue(system)
      mRef.current?.toggle(visible)
    }
  }))

  const onOk = useLockFn(async () => {
    let formValues: ISysConfig
    try {
      formValues = await form.validateFields()
    } catch (error) {
      console.log('Failed:', error)
      return
    }
    console.log('Success:', formValues)
    const modal = makeSysConfigModal()
    await saveConfig(formValues, modal)
    modal.destroy()
    dispatch({ type: 'u_system', payload: formValues });
    (ref as QuickModalInst)?.current.toggle(false)
  })

  const renderTitle = useMemo(() => {
    return (<span className={`${baseCls}-title`} ref={titleRef}>
      <span className={`${baseCls}-title-text`}>{fmlText('title')}</span>
      <span className={`${baseCls}-title-ver`}>Ver {system?.cfg_ver}</span>
      <span className={`${baseCls}-title-btns`}>
        <Button size='small' type='text' onClick={() => {
          Modal.info({
            title: fmlText('raw_title'),
            content: (<pre>
              {JSON.stringify(system, undefined, 2)}
            </pre>),
            closable: true,
            footer: null,
            maskClosable: true,
            wrapClassName: `${baseCls}-raw`,
            getContainer: () => titleRef.current || document.body,
          })
        }}>{fmlText('raw')}</Button>
      </span>
    </span>)
  }, [state.langs, system?.cfg_ver])

  return (<QuickModal
    classNames={{ body: `${baseCls}-body` }}
    title={renderTitle}
    ref={mRef}
    footer={() => (
      <Space>
        <Button type='primary' onClick={onOk}>{fmlText('save')}</Button>
        <Button onClick={() => (ref as QuickModalInst)?.current.toggle(false)}>{fmlText('common:cancel')}</Button>
      </Space>
    )}
  >
    <Form
      autoComplete="off"
      form={form}
      initialValues={system}
      labelCol={{ span: 6 }}
      labelWrap={true}
      name="sys_cfg"
      requiredMark={false}
      colon={false}
    >
      <Form.Item<ISysConfig>
        hidden
        label={fmlText('cfg_ver')}
        name="cfg_ver"
        rules={[{ required: true, message: fmlText('common:form_tips_required') }]}
      >
        <Input disabled />
      </Form.Item>
      <Form.Item<ISysConfig>
        label={fmlText('cfg_lang')}
        name="lang"
        rules={[{ required: true, message: fmlText('common:form_tips_required') }]}
      >
        <Select
          style={{ width: 120 }}
          options={languageOptions}
        />
      </Form.Item>
      <Form.Item label={fmlText('cfg_limit')} style={{ marginBottom: 0 }}>
        <Space>
          <Form.Item
            className={`${baseCls}-label-sm`}
            tooltip={fmlText('cfg_limit_max_tips')}
            label={fmlText('cfg_limit_max')}
          />
          <Form.Item<ISysConfig>
            name={["limit", "max"]}
            style={{ display: 'inline-block' }}
            rules={[{ required: true, message: fmlText('common:form_tips_required') }]}
          >
            <InputNumber min={0} max={10000000} controls={false} keyboard={false} />
          </Form.Item>
          <Form.Item
            className={`${baseCls}-label-sm`}
            tooltip={fmlText('cfg_limit_warn_tips')}
            label={fmlText('cfg_limit_warn')}
          />
          <Form.Item<ISysConfig>
            name={["limit", "warn"]}
            style={{ display: 'inline-block' }}
            rules={[{ required: true, message: fmlText('common:form_tips_required') }]}
          >
            <InputNumber min={0} max={10000000} controls={false} keyboard={false} />
          </Form.Item>
        </Space>
      </Form.Item>
      <Form.Item<ISysConfig>
        label={fmlText('cfg_fsn')}
        name="follow_step_name"
        tooltip={fmlText('cfg_fsn_tips')}
        rules={[{ required: true, message: fmlText('common:form_tips_required') }]}
      >
        <Radio.Group>
          <Radio value={true}>{fmlText('common:yes')}</Radio>
          <Radio value={false}>{fmlText('common:no')}</Radio>
        </Radio.Group>
      </Form.Item>
    </Form>
  </QuickModal>)
})

Content.defaultProps = {}
Content.displayName = baseCls
export { Content as SettingsModal }
export type { IProps as SettingsModalProps }