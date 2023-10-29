import { ExportOutlined, ImportOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Flex, Modal } from 'antd'
import { Children, FC, cloneElement } from 'react'
import './index.scss'
import { WithConfigProps, WithConsoleProps, WithRuntimeProps } from '@/types/common'
import { useMultiLang } from '@/utils/mlang'
import { makeDefaultTask, makeTaskRunnerSysArg } from '@/utils/runners/common'
import { MultiLangProps } from '@/types/mlang'
import { checkOsError, useKeyMessage } from '@/utils/common'
import { FileItemExtend } from '@/types/file'
import { invoke } from '@tauri-apps/api/tauri'

interface IProps extends MultiLangProps, WithConsoleProps, WithConfigProps, WithRuntimeProps {}

const baseCls = 'flow-ctrl'
const Content: FC<IProps> = (props) => {
  const { con, config, runtime } = props
  const { fmlName, fmlText } = useMultiLang(config.state, baseCls, props.inheritName)
  const [msgApi, msgCtx] = useKeyMessage(baseCls)

  const clearHistoryData = (fileList: FileItemExtend[]): FileItemExtend[] => {
    return fileList.map((fileItem) => {
      fileItem.steps = []
      return fileItem
    })
  }

  const onAddStep = () => {
    const newStep = makeDefaultTask(fmlText('default_task'))
    runtime.set('c_tasks', newStep)
  }

  const onPreview = async () => {
    if (runtime.state.fileList.length === 0) {
      msgApi.warning(fmlText('no_source'))
      return
    }
    if (runtime.state.tasks.length === 0) {
      msgApi.warning(fmlText('no_task'))
      return
    }
    const tasks = runtime.state.tasks
    const runners = runtime.state.runners
    const clearList = clearHistoryData(runtime.state.fileList)
    let storeList: FileItemExtend[] = clearList
    for (const task of tasks) {
      if (runners[task.runner]) {
        storeList = await runners[task.runner].func(
          makeTaskRunnerSysArg(storeList, runners[task.runner]),
          task.args
        )
      } else {
        msgApi.error(fmlText('preview_no_runner'))
        return
      }
    }
    msgApi.success(fmlText('preview_done'))
    runtime.set('u_file_list', storeList)
    runtime.set('sig_preview')
  }

  // FIXME: 运行之前需要校验所有执行器的配置是否正确
  const askApplyResult = () => {
    const result = runtime.state.fileList.filter((fileItem) => {
      return fileItem.steps.length > 0 && fileItem.steps[fileItem.steps.length - 1].to
    })
    if (result.length === 0) {
      msgApi.error(fmlText('no_result'))
      return
    }
    Modal.confirm({
      title: fmlText('cfm_run_title'),
      content: fmlText('cfm_run_msg'),
      okText: fmlText('common:confirm'),
      cancelText: fmlText('common:cancel'),
      footer: (i: any) => cloneElement(i, {
        children: Children.toArray(i.props.children).reverse()
      }),
      onOk: () => {
        onApplyResult(result)
      }
    })
  }

  const onApplyResult = async (fileList: FileItemExtend[]) => {
    msgApi.loading('Start Running...', 0)
    for (let i = 0; i < fileList.length; i++) {
      const fileItem = fileList[i]
      const lastStep = fileItem.steps[fileItem.steps.length - 1]
      const targetFile = lastStep.result
      const targetPath = lastStep.to
      if (runtime.state.config.outputMethod === 'copy') {
        // Copy to target
        try {
          await invoke('fs_copy_file', {
            source: fileItem.path,
            destination: `${targetPath}\\${targetFile.name}`
          })
          msgApi.loading(`Copy File ${i + 1} / ${fileList.length}`, 0)
        } catch (e) {
          msgApi.error(`Copy File Error: ${e}`)
          return
        }
      } else {
        // Move to target
        try {
          await invoke('fs_rename_file', {
            oldPath: fileItem.path,
            newPath: `${targetPath}\\${targetFile.name}`
          })
          msgApi.loading(`Rename File ${i + 1} / ${fileList.length}`, 0)
        } catch (e) {
          const osErrNum = checkOsError(e)
          if (osErrNum === 17) {
            // msgApi.error('The system cannot move the file to a different disk drive. (os error 17)')
            msgApi.error('系统无法将文件移到不同的磁盘驱动器。 (os error 17)')
          } else {
            msgApi.error(`Rename File Error: ${e}`)
          }
          return
        }
      }
    }
    msgApi.success('Copy File Done')
  }

  return (<Flex className={baseCls}>
    {msgCtx}
    <Button
      icon={<PlusOutlined />}
      size='small'
      title={''}
      type='text'
      onClick={() => onAddStep()}
    >{fmlText('new')}</Button>
    <Button
      className={'flex-auto compact'}
      size='small'
      type='text'
      onClick={() => onPreview()}
    >{fmlText('preview')}</Button>
    <Button
      className={'flex-auto compact'}
      size='small'
      type='text'
      onClick={() => askApplyResult()}
    >{fmlText('run')}</Button>
  </Flex>)
}

Content.defaultProps = {}
Content.displayName = baseCls
export { Content as FlowControl }
export type { IProps as FlowControlProps }