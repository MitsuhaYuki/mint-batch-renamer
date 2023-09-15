import type { ColumnsType } from 'antd/es/table'
import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, ConfigProvider, Form, Input, Modal, Select, Space, Switch, Table, message } from 'antd'
import { ControlButton } from '@/components/ControlButton'
import { FC, useMemo, useState } from 'react'
import { IScriptParam } from '@/types/script'
import { cloneDeep, isNaN, toNumber } from 'lodash'
import './index.scss'

interface IProps {
  value?: string
  onChange?: (value: string) => void
}

const baseCls = 'param-editor'
const Content: FC<IProps> = (props) => {
  const { value: $value, onChange } = props
  // Param edit modal
  const [visible, setVisible] = useState(false)
  // Current edit record
  const [record, setRecord] = useState<Partial<IScriptParam>>({})
  // Current edit record is select type
  const [isSelect, setIsSelect] = useState<boolean>(false)
  // Param edit form instance
  const [form] = Form.useForm()
  // Parse incoming value
  const value: IScriptParam[] = useMemo(() => {
    try {
      return $value ? JSON.parse($value) : []
    } catch (e) {
      return []
    }
  }, [$value])

  const handleUpdate = async () => {
    // validate form
    try {
      await form.validateFields()
    } catch (e) {
      message.error('请检查参数信息是否填写正确')
      return
    }
    // format data
    const formVals = cloneDeep(form.getFieldsValue())
    if (formVals.type === 'string') {
      delete formVals.range
    } else if (formVals.type === 'number') {
      delete formVals.range
      formVals.default = toNumber(formVals.default)
    }
    // merge data
    const newParams = value.filter(i => i.name !== record.name)
    newParams.push(formVals)
    onChange?.(JSON.stringify(newParams))
    setVisible(false)
  }

  const handleDelete = async (row: IScriptParam) => {
    const newParams = value.filter(i => i.name !== row.name)
    onChange?.(JSON.stringify(newParams))
  }

  const handleMoveUp = async (row: IScriptParam) => {
    const index = value.findIndex(i => i.name === row.name)
    if (index === -1 || index === 0) return
    const newParams = cloneDeep(value)
    const temp = newParams[index]
    newParams[index] = newParams[index - 1]
    newParams[index - 1] = temp
    onChange?.(JSON.stringify(newParams))
  }

  const handleMoveDown = async (row: IScriptParam) => {
    const index = value.findIndex(i => i.name === row.name)
    if (index === -1 || index === value.length - 1) return
    const newParams = cloneDeep(value)
    const temp = newParams[index]
    newParams[index] = newParams[index + 1]
    newParams[index + 1] = temp
    onChange?.(JSON.stringify(newParams))
  }

  const renderParamList = () => {
    const columns: ColumnsType<IScriptParam> = [
      {
        title: '参数名',
        dataIndex: 'label',
        ellipsis: true,
        width: 140,
      },
      {
        title: 'ID',
        dataIndex: 'name',
        ellipsis: true,
        width: 180,
      },
      {
        title: '参数类型',
        dataIndex: 'type',
        ellipsis: true,
        render: (value) => {
          switch (value) {
            case 'string':
              return '字符串'
            case 'number':
              return '数字'
            case 'select':
              return '枚举'
            default:
              return '-ERROR-'
          }
        }
      },
      {
        title: '操作',
        key: 'action',
        width: 140,
        ellipsis: true,
        render: (_, row, index) => (
          <Space size={4}>
            <ControlButton
              disabled={index === 0}
              onClick={() => handleMoveUp(row)}
            ><ArrowUpOutlined /></ControlButton>
            <ControlButton
              disabled={index + 1 === value.length}
              onClick={() => handleMoveDown(row)}
            ><ArrowDownOutlined /></ControlButton>
            <ControlButton onClick={() => {
              setRecord(row)
              setIsSelect(row.type === 'select')
              form.resetFields()
              form.setFieldsValue(row)
              setVisible(true)
            }}><EditOutlined /></ControlButton>
            <ControlButton danger onClick={() => handleDelete(row)}>
              <DeleteOutlined />
            </ControlButton>
          </Space>
        ),
      },
    ]

    return (
      <div className={`${baseCls}-table`}>
        <Table
          columns={columns}
          dataSource={value}
          pagination={false}
          rowKey='name'
          size='small'
        />
        <div className={`${baseCls}-table-btns`}>
          <ControlButton
            title='新建'
            onClick={() => {
              setRecord({})
              setIsSelect(false)
              form.resetFields()
              setVisible(true)
            }}
          ><PlusOutlined /></ControlButton>
        </div>
      </div>
    )
  }

  return (
    <div className={baseCls}>
      {renderParamList()}

      <Modal
        centered
        closable={false}
        focusTriggerAfterClose={false}
        maskClosable={false}
        open={visible}
        title='修改参数信息'
        wrapClassName={baseCls}
        onOk={handleUpdate}
        onCancel={() => setVisible(false)}
      >
        <div className={`${baseCls}-content`}>
          <Form
            autoComplete='off'
            colon={false}
            form={form}
            labelCol={{ span: 5 }}
            onValuesChange={(value) => {
              if (value.type) setIsSelect(value.type === 'select')
            }}
          >
            <Form.Item
              label='ID'
              name='name'
              tooltip='实际传参使用的名称'
              rules={[{ required: true, message: '请输入此项!' }, {
                async validator (_, curVal) {
                  const reg = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/
                  if (!reg.test(curVal)) throw 'ID只能包含字母、数字、下划线、$，且不能以数字开头'
                }
              }, {
                async validator (_, curVal) {
                  curVal !== record?.name && value.forEach(i => {
                    if (i.name === curVal) throw '已存在使用相同的ID的参数!'
                  })
                }
              }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label='名称'
              name='label'
              tooltip='参数的显示名'
              rules={[{ required: true, message: '请输入此项!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label='描述'
              name='desc'
              tooltip='参数的描述，会显示在参数项的下方'
            >
              <Input />
            </Form.Item>
            <Form.Item
              label='悬浮提示'
              name='tips'
              tooltip='悬浮提示，就是你看到的这个'
            >
              <Input />
            </Form.Item>
            <Form.Item
              label='参数类型'
              name='type'
              rules={[{ required: true, message: '请输入此项!' }]}
              initialValue='string'
            >
              <Select options={[{
                label: '字符串',
                value: 'string'
              }, {
                label: '数字',
                value: 'number'
              }, {
                label: '枚举',
                value: 'select'
              }]} />
            </Form.Item>
            <Form.Item
              label='可选项'
              hidden={!isSelect}
              required
            >
              <Form.List
                name="range"
                rules={[{
                  async validator (_, value) {
                    if (isSelect && value && value.length < 2) throw '至少需要提供两个可选项'
                  }
                }]}
              >
                {(fields, { add, remove }, { errors }) => (<>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} align="baseline" size={4}>
                      <Form.Item
                        {...restField}
                        name={[name, 'label']}
                        rules={[{ required: true, message: '请提供选项名' }]}
                      >
                        <Input placeholder="选项名" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'value']}
                        rules={[{ required: true, message: '请提供选项值' }]}
                      >
                        <Input placeholder="选项值" />
                      </Form.Item>
                      <ControlButton danger onClick={() => remove(name)}><DeleteOutlined /></ControlButton>
                    </Space>
                  ))}
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    增加参数
                  </Button>
                  <Form.ErrorList className={`${baseCls}-form-error`} errors={errors} />
                </>)}
              </Form.List>
            </Form.Item>
            <Form.Item
              label='默认值'
              name='default'
              rules={[{
                async validator (_, value) {
                  if (value !== undefined) {
                    const formVals = form.getFieldsValue()
                    const range = formVals.range
                    if (formVals.type === 'select' && range && range.length) {
                      const has = range.some((item: any) => item.value === value)
                      if (!has) throw '枚举项默认值必须是可选项之一'
                    } else if (formVals.type === 'number' && isNaN(toNumber(value))) {
                      throw '数字类型的默认值必须是数字'
                    }
                  }
                }
              }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label='只读'
            >
              <ConfigProvider
                theme={{
                  token: {
                    colorPrimary: '#fa8c16',
                    colorPrimaryBorder: '#ffd591',
                    colorPrimaryHover: '#ffa940'
                  },
                }}
              >
                <Form.Item name={'readonly'} valuePropName='checked' initialValue={false}>
                  <Switch checkedChildren="只读" unCheckedChildren="&nbsp;可编辑&nbsp;" defaultChecked />
                </Form.Item>
              </ConfigProvider>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  )
}

Content.defaultProps = {}
Content.displayName = baseCls
export { Content as ParamEditor }
export type { IProps as ParamEditorProps }