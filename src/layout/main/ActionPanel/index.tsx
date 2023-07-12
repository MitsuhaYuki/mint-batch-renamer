import { FC, useMemo, useState } from 'react'
import FilterSection from './components/FilterSection'
import OperableList from '@/common/OperableList'
import RenamerSection from './components/RenamerSection'
import type { IFileItem } from '@/types/file'
import useGlobalData from '@/utils/hooks/useGlobalData'
import useLogger from '@/utils/logger'
import { Button, ButtonProps, Collapse, Modal, message } from 'antd'
import { CloseOutlined, DeleteOutlined, FolderOpenOutlined, PlayCircleOutlined, ReloadOutlined } from '@ant-design/icons'
import { cloneDeep, isEmpty } from 'lodash'
import { invoke } from '@tauri-apps/api/tauri'
import './index.scss'

const { Panel } = Collapse

export type ContentProps = {}

const baseCls = 'action-panel'
const Content: FC<ContentProps> = (props) => {
  // global data
  const { globalData, setGlobalData } = useGlobalData()
  // logger
  const { logger } = useLogger()
  // is currently in operation
  const [inOperation, setInOperation] = useState(false)
  // system config
  const { config } = globalData

  const selectFolder = async (): Promise<{ success: boolean; status: string; data?: string | undefined }> => {
    try {
      const res: string = await invoke("select_folder")
      logger.info(`Selected folder: ${res}`)
      return {
        success: true,
        status: 'ok',
        data: res
      }
    } catch (e) {
      if (e === 'No folder selected') {
        message.info('取消选择文件夹')
        logger.info('Canceled select folder')
        return {
          success: false,
          status: 'canceled'
        }
      } else {
        message.error(`选择文件夹失败(${e})`, 5)
        logger.error(`Select folder failed: ${e}`)
        return {
          success: false,
          status: 'failed',
          data: `${e}`
        }
      }
    }
  }

  const selectSourceFolder = async (clear = false) => {
    setInOperation(true)
    if (clear) {
      if (globalData.sourceFolders.length > 0) {
        setGlobalData('d_source')
        message.success('源文件夹设定已清空')
        logger.info('Source folders cleared.')
      } else {
        message.info('源文件夹设定已清空')
        logger.info('Source folders already empty.')
      }
    } else {
      const folderInfo = await selectFolder()
      if (folderInfo.success) {
        const path = folderInfo.data!
        const conflictSourceFolders = globalData.sourceFolders.filter(i => {
          let conflict = false
          if (path.length === i.length) {
            conflict = path === i
          } else if (path.length > i.length) {
            conflict = path.startsWith(i + '\\') || path.startsWith(i + '/')
          } else {
            conflict = i.startsWith(path + '\\') || i.startsWith(path + '/')
          }
          return conflict
        })
        if (conflictSourceFolders.length) {
          message.error('不要选择重复的文件夹、子文件夹或父文件夹作为源!')
        } else {
          const sourceFolders = [...globalData.sourceFolders, folderInfo.data!]
          try {
            await getFileList(sourceFolders)
            setGlobalData('u_source', sourceFolders)
            message.success('选择源文件夹成功')
          } catch (err) {
            message.error(err as string)
          }
        }
      }
    }
    setInOperation(false)
  }

  const selectTargetFolder = async (clear = false) => {
    setInOperation(true)
    if (clear) {
      if (globalData.sourceFolders.length > 0) {
        setGlobalData('d_target')
        message.success('目标文件夹设定已清空')
        logger.info('Target folders cleared.')
      } else {
        message.info('目标文件夹设定已清空')
        logger.info('Target folders already empty.')
      }
    } else {
      const folderInfo = await selectFolder()
      if (folderInfo.success && folderInfo.data) {
        message.success('选择目标文件夹成功')
        setGlobalData('u_target', folderInfo.data)
      }
    }
    setInOperation(false)
  }

  const getFileList = async (sourceFolders: string[]) => {
    // Check if source folders exist.
    if (sourceFolders.length > 0) {
      // Check file limit
      let totalFiles = 0
      for (const sourcePath of sourceFolders) {
        try {
          const count: number = await invoke("count_folder_files", { folderPath: sourcePath, maxCount: config.max_file_limit })
          if (count === -1 || (totalFiles += count) > config.max_file_limit) {
            logger.error(`Exceed max file limit, limit is ${config.max_file_limit}`)
            throw `最大处理文件数限制${config.max_file_limit}`
          } else {
            if (totalFiles > 2000) {
              message.warning({
                content: '当前源文件夹下文件数量过多，可能会导致加载时间过长，请耐心等待',
                duration: 0,
                key: 'FILE_MAX_COUNT_WARNING'
              })
            }
          }
        } catch (e) {
          logger.error(`Error when loading file counts, code ${e}`)
          throw `文件数统计失败, ${e}`
        }
      }
      // Actually load file list
      try {
        let fileList: IFileItem[] = []
        for (const sourcePath of sourceFolders) {
          const res: IFileItem[] = await invoke("get_folder_files", { path: sourcePath })
          fileList.push(...res)
          logger.info(`From ${sourcePath} add ${res.length} files.`)
        }
        logger.info(`File list updated, total ${fileList.length} files.`)
        setGlobalData('u_original_files', fileList)
      } catch (e) {
        logger.error(`Unknown error, code ${e}`)
        throw `加载文件列表失败, ${e}`
      } finally {
        message.destroy('FILE_MAX_COUNT_WARNING')
      }
    } else {
      logger.error('No source folder selected.')
      throw '请先选择源文件夹'
    }
  }

  const warningForFinalRename = () => {
    if (isEmpty(globalData.filesRenamed)) {
      message.info('请先重命名文件')
    } else {
      Modal.confirm({
        title: '注意',
        content: '此操作不可撤销, 确定要重命名这些文件吗?',
        onOk: () => {
          copySourceFilesToTarget()
        }
      })
    }
  }

  const copySourceFilesToTarget = async () => {
    setInOperation(true)
    try {
      const isFilesRenamed = globalData.filesRenamed && globalData.filesRenamed.length > 0
      if (globalData.targetFolder && isFilesRenamed) {
        for (const file of globalData.filesRenamed!) {
          const res = await invoke("copy_file", {
            source: file.path,
            destination: `${globalData.targetFolder}\\${file.rename_full_name}`
          })
        }
        message.success('复制文件成功')
        logger.info('Copy files success')
      } else {
        if (!globalData.targetFolder) {
          message.info('请先选择输出文件夹')
          logger.info('Copy failed: target folder not selected')
        } else if (!isFilesRenamed) {
          message.info('请先重命名文件')
          logger.info('Copy failed: no files renamed')
        }
      }
    } catch (e) {
      message.error(`复制文件失败 ${e}`)
      logger.error(`Copy files failed, code ${e}`)
    } finally {
      setInOperation(false)
    }
  }

  const ActionBtn = (props: ButtonProps) => <Button type='text' size='small' disabled={inOperation} {...props} />

  // source folder
  const renderSourceList = useMemo(() => {
    const opsList = globalData.sourceFolders.map(item => {
      return {
        content: item,
        operations: [{
          icon: <CloseOutlined />,
          onClick: async () => {
            // remove source folder
            const idx = globalData.sourceFolders.indexOf(item)
            const newSourceFolders = cloneDeep(globalData.sourceFolders)
            newSourceFolders.splice(idx, 1)
            await getFileList(newSourceFolders)
            setGlobalData('u_source', newSourceFolders)
            message.success('已移除选定的源文件夹')
            logger.info(`Source folder '${item}' has been deleted.`)
          }
        }]
      }
    })
    return <OperableList dataSource={opsList} />
  }, [globalData.sourceFolders])

  // target folder
  const renderTargetList = useMemo(() => {
    const folders = globalData.targetFolder ? [globalData.targetFolder] : []
    const opsList = folders.map(item => {
      return {
        content: item,
        operations: [{
          icon: <CloseOutlined />,
          onClick () {
            setGlobalData('d_target')
            message.success('输出路径设定已清空')
            logger.info('Target folder has been cleard.')
          }
        }]
      }
    })
    return <OperableList dataSource={opsList} />
  }, [globalData.targetFolder])

  const renderSourceControl = useMemo(() => {
    return (
      <div className={`${baseCls}-content-btns`}>
        <ActionBtn
          icon={<FolderOpenOutlined />}
          onClick={() => selectSourceFolder()}
        >选择源文件夹</ActionBtn>
        <ActionBtn title='清空所有源' onClick={() => selectSourceFolder(true)}>
          <DeleteOutlined />
        </ActionBtn>
        <ActionBtn title='刷新文件列表' onClick={async () => {
          try {
            await getFileList(globalData.sourceFolders)
            message.success(`文件列表更新完成`)
          } catch (err) {
            message.error(err as string)
          }
        }}>
          <ReloadOutlined />
        </ActionBtn>
      </div>
    )
  }, [globalData.sourceFolders])

  const renderTargetControl = useMemo(() => {
    return (
      <div className={`${baseCls}-content-btns`}>
        <ActionBtn
          icon={<FolderOpenOutlined />}
          onClick={() => selectTargetFolder()}
        >选择输出目录</ActionBtn>
        <ActionBtn
          icon={<PlayCircleOutlined />}
          onClick={() => warningForFinalRename()}
        >运行</ActionBtn>
      </div>
    )
  }, [globalData.sourceFolders])

  return (<div className={baseCls}>
    <Collapse
      accordion={true}
      className={`${baseCls}-collapse`}
      bordered={false}
      size='small'
      ghost
      defaultActiveKey={['1']}
    >
      <Panel header="获取" key="1">
        <div className={`${baseCls}-content`}>
          {renderSourceControl}
          {renderSourceList}
        </div>
      </Panel>
      <Panel header="过滤" key="2">
        <div className={`${baseCls}-content`}>
          <FilterSection />
        </div>
      </Panel>
      <Panel header="命名" key="3">
        <div className={`${baseCls}-content`}>
          <RenamerSection />
        </div>
      </Panel>
      <Panel header="输出" key="4">
        <div className={`${baseCls}-content`}>
          {renderTargetControl}
          {renderTargetList}
        </div>
      </Panel>
    </Collapse>
  </div>)
}

Content.defaultProps = {}
Content.displayName = baseCls
export default Content