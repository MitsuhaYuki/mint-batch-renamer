import { App, Button, Flex, List, Popconfirm } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { FlowConfig } from '@/types/flow'
import { MultiLangProps } from '@/types/mlang'
import { QuickModal, QuickModalInst, QuickModalRef } from '../Base'
import { WithConfigProps } from '@/types/common'
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { useDebounceFn } from 'ahooks'
import { useMultiLang } from '@/utils/mlang'
import './index.scss'

interface RawFileItem {
  name: string
  file_name: string
  file_ext: string
  path: string
  size: number
}

interface IProps extends MultiLangProps, WithConfigProps {
  onOk?: (cfg: FlowConfig) => void
}

const baseCls = 'modal-flow-manage'
const Content = forwardRef<QuickModalRef, IProps>((props, ref) => {
  const { config } = props
  const { fmlText } = useMultiLang(config.state, baseCls, props.inheritName)
  const { message } = App.useApp()

  const [localFlowList, setLocalFlowList] = useState<RawFileItem[]>([])
  const [flowDetail, setFlowDetail] = useState<FlowConfig>()
  const mRef = useRef<QuickModalRef>(null)

  useImperativeHandle(ref, () => ({
    toggle: (v?: boolean) => {
      if (v ?? true) loadLocalFlowList()
      mRef.current?.toggle(v)
    }
  }))

  const loadLocalFlowList = async () => {
    try {
      const exist = await invoke('fs_exists', { path: 'flow' })
      if (!exist) {
        await invoke('fs_create_dir', { path: 'flow' })
      }
      const res: any[] = await invoke('fetch_file_list', { path: 'flow', recursive: false })
      setLocalFlowList(res)
    } catch (e) {
      message.error(fmlText('load_list_failed', `${e}`))
    }
  }

  const { run: loadFlowDetail } = useDebounceFn(async (path: string) => {
    try {
      const res: string = await invoke('fs_read_text_file', { path })
      setFlowDetail(JSON.parse(res))
    } catch (e) {
      message.error(fmlText('load_file_failed', `${e}`))
    }
  }, { wait: 200, leading: true, trailing: true })

  const renderInfo = () => {
    return <div className={`${baseCls}-extra`} style={{ width: '100%' }}>
      {flowDetail ? <Flex vertical gap='4px'>
        <div className={`${baseCls}-extra-block`}>
          <div className={`${baseCls}-extra-item`}>
            {fmlText('cfg_name')}: <div>{flowDetail.info.name}</div>
          </div>
          <div className={`${baseCls}-extra-item`}>
            {fmlText('cfg_desc')}: <div>{flowDetail.info.desc}</div>
          </div>
        </div>
        <div className={`${baseCls}-extra-block`}>
          <div className={`${baseCls}-extra-item`}>{fmlText('cfg_detail')}:</div>
          <div className={`${baseCls}-extra-item`}>
            <div>{flowDetail.flow.config ? `${fmlText('cfg_with_basecfg')}, ` : ''}</div>
            <div>{fmlText('cfg_task_brief', flowDetail.flow.tasks.length.toString())}</div>
          </div>
        </div>
      </Flex > : <Flex vertical gap='4px'>
        <div className={`${baseCls}-extra-block`}>
          <div className={`${baseCls}-extra-item`}>
            <div>{fmlText('cfg_no_select')}</div>
          </div>
        </div>
      </Flex >}
    </div >
  }

  const deleteFlowConfig = async (path: string) => {
    try {
      await invoke('fs_remove_file', { path })
      message.success(fmlText('del_cfg_success'))
      loadLocalFlowList()
    } catch (e) {
      message.error(fmlText('del_cfg_failed', `${e}`))
    }
  }

  const onDoubleClick = async (path: string) => {
    try {
      const res: string = await invoke('fs_read_text_file', { path })
      props.onOk?.(JSON.parse(res))
      { (ref as QuickModalInst).current?.toggle(false) }
    } catch (e) {
      message.error(fmlText('load_file_failed', `${e}`))
    }
  }

  const onOk = () => {
    if (!flowDetail) {
      message.warning(fmlText('no_select'))
      return
    }
    props.onOk?.(flowDetail)
    { (ref as QuickModalInst).current?.toggle(false) }
  }

  return (<QuickModal
    afterOpenChange={v => {
      if (!v) {
        setLocalFlowList([])
        setFlowDetail(undefined)
      }
    }}
    centered
    classNames={{ content: `${baseCls}-content`, body: `${baseCls}-body` }}
    closable={false}
    maskClosable={false}
    ref={mRef}
    title={fmlText("title")}
    width={700}
    wrapClassName={baseCls}
    onOk={onOk}
  >
    <Flex className={`${baseCls}-flex`} gap='8px'>
      <Flex flex='1 1 auto'>
        <div className={`${baseCls}-list`}>
          <List
            dataSource={localFlowList}
            locale={{ emptyText: fmlText('no_saved_flow') }}
            renderItem={(item) => (
              <List.Item
                className={`${baseCls}-list-item${flowDetail?.info.name === item.file_name ? ' active' : ''}`}
                onClick={() => loadFlowDetail(item.path)}
                onDoubleClick={() => onDoubleClick(item.path)}
              >
                {item.file_name}
                <Popconfirm
                  placement="left"
                  title={fmlText('del_cfm_title')}
                  description={fmlText('del_cfm_msg')}
                  onConfirm={() => deleteFlowConfig(item.path)}
                  okButtonProps={{ danger: true }}
                  onPopupClick={e => e.stopPropagation()}
                  okText={fmlText('common:del')}
                  cancelText={fmlText('common:cancel')}
                >
                  <Button type='text' size='small' icon={<DeleteOutlined />} onClick={e => e.stopPropagation()} />
                </Popconfirm>
              </List.Item>
            )}
          />
        </div>
      </Flex>
      <Flex flex='0 0 220px'>{renderInfo()}</Flex>
    </Flex>
  </QuickModal>)
})

Content.defaultProps = {}
Content.displayName = baseCls
export { Content as FlowManageModal }
export type { IProps as FlowManageModalProps }