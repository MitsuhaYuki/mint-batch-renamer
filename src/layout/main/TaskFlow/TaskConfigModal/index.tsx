import { App, Checkbox, Flex, Form, FormItemProps, Input, InputNumber, Radio, Segmented, Select, Switch } from 'antd'
import { MultiLangProps } from '@/types/mlang'
import { PathSelector } from '@/components/FieldRender/PathSelector'
import { QuickModal, QuickModalRef } from '@/components/QuickModal/Base'
import { ReactElement, forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { RunnerSelector } from '@/components/FieldRender/RunnerSelector'
import { TaskRunnerConfig, TaskRunnerExtArg } from '@/types/task'
import { WithConfigProps, WithConsoleProps, WithRuntimeProps } from '@/types/common'
import { useForm } from 'antd/es/form/Form'
import { useMultiLang } from '@/utils/mlang'
import './index.scss'

interface IProps extends MultiLangProps, WithConsoleProps, WithConfigProps, WithRuntimeProps {
  onOk?: (cfg: TaskRunnerConfig) => void
}

interface IRef {
  open: (cfg: TaskRunnerConfig) => void
}

const baseCls = 'modal-task-cfg'
const Content = forwardRef<IRef, IProps>((props, ref) => {
  const { config, con, runtime } = props
  const { fmlName, fmlText, fmlField, fmlFieldOption } = useMultiLang(config.state, baseCls, props.inheritName)
  const { message } = App.useApp()
  const [form] = useForm()
  // Only used to store the current configuration
  const [cfg, setCfg] = useState<TaskRunnerConfig>()
  const mRef = useRef<QuickModalRef>(null)

  const [hoverField, setHoverField] = useState<TaskRunnerExtArg>()

  useImperativeHandle(ref, () => ({
    open: (cfg: TaskRunnerConfig) => {
      console.log('TCM Open: ext-cfg', cfg)
      setCfg(cfg)
      // wait for form to re-render
      setTimeout(() => form.setFieldsValue(cfg), 10)
      mRef.current?.toggle(true)
    }
  }))

  const onValuesChange = (changedValues: any, allValues: any) => {
    console.log('onValuesChange', changedValues, allValues)
    if (changedValues.runner) {
      const update = { ...cfg!, runner: changedValues.runner }
      if (config.state.system?.follow_step_name) {
        const cfgRunnerName = fmlField(runtime.state.runners[cfg?.runner ?? 'default'].name)
        const isDefaultName = update.name === fmlText('default_task') || update.name === cfgRunnerName
        if (isDefaultName) update.name = fmlField(runtime.state.runners[update.runner].name)
      }
      setCfg(update)
      setHoverField(undefined)
      form.setFieldsValue(update)
    }
  }

  const onOk = async () => {
    try {
      const formVals = await form.validateFields()
      props.onOk?.(formVals)
      mRef.current?.toggle(false)
    } catch (e) {
      message.error(fmlText('msg_cfg_invalid'))
    }
  }

  const renderFormItems = () => {
    const items: ReactElement[] = []

    // id & name
    items.push(<Form.Item
      key='step_id'
      label='step_id_hidden'
      name='id'
      rules={[{ required: true }]}
      initialValue={cfg?.id}
      hidden
    >
      <Input disabled />
    </Form.Item>)
    items.push(<Form.Item
      key='step_name'
      label={fmlText('step_name')}
      name='name'
      rules={[{ required: true, message: fmlText('no_step_name') }]}
      initialValue={cfg?.name}
    >
      <Input />
    </Form.Item>)

    // All Runners
    items.push(<Form.Item
      key='step_runner'
      label={fmlText('runner')}
      name='runner'
      rules={[{ required: true, message: fmlText('no_runner') }]}
      initialValue={cfg?.runner}
    >
      <RunnerSelector con={con} config={config} inheritName={fmlName} runners={runtime.state.runners} />
    </Form.Item>)

    // Append Runner Args
    const args = runtime.state.runners[cfg?.runner ?? 'default']?.args
    if (Array.isArray(args) && args.length > 0) {
      args.forEach((arg, idx) => {
        let el: ReactElement = <div>{fmlText('invalid_el')}</div>
        const extra: FormItemProps = {
          // extra: fmlText('arg_desc', arg.name),
          initialValue: arg.default,
          label: <div onMouseOver={() => setHoverField(arg)}>{fmlField(arg.name)}</div>,
          name: ['args', arg.id],
          // rules: [{ required: true, message: fmlText('no_arg_value', arg.name) }],
        }
        switch (arg.type) {
          case 'path-folder':
            el = <PathSelector
              con={con}
              config={config}
              directory
              inheritName={fmlName}
              title={fmlText('folder_sel_title')}
            />
            break
          case 'string':
            el = <Input />
            break
          case 'number':
            el = <InputNumber />
            break
          case 'checkbox':
            el = <Checkbox.Group options={fmlFieldOption(arg.options)} />
            break
          case 'radio':
            el = <Radio.Group options={fmlFieldOption(arg.options)} />
            break
          case 'radio-button':
            el = <Radio.Group
              buttonStyle='solid'
              options={fmlFieldOption(arg.options)}
              optionType='button'
            />
            break
          case 'segmented':
            el = <Segmented options={fmlFieldOption(arg.options)} />
            break
          case 'select':
            el = <Select options={fmlFieldOption(arg.options)} />
            break
          case 'switch':
            extra.valuePropName = 'checked'
            el = <Switch />
            break
        }
        items.push(<Form.Item
          key={`args-${idx}`}
          {...extra}
        >{el}</Form.Item>)
      })
    }
    return items
  }

  const renderRunnerInfo = () => {
    const runner = runtime.state.runners[cfg?.runner ?? 'default']
    if (!runner) return <div className={`${baseCls}-extra-item`}>
      {fmlText('runner_unknown')}<div>{fmlText('runner_unknown_tip')}</div>
    </div>
    return <div className={`${baseCls}-extra`} style={{ width: '100%' }}>
      <Flex vertical gap='4px'>
        <div className={`${baseCls}-extra-block`}>
          <div className={`${baseCls}-extra-item`}>
            {fmlText('runner')}: <div>{fmlField(runner.name)}</div>
          </div>
          <div className={`${baseCls}-extra-item`}>
            {fmlText('runner_type')}: <div>{fmlText(`fields:runner_type_${runner.type}`)}</div>
          </div>
        </div>
        <div className={`${baseCls}-extra-block`}>
          <div className={`${baseCls}-extra-item`}>
            {fmlText('runner_desc')}:
          </div>
          <div className={`${baseCls}-extra-item`}>
            <div>{runner.desc ? fmlField(runner.desc) : fmlText('runner_no_desc')}</div>
          </div>
        </div>
        <div className={`${baseCls}-extra-block`}>
          <div className={`${baseCls}-extra-item`}>
            {fmlText('runner_args')}:
          </div>
          {runner.args.length
            ? hoverField ? <>
              <div className={`${baseCls}-extra-item`}>
                {fmlText('runner_arg_name')}: <div>{fmlField(hoverField.name)}</div>
              </div>
              <div className={`${baseCls}-extra-item`}>
                {fmlText('runner_arg_desc')}: <div>{hoverField.desc ? fmlField(hoverField.desc) : fmlText('runner_arg_no_desc')}</div>
              </div>
              <div className={`${baseCls}-extra-item`}>
                {fmlText('runner_arg_default')}: <div>{hoverField.default ?? fmlText('runner_arg_no_default')}</div>
              </div>
            </> : <div className={`${baseCls}-extra-item`}>
              <div>{fmlText('arg_hover_tips')}</div>
            </div>
            : <div className={`${baseCls}-extra-item`}>
              <div>{fmlText('runner_no_arg')}</div>
            </div>}
        </div>
      </Flex >
    </div >
  }

  return (<QuickModal
    title={fmlText('title')}
    ref={mRef}
    classNames={{
      'content': `${baseCls}-content`,
      'body': `${baseCls}-body`,
    }}
    wrapClassName={baseCls}
    width={750}
    centered
    onOk={onOk}
  >
    <Flex className={`${baseCls}-flex`} gap='6px'>
      <Flex flex='1 1 auto'>
        <Form
          autoComplete="off"
          className={`${baseCls}-form`}
          form={form}
          initialValues={{ remember: true }}
          labelCol={{ span: 7 }}
          name={baseCls}
          preserve={false}
          wrapperCol={{ span: 17 }}
          onValuesChange={onValuesChange}
        >
          {renderFormItems()}
        </Form>
      </Flex>
      <Flex flex='0 0 220px'>
        {renderRunnerInfo()}
      </Flex>
    </Flex>
  </QuickModal>)
})

Content.defaultProps = {}
Content.displayName = baseCls
export { Content as TaskCfgModal }
export type {
  IProps as TaskCfgModalProps,
  IRef as TaskCfgModalRef
}