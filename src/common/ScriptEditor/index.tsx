import CodeMirror from '@uiw/react-codemirror'
import { EFilterScope, IExtFilter } from '@/types/filter'
import { EScriptAction, EScriptType } from '@/types/extension'
import { Form, Input, Modal, Select, Space, message } from 'antd'
import { cloneDeep, isEmpty, isEqual } from 'lodash'
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { javascript } from '@codemirror/lang-javascript'
import { js as beautify } from 'js-beautify'
import './index.scss'

type Content = {
  toggle: (visible?: boolean) => void
}

type ContentProps = {
  script?: IExtFilter
  scriptType: EScriptType
  onOk?: (script: IExtFilter, scriptType: EScriptType, actionType: EScriptAction) => void
}

const baseCls = 'script-editor'
const Content = forwardRef<Content, ContentProps>((props, ref) => {
  const { script, scriptType, onOk } = props
  const [visible, setVisible] = useState(false)
  const [form] = Form.useForm()
  const originalScript = useRef<any>({})
  const editor = useRef<any>(null)

  useImperativeHandle(ref, () => ({
    toggle: (visible?: boolean) => {
      setVisible(s => visible ?? !s)
    }
  }))

  const formatOptions = useMemo(() => ({
    indent_size: 2,
    indent_char: ' ',
    eol: '\r\n',
    end_with_newline: false,
    preserve_newlines: false,
  }), [])

  const handleOk = async () => {
    try {
      await form.validateFields()
    } catch (e) {
      message.error('请输入所有必填项')
      return
    }
    const formVals = form.getFieldsValue()
    const allFieldsValue = {
      ...formVals,
      func: beautify(formVals.func, formatOptions),
      error: script?.error,
      status: script?.status
    }

    if (isEqual(allFieldsValue, originalScript.current)) {
      message.info('未修改任何内容')
      setVisible(false)
      return
    }

    let transformedFunc
    try {
      transformedFunc = new Function('return ' + allFieldsValue.func)()
    } catch (e) {
      message.error('脚本存在语法错误, 请检查代码!')
      return
    }

    const newFieldsValue: IExtFilter = {
      ...allFieldsValue,
      modified: true,
      params: JSON.parse(allFieldsValue.params),
      func: transformedFunc
    }

    if (newFieldsValue.id !== script?.id) {
      Modal.confirm({
        title: '发现脚本ID变化!',
        content: '确定要修改脚本ID吗? 这将会复制一个新的脚本, 而不是修改当前脚本!',
        onOk: () => {
          onOk?.(newFieldsValue, scriptType, EScriptAction.Create)
          setVisible(false)
        }
      })
    } else {
      onOk?.(newFieldsValue, scriptType, EScriptAction.Update)
      setVisible(false)
    }
  }

  useEffect(() => {
    if (!isEmpty(script)) {
      const formVal = {
        ...script,
        params: script.params ? JSON.stringify(script.params) : undefined,
        func: script.func ? beautify(script.func.toString(), formatOptions) : ''
      }
      originalScript.current = cloneDeep(formVal)
      form.setFieldsValue(formVal)
    }
  }, [script])

  return (
    <Modal
      centered
      closable={false}
      destroyOnClose
      focusTriggerAfterClose={false}
      maskClosable={false}
      open={visible}
      title='Edit Script'
      width={'85%'}
      wrapClassName={baseCls}
      onOk={handleOk}
      onCancel={() => setVisible(false)}
    >
      <div className={`${baseCls}-content`}>
        <Form
          form={form}
          autoComplete='off'
          colon={false}
          labelCol={{ span: 4 }}
        // requiredMark={false}
        >
          <Form.Item
            label='名称'
            name='label'
            tooltip='Label'
            rules={[{ required: true, message: '请输入此项!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label='ID'
            name='id'
            tooltip='ID'
            rules={[{ required: true, message: '请输入此项!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label='描述'
            name='desc'
            tooltip='Description'
            rules={[{ required: true, message: '请输入此项!' }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            label='作用域'
            name='scope'
            tooltip='Scope'
            hidden={scriptType === 'renamer'}
            rules={[{ required: true, message: '请输入此项!' }]}
          >
            <Select options={[{
              label: '单个文件',
              value: EFilterScope.fileName
            }, {
              label: '所有文件',
              value: EFilterScope.fileList
            }]} />
          </Form.Item>
          <Form.Item
            label='参数列表'
            name='params'
            tooltip='Param list'
            rules={[{ required: true, message: '请输入此项!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label='脚本'
            name='func'
            tooltip='Function text'
            labelCol={{ span: 4 }}
            rules={[{ required: true, message: '请输入此项!' }]}
          >
            <CodeMirror
              // FIXME: if creating new script or empty, should provide default function placeholder.
              extensions={[javascript({ jsx: false })]}
              ref={editor}
              basicSetup={{
                lineNumbers: false,
                indentOnInput: true,
                rectangularSelection: false,
                crosshairCursor: false,
                defaultKeymap: false,
                searchKeymap: false,
                historyKeymap: false,
                foldKeymap: false,
                completionKeymap: false,
                lintKeymap: false,
              }}
              minHeight='200px'
              maxHeight='420px'
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  )
})

Content.defaultProps = {}
Content.displayName = baseCls
export {
  Content as ScriptEditor
}
export type {
  Content as ScriptEditorRef,
  ContentProps as ScriptEditorProps
}