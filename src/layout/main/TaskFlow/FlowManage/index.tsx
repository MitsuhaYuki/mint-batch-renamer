import { ExportOutlined, ImportOutlined } from '@ant-design/icons'
import { Button, Flex } from 'antd'
import { FC } from 'react'
import './index.scss'
import { WithConfigProps, WithConsoleProps, WithRuntimeProps } from '@/types/common'
import { useMultiLang } from '@/utils/mlang'
import { MultiLangProps } from '@/types/mlang'
import { exportJsonFile, useKeyMessage, uuid } from '@/utils/common'
import { open } from '@tauri-apps/api/dialog'
import { invoke } from '@tauri-apps/api/tauri'

interface IProps extends MultiLangProps, WithConsoleProps, WithConfigProps, WithRuntimeProps {}

const baseCls = 'flow-manage'
const Content: FC<IProps> = (props) => {
  const { con, config, runtime } = props
  const { logger } = con
  const { fmlName, fmlText } = useMultiLang(config.state, baseCls, props.inheritName)
  const [msgApi, msgCtx] = useKeyMessage(baseCls)

  const fsOpenDialog = async (
    title?: string
  ): Promise<string | undefined> => {
    try {
      const selected = await open({
        title, filters: [{
          name: fmlText('cfg_typevar'),
          extensions: ['json']
        }]
      })
      if (selected !== null) {
        const res = Array.isArray(selected) ? selected[0] : selected
        logger.info(`Selected path: ${res}`)
        return res
      } else {
        logger.info('Canceled select path')
      }
    } catch (e) {
      logger.error(`Select path failed: ${e}`)
    }
    return
  }

  const onImportSeq = async () => {
    const res = await fsOpenDialog(fmlText('import_seq_title'))
    if (res) {
      try {
        const data = await invoke('fs_read_text_file', { path: res }) as string
        const flowConfig = JSON.parse(data)
        runtime.set({ ...runtime.state, ...flowConfig })
        msgApi.success(fmlText('import_ok'))
        logger.info(`Import flow config from ${res}`)
      } catch (e) {
        msgApi.error(fmlText('import_failed', `${e}`))
        logger.error(`Import flow config failed: ${e}`)
      }
    }
  }

  const onExportSeq = () => {
    if (runtime.state.tasks.length===0){
      msgApi.error(fmlText('export_no_task'))
      return
    }
    const exportData = {
      config: runtime.state.config,
      tasks: runtime.state.tasks,
    }
    exportJsonFile(exportData, `TaskConfig${Date.now()}.json`)
    msgApi.success(fmlText('export_ok'))
    logger.info('Export flow config')
  }

  return (<Flex className={baseCls}>
    {msgCtx}
    <Button
      icon={<ImportOutlined />}
      size='small'
      title={''}
      type='text'
      onClick={() => onImportSeq()}
    >{fmlText('import_seq')}</Button>
    <Button
      icon={<ExportOutlined />}
      size='small'
      title={''}
      type='text'
      onClick={() => onExportSeq()}
    >{fmlText('export_seq')}</Button>
  </Flex>)
}

Content.defaultProps = {}
Content.displayName = baseCls
export { Content as FlowManage }
export type { IProps as FlowManageProps }