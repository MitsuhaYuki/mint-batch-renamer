import { Button, Form, Input, InputNumber, Modal, Radio, Select, Space, Switch } from 'antd'
import { ConfigContext } from '@/context/config'
import { ISysConfig } from '@/types/syscfg'
import { MultiLangProps } from '@/types/mlang'
import { QuickModal, QuickModalInst, QuickModalRef } from '../Base'
import { forwardRef, useContext, useImperativeHandle, useMemo, useRef } from 'react'
import { langs, useMultiLang } from '@/utils/mlang'
import { makeSysConfigModal, saveConfig } from '@/utils/syscfg'
import { useLockFn } from 'ahooks'
import './index.scss'

interface IProps extends MultiLangProps {}

const baseCls = 'modal-settings'
const Content = forwardRef<QuickModalRef, IProps>((props, ref) => {
  const { state, dispatch } = useContext(ConfigContext)
  const { fmlText } = useMultiLang(state, baseCls, props.inheritName)
  const { system } = state
  const titleRef = useRef<HTMLSpanElement>(null)
  const mRef = useRef<QuickModalRef>(null)
  // settings form
  const [form] = Form.useForm()
  const fontEnable = Form.useWatch(['font', 'enable'], form)

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
    } catch (e) {
      return
    }
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
        rules={[{ required: true, message: fmlText('field_required') }]}
      >
        <Input disabled />
      </Form.Item>
      <Form.Item<ISysConfig>
        label={fmlText('cfg_lang')}
        name="lang"
        rules={[{ required: true, message: fmlText('field_required') }]}
      >
        <Select
          style={{ width: 120 }}
          options={languageOptions}
        />
      </Form.Item>
      <Form.Item label={fmlText('cfg_limit')} style={{ marginBottom: 0 }}>
        <Space>
          <Form.Item<ISysConfig>
            label={fmlText('cfg_limit_max')}
            name={["limit", "max"]}
            className={`${baseCls}-label-sm`}
            tooltip={fmlText('cfg_limit_max_tips')}
            rules={[{ required: true, message: fmlText('field_required') }]}
          >
            <InputNumber min={0} max={10000000} controls={false} keyboard={false} />
          </Form.Item>
          <Form.Item<ISysConfig>
            label={fmlText('cfg_limit_warn')}
            name={["limit", "warn"]}
            className={`${baseCls}-label-sm`}
            tooltip={fmlText('cfg_limit_warn_tips')}
            rules={[{ required: true, message: fmlText('field_required') }]}
          >
            <InputNumber min={0} max={10000000} controls={false} keyboard={false} />
          </Form.Item>
        </Space>
      </Form.Item>
      <Form.Item<ISysConfig>
        label={fmlText('cfg_fsn')}
        name="follow_step_name"
        className={`${baseCls}-2col`}
        tooltip={fmlText('cfg_fsn_tips')}
        labelCol={{ span: 12 }}
        rules={[{ required: true, message: fmlText('field_required') }]}
      >
        <Radio.Group>
          <Radio value={true}>{fmlText('common:yes')}</Radio>
          <Radio value={false}>{fmlText('common:no')}</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item label={fmlText('cfg_font')} style={{ marginBottom: 0 }}>
        <Space size='middle'>
          <Form.Item<ISysConfig>
            label={fmlText('cfg_font_sys')}
            name={["font", "enable"]}
            className={`${baseCls}-label-sm`}
            tooltip={fmlText('cfg_font_sys_tips')}
            valuePropName='checked'
            rules={[{ required: true, message: fmlText('field_required') }]}
          >
            <Switch />
          </Form.Item>
          <Form.Item<ISysConfig>
            label={fmlText('cfg_font_bold')}
            name={["font", "bolder"]}
            className={`${baseCls}-label-sm`}
            tooltip={fmlText('cfg_font_bold_tips')}
            valuePropName='checked'
            rules={[{ required: true, message: fmlText('field_required') }]}
          >
            <Switch disabled={!fontEnable} />
          </Form.Item>
        </Space>
      </Form.Item>
    </Form>
  </QuickModal>)
})

Content.defaultProps = {}
Content.displayName = baseCls
export { Content as SettingsModal }
export type { IProps as SettingsModalProps }