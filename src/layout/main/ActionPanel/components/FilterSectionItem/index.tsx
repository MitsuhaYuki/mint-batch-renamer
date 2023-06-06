import { IFilterConfig, IFilterParam } from '@/types/filter'
import { Button, Form, Input, InputNumber, Modal, Select, message } from 'antd'
import { FC, useEffect, useState } from 'react'
import { ArrowDownOutlined, ArrowUpOutlined, EllipsisOutlined } from '@ant-design/icons'
import { IState as IGlobalState } from '@/context/global'
import { useMount, useUpdateEffect } from 'ahooks'
import { ILogger } from '@/utils/logger'
import './index.scss'
import { cloneDeep } from 'lodash'
import { filterScopeOptions } from '@/utils/filter'

export type ContentProps = {
  filterConfig: IFilterConfig
  globalData: IGlobalState
  logger: ILogger
  onChange?: (filterConfig: IFilterConfig) => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  onRemove?: (filterConfig: IFilterConfig) => void
}
const baseCls = 'filter-item'
const Content: FC<ContentProps> = (props) => {
  const { filterConfig, globalData, logger, onChange } = props
  const [configModalVisible, setConfigModalVisible] = useState(true)
  const [formItems, setFormItems] = useState<IFilterParam[]>([])
  const [form] = Form.useForm()

  const extractFormItems = (override: Record<string, any> = {}) => {
    const overrideVals = { ...override, ...filterConfig.filterParams }
    const filterId = overrideVals['filter_id'] ?? filterConfig.filterId
    let filterInst = globalData.sysFilters[filterId]
    if (!filterInst) {
      message.error(`没有找到 ${filterId} 过滤器, 已重置为默认值!`)
      logger.error(`Filter ${filterId} not found`)
      filterInst = globalData.sysFilters['contains']
    }

    const newFormItems: IFilterParam[] = [
      {
        name: 'filter_label',
        label: '过滤器名',
        type: 'string',
        default: override['filter_label'] ?? filterConfig.label,
      },
      {
        name: 'filter_id',
        label: '过滤器',
        type: 'select',
        range: Object.keys(globalData.sysFilters).map(key => ({ label: globalData.sysFilters[key].label, value: key })),
        default: filterInst.id,
      },
      {
        name: 'filter_scope',
        label: '作用域',
        type: 'select',
        range: filterScopeOptions,
        default: filterInst.scope,
        readonly: true
      },
    ]
    newFormItems.push(...filterInst.params)

    const overrideValKeys = Object.keys(overrideVals)
    const extractedFormItem = newFormItems.reduce((prev, item) => {
      if (overrideValKeys.includes(item.name) && item.name !== 'filter_id' && item.name !== 'filter_label') {
        item.default = overrideVals[item.name]
      }
      prev.push(item)
      return prev
    }, [] as IFilterParam[])

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
    const newFilterConfig = cloneDeep(filterConfig)
    // assign sys args
    newFilterConfig.label = formVals.filter_label
    newFilterConfig.filterId = formVals.filter_id
    // delete unused args
    delete formVals.filter_label
    delete formVals.filter_id
    delete formVals.filter_scope
    // assign filter args
    newFilterConfig.filterParams = formVals
    // must close modal first, otherwise form will flash blank
    setConfigModalVisible(false)
    onChange?.(newFilterConfig)
  }

  const handleRemove = () => {
    Modal.confirm({
      title: '删除此过滤器',
      content: '你确定要删除此过滤器吗?',
      centered: true,
      onOk: () => {
        props.onRemove?.(filterConfig)
      }
    })
  }

  const handleFormValuesChange = (changedValues: Record<string, any>, currentValues: Record<string, any>) => {
    const changedKeys = Object.keys(changedValues)
    if (changedKeys.includes('filter_id')) {
      extractFormItems({
        filter_id: changedValues.filter_id,
        filter_label: globalData.sysFilters[changedValues.filter_id].label,
      })
    }
  }

  useEffect(() => {
    console.log('I: form rerendered, new form items =', formItems)
    form.resetFields()
  }, [formItems])

  useMount(() => {
    console.log('I: item mount, props =', props)
    extractFormItems()
    setConfigModalVisible(true)
  })

  useUpdateEffect(() => {
    if (configModalVisible) setTimeout(() => form.resetFields(), 0)
  }, [configModalVisible])

  useUpdateEffect(() => {
    if (filterConfig) extractFormItems()
  }, [filterConfig])

  const formItemRender = (item: IFilterParam, index: number) => {
    if (item.readonly) {
      switch (item.type) {
        case 'string':
        case 'number':
          return <div className={`${baseCls}-form-view`}>{item.default}</div>
        case 'select': {
          if (Array.isArray(item.range)) {
            const res = item.range.find(rangeItem => rangeItem.value === item.default)
            return <div className={`${baseCls}-form-view`}>{res.label}</div>
          } else {
            return <div className={`${baseCls}-form-error`}>选项格式错误</div>
          }
        }
        default:
          return <div className={`${baseCls}-form-error`}>参数格式错误</div>
      }
    } else {
      switch (item.type) {
        case 'string':
          return <Input disabled={item.readonly} />
        case 'number':
          return <InputNumber controls={false} disabled={item.readonly} />
        case 'select': {
          if (Array.isArray(item.range)) {
            return <Select disabled={item.readonly} options={item.range} />
          } else {
            return <div className={`${baseCls}-form-error`}>选项格式错误</div>
          }
        }
        default:
          return <div className={`${baseCls}-form-error`}>参数格式错误</div>
      }
    }
  }

  return (
    <div className={baseCls}>
      <div className={`${baseCls}-main`}>
        <div className={`${baseCls}-main-name`}>{filterConfig.label}</div>
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
        title='过滤器配置'
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