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
      console.log('I: message', res)
      setLocalFlowList(res)
    } catch (e) {
      message.error(`加载本地流程列表失败: ${e}`)
    }
  }

  const { run: loadFlowDetail } = useDebounceFn(async (path: string) => {
    try {
      const res: string = await invoke('fs_read_text_file', { path })
      setFlowDetail(JSON.parse(res))
    } catch (e) {
      message.error(`加载流程详情失败: ${e}`)
    }
  }, { wait: 200, leading: true, trailing: true })

  const renderInfo = () => {
    return <div className={`${baseCls}-extra`} style={{ width: '100%' }}>
      {flowDetail ? <Flex vertical gap='4px'>
        <div className={`${baseCls}-extra-block`}>
          <div className={`${baseCls}-extra-item`}>
            名称: <div>{flowDetail.info.name}</div>
          </div>
          <div className={`${baseCls}-extra-item`}>
            描述: <div>{flowDetail.info.desc}</div>
          </div>
        </div>
        <div className={`${baseCls}-extra-block`}>
          <div className={`${baseCls}-extra-item`}>详情:</div>
          <div className={`${baseCls}-extra-item`}>
            <div>{flowDetail.flow.config ? '包含基础设置, ' : ''}</div>
            <div>已配置{flowDetail.flow.tasks.length}个步骤</div>
          </div>
        </div>
      </Flex > : <Flex vertical gap='4px'>
        <div className={`${baseCls}-extra-block`}>
          <div className={`${baseCls}-extra-item`}>未选择流程</div>
          <div className={`${baseCls}-extra-item`}>
            <div>请从左侧列表选择一个流程</div>
          </div>
        </div>
      </Flex >}
    </div >
  }

  const deleteFlowConfig = async (path: string) => {
    try {
      await invoke('fs_remove_file', { path })
      message.success('删除成功')
      loadLocalFlowList()
    } catch (e) {
      message.error(`删除失败: ${e}`)
    }
  }

  const onOk = () => {
    if (!flowDetail) {
      message.warning('未选择流程')
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
    title={'加载已保存流程'}
    width={700}
    wrapClassName={baseCls}
    onOk={onOk}
  >
    <Flex className={`${baseCls}-flex`} gap='8px'>
      <Flex flex='1 1 auto'>
        <div className={`${baseCls}-list`}>
          <List
            dataSource={localFlowList}
            locale={{ emptyText: '暂无已保存流程' }}
            renderItem={(item) => (
              <List.Item
                className={`${baseCls}-list-item${flowDetail?.info.name === item.file_name ? ' active' : ''}`}
                onClick={() => loadFlowDetail(item.path)}
              >
                {item.file_name}
                <Popconfirm
                  placement="left"
                  title={'你确定要删除这个序列配置吗?'}
                  description={'删除后将无法恢复'}
                  onConfirm={() => deleteFlowConfig(item.path)}
                  okButtonProps={{ danger: true }}
                  onPopupClick={e => e.stopPropagation()}
                  okText='删除'
                  cancelText='取消'
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