import { QuickModal, QuickModalRef } from '@/components/QuickModal'
import { WithConfigProps, WithConsoleProps, WithRuntimeProps } from '@/types/common'
import { TaskRunnerConfig, TaskRunnerScope } from '@/types/task'
import { fmlField, useMultiLang } from '@/utils/mlang'
import { ReactElement, cloneElement, forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import './index.scss'
import { Flex, Form, Input, InputNumber, Select, message } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { TaskRunnerScopeOptions } from '@/utils/runners/common'
import { MultiLangProps } from '@/types/mlang'
import { useKeyMessage } from '@/utils/common'
import { FolderSelector } from '@/components/FieldRender/FolderSelector'

interface IProps extends MultiLangProps, WithConsoleProps, WithConfigProps, WithRuntimeProps {
  onOk?: (cfg: TaskRunnerConfig) => void
}

interface IRef {
  open: (cfg: TaskRunnerConfig) => void
}

const baseCls = 'modal-task-cfg'
const Content = forwardRef<IRef, IProps>((props, ref) => {
  const { config, con, runtime } = props
  const { fmlName, fmlText } = useMultiLang(config.state, baseCls, props.inheritName)
  const [msgApi, msgCtx] = useKeyMessage(baseCls)
  const [form] = useForm()
  // Mainly used to store the current configuration
  const [cfg, setCfg] = useState<TaskRunnerConfig>()
  const mRef = useRef<QuickModalRef>(null)

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
        const cfgRunnerName = fmlField(runtime.state.runners[cfg?.runner ?? 'default'].name, config.state)
        const isDefaultName = update.name === fmlText('default_task') || update.name === cfgRunnerName
        if (isDefaultName) update.name = fmlField(runtime.state.runners[update.runner].name, config.state)
      }
      setCfg(update)
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
      rules={[{ required: true }]}
      initialValue={cfg?.name}
    >
      <Input />
    </Form.Item>)

    // All Runners
    const optRunners = Object.keys(runtime.state.runners).reduce(
      (prev, i) => {
        const inst = runtime.state.runners[i]
        prev.push({ label: fmlField(inst.name, config.state), value: inst.id })
        return prev
      }, [] as any[]
    )
    items.push(<Form.Item
      key='step_runner'
      label={fmlText('runner')}
      name='runner'
      rules={[{ required: true }]}
      initialValue={cfg?.runner}
    >
      <Select options={optRunners} />
    </Form.Item>)

    // Append Runner Args
    const args = runtime.state.runners[cfg?.runner ?? 'default']?.args
    if (Array.isArray(args) && args.length > 0) {
      args.forEach((arg, idx) => {
        let el: ReactElement = <div>不合法的控件类型</div>
        switch (arg.type) {
          case 'string':
            el = <Input />
            break
          case 'number':
            el = <InputNumber />
            break
          case 'folder_selector':
            el = <FolderSelector con={con} config={config} inheritName={fmlName} />
            break
        }
        items.push(<Form.Item
          key={`args-${idx}`}
          label={fmlField(arg.name, config.state)}
          name={['args', arg.id]}
          initialValue={arg.default}
        >{el}</Form.Item>)
      })
    }
    return items
  }

  const renderRunnerInfo = () => {
    const runner = runtime.state.runners[cfg?.runner ?? 'default']
    if (!runner) return <div>未知的执行器</div>
    return <div style={{ width: '100%' }}>
      <div>执行器标识：{runner.id}</div>
      <div>名称(FML)：{fmlField(runner.name, config.state)}</div>
      <div>作用域：{runner.scope}</div>
      <div>参数列表：</div>
      <Flex gap='4px' vertical style={{ padding: '4px 0' }}>
        {Array.isArray(runner.args) && runner.args.map((i, idx) => (
          <div key={idx} style={{ border: '1px dashed #bae7ff', borderRadius: '4px', padding: '4px' }}>
            <div>参数名称：{fmlField(i.name, config.state)}</div>
            <div>参数类型：{i.type}</div>
            <div>参数默认值：{i.default}</div>
          </div>
        ))}
        {Array.isArray(runner.args) && runner.args.length === 0 && <div style={{
          border: '1px dashed #bae7ff',
          borderRadius: '4px',
          padding: '4px'
        }}>无</div>}
      </Flex>
    </div>
  }

  return (<QuickModal
    title={fmlText('title')}
    ref={mRef}
    width={720}
    onOk={onOk}
  >
    {msgCtx}
    <div className={baseCls}>
      <Flex gap='16px'>
        <Flex flex='1 1 auto'>
          <Form
            form={form}
            name={baseCls}
            className={`${baseCls}-form`}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            initialValues={{ remember: true }}
            autoComplete="off"
            onValuesChange={onValuesChange}
          >
            {renderFormItems()}
          </Form>
        </Flex>
        <Flex flex='0 0 300px'>
          {renderRunnerInfo()}
        </Flex>
      </Flex>
    </div>
  </QuickModal>)
})

Content.defaultProps = {}
Content.displayName = baseCls
export { Content as TaskCfgModal }
export type {
  IProps as TaskCfgModalProps,
  IRef as TaskCfgModalRef
}