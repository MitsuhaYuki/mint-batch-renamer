import { ArrowDownOutlined, ArrowUpOutlined, EllipsisOutlined } from '@ant-design/icons'
import { Button, Form, Input, InputNumber, Modal, Select, message } from 'antd'
import { FC, useEffect, useState } from 'react'
import { IGlobalState } from '@/context/global'
import { ILogger } from '@/utils/logger'
import { IScriptConfig, IScriptParam } from '@/types/script'
import { cloneDeep } from 'lodash'
import { getRenamers } from '@/utils/renamer'
import { useMount, useUpdateEffect } from 'ahooks'
import './index.scss'

export type ContentProps = {
  renamerConfig: IScriptConfig
  globalData: IGlobalState
  logger: ILogger
  onChange?: (renamerConfig: IScriptConfig) => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  onRemove?: (renamerConfig: IScriptConfig) => void
}
const baseCls = 'renamer-item'
const Content: FC<ContentProps> = (props) => {
  const { renamerConfig, globalData, logger, onChange } = props
  const renamerSet = getRenamers(globalData.sysRenamers, globalData.sysRenamersExt)
  const [configModalVisible, setConfigModalVisible] = useState(true)
  const [formItems, setFormItems] = useState<IScriptParam[]>([])
  const [form] = Form.useForm()

  const extractFormItems = (override: Record<string, any> = {}) => {
    const overrideVals = { ...override, ...renamerConfig.scriptParam }
    const renamerId = overrideVals['renamer_id'] ?? renamerConfig.scriptId
    let renamerInst = renamerSet[renamerId]
    if (!renamerInst) {
      message.error(`没有找到 ${renamerId} 步骤方法, 已重置为默认值!`)
      logger.error(`Renamer ${renamerId} not found`)
      renamerInst = renamerSet['contains']
    }

    const newFormItems: IScriptParam[] = [
      {
        name: 'renamer_label',
        label: '步骤名称',
        type: 'string',
        default: override['renamer_label'] ?? renamerConfig.label,
        readonly: true,
      },
      {
        name: 'renamer_id',
        label: '此步骤使用',
        type: 'select',
        range: Object.keys(renamerSet).map(key => ({ label: renamerSet[key].label, value: key })),
        default: renamerInst.id,
        readonly: true,
      },
    ]
    newFormItems.push(...cloneDeep(renamerInst.params))

    const overrideValKeys = Object.keys(overrideVals)
    const extractedFormItem = newFormItems.reduce((prev, item) => {
      if (overrideValKeys.includes(item.name) && item.name !== 'filter_id' && item.name !== 'filter_label') {
        item.default = overrideVals[item.name]
      }
      prev.push(item)
      return prev
    }, [] as IScriptParam[])

    setFormItems(extractedFormItem)
  }

  const handleOk = async () => {
    // validate form
    try {
      await form.validateFields()
    } catch (e) {
      return
    }
    // get new filter config
    const formVals = form.getFieldsValue()
    const newRenamerConfig = cloneDeep(renamerConfig)
    // assign sys args
    newRenamerConfig.label = formVals.renamer_label
    newRenamerConfig.scriptId = formVals.renamer_id
    // delete unused args
    delete formVals.renamer_label
    delete formVals.renamer_id
    // assign filter args
    newRenamerConfig.scriptParam = formVals
    // must close modal first, otherwise form will flash blank
    setConfigModalVisible(false)
    onChange?.(newRenamerConfig)
  }

  const handleRemove = () => {
    Modal.confirm({
      title: '删除此步骤',
      content: '你确定要删除此步骤吗?',
      centered: true,
      onOk: () => {
        props.onRemove?.(renamerConfig)
      }
    })
  }

  const handleFormValuesChange = (changedValues: Record<string, any>, currentValues: Record<string, any>) => {
    const changedKeys = Object.keys(changedValues)
    if (changedKeys.includes('renamer_id')) {
      extractFormItems({
        renamer_id: changedValues.renamer_id,
        renamer_label: renamerSet[changedValues.renamer_id].label,
      })
    }
  }

  useMount(() => {
    extractFormItems()
    setConfigModalVisible(true)
  })

  useEffect(() => {
    if (formItems.length) form.resetFields()
  }, [formItems])

  useUpdateEffect(() => {
    if (configModalVisible) setTimeout(() => form.resetFields(), 0)
  }, [configModalVisible])

  useUpdateEffect(() => {
    if (renamerConfig) extractFormItems()
  }, [renamerConfig])

  const formItemRender = (item: IScriptParam, index: number) => {
    if (item.readonly) {
      switch (item.type) {
        case 'string':
        case 'number':
          return <div className={`${baseCls}-form-view`}>{item.default}</div>
        case 'select': {
          if (Array.isArray(item.range)) {
            const res = item.range.find(rangeItem => rangeItem.value === item.default)
            return <div className={`${baseCls}-form-view`}>{res?.label}</div>
          } else {
            return <div className={`${baseCls}-form-error`}>Form item option range error</div>
          }
        }
        default:
          return <div className={`${baseCls}-form-error`}>Form item render error</div>
      }
    } else {
      switch (item.type) {
        case 'string':
          return <Input disabled={item.readonly} type='text' />
        case 'number':
          return <InputNumber controls={false} disabled={item.readonly} />
        case 'select': {
          if (Array.isArray(item.range)) {
            return <Select disabled={item.readonly} options={item.range} />
          } else {
            return <div className={`${baseCls}-form-error`}>Form item option range error</div>
          }
        }
        default:
          return <div className={`${baseCls}-form-error`}>Form item render error</div>
      }
    }
  }

  return (
    <div className={baseCls}>
      <div className={`${baseCls}-main`}>
        <div className={`${baseCls}-main-name`}>{renamerConfig.label}</div>
        <div className={`${baseCls}-main-controls`}>
          <div className={`${baseCls}-main-controls-btn`}>
            <Button
              hidden
              size='small' type='text' icon={<ArrowUpOutlined style={{ fontSize: '12px' }} />}
              onClick={() => {}}
            />
          </div>
          <div className={`${baseCls}-main-controls-btn`}>
            <Button
              hidden
              size='small' type='text' icon={<ArrowDownOutlined style={{ fontSize: '12px' }} />}
              onClick={() => {}}
            />
          </div>
          <div className={`${baseCls}-main-controls-btn`}>
            <Button
              size='small' type='text' icon={<EllipsisOutlined style={{ fontSize: '12px' }} />}
              onClick={() => setConfigModalVisible(true)}
            />
          </div>
        </div>
      </div>
      <Modal
        title='步骤配置'
        open={configModalVisible}
        maskClosable={false}
        wrapClassName={`${baseCls}-modal`}
        closable={false}
        footer={[
          <Button key="del" danger onClick={handleRemove}>删除</Button>,
          <div className={`${baseCls}-modal-btn-group`} key='action'>
            <Button onClick={() => setConfigModalVisible(false)}>取消</Button>
            <Button type="primary" onClick={handleOk}>确定</Button>
          </div>
        ]}
        onCancel={() => setConfigModalVisible(false)}
      >
        <Form
          autoComplete="off"
          className={`${baseCls}-form`}
          form={form}
          onValuesChange={handleFormValuesChange}
        >
          {formItems.map((item, index) => {
            return (
              <Form.Item
                initialValue={item.default}
                key={index}
                label={item.label}
                labelCol={{ span: 6 }}
                name={item.name}
                rules={[{ required: true, message: '必须提供所有配置参数!' }]}
              >
                {formItemRender(item, index)}
              </Form.Item>
            )
          })}
        </Form>
      </Modal>
    </div>
  )
}

Content.defaultProps = {}
Content.displayName = baseCls
export default Content