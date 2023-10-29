import { Checkbox, Flex, Form, FormItemProps, Input, InputNumber, Radio, Segmented, Select, Switch } from 'antd'
import { MultiLangProps } from '@/types/mlang'
import { PathSelector } from '@/components/FieldRender/PathSelector'
import { QuickModal, QuickModalRef } from '@/components/QuickModal'
import { ReactElement, forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { RunnerSelector } from '@/components/FieldRender/RunnerSelector'
import { TaskRunnerConfig, TaskRunnerExtArg } from '@/types/task'
import { WithConfigProps, WithConsoleProps, WithRuntimeProps } from '@/types/common'
import { useMultiLang } from '@/utils/mlang'
import { useForm } from 'antd/es/form/Form'
import { useKeyMessage } from '@/utils/common'
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
  const [msgApi, msgCtx] = useKeyMessage(baseCls)
  const [form] = useForm()
  // Mainly used to store the current configuration
  const [cfg, setCfg] = useState<TaskRunnerConfig>()
  const mRef = useRef<QuickModalRef>(null)

  const [hoverField, setHoverField] = useState<TaskRunnerExtArg>()

  useImperativeHandle(ref, () => ({
    open: (cfg: TaskRunnerConfig) => {
      console.log('TCM Open: ext-cfg', cfg)
      setCfg(cfg)
      form.setFieldsValue(cfg)
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
      msgApi.error(fmlText('msg_cfg_invalid'))
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
        let el: ReactElement = <div>不合法的控件类型</div>
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
      未知的执行器!<div>您可能加载了一个错误的序列配置文件或一个不存在的外部执行器!</div>
    </div>
    return <div className={`${baseCls}-extra`} style={{ width: '100%' }}>
      <Flex vertical gap='4px'>
        <div className={`${baseCls}-extra-block`}>
          <div className={`${baseCls}-extra-item`}>
            执行器: <div>{fmlField(runner.name)}</div>
          </div>
          <div className={`${baseCls}-extra-item`}>
            类型: <div>{fmlText(`fields:runner_type_${runner.type}`)}</div>
          </div>
        </div>
        <div className={`${baseCls}-extra-block`}>
          <div className={`${baseCls}-extra-item`}>
            执行器描述:
          </div>
          <div className={`${baseCls}-extra-item`}>
            <div>{runner.desc ? fmlField(runner.desc) : '该执行器未提供描述'}</div>
          </div>
        </div>
        <div className={`${baseCls}-extra-block`}>
          <div className={`${baseCls}-extra-item`}>
            参数详情:
          </div>
          {runner.args.length
            ? hoverField ? <>
              <div className={`${baseCls}-extra-item`}>
                参数名: <div>{fmlField(hoverField.name)}</div>
              </div>
              <div className={`${baseCls}-extra-item`}>
                描述: <div>{hoverField.desc ? fmlField(hoverField.desc) : '该参数未提供描述'}</div>
              </div>
              <div className={`${baseCls}-extra-item`}>
                默认值: <div>{hoverField.default ?? '无'}</div>
              </div>
            </> : <div className={`${baseCls}-extra-item`}>
              <div>鼠标移动到参数名称上查看参数信息</div>
            </div>
            : <div className={`${baseCls}-extra-item`}>
              <div>当前执行器不需要任何参数</div>
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
    {msgCtx}
    <Flex className={`${baseCls}-flex`} gap='6px'>
      <Flex flex='1 1 auto'>
        <Form
          autoComplete="off"
          className={`${baseCls}-form`}
          form={form}
          initialValues={{ remember: true }}
          // labelCol={{ span: 8 }}
          labelCol={{ span: 7 }}
          name={baseCls}
          preserve={false}
          // wrapperCol={{ span: 16 }}
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