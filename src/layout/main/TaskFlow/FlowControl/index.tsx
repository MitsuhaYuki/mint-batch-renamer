import { App, Button, Flex, Modal } from 'antd'
import { FC } from 'react'
import { FileItemExtend } from '@/types/file'
import { MultiLangProps } from '@/types/mlang'
import { PlusOutlined } from '@ant-design/icons'
import { WithConfigProps, WithConsoleProps, WithRuntimeProps } from '@/types/common'
import { checkOsError, reverseFooter } from '@/utils/common'
import { invoke } from '@tauri-apps/api/tauri'
import { makeDefaultTask, makeTaskRunnerSysArg } from '@/utils/runners/common'
import { useMultiLang } from '@/utils/mlang'
import './index.scss'

interface IProps extends MultiLangProps, WithConsoleProps, WithConfigProps, WithRuntimeProps {}

const baseCls = 'flow-ctrl'
const Content: FC<IProps> = (props) => {
  const { con, config, runtime } = props
  const { fmlName, fmlText } = useMultiLang(config.state, baseCls, props.inheritName)
  const { message } = App.useApp()
  const withKey = (content: string, duration?: number) => ({ content, duration, key: baseCls })

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
      message.warning(fmlText('no_source'))
      return
    }
    if (runtime.state.tasks.length === 0) {
      message.warning(fmlText('no_task'))
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
        message.error(fmlText('no_runner'))
        return
      }
    }
    message.success(fmlText('preview_done'))
    runtime.set('u_file_list', storeList)
    runtime.set('sig_preview')
  }

  // FIXME: 运行之前需要校验所有执行器的配置是否正确
  const askApplyResult = () => {
    const result = runtime.state.fileList.filter((fileItem) => {
      return fileItem.steps.length > 0 && fileItem.steps[fileItem.steps.length - 1].to
    })
    if (result.length === 0) {
      message.error(fmlText('no_result'))
      return
    }
    Modal.confirm({
      title: fmlText('run_cfm_title'),
      content: fmlText('run_cfm_msg'),
      okText: fmlText('common:confirm'),
      cancelText: fmlText('common:cancel'),
      footer: reverseFooter,
      onOk: () => onApplyResult(result)
    })
  }

  // FIXME: 这里最终要换成Modal，便于全局控制，也可以添加终止按钮等操作
  const onApplyResult = async (fileList: FileItemExtend[]) => {
    message.loading(withKey(fmlText('run_start'), 0))
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
          message.loading(withKey(fmlText('run_copying', (i + 1).toString(), fileList.length.toString()), 0))
        } catch (e) {
          message.error(withKey(fmlText('run_copy_err', `${e}`)))
          return
        }
      } else {
        // Move to target
        try {
          await invoke('fs_rename_file', {
            oldPath: fileItem.path,
            newPath: `${targetPath}\\${targetFile.name}`
          })
          message.loading(withKey(fmlText('run_moving', (i + 1).toString(), fileList.length.toString()), 0))
        } catch (e) {
          const osErrNum = checkOsError(e)
          if (osErrNum === 17) {
            message.error(withKey(fmlText('run_move_e17')))
          } else {
            message.error(withKey(fmlText('run_move_err', `${e}`)))
          }
          return
        }
      }
    }
    message.success(withKey(fmlText('run_done')))
  }

  return (<Flex className={baseCls}>
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