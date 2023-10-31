import { App, Badge, Button, Flex } from 'antd'
import { ExportOutlined, ImportOutlined } from '@ant-design/icons'
import { FC, useRef } from 'react'
import { FlowConfig } from '@/types/flow'
import { FlowManageModal } from '@/components/QuickModal/FlowManage'
import { FlowUpdateModal } from '@/components/QuickModal/FlowUpdate'
import { MultiLangProps } from '@/types/mlang'
import { QuickModalRef } from '@/components/QuickModal/Base'
import { WithConfigProps, WithConsoleProps, WithRuntimeProps } from '@/types/common'
import { useMultiLang } from '@/utils/mlang'
import './index.scss'

interface IProps extends MultiLangProps, WithConsoleProps, WithConfigProps, WithRuntimeProps {}

const baseCls = 'flow-manage'
const Content: FC<IProps> = (props) => {
  const { con, config, runtime } = props
  const { logger } = con
  const { fmlName, fmlText } = useMultiLang(config.state, baseCls, props.inheritName)
  const { message } = App.useApp()
  const mRef = useRef<QuickModalRef>(null)
  const uRef = useRef<QuickModalRef>(null)

  const onLoadSeq = async (cfg: FlowConfig) => {
    try {
      const flowConfig = cfg.flow
      runtime.set({ ...runtime.state, ...flowConfig, flowInfo: cfg.info })
      message.success('导入成功')
      logger.info(`Import flow config from ${cfg}`)
    } catch (e) {
      message.error(`导入失败: ${e}`)
      logger.error(`Import flow config failed: ${e}`)
    }
  }

  const onOpenSaveSeqModal = () => {
    if (runtime.state.tasks.length === 0) {
      message.error('请先配置任务')
      return
    }
    uRef.current?.toggle(true)
  }

  const onClearSeqBaseInfo = () => {
    if (runtime.state.flowInfo) {
      runtime.set({ ...runtime.state, flowInfo: undefined })
      message.success('已清空序列描述信息')
    }
  }

  return (<Flex className={baseCls} flex='1 1 auto' justify='space-between'>
    <Button
      icon={<ExportOutlined />}
      size='small'
      title={fmlText('btn_load_tip')}
      type='text'
      onClick={() => mRef.current?.toggle(true)}
    >{fmlText('btn_load')}</Button>
    <Button
      icon={<ImportOutlined />}
      size='small'
      title={fmlText('btn_save_tip')}
      type='text'
      onClick={onOpenSaveSeqModal}
    >{fmlText('btn_save')}</Button>
    <div
      className={`${baseCls}-status`}
      title={runtime.state.flowInfo ? '已从本地加载序列, 双击状态点清空序列描述信息' : '常规运行序列'}
      onDoubleClick={onClearSeqBaseInfo}
    >
      <Badge color={runtime.state.flowInfo ? '#1677ff' : '#d9d9d9'} />
    </div>
    <FlowManageModal ref={mRef} inheritName={fmlName} config={config} onOk={onLoadSeq} />
    <FlowUpdateModal ref={uRef} inheritName={fmlName} config={config} runtime={runtime} />
  </Flex>)
}

Content.defaultProps = {}
Content.displayName = baseCls
export { Content as FlowManage }
export type { IProps as FlowManageProps }